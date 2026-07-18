(() => {
    "use strict";

    const APP_ID = "style-order-manager-app";
    const API_BASE = "/style-order-manager/v1";
    const STORAGE_KEY = "forge_neo_style_editor_settings_v1";
    const SETTINGS_VERSION = 2;
    const DEFAULT_BACKUP_FOLDER = "styles_backups";
    const LANGUAGE_STORAGE_KEY = "forge_neo_style_editor_language_v1";

    const I18N = {
        ja: {
            subtitle: "Forge Neo の styles.csv を一覧・編集・並べ替えします。",
            itemCount: "{count} 件",
            filteredCount: "{visible} / {total} 件",
            saved: "保存済み",
            unsaved: "未保存の変更あり",
            searchLabel: "検索",
            searchPlaceholder: "スタイル名・本文を検索...",
            add: "＋ スタイル追加",
            reload: "一覧を再読込",
            save: "保存",
            statusReady: "読み込み前",
            statusLoading: "styles.csv を再読込しています...",
            statusLoaded: "{file} を読み込みました。",
            statusReadError: "読込エラー: {message}",
            help: "↑↓で1段ずつ移動、☷をドラッグして並べ替え、▶で編集欄を展開します。編集内容は「保存」するまで styles.csv に反映されません。",
            backupSettings: "バックアップ設定",
            backupEnabled: "保存時にバックアップを作成",
            backupNow: "今すぐバックアップ",
            backingUp: "保存済みの styles.csv をバックアップしています...",
            backupCreated: "バックアップを作成しました: {file}",
            backupCreateError: "バックアップ作成エラー: {message}",
            keepCount: "残す件数",
            countUnit: "件",
            folderLabel: "保存先",
            browse: "参照",
            standard: "標準",
            refreshBackups: "バックアップ一覧を更新",
            noBackups: "バックアップなし",
            restore: "リストア",
            backupCount: "{count}件",
            backupNote: "「今すぐバックアップ」は保存済みの styles.csv をコピーします（未保存の編集は含みません）。標準保存先: styles_backups。リストア時は現在の styles.csv も安全用に退避します。",
            backupListError: "取得エラー",
            delete: "削除",
            dragTitle: "ドラッグして並べ替え",
            moveUp: "1段上へ移動",
            moveDown: "1段下へ移動",
            expand: "編集欄を開く",
            collapse: "編集欄を閉じる",
            copy: "コピー",
            paste: "貼り付け",
            copied: "コピー済み",
            pasted: "貼付済み",
            clipboardWriteError: "コピーできませんでした: {message}",
            clipboardReadError: "貼り付けできませんでした: {message}",
            styleName: "スタイル名",
            positivePrompt: "ポジティブプロンプト",
            negativePrompt: "ネガティブプロンプト",
            unsetStyleName: "（名称未設定）",
            noMatches: "検索条件に一致するスタイルがありません。",
            reloadConfirm: "未保存の変更を破棄して styles.csv を再読込しますか？",
            deleteConfirm: "「{name}」を削除しますか？",
            restoreConfirm: "現在の styles.csv を安全用バックアップにしてから「{name}」をリストアしますか？",
            folderChanged: "バックアップ保存先を変更しました。",
            folderReset: "バックアップ保存先を標準に戻しました。",
            folderError: "フォルダ選択エラー: {message} パスを直接入力できます。",
            restoring: "バックアップをリストアしています...",
            restored: "リストアしました。現行ファイルの退避: {file}",
            restoreError: "リストアエラー: {message}",
            saving: "styles.csv を保存しています...",
            saveError: "保存エラー: {message}",
            backupMessage: " バックアップ: {file}",
            restartNeeded: " Forgeの再起動が必要です。",
            stylesRefreshed: " Styles一覧を自動更新しました。",
            stylesRefreshManual: " Styles一覧は既存画面の更新ボタンで反映できます。",
            savedMessage: "保存しました。",
            emptyStyleName: "{index}番目のスタイル名が空です。",
            duplicateStyle: "スタイル名が重複しています: {name}",
            newStyle: "新しいスタイル",
        },
        en: {
            subtitle: "Browse, edit, and reorder Forge Neo's styles.csv.",
            itemCount: "{count} items",
            filteredCount: "{visible} / {total} items",
            saved: "Saved",
            unsaved: "Unsaved changes",
            searchLabel: "Search",
            searchPlaceholder: "Search style names and prompts...",
            add: "＋ Add style",
            reload: "Reload list",
            save: "Save",
            statusReady: "Not loaded",
            statusLoading: "Reloading styles.csv...",
            statusLoaded: "Loaded {file}.",
            statusReadError: "Read error: {message}",
            help: "Use ↑↓ to move one step, drag ☷ to reorder, and use ▶ to expand the editor. Changes are not written to styles.csv until you press Save.",
            backupSettings: "Backup settings",
            backupEnabled: "Create a backup when saving",
            backupNow: "Back up now",
            backingUp: "Backing up the saved styles.csv...",
            backupCreated: "Created backup: {file}",
            backupCreateError: "Backup error: {message}",
            keepCount: "Keep",
            countUnit: "files",
            folderLabel: "Folder",
            browse: "Browse",
            standard: "Default",
            refreshBackups: "Refresh backups",
            noBackups: "No backups",
            restore: "Restore",
            backupCount: "{count} files",
            backupNote: "Back up now copies the saved styles.csv (unsaved edits are not included). Default: styles_backups. During restore, the current styles.csv is also saved as a safety backup.",
            backupListError: "Could not load",
            delete: "Delete",
            dragTitle: "Drag to reorder",
            moveUp: "Move up one step",
            moveDown: "Move down one step",
            expand: "Open editor",
            collapse: "Close editor",
            copy: "Copy",
            paste: "Paste",
            copied: "Copied",
            pasted: "Pasted",
            clipboardWriteError: "Could not copy: {message}",
            clipboardReadError: "Could not paste: {message}",
            styleName: "Style name",
            positivePrompt: "Positive prompt",
            negativePrompt: "Negative prompt",
            unsetStyleName: "(unnamed)",
            noMatches: "No styles match the search.",
            reloadConfirm: "Discard unsaved changes and reload styles.csv?",
            deleteConfirm: "Delete “{name}”?",
            restoreConfirm: "Back up the current styles.csv, then restore “{name}”?",
            folderChanged: "Backup folder changed.",
            folderReset: "Backup folder reset to default.",
            folderError: "Folder picker error: {message} You can enter a path manually.",
            restoring: "Restoring the backup...",
            restored: "Restored. Current file saved as: {file}",
            restoreError: "Restore error: {message}",
            saving: "Saving styles.csv...",
            saveError: "Save error: {message}",
            backupMessage: " Backup: {file}",
            restartNeeded: " Forge must be restarted.",
            stylesRefreshed: " Refreshed the Styles lists automatically.",
            stylesRefreshManual: " Use the refresh button on an existing Styles panel to update its list.",
            savedMessage: "Saved.",
            emptyStyleName: "Style {index} has an empty name.",
            duplicateStyle: "Duplicate style name: {name}",
            newStyle: "New Style",
        },
    };

    function t(key, replacements = {}) {
        let value = I18N[state.language]?.[key] ?? I18N.en[key] ?? key;
        Object.entries(replacements).forEach(([name, replacement]) => {
            value = value.replaceAll(`{${name}}`, String(replacement));
        });
        return value;
    }

    function detectLanguage() {
        const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (saved === "ja" || saved === "en") return saved;
        return "en";
    }

    const state = {
        language: "ja",
        styles: [],
        query: "",
        expanded: new Set(),
        dirty: false,
        busy: false,
        draggingId: null,
        suppressToggleUntil: 0,
        backups: [],
    };

    let root = null;

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function newId() {
        return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
    }

    function makeStyle(item) {
        return {
            id: item.id || newId(),
            name: String(item.name ?? ""),
            prompt: String(item.prompt ?? ""),
            negative_prompt: String(item.negative_prompt ?? ""),
        };
    }

    function loadSettings() {
        let saved = {};
        try {
            saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        } catch {
            saved = {};
        }

        const enabled = root.querySelector("#style-editor-backup-enabled");
        const count = root.querySelector("#style-editor-backup-count");
        const folder = root.querySelector("#style-editor-backup-folder");
        const hasCurrentSettings = Number(saved.settingsVersion) >= SETTINGS_VERSION;
        enabled.checked = hasCurrentSettings ? saved.backupEnabled !== false : true;
        count.value = Math.min(100, Math.max(1, Number(saved.backupCount) || 10));
        folder.value = hasCurrentSettings && saved.backupFolder ? saved.backupFolder : DEFAULT_BACKUP_FOLDER;
        updateBackupControls();
    }

    function persistSettings() {
        const enabled = root.querySelector("#style-editor-backup-enabled");
        const count = root.querySelector("#style-editor-backup-count");
        const folder = root.querySelector("#style-editor-backup-folder");
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            settingsVersion: SETTINGS_VERSION,
            backupEnabled: enabled.checked,
            backupCount: Number(count.value) || 10,
            backupFolder: folder.value.trim() || DEFAULT_BACKUP_FOLDER,
        }));
    }

    function updateBackupControls() {
        const count = root.querySelector("#style-editor-backup-count");
        count.disabled = false;
    }

    function applyLanguage() {
        root.querySelector("#style-editor-subtitle").textContent = t("subtitle");
        root.querySelector("#style-editor-search-label").textContent = t("searchLabel");
        root.querySelector("#style-editor-search").placeholder = t("searchPlaceholder");
        root.querySelector("#style-editor-add").textContent = t("add");
        root.querySelector("#style-editor-reload").textContent = t("reload");
        root.querySelector("#style-editor-save").textContent = t("save");
        root.querySelector("#style-editor-help").textContent = t("help");
        root.querySelector("#style-editor-settings-title").textContent = t("backupSettings");
        root.querySelector("#style-editor-backup-enabled-label").textContent = t("backupEnabled");
        root.querySelector("#style-editor-backup-now").textContent = t("backupNow");
        root.querySelector("#style-editor-keep-label").textContent = t("keepCount");
        root.querySelector("#style-editor-count-unit").textContent = t("countUnit");
        root.querySelector("#style-editor-folder-label").textContent = t("folderLabel");
        root.querySelector("#style-editor-browse-backup").textContent = t("browse");
        root.querySelector("#style-editor-reset-backup").textContent = t("standard");
        root.querySelector("#style-editor-backups-refresh").textContent = t("refreshBackups");
        root.querySelector("#style-editor-restore").textContent = t("restore");
        root.querySelector("#style-editor-backup-note").textContent = t("backupNote");
        root.querySelector("#style-editor-language").value = state.language;
        const backupSelect = root.querySelector("#style-editor-backup-select");
        if (!state.backups.length && backupSelect.options.length) backupSelect.options[0].textContent = t("noBackups");
        root.querySelector("#style-editor-backup-summary").textContent = t("backupCount", { count: state.backups.length });
        updateSummary();
    }

    function setStatus(message, type = "") {
        const status = root.querySelector("#style-editor-status");
        status.textContent = message;
        status.className = `style-editor-status ${type}`.trim();
    }

    function updateSummary() {
        const count = root.querySelector("#style-editor-summary");
        const saveButton = root.querySelector("#style-editor-save");
        const dirtyBadge = root.querySelector("#style-editor-dirty");
        const visibleCount = root.querySelectorAll(".style-editor-card").length;
        count.textContent = state.query.trim()
            ? t("filteredCount", { visible: visibleCount, total: state.styles.length })
            : t("itemCount", { count: state.styles.length });
        dirtyBadge.textContent = state.dirty ? t("unsaved") : t("saved");
        dirtyBadge.className = `style-editor-dirty ${state.dirty ? "is-dirty" : ""}`.trim();
        saveButton.disabled = state.busy || !state.dirty;
    }

    function setBusy(busy) {
        state.busy = busy;
        ["#style-editor-add", "#style-editor-reload", "#style-editor-save"].forEach((selector) => {
            const button = root.querySelector(selector);
            if (button) button.disabled = busy || (selector === "#style-editor-save" && !state.dirty);
        });
        ["#style-editor-backup-now", "#style-editor-browse-backup", "#style-editor-reset-backup", "#style-editor-backups-refresh"].forEach((selector) => {
            const button = root.querySelector(selector);
            if (button) button.disabled = busy;
        });
        const restoreButton = root.querySelector("#style-editor-restore");
        const backupSelect = root.querySelector("#style-editor-backup-select");
        if (restoreButton) restoreButton.disabled = busy || !backupSelect?.value;
        if (backupSelect) backupSelect.disabled = busy;
        root.querySelector("#style-editor-search").disabled = busy;
    }

    function markDirty() {
        state.dirty = true;
        updateSummary();
    }

    function cardMarkup(style, index) {
        const expanded = state.expanded.has(style.id);
        const promptId = `style-editor-prompt-${style.id}`;
        const negativePromptId = `style-editor-negative-prompt-${style.id}`;
        return `
            <article class="style-editor-card ${expanded ? "is-expanded" : ""}" data-index="${index}" data-id="${escapeHtml(style.id)}">
                <div class="style-editor-card-side">
                    <button type="button" class="style-editor-move-button" data-action="move-up" title="${escapeHtml(t("moveUp"))}" aria-label="${escapeHtml(t("moveUp"))}" ${index === 0 ? "disabled" : ""}>↑</button>
                    <button type="button" class="style-editor-move-button" data-action="move-down" title="${escapeHtml(t("moveDown"))}" aria-label="${escapeHtml(t("moveDown"))}" ${index === state.styles.length - 1 ? "disabled" : ""}>↓</button>
                    <button type="button" class="style-editor-drag-handle" draggable="true" data-drag-handle="true" title="${escapeHtml(t("dragTitle"))}" aria-label="${escapeHtml(t("dragTitle"))}"><span aria-hidden="true">☷</span><span class="style-editor-order">${index + 1}</span></button>
                </div>
                <div class="style-editor-card-body">
                    <div class="style-editor-card-heading">
                        <button type="button" class="style-editor-toggle" data-action="toggle" title="${escapeHtml(t(expanded ? "collapse" : "expand"))}" aria-label="${escapeHtml(t(expanded ? "collapse" : "expand"))}" aria-expanded="${expanded}">${expanded ? "▼" : "▶"}</button>
                        <strong>${escapeHtml(style.name || t("unsetStyleName"))}</strong>
                        <button type="button" class="style-editor-delete" data-action="delete">${escapeHtml(t("delete"))}</button>
                    </div>
                    <div class="style-editor-fields">
                        <label>${escapeHtml(t("styleName"))}<input type="text" data-field="name" value="${escapeHtml(style.name)}" autocomplete="off"></label>
                        <div class="style-editor-field-group">
                            <div class="style-editor-field-heading">
                                <label for="${escapeHtml(promptId)}">${escapeHtml(t("positivePrompt"))}</label>
                                <div class="style-editor-clipboard-actions">
                                    <button type="button" class="style-editor-copy" data-action="copy" data-clipboard-field="prompt">${escapeHtml(t("copy"))}</button>
                                    <button type="button" class="style-editor-paste" data-action="paste" data-clipboard-field="prompt">${escapeHtml(t("paste"))}</button>
                                </div>
                            </div>
                            <textarea id="${escapeHtml(promptId)}" data-field="prompt" rows="4">${escapeHtml(style.prompt)}</textarea>
                        </div>
                        <div class="style-editor-field-group">
                            <div class="style-editor-field-heading">
                                <label for="${escapeHtml(negativePromptId)}">${escapeHtml(t("negativePrompt"))}</label>
                                <div class="style-editor-clipboard-actions">
                                    <button type="button" class="style-editor-copy" data-action="copy" data-clipboard-field="negative_prompt">${escapeHtml(t("copy"))}</button>
                                    <button type="button" class="style-editor-paste" data-action="paste" data-clipboard-field="negative_prompt">${escapeHtml(t("paste"))}</button>
                                </div>
                            </div>
                            <textarea id="${escapeHtml(negativePromptId)}" data-field="negative_prompt" rows="4">${escapeHtml(style.negative_prompt)}</textarea>
                        </div>
                    </div>
                </div>
            </article>`;
    }

    function render() {
        const list = root.querySelector("#style-editor-list");
        const query = state.query.trim().toLocaleLowerCase();
        const matches = state.styles
            .map((style, index) => ({ style, index }))
            .filter(({ style }) => !query || [style.name, style.prompt, style.negative_prompt]
                .some((value) => value.toLocaleLowerCase().includes(query)));

        list.innerHTML = matches.length
            ? matches.map(({ style, index }) => cardMarkup(style, index)).join("")
            : `<div class="style-editor-empty">${escapeHtml(t("noMatches"))}</div>`;
        updateSummary();
    }

    async function request(path, options = {}) {
        const response = await fetch(`${API_BASE}${path}`, {
            cache: "no-store",
            ...options,
            headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
        return data;
    }

    function updateRestoreButton() {
        const select = root.querySelector("#style-editor-backup-select");
        const restore = root.querySelector("#style-editor-restore");
        if (restore) restore.disabled = state.busy || !select?.value;
    }

    async function loadBackups() {
        const folder = root.querySelector("#style-editor-backup-folder").value.trim() || DEFAULT_BACKUP_FOLDER;
        const select = root.querySelector("#style-editor-backup-select");
        const summary = root.querySelector("#style-editor-backup-summary");
        try {
            const data = await request("/backups", {
                method: "POST",
                body: JSON.stringify({ backup_folder: folder }),
            });
            state.backups = data.backups || [];
            select.innerHTML = state.backups.length
                ? state.backups.map((backup) => {
                    const locale = state.language === "ja" ? "ja-JP" : "en-US";
                    const date = backup.modified ? new Date(backup.modified).toLocaleString(locale) : "";
                    return `<option value="${escapeHtml(backup.name)}">${escapeHtml(backup.name)}${date ? ` — ${escapeHtml(date)}` : ""}</option>`;
                }).join("")
                : `<option value="">${escapeHtml(t("noBackups"))}</option>`;
            summary.textContent = t("backupCount", { count: state.backups.length });
            updateRestoreButton();
        } catch (error) {
            state.backups = [];
            select.innerHTML = `<option value="">${escapeHtml(t("backupListError"))}</option>`;
            summary.textContent = t("backupListError");
            updateRestoreButton();
        }
    }

    async function browseBackupFolder() {
        try {
            const data = await request("/select-backup-folder", { method: "POST" });
            if (!data.folder) return;
            root.querySelector("#style-editor-backup-folder").value = data.folder;
            persistSettings();
            await loadBackups();
            setStatus(t("folderChanged"), "success");
        } catch (error) {
            setStatus(t("folderError", { message: error.message }), "error");
        }
    }

    async function resetBackupFolder() {
        root.querySelector("#style-editor-backup-folder").value = DEFAULT_BACKUP_FOLDER;
        persistSettings();
        await loadBackups();
        setStatus(t("folderReset"), "success");
    }

    async function createBackupNow() {
        const countInput = root.querySelector("#style-editor-backup-count");
        const folderInput = root.querySelector("#style-editor-backup-folder");
        const backupCount = Math.min(100, Math.max(1, Number(countInput.value) || 10));
        const backupFolder = folderInput.value.trim() || DEFAULT_BACKUP_FOLDER;
        countInput.value = backupCount;
        folderInput.value = backupFolder;
        persistSettings();
        setBusy(true);
        setStatus(t("backingUp"), "working");
        try {
            const data = await request("/backup", {
                method: "POST",
                body: JSON.stringify({ backup_folder: backupFolder, backup_count: backupCount }),
            });
            await loadBackups();
            setStatus(t("backupCreated", { file: data.backup_file }), "success");
        } catch (error) {
            setStatus(t("backupCreateError", { message: error.message }), "error");
        } finally {
            setBusy(false);
            updateSummary();
        }
    }

    async function restoreBackup() {
        const select = root.querySelector("#style-editor-backup-select");
        const backupName = select.value;
        if (!backupName) return;
        if (!window.confirm(t("restoreConfirm", { name: backupName }))) return;

        const folder = root.querySelector("#style-editor-backup-folder").value.trim() || DEFAULT_BACKUP_FOLDER;
        const count = Math.min(100, Math.max(1, Number(root.querySelector("#style-editor-backup-count").value) || 10));
        setBusy(true);
        setStatus(t("restoring"), "working");
        try {
            const data = await request("/restore", {
                method: "POST",
                body: JSON.stringify({ backup_folder: folder, backup_name: backupName, backup_count: count }),
            });
            state.styles = (data.styles || []).map(makeStyle);
            state.expanded.clear();
            state.dirty = false;
            render();
            await loadBackups();
            setStatus(t("restored", { file: data.safety_backup_file }), "success");
        } catch (error) {
            setStatus(t("restoreError", { message: error.message }), "error");
        } finally {
            setBusy(false);
            updateSummary();
        }
    }

    async function reloadStyles(force = false) {
        if (state.dirty && !force && !window.confirm(t("reloadConfirm"))) return;
        setBusy(true);
        setStatus(t("statusLoading"), "working");
        try {
            const data = await request("/reload", { method: "POST" });
            state.styles = (data.styles || []).map(makeStyle);
            state.expanded.clear();
            state.dirty = false;
            render();
            setStatus(t("statusLoaded", { file: data.file || "styles.csv" }), "success");
        } catch (error) {
            setStatus(t("statusReadError", { message: error.message }), "error");
        } finally {
            setBusy(false);
            updateSummary();
        }
    }

    function validateStyles() {
        const seen = new Set();
        for (let index = 0; index < state.styles.length; index += 1) {
            const style = state.styles[index];
            if (!style.name.trim()) return t("emptyStyleName", { index: index + 1 });
            const key = style.name.trim().toLocaleLowerCase();
            if (seen.has(key)) return t("duplicateStyle", { name: style.name });
            seen.add(key);
        }
        return "";
    }

    function refreshForgeStyleControls() {
        const refreshButtons = [...document.querySelectorAll('[id^="refresh_"][id$="_styles"]')];
        refreshButtons.forEach((button) => button.click());
        return refreshButtons.length;
    }

    async function saveStyles() {
        const validationError = validateStyles();
        if (validationError) {
            setStatus(validationError, "error");
            return;
        }

        const enabled = root.querySelector("#style-editor-backup-enabled");
        const count = root.querySelector("#style-editor-backup-count");
        const folder = root.querySelector("#style-editor-backup-folder");
        const backupCount = Math.min(100, Math.max(1, Number(count.value) || 10));
        const backupFolder = folder.value.trim() || DEFAULT_BACKUP_FOLDER;
        count.value = backupCount;
        folder.value = backupFolder;
        persistSettings();
        setBusy(true);
        setStatus(t("saving"), "working");
        try {
            const data = await request("/save", {
                method: "POST",
                body: JSON.stringify({
                    styles: state.styles.map(({ name, prompt, negative_prompt }) => ({ name, prompt, negative_prompt })),
                    backup_enabled: enabled.checked,
                    backup_count: backupCount,
                    backup_folder: backupFolder,
                }),
            });
            state.styles = (data.styles || []).map(makeStyle);
            state.expanded.clear();
            state.dirty = false;
            render();
            const backupMessage = data.backup_file ? t("backupMessage", { file: data.backup_file }) : "";
            const refreshedControls = data.restart_required ? 0 : refreshForgeStyleControls();
            const reloadMessage = data.restart_required
                ? t("restartNeeded")
                : t(refreshedControls ? "stylesRefreshed" : "stylesRefreshManual");
            setStatus(`${t("savedMessage")}${backupMessage}${reloadMessage}`, "success");
        } catch (error) {
            setStatus(t("saveError", { message: error.message }), "error");
        } finally {
            setBusy(false);
            updateSummary();
        }
    }

    function nextStyleName() {
        const names = new Set(state.styles.map((style) => style.name));
        let candidate = t("newStyle");
        let suffix = 2;
        while (names.has(candidate)) candidate = `${t("newStyle")} ${suffix++}`;
        return candidate;
    }

    function addStyle() {
        const style = makeStyle({ name: nextStyleName(), prompt: "", negative_prompt: "" });
        state.styles.push(style);
        state.expanded.add(style.id);
        state.query = "";
        root.querySelector("#style-editor-search").value = "";
        markDirty();
        render();
        const card = [...root.querySelectorAll(".style-editor-card")].find((item) => item.dataset.id === style.id);
        card?.querySelector('[data-field="name"]')?.focus();
    }

    function moveStyle(fromIndex, targetIndex, insertAfter) {
        if (fromIndex < 0 || targetIndex < 0 || fromIndex === targetIndex && !insertAfter) return;
        let insertIndex = targetIndex + (insertAfter ? 1 : 0);
        if (fromIndex < insertIndex) insertIndex -= 1;
        if (insertIndex === fromIndex) return;
        const [moved] = state.styles.splice(fromIndex, 1);
        state.styles.splice(insertIndex, 0, moved);
        markDirty();
        render();
    }

    function moveStyleOneStep(index, offset) {
        const targetIndex = index + offset;
        if (index < 0 || targetIndex < 0 || targetIndex >= state.styles.length) return;
        const [moved] = state.styles.splice(index, 1);
        state.styles.splice(targetIndex, 0, moved);
        markDirty();
        render();
    }

    function collapseExpandedCardsForDrag(list) {
        if (!state.expanded.size) return;
        state.expanded.clear();
        list.querySelectorAll(".style-editor-card.is-expanded").forEach((card) => {
            card.classList.remove("is-expanded");
            const toggle = card.querySelector('[data-action="toggle"]');
            if (!toggle) return;
            toggle.textContent = "▶";
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", t("expand"));
            toggle.title = t("expand");
        });
    }

    function autoScrollDuringDrag(clientY) {
        const edge = 72;
        const maxStep = 24;
        let step = 0;
        if (clientY < edge) step = -Math.min(maxStep, Math.ceil((edge - clientY) / 3));
        else if (clientY > window.innerHeight - edge) step = Math.min(maxStep, Math.ceil((clientY - (window.innerHeight - edge)) / 3));
        if (step) window.scrollBy(0, step);
    }

    function flashClipboardButton(button, label) {
        button.textContent = label;
        window.setTimeout(() => {
            if (!button.isConnected) return;
            button.textContent = t(button.dataset.action);
        }, 1000);
    }

    async function copyStyleField(style, field, button) {
        try {
            await navigator.clipboard.writeText(style[field] || "");
            flashClipboardButton(button, t("copied"));
        } catch (error) {
            setStatus(t("clipboardWriteError", { message: error.message }), "error");
        }
    }

    async function pasteStyleField(style, field, card, button) {
        try {
            const value = await navigator.clipboard.readText();
            style[field] = value;
            const textarea = card.querySelector(`[data-field="${field}"]`);
            if (textarea) textarea.value = value;
            markDirty();
            flashClipboardButton(button, t("pasted"));
        } catch (error) {
            setStatus(t("clipboardReadError", { message: error.message }), "error");
        }
    }

    function bindEvents() {
        const list = root.querySelector("#style-editor-list");
        root.querySelector("#style-editor-search").addEventListener("input", (event) => {
            state.query = event.target.value;
            render();
        });
        root.querySelector("#style-editor-add").addEventListener("click", addStyle);
        root.querySelector("#style-editor-reload").addEventListener("click", () => reloadStyles(false));
        root.querySelector("#style-editor-save").addEventListener("click", saveStyles);
        root.querySelector("#style-editor-language").addEventListener("change", (event) => {
            state.language = event.target.value === "ja" ? "ja" : "en";
            localStorage.setItem(LANGUAGE_STORAGE_KEY, state.language);
            applyLanguage();
            render();
            loadBackups();
        });

        const backupEnabled = root.querySelector("#style-editor-backup-enabled");
        const backupCount = root.querySelector("#style-editor-backup-count");
        const backupFolder = root.querySelector("#style-editor-backup-folder");
        backupEnabled.addEventListener("change", () => { updateBackupControls(); persistSettings(); });
        backupCount.addEventListener("input", persistSettings);
        backupFolder.addEventListener("input", persistSettings);
        backupFolder.addEventListener("change", loadBackups);
        root.querySelector("#style-editor-backup-now").addEventListener("click", createBackupNow);
        root.querySelector("#style-editor-browse-backup").addEventListener("click", browseBackupFolder);
        root.querySelector("#style-editor-reset-backup").addEventListener("click", resetBackupFolder);
        root.querySelector("#style-editor-backups-refresh").addEventListener("click", loadBackups);
        root.querySelector("#style-editor-backup-select").addEventListener("change", updateRestoreButton);
        root.querySelector("#style-editor-restore").addEventListener("click", restoreBackup);

        list.addEventListener("input", (event) => {
            const field = event.target.dataset.field;
            const card = event.target.closest(".style-editor-card");
            if (!field || !card) return;
            const index = Number(card.dataset.index);
            const style = state.styles[index];
            if (!style) return;
            style[field] = event.target.value;
            markDirty();
        });

        list.addEventListener("click", async (event) => {
            const card = event.target.closest(".style-editor-card");
            if (!card) return;
            const index = Number(card.dataset.index);
            const style = state.styles[index];
            if (!style) return;
            const actionButton = event.target.closest("[data-action]");
            if (!actionButton) return;
            const action = actionButton.dataset.action;

            if (action === "delete") {
                if (!window.confirm(t("deleteConfirm", { name: style.name }))) return;
                state.styles.splice(index, 1);
                state.expanded.delete(style.id);
                markDirty();
                render();
                return;
            }
            if (action === "move-up") {
                moveStyleOneStep(index, -1);
                return;
            }
            if (action === "move-down") {
                moveStyleOneStep(index, 1);
                return;
            }
            if (action === "toggle") {
                if (Date.now() < state.suppressToggleUntil) return;
                if (state.expanded.has(style.id)) state.expanded.delete(style.id);
                else state.expanded.add(style.id);
                render();
                return;
            }
            const field = actionButton.dataset.clipboardField;
            if (!field || !["prompt", "negative_prompt"].includes(field)) return;
            if (action === "copy") await copyStyleField(style, field, actionButton);
            else if (action === "paste") await pasteStyleField(style, field, card, actionButton);
        });

        list.addEventListener("dragstart", (event) => {
            const handle = event.target.closest("[data-drag-handle]");
            const card = event.target.closest(".style-editor-card");
            if (!handle || !card) return;
            collapseExpandedCardsForDrag(list);
            state.draggingId = card.dataset.id;
            state.suppressToggleUntil = Date.now() + 350;
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", state.draggingId);
            card.classList.add("is-dragging");
        });

        list.addEventListener("dragover", (event) => {
            const card = event.target.closest(".style-editor-card");
            if (!card || !state.draggingId) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
            list.querySelectorAll(".drag-over-before, .drag-over-after").forEach((item) => item.classList.remove("drag-over-before", "drag-over-after"));
            const insertAfter = event.clientY > card.getBoundingClientRect().top + card.getBoundingClientRect().height / 2;
            card.classList.add(insertAfter ? "drag-over-after" : "drag-over-before");
            autoScrollDuringDrag(event.clientY);
        });

        list.addEventListener("drop", (event) => {
            const card = event.target.closest(".style-editor-card");
            if (!card || !state.draggingId) return;
            event.preventDefault();
            const fromIndex = state.styles.findIndex((style) => style.id === state.draggingId);
            const targetIndex = Number(card.dataset.index);
            const insertAfter = event.clientY > card.getBoundingClientRect().top + card.getBoundingClientRect().height / 2;
            state.draggingId = null;
            moveStyle(fromIndex, targetIndex, insertAfter);
        });

        list.addEventListener("dragend", () => {
            state.draggingId = null;
            state.suppressToggleUntil = Date.now() + 350;
            list.querySelectorAll(".is-dragging, .drag-over-before, .drag-over-after").forEach((item) => item.classList.remove("is-dragging", "drag-over-before", "drag-over-after"));
        });
    }

    function buildUi() {
        root.innerHTML = `
            <div class="style-editor-header">
                <div>
                    <h2>Style Order Manager</h2>
                    <p id="style-editor-subtitle"></p>
                </div>
                <div class="style-editor-header-meta">
                    <select id="style-editor-language" class="style-editor-language" aria-label="Language">
                        <option value="en">EN</option>
                        <option value="ja">JA</option>
                    </select>
                    <span id="style-editor-summary">0 items</span>
                    <span id="style-editor-dirty">Saved</span>
                </div>
            </div>
            <div class="style-editor-toolbar">
                <label id="style-editor-search-label" class="style-editor-search-label" for="style-editor-search"></label>
                <input id="style-editor-search" type="search" autocomplete="off">
                <button id="style-editor-add" type="button"></button>
                <button id="style-editor-reload" type="button"></button>
                <button id="style-editor-save" type="button" class="primary" disabled></button>
            </div>
            <div id="style-editor-status" class="style-editor-status"></div>
            <p id="style-editor-help" class="style-editor-help"></p>
            <details class="style-editor-settings">
                <summary id="style-editor-settings-title"></summary>
                <div class="style-editor-settings-body">
                    <label><input id="style-editor-backup-enabled" type="checkbox" checked><span id="style-editor-backup-enabled-label"></span></label>
                    <label class="style-editor-count-label"><span id="style-editor-keep-label"></span><input id="style-editor-backup-count" type="number" min="1" max="100" step="1" value="10"><span id="style-editor-count-unit"></span></label>
                    <button id="style-editor-backup-now" type="button" class="style-editor-action-button"></button>
                    <div class="style-editor-backup-folder-row">
                        <label id="style-editor-folder-label" for="style-editor-backup-folder"></label>
                        <input id="style-editor-backup-folder" class="style-editor-backup-folder" type="text" value="styles_backups" spellcheck="false">
                        <button id="style-editor-browse-backup" type="button"></button>
                        <button id="style-editor-reset-backup" type="button"></button>
                    </div>
                    <div class="style-editor-restore-row">
                        <button id="style-editor-backups-refresh" type="button"></button>
                        <select id="style-editor-backup-select" class="style-editor-backup-select"><option value=""></option></select>
                        <button id="style-editor-restore" type="button" class="primary" disabled></button>
                        <span id="style-editor-backup-summary"></span>
                    </div>
                    <p id="style-editor-backup-note"></p>
                </div>
            </details>
            <div id="style-editor-list" class="style-editor-list"></div>`;
        state.language = detectLanguage();
        loadSettings();
        applyLanguage();
        setStatus(t("statusReady"));
        bindEvents();
        render();
    }

    function initialize() {
        const candidate = document.getElementById(APP_ID);
        if (!candidate || candidate.dataset.ready === "true") return;
        root = candidate;
        root.dataset.ready = "true";
        buildUi();
        reloadStyles(true);
        loadBackups();
    }

    if (typeof onUiLoaded === "function") onUiLoaded(initialize);
    else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
    else initialize();
    if (typeof onAfterUiUpdate === "function") onAfterUiUpdate(initialize);
})();
