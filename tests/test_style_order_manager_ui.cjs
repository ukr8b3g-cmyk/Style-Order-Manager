// Isolated browser regression tests. Requires an existing Playwright installation and Edge.
// The API is intercepted; no request reaches Forge or any user's CSV/backup.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const script = fs.readFileSync(path.join(__dirname, "../javascript/style_order_manager.js"), "utf8");
const css = fs.readFileSync(path.join(__dirname, "../style.css"), "utf8");
const initialStyles = [
    { name: "Alpha", prompt: "original", negative_prompt: "negative" },
    { name: "Beta", prompt: "second", negative_prompt: "" },
];

(async () => {
    const browser = await chromium.launch({ channel: "msedge", headless: true });
    let passed = 0;
    async function scenario(title, base, configuredRoot, test) {
        const context = await browser.newContext();
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", e => errors.push(e.message));
        const apiCalls = [];
        let saveRelease;
        let delayedSave = false;
        let conflict = false;
        let rows = structuredClone(initialStyles);
        let revision = "test-revision-1";
        let backups = [{ name: "styles_20260101_120000_001.csv", modified: 1, size: 42 }];
        await page.route("http://som.test/**", async route => {
            const url = new URL(route.request().url());
            if (url.pathname === base || url.pathname === base + "/") {
                return route.fulfill({ contentType: "text/html", body: "<!doctype html><meta charset='utf-8'><div id='style-order-manager-app'></div><button id='refresh_txt2img_styles'>refresh txt2img</button><button id='refresh_img2img_styles'>refresh img2img</button>" });
            }
            const expected = base.replace(/\/$/, "") + "/style-order-manager/v1";
            assert.ok(url.pathname.startsWith(expected), `wrong API URL: ${url.pathname}`);
            const action = url.pathname.slice(expected.length);
            apiCalls.push({ action, payload: route.request().postDataJSON() });
            let data;
            if (action === "/reload" || action === "/styles") data = { styles: rows, revision, file: "styles.csv" };
            else if (action === "/backups") data = { backups };
            else if (action === "/save") {
                if (delayedSave) await new Promise(resolve => { saveRelease = resolve; });
                if (conflict) return route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ error: "stale" }) });
                rows = apiCalls.findLast(c => c.action === "/save").payload.styles;
                revision = "test-revision-2";
                backups = [{ name: "styles_20261001_180000_000001.csv", modified: 2, size: 43 }];
                data = { styles: rows, revision, file: "styles.csv", backup_file: backups[0].name, restart_required: false };
            } else if (action === "/restore") {
                rows = [{ name: "Restored", prompt: "restored prompt", negative_prompt: "" }];
                revision = "test-restored-revision";
                data = { styles: rows, revision, safety_backup_file: "styles_20261001_180001_000001_pre_restore.csv", restart_required: false };
            } else throw new Error(`unexpected endpoint: ${action}`);
            await route.fulfill({ contentType: "application/json", body: JSON.stringify(data) });
        });
        await page.goto("http://som.test" + (base || "/"));
        await page.evaluate(root => {
            if (root !== null) window.gradio_config = { root };
            window.refreshClicks = [];
            document.querySelectorAll('[id^="refresh_"]').forEach(b => b.addEventListener("click", () => window.refreshClicks.push(b.id)));
            window.readCount = 0;
            Object.defineProperty(navigator, "clipboard", { configurable: true, value: {
                readText: () => { window.readCount++; return new Promise(resolve => { window.releasePaste = resolve; }); },
                writeText: async () => {},
            } });
        }, configuredRoot);
        await page.addStyleTag({ content: css });
        await page.addScriptTag({ content: script });
        await page.waitForFunction(() => document.querySelectorAll(".style-editor-card").length === 2 && document.querySelector("#style-order-manager-app").getAttribute("aria-busy") === "false");
        await page.locator('.style-editor-card [data-action="toggle"]').first().click();
        await page.locator('.style-editor-settings > summary').click();
        try {
            await test({ page, apiCalls, delaySave: () => { delayedSave = true; }, releaseSave: () => saveRelease(), setConflict: () => { conflict = true; } });
            assert.deepEqual(errors, []);
            console.log(`PASS ${title}`);
            passed++;
        } finally {
            await context.close();
        }
    }

    try {
        await scenario("delayed save locks all row mutations and refreshes backups", "", null, async ({ page, apiCalls, delaySave, releaseSave }) => {
            await page.locator('[data-field="prompt"]').first().fill("edited before save");
            delaySave();
            await page.locator("#style-editor-save").click();
            await page.waitForFunction(() => document.querySelector("#style-order-manager-app").getAttribute("aria-busy") === "true");
            assert.ok(await page.locator('.style-editor-card input, .style-editor-card textarea, .style-editor-card button').evaluateAll(elements => elements.every(e => e.disabled)));
            assert.ok(await page.locator('[data-drag-handle]').evaluateAll(elements => elements.every(e => !e.draggable)));
            await page.evaluate(() => {
                const input = document.querySelector('[data-field="prompt"]');
                input.value = "late synthetic input";
                input.dispatchEvent(new Event("input", { bubbles: true }));
                for (const action of ["delete", "move-down", "paste"]) document.querySelector(`[data-action="${action}"]`).dispatchEvent(new MouseEvent("click", { bubbles: true }));
                document.querySelector('[data-drag-handle]').dispatchEvent(new Event("dragstart", { bubbles: true, cancelable: true }));
                document.querySelectorAll(".style-editor-card")[1].dispatchEvent(new Event("drop", { bubbles: true, cancelable: true }));
            });
            assert.equal(await page.evaluate(() => window.readCount), 0);
            releaseSave();
            await page.waitForFunction(() => document.querySelector("#style-order-manager-app").getAttribute("aria-busy") === "false");
            assert.equal(apiCalls.filter(c => c.action === "/save").length, 1);
            const saved = apiCalls.find(c => c.action === "/save").payload;
            assert.equal(saved.revision, "test-revision-1");
            assert.equal(saved.styles[0].prompt, "edited before save");
            assert.equal(await page.locator('.style-editor-card [data-field="prompt"]').first().inputValue(), "edited before save");
            assert.equal(await page.locator('.style-editor-card').count(), 2);
            assert.ok((await page.locator("#style-editor-backup-select").innerHTML()).includes("styles_20261001_180000_000001.csv"));
            assert.deepEqual(await page.evaluate(() => window.refreshClicks), ["refresh_txt2img_styles", "refresh_img2img_styles"]);
            await page.locator('.style-editor-card [data-action="toggle"]').first().click();
            await page.locator('[data-field="prompt"]').first().fill("next edit");
            assert.equal(await page.locator("#style-editor-save").isEnabled(), true);
        });

        await scenario("pending clipboard paste cannot race save", "/forge", "/forge", async ({ page, apiCalls }) => {
            await page.locator('[data-action="paste"]').first().click();
            await page.waitForFunction(() => window.readCount === 1);
            assert.equal(await page.locator("#style-editor-save").isDisabled(), true);
            await page.locator("#style-editor-save").dispatchEvent("click");
            assert.equal(apiCalls.filter(c => c.action === "/save").length, 0);
            await page.evaluate(() => window.releasePaste("clipboard result"));
            await page.waitForFunction(() => document.querySelector("#style-order-manager-app").getAttribute("aria-busy") === "false");
            assert.equal(await page.locator('[data-field="prompt"]').first().inputValue(), "clipboard result");
            await page.locator("#style-editor-save").click();
            await page.waitForFunction(() => document.querySelector("#style-order-manager-app").getAttribute("aria-busy") === "false");
            assert.equal(apiCalls.find(c => c.action === "/save").payload.styles[0].prompt, "clipboard result");
        });

        await scenario("dirty restore warns and cancel preserves edits; accepted restore refreshes both tabs", "/nested/forge/", "http://som.test/nested/forge/", async ({ page, apiCalls }) => {
            await page.locator('[data-field="prompt"]').first().fill("unsaved work");
            let warning;
            page.once("dialog", async dialog => { warning = dialog.message(); await dialog.dismiss(); });
            await page.locator("#style-editor-restore").click();
            assert.ok(warning.includes("Unsaved edits will be discarded"));
            assert.equal(apiCalls.filter(c => c.action === "/restore").length, 0);
            assert.equal(await page.locator('[data-field="prompt"]').first().inputValue(), "unsaved work");
            page.once("dialog", dialog => dialog.accept());
            await page.locator("#style-editor-restore").click();
            await page.waitForFunction(() => document.querySelectorAll('.style-editor-card').length === 1 && document.querySelector("#style-order-manager-app").getAttribute("aria-busy") === "false");
            assert.equal(apiCalls.find(c => c.action === "/restore").payload.revision, "test-revision-1");
            assert.equal(await page.locator('[data-field="name"]').inputValue(), "Restored");
            assert.deepEqual(await page.evaluate(() => window.refreshClicks), ["refresh_txt2img_styles", "refresh_img2img_styles"]);
        });

        await scenario("409 retains unsaved edits and shows conflict; pathname subpath fallback works", "/forge", null, async ({ page, setConflict }) => {
            await page.locator('[data-field="prompt"]').first().fill("local draft");
            setConflict();
            await page.locator("#style-editor-save").click();
            await page.waitForFunction(() => document.querySelector("#style-order-manager-app").getAttribute("aria-busy") === "false");
            assert.equal(await page.locator('[data-field="prompt"]').first().inputValue(), "local draft");
            assert.equal(await page.locator("#style-editor-save").isEnabled(), true);
            assert.ok((await page.locator("#style-editor-status").textContent()).includes("unsaved edits are retained"));
        });
        console.log(`${passed} browser scenarios passed`);
    } finally {
        await browser.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
