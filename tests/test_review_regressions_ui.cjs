// Independent Edge contexts; every HTTP request is intercepted. No host data.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium, expect} = require('playwright/test');
const script = fs.readFileSync(path.join(__dirname, '../javascript/style_order_manager.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../style.css'), 'utf8');
const BACKUP = 'styles_20260101_120000_001.csv';
const PREFIX = '/style-order-manager/v1';
const canonical = folder => `C:/isolated/${folder}`;

(async () => {
  const browser = await chromium.launch({channel: 'msedge', headless: true});
  let passed = 0;
  async function scenario(title, check) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const calls = [], errors = [], confirmations = [], gates = [];
    let failList = false, warn = false, revision = 'revision-1';
    let styles = [{name: 'Alpha', prompt: 'original', negative_prompt: ''}];
    page.on('pageerror', e => errors.push(e.message));
    page.on('dialog', async dialog => { confirmations.push(dialog.message()); await dialog.accept(); });
    await page.route('http://som.test/**', async route => {
      const url = new URL(route.request().url());
      if (url.pathname === '/') return route.fulfill({contentType: 'text/html', body: "<!doctype html><div id='style-order-manager-app'></div><button id='refresh_txt2img_styles'>refresh</button>"});
      const action = url.pathname.slice(PREFIX.length);
      const payload = route.request().postDataJSON();
      calls.push({action, payload});
      let data, gate;
      if (action === '/reload') data = {styles, revision, file: 'styles.csv'};
      else if (action === '/backups') {
        if (failList) return route.fulfill({status: 500, contentType: 'application/json', body: JSON.stringify({error: 'list unavailable'})});
        data = {backups: [{name: BACKUP, modified: 1}], folder: canonical(payload.backup_folder)};
        gate = gates.find(g => !g.used && g.folder === payload.backup_folder);
        if (gate) { gate.used = true; gate.reached(); await gate.wait; }
      } else if (action === '/next-name') {
        const used = new Set(payload.names.map(name => name.toLowerCase()));
        let name = payload.base, suffix = 2;
        while (used.has(name.toLowerCase())) name = `${payload.base} ${suffix++}`;
        data = {name};
      } else if (action === '/save') {
        assert.equal(payload.revision, revision);
        styles = payload.styles; revision += '-saved';
        data = {styles, revision, backup_file: BACKUP, cleanup_warning: warn ? 'locked backup' : null};
      } else if (action === '/restore') {
        assert.equal(payload.revision, revision);
        styles = [{name: 'Restored', prompt: 'from ' + payload.backup_folder, negative_prompt: ''}];
        revision += '-restored';
        data = {styles, revision, safety_backup_file: 'safe.csv', cleanup_warning: warn ? 'locked backup' : null};
      } else if (action === '/backup') data = {backup_file: BACKUP, cleanup_warning: warn ? 'locked backup' : null};
      else throw new Error('Unexpected endpoint ' + action);
      try { await route.fulfill({contentType: 'application/json', body: JSON.stringify(data)}); }
      finally { if (gate) gate.finished(); }
    });
    function delay(folder) {
      let reached, release, finished;
      const seen = new Promise(resolve => { reached = resolve; });
      const wait = new Promise(resolve => { release = resolve; });
      const done = new Promise(resolve => { finished = resolve; });
      gates.push({folder, used: false, reached, wait, finished});
      return {seen, async release() { release(); await done; }};
    }
    try {
      await page.goto('http://som.test/');
      await page.addStyleTag({content: css}); await page.addScriptTag({content: script});
      await expect(page.locator('.style-editor-card')).toHaveCount(1);
      await expect(page.locator('#style-editor-restore')).toBeEnabled();
      await page.locator('.style-editor-settings > summary').click();
      const folder = page.locator('#style-editor-backup-folder');
      const restore = page.locator('#style-editor-restore');
      const list = page.locator('#style-editor-backup-select');
      const status = page.locator('#style-editor-status');
      const busyDone = () => expect(page.locator('#style-order-manager-app')).toHaveAttribute('aria-busy', 'false');
      const restoreDone = async () => {
        const response = page.waitForResponse(r => r.url().endsWith('/restore'));
        await restore.click(); await response; await busyDone();
      };
      const change = async value => { await folder.fill(value); await folder.press('Tab'); };
      await check({page, folder, restore, list, status, calls, confirmations, delay, change, busyDone, restoreDone,
        setListFailure: value => { failList = value; }, setWarning: () => { warn = true; }});
      assert.deepEqual(errors, []); passed++; console.log('PASS ' + title);
    } finally { await context.close(); }
  }
  try {
    await scenario('input without change immediately invalidates the old selection', async ({folder, restore, list, calls}) => {
      await folder.fill('folder-B');
      await expect(restore).toBeDisabled(); await expect(list).toHaveValue('');
      await restore.dispatchEvent('click'); assert.equal(calls.filter(c => c.action === '/restore').length, 0);
    });
    await scenario('delayed A to B cannot restore old selection; verified B restores with canonical folder', async ({change, delay, restore, list, calls, confirmations, restoreDone}) => {
      const pending = delay('folder-B'); await change('folder-B'); await pending.seen;
      await expect(restore).toBeDisabled(); await expect(list).toBeDisabled();
      await restore.dispatchEvent('click'); assert.equal(calls.filter(c => c.action === '/restore').length, 0);
      await pending.release(); await expect(restore).toBeEnabled(); await restoreDone();
      const sent = calls.find(c => c.action === '/restore').payload;
      assert.equal(sent.backup_name, BACKUP); assert.equal(sent.backup_folder, canonical('folder-B'));
      assert(confirmations[0].includes(canonical('folder-B')));
    });
    await scenario('A to B to A ignores the late B response', async ({change, delay, restore, calls, restoreDone}) => {
      const stale = delay('folder-B'); await change('folder-B'); await stale.seen;
      await change('styles_backups'); await expect(restore).toBeEnabled();
      await stale.release(); await restoreDone();
      assert.equal(calls.find(c => c.action === '/restore').payload.backup_folder, canonical('styles_backups'));
    });
    await scenario('reset to default invalidates selected backup while fetching', async ({page, change, delay, restore, calls}) => {
      await change('folder-B'); await expect(restore).toBeEnabled();
      const pending = delay('styles_backups'); await page.locator('#style-editor-reset-backup').click(); await pending.seen;
      await expect(restore).toBeDisabled(); await restore.dispatchEvent('click');
      assert.equal(calls.filter(c => c.action === '/restore').length, 0);
      await pending.release(); await expect(restore).toBeEnabled();
    });
    await scenario('list failure and input during a pending request both fail closed', async ({folder, change, delay, restore, list, setListFailure, calls}) => {
      setListFailure(true); await change('folder-B'); await expect(list.locator('option')).toHaveText(['Could not load']);
      await expect(restore).toBeDisabled(); await restore.dispatchEvent('click');
      setListFailure(false); const pending = delay('folder-C'); await change('folder-C'); await pending.seen;
      await folder.fill('half-typed'); await pending.release(); await expect(restore).toBeDisabled();
      assert.equal(calls.filter(c => c.action === '/restore').length, 0);
    });
    await scenario('cleanup warning after save commits rows/revision, clears dirty and permits another save', async ({page, status, calls, busyDone, setWarning}) => {
      setWarning(); await page.locator('[data-action="toggle"]').click();
      await page.locator('[data-field="prompt"]').fill('edited'); await page.locator('#style-editor-save').click(); await busyDone();
      await expect(status).toHaveClass(/warning/); await expect(status).toContainText('operation completed');
      await expect(page.locator('#style-editor-dirty')).toHaveText('Saved');
      await page.locator('[data-action="toggle"]').click(); await page.locator('[data-field="prompt"]').fill('next');
      await page.locator('#style-editor-save').click(); await busyDone();
      assert.equal(calls.filter(c => c.action === '/save')[1].payload.revision, 'revision-1-saved');
    });
    await scenario('cleanup warning after restore updates revision and visible styles', async ({page, restoreDone, status, calls, busyDone, setWarning}) => {
      setWarning(); await restoreDone(); await expect(status).toHaveClass(/warning/);
      await expect(page.locator('.style-editor-card')).toContainText('Restored');
      await expect(page.locator('#style-editor-dirty')).toHaveText('Saved');
      await page.locator('[data-action="toggle"]').click(); await page.locator('[data-field="prompt"]').fill('after restore');
      await page.locator('#style-editor-save').click(); await busyDone();
      assert.equal(calls.find(c => c.action === '/save').payload.revision, 'revision-1-restored');
    });
    await scenario('manual backup cleanup warning preserves unsaved draft', async ({page, status, setWarning, busyDone}) => {
      setWarning(); await page.locator('[data-action="toggle"]').click(); await page.locator('[data-field="prompt"]').fill('draft');
      await page.locator('#style-editor-backup-now').click(); await busyDone(); await expect(status).toHaveClass(/warning/);
      await expect(page.locator('[data-field="prompt"]')).toHaveValue('draft');
      await expect(page.locator('#style-editor-dirty')).toHaveText('Unsaved changes');
    });
    console.log(`${passed} review browser scenarios passed`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error.stack); process.exitCode = 1; });
