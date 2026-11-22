(() => {
    "use strict";

    const APP_ID = "style-order-manager-app";
    const API_PREFIX = "/style-order-manager/v1";
    const STORAGE_KEY = "forge_neo_style_editor_settings_v1";
    const SETTINGS_VERSION = 2;
    const DEFAULT_BACKUP_FOLDER = "styles_backups";
    const LANGUAGE_STORAGE_KEY = "forge_neo_style_editor_language_v1";

    const I18N = {
        ja: {
            catalogWarning: " セット情報の確定処理を次回に再試行します。{message}",
            orderSets: "並べ替え", finishOrder: "完了", orderSaved: "セットの並び順を保存しました。",
            shiftLeft: "「{name}」を左へ", shiftRight: "「{name}」を右へ", newDestination: "＋ 新しいセット…",
            copiedTo: "「{name}」にコピーしました。",
            allSets: "すべて", setPicker: "スタイルセット", sets: "スタイルセット", firstSet: "セット1", setBase: "セット", newSet: "セット追加",
            renameSet: "名前変更", setName: "セット名", selectRows: "選択", finishSelect: "選択を終了",
            selectedRows: "{count}件選択中", destination: "送り先", moveSet: "移動", copySet: "コピー",
            dirtySwitch: "現在のセットに未保存の変更があります。", saveSwitch: "保存して切り替え",
            discardSwitch: "変更を破棄して切り替え", cancel: "キャンセル",
            saveTransfer: "現在の編集も保存して、選択したスタイルを送りますか？",
            collision: "送り先の「{name}」と名前が重複しています。別の名前を入力してください。空欄でこの項目をスキップします。",
            setReady: "使用中のセット：{name}", transferred: "「{name}」へ{count}件送りました。",
            setConflict: "一覧またはセットが更新されました。編集内容を控えて一覧を再読込してください。",
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
            saveAllStyles: "未保存のスタイル変更をすべて保存",
            statusReady: "読み込み前",
            statusLoading: "styles.csv を再読込しています...",
            statusLoaded: "{file} を読み込みました。",
            statusMissing: "{file} がありません。バックアップを選んでリストアできます。",
            conflict: "別のタブまたは外部で styles.csv が変更されました。未保存の編集は保持しています。編集を控えてから一覧を再読込し、変更を適用し直してください。",
            statusReadError: "読込エラー: {message}",
            help: "↑↓で1段ずつ移動、☷をドラッグして並べ替え、見出しをクリックして編集欄を開閉します。編集内容は「保存」するまで styles.csv に反映されません。",
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
            editStyleName: "スタイル名を編集",
            positivePrompt: "ポジティブプロンプト",
            negativePrompt: "ネガティブプロンプト",
            unsetStyleName: "（名称未設定）",
            noMatches: "検索条件に一致するスタイルがありません。",
            reloadConfirm: "未保存の変更を破棄して styles.csv を再読込しますか？",
            deleteConfirm: "「{name}」を削除しますか？",
            restoreConfirm: "現在の styles.csv を安全用バックアップにしてから「{name}」をリストアしますか？\n保存先: {folder}",
            cleanupWarning: " バックアップの世代整理に失敗しました（操作は完了済み）: {message}",
            backupsNotReady: "保存先のバックアップ一覧を更新してからリストアしてください。",
            restoreDirtyConfirm: "未保存の編集は破棄されます。{confirm}",
            restoredMissing: "リストアしました。元のCSVがなかったため復元前バックアップはありません。",
            folderChanged: "バックアップ保存先を変更しました。",
            folderReset: "バックアップ保存先を標準に戻しました。",
            folderError: "フォルダ選択エラー: {message} パスを直接入力できます。",
            restoring: "バックアップをリストアしています...",
            restored: "リストアしました。現行ファイルの退避: {file}",
            restoreError: "リストアエラー: {message}",
            saving: "styles.csv を保存しています...",
            saveError: "保存エラー: {message}",
            addError: "追加エラー: {message}",
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
            catalogWarning: " Set metadata finalization will be retried on next access. {message}",
            orderSets: "Reorder", finishOrder: "Done", orderSaved: "Set order saved.",
            shiftLeft: "Move {name} left", shiftRight: "Move {name} right", newDestination: "+ New set…",
            copiedTo: "Copied to “{name}”.",
            allSets: "All", setPicker: "Style set", sets: "Style sets", firstSet: "Set 1", setBase: "Set ", newSet: "Add set",
            renameSet: "Rename", setName: "Set name", selectRows: "Select", finishSelect: "Done selecting",
            selectedRows: "{count} selected", destination: "Destination", moveSet: "Move", copySet: "Copy",
            dirtySwitch: "The current set has unsaved changes.", saveSwitch: "Save and switch",
            discardSwitch: "Discard and switch", cancel: "Cancel",
            saveTransfer: "Save the current edits and transfer the selected styles?",
            collision: "“{name}” already exists in the destination. Enter another name, or leave it blank to skip this style.",
            setReady: "Active set: {name}", transferred: "Sent {count} style(s) to “{name}”.",
            setConflict: "Styles or sets changed. Keep your edits and reload the list.",
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
            saveAllStyles: "Save all unsaved style changes",
            statusReady: "Not loaded",
            statusLoading: "Reloading styles.csv...",
            statusLoaded: "Loaded {file}.",
            statusMissing: "{file} is missing. Select a backup to restore it.",
            conflict: "Another tab or external writer changed styles.csv. Your unsaved edits are retained. Copy them before reloading the list, then apply them again.",
            statusReadError: "Read error: {message}",
            help: "Use ↑↓ to move one step, drag ☷ to reorder, and click the heading to open or close the editor. Changes are not written to styles.csv until you press Save.",
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
            editStyleName: "Edit style name",
            positivePrompt: "Positive prompt",
            negativePrompt: "Negative prompt",
            unsetStyleName: "(unnamed)",
            noMatches: "No styles match the search.",
            reloadConfirm: "Discard unsaved changes and reload styles.csv?",
            deleteConfirm: "Delete “{name}”?",
            restoreConfirm: "Back up the current styles.csv, then restore “{name}”?\nFolder: {folder}",
            cleanupWarning: " Backup retention failed (the operation completed): {message}",
            backupsNotReady: "Refresh the backups for this folder before restoring.",
            restoreDirtyConfirm: "Unsaved edits will be discarded. {confirm}",
            restoredMissing: "Restored. There was no current CSV to back up.",
            folderChanged: "Backup folder changed.",
            folderReset: "Backup folder reset to default.",
            folderError: "Folder picker error: {message} You can enter a path manually.",
            restoring: "Restoring the backup...",
            restored: "Restored. Current file saved as: {file}",
            restoreError: "Restore error: {message}",
            saving: "Saving styles.csv...",
            saveError: "Save error: {message}",
            addError: "Could not add style: {message}",
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
        revision: null,
        sets: [], activeSet: null, setsRevision: null,
        generationSet: "",
        orderingSets: false,
        selecting: false, selected: new Set(), destination: "",
        backupsRequest: 0,
        backupsLoading: false,
        backupsInputFolder: null,
        backupsFolder: null,
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
        count.disabled = state.busy;
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
        root.querySelectorAll('[data-action="save"]').forEach((button) => {
            button.disabled = state.busy || !state.dirty;
        });
    }

    function setBusy(busy) {
        state.busy = busy;
        if (busy) state.draggingId = null;
        root.setAttribute("aria-busy", String(busy));
        ["#style-editor-add", "#style-editor-reload", "#style-editor-save"].forEach((selector) => {
            const button = root.querySelector(selector);
            if (button) button.disabled = busy || (selector === "#style-editor-save" && !state.dirty);
        });
        ["#style-editor-backup-now", "#style-editor-browse-backup", "#style-editor-reset-backup", "#style-editor-backups-refresh"].forEach((selector) => {
            const button = root.querySelector(selector);
            if (button) button.disabled = busy;
        });
        updateRestoreButton();
        root.querySelector("#style-editor-search").disabled = busy;
        ["#style-editor-language", "#style-editor-backup-enabled", "#style-editor-backup-count", "#style-editor-backup-folder"].forEach((selector) => {
            root.querySelector(selector).disabled = busy;
        });
        renderSets();
        lockRowControls();
    }

    function lockRowControls() {
        root.querySelectorAll(".style-editor-card").forEach((card) => {
            const index = Number(card.dataset.index);
            card.querySelectorAll("input, textarea, button, select").forEach((control) => {
                const action = control.dataset.action;
                control.disabled = state.busy
                    || action === "save" && !state.dirty
                    || action === "move-up" && index === 0
                    || action === "move-down" && index === state.styles.length - 1;
            });
            card.querySelector("[data-drag-handle]").draggable = !state.busy;
        });
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
                ${state.selecting ? `<label class="style-set-check"><input type="checkbox" data-pick-style aria-label="${escapeHtml(style.name)}" ${state.selected.has(style.id) ? "checked" : ""}></label>` : ""}
                <div class="style-editor-card-side">
                    <button type="button" class="style-editor-move-button" data-action="move-up" title="${escapeHtml(t("moveUp"))}" aria-label="${escapeHtml(t("moveUp"))}" ${index === 0 ? "disabled" : ""}>↑</button>
                    <button type="button" class="style-editor-move-button" data-action="move-down" title="${escapeHtml(t("moveDown"))}" aria-label="${escapeHtml(t("moveDown"))}" ${index === state.styles.length - 1 ? "disabled" : ""}>↓</button>
                    <button type="button" class="style-editor-drag-handle" draggable="true" data-drag-handle="true" title="${escapeHtml(t("dragTitle"))}" aria-label="${escapeHtml(t("dragTitle"))}"><span aria-hidden="true">☷</span><span class="style-editor-order">${index + 1}</span></button>
                </div>
                <div class="style-editor-card-body">
                    <div class="style-editor-card-heading">
                        <button type="button" class="style-editor-toggle" data-action="toggle" title="${escapeHtml(t(expanded ? "collapse" : "expand"))}" aria-label="${escapeHtml(t(expanded ? "collapse" : "expand"))}" aria-expanded="${expanded}">${expanded ? "▼" : "▶"}</button>
                        <strong>${escapeHtml(style.name || t("unsetStyleName"))}</strong>
                        <button type="button" class="style-editor-edit-name" data-action="edit-name" title="${escapeHtml(t("editStyleName"))}" aria-label="${escapeHtml(t("editStyleName"))}">✎</button>
                        <input type="text" class="style-editor-name" data-field="name" aria-label="${escapeHtml(t("styleName"))}" placeholder="${escapeHtml(t("styleName"))}" value="${escapeHtml(style.name)}" autocomplete="off">
                        <button type="button" class="style-editor-card-save primary" data-action="save" title="${escapeHtml(t("saveAllStyles"))}">${escapeHtml(t("save"))}</button>
                        <button type="button" class="style-editor-delete" data-action="delete">${escapeHtml(t("delete"))}</button>
                    </div>
                    <div class="style-editor-fields">
                        ${expanded && state.sets.length ? cardTransferMarkup(style) : ""}
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
        renderSets();
        const list = root.querySelector("#style-editor-list");
        const query = state.query.trim().toLocaleLowerCase();
        const matches = state.styles
            .map((style, index) => ({ style, index }))
            .filter(({ style }) => !query || [style.name, style.prompt, style.negative_prompt]
                .some((value) => value.toLocaleLowerCase().includes(query)));

        list.innerHTML = matches.length
            ? matches.map(({ style, index }) => cardMarkup(style, index)).join("")
            : `<div class="style-editor-empty">${escapeHtml(t("noMatches"))}</div>`;
        lockRowControls();
        updateSummary();
    }

    function apiBase() {
        // Gradio's configured root includes --subpath; pathname covers older hosts.
        const configuredRoot = globalThis.gradio_config?.root;
        const base = typeof configuredRoot === "string" && configuredRoot
            ? new URL(configuredRoot, window.location.href).pathname
            : window.location.pathname;
        return `${base.replace(/\/+$/, "")}${API_PREFIX}`;
    }

    async function request(path, options = {}) {
        const response = await fetch(`${apiBase()}${path}`, {
            cache: "no-store",
            ...options,
            headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const error = new Error(response.status === 409 ? t(state.sets.length ? "setConflict" : "conflict") : data.error || data.detail || `HTTP ${response.status}`);
            error.status = response.status;
            throw error;
        }
        return data;
    }

    function currentBackupFolder() {
        return root.querySelector("#style-editor-backup-folder").value.trim() || DEFAULT_BACKUP_FOLDER;
    }

    function backupSelectionIsCurrent() {
        const select = root.querySelector("#style-editor-backup-select");
        return !state.backupsLoading && state.backupsInputFolder === currentBackupFolder()
            && Boolean(state.backupsFolder) && state.backups.some(backup => backup.name === select?.value);
    }

    function updateRestoreButton() {
        const select = root.querySelector("#style-editor-backup-select");
        const restore = root.querySelector("#style-editor-restore");
        if (restore) restore.disabled = state.busy || !backupSelectionIsCurrent();
        if (select) select.disabled = state.busy || state.backupsLoading || state.backupsInputFolder !== currentBackupFolder();
    }

    function invalidateBackups() {
        state.backupsRequest += 1;
        state.backups = [];
        state.backupsInputFolder = null;
        state.backupsFolder = null;
        state.backupsLoading = false;
        root.querySelector("#style-editor-backup-select").innerHTML = `<option value="">${escapeHtml(t("noBackups"))}</option>`;
        root.querySelector("#style-editor-backup-summary").textContent = "";
        updateRestoreButton();
    }

    async function loadBackups() {
        invalidateBackups();
        const requestId = state.backupsRequest;
        const folder = currentBackupFolder();
        state.backupsLoading = true;
        updateRestoreButton();
        const select = root.querySelector("#style-editor-backup-select");
        const summary = root.querySelector("#style-editor-backup-summary");
        try {
            const data = await request("/backups", {
                method: "POST",
                body: JSON.stringify({ backup_folder: folder }),
            });
            if (requestId !== state.backupsRequest || folder !== currentBackupFolder()) return;
            if (typeof data.folder !== "string" || !data.folder.trim()) throw new Error("Backup folder is missing");
            state.backups = data.backups || [];
            state.backupsInputFolder = folder;
            state.backupsFolder = data.folder;
            select.innerHTML = state.backups.length
                ? state.backups.map((backup) => {
                    const locale = state.language === "ja" ? "ja-JP" : "en-US";
                    const date = backup.modified ? new Date(backup.modified).toLocaleString(locale) : "";
                    return `<option value="${escapeHtml(backup.name)}">${escapeHtml(backup.name)}${date ? ` — ${escapeHtml(date)}` : ""}</option>`;
                }).join("")
                : `<option value="">${escapeHtml(t("noBackups"))}</option>`;
            summary.textContent = t("backupCount", { count: state.backups.length });
        } catch (error) {
            if (requestId !== state.backupsRequest) return;
            state.backups = [];
            state.backupsInputFolder = null;
            state.backupsFolder = null;
            select.innerHTML = `<option value="">${escapeHtml(t("backupListError"))}</option>`;
            summary.textContent = t("backupListError");
        } finally {
            if (requestId === state.backupsRequest) {
                state.backupsLoading = false;
                updateRestoreButton();
            }
        }
    }

    function showCommittedStatus(message, data) {
        if (data.cleanup_warning) message += t("cleanupWarning", {message: data.cleanup_warning});
        if (data.catalog_warning) message += t("catalogWarning", {message: data.catalog_warning});
        setStatus(message, data.cleanup_warning || data.catalog_warning ? "warning" : "success");
    }

    async function browseBackupFolder() {
        if (state.busy) return;
        setBusy(true);
        try {
            const data = await request("/select-backup-folder", { method: "POST" });
            if (!data.folder) return;
            root.querySelector("#style-editor-backup-folder").value = data.folder;
            persistSettings();
            await loadBackups();
            setStatus(t("folderChanged"), "success");
        } catch (error) {
            setStatus(t("folderError", { message: error.message }), "error");
        } finally {
            setBusy(false);
        }
    }

    async function resetBackupFolder() {
        if (state.busy) return;
        root.querySelector("#style-editor-backup-folder").value = DEFAULT_BACKUP_FOLDER;
        persistSettings();
        await loadBackups();
        setStatus(t("folderReset"), "success");
    }

    async function createBackupNow() {
        if (state.busy) return;
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
            showCommittedStatus(t("backupCreated", { file: data.backup_file }), data);
        } catch (error) {
            setStatus(t("backupCreateError", { message: error.message }), "error");
        } finally {
            setBusy(false);
            updateSummary();
        }
    }

    async function restoreBackup() {
        if (state.busy) return;
        const select = root.querySelector("#style-editor-backup-select");
        if (!backupSelectionIsCurrent()) {
            setStatus(t("backupsNotReady"), "warning");
            return;
        }
        const backupName = select.value;
        const folder = state.backupsFolder;
        const confirm = t("restoreConfirm", { name: backupName, folder });
        if (!window.confirm(state.dirty ? t("restoreDirtyConfirm", { confirm }) : confirm)) return;

        if (!backupSelectionIsCurrent() || select.value !== backupName || state.backupsFolder !== folder) return;
        const count = Math.min(100, Math.max(1, Number(root.querySelector("#style-editor-backup-count").value) || 10));
        setBusy(true);
        setStatus(t("restoring"), "working");
        try {
            const data = await request("/restore", {
                method: "POST",
                body: JSON.stringify({ backup_folder: folder, backup_name: backupName, backup_count: count, revision: state.revision, sets_revision: state.setsRevision }),
            });
            state.selected.clear();
            state.styles = (data.styles || []).map(makeStyle);
            state.revision = data.revision;
            state.expanded.clear();
            state.dirty = false;
            render();
            await loadBackups();
            const refreshed = data.restart_required ? 0 : refreshForgeStyleControls();
            const message = data.safety_backup_file ? t("restored", { file: data.safety_backup_file }) : t("restoredMissing");
            showCommittedStatus(message + t(data.restart_required ? "restartNeeded" : refreshed ? "stylesRefreshed" : "stylesRefreshManual"), data);
        } catch (error) {
            setStatus(t("restoreError", { message: error.message }), "error");
        } finally {
            setBusy(false);
            updateSummary();
        }
    }

    async function reloadStyles(force = false) {
        if (state.busy) return;
        if (state.dirty && !force && !window.confirm(t("reloadConfirm"))) return;
        setBusy(true);
        setStatus(t("statusLoading"), "working");
        try {
            const data = await request("/reload", { method: "POST" });
            readSets(data);
            state.selected.clear();
            state.styles = (data.styles || []).map(makeStyle);
            state.revision = data.revision;
            state.expanded.clear();
            state.dirty = false;
            render();
            refreshGenerationViews();
            setStatus(t(data.missing_file ? "statusMissing" : "statusLoaded", { file: data.file || "styles.csv" }), "success");
        } catch (error) {
            setStatus(t("statusReadError", { message: error.message }), "error");
        } finally {
            setBusy(false);
            updateSummary();
        }
    }

    function earlyStyleNameKey(name) {
        // Only certain ASCII folds are checked locally. Do not trim names or
        // invent a partial Unicode casefold; the server remains authoritative.
        return name.replace(/[A-Z]/g, char => char.toLowerCase());
    }

    function validateStyles() {
        const seen = new Set();
        for (let index = 0; index < state.styles.length; index += 1) {
            const style = state.styles[index];
            if (!style.name.trim()) return t("emptyStyleName", { index: index + 1 });
            const key = earlyStyleNameKey(style.name);
            if (seen.has(key)) return t("duplicateStyle", { name: style.name });
            seen.add(key);
        }
        return "";
    }

    function refreshForgeStyleControls() {
        const refreshButtons = [...document.querySelectorAll('[id^="refresh_"][id$="_styles"]')];
        refreshButtons.forEach(button => {
            const tab = button.id.replace(/^refresh_/, "").replace(/_styles$/, "");
            if (!requestGenerationChoices(tab)) button.click();
        });
        return refreshButtons.length;
    }

    async function saveStyles() {
        if (state.busy) return;
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
                    sets_revision: state.setsRevision,
                    revision: state.revision,
                    backup_enabled: enabled.checked,
                    backup_count: backupCount,
                    backup_folder: backupFolder,
                }),
            });
            state.selected.clear();
            // The save response follows submission order. Keep each card's UI identity.
            data.styles.forEach((saved, index) => Object.assign(state.styles[index], saved));
            state.revision = data.revision;
            state.dirty = false;
            render();
            await loadBackups();
            const backupMessage = data.backup_file ? t("backupMessage", { file: data.backup_file }) : "";
            const refreshedControls = data.restart_required ? 0 : refreshForgeStyleControls();
            const reloadMessage = data.restart_required
                ? t("restartNeeded")
                : t(refreshedControls ? "stylesRefreshed" : "stylesRefreshManual");
            showCommittedStatus(`${t("savedMessage")}${backupMessage}${reloadMessage}`, data);
        } catch (error) {
            setStatus(t("saveError", { message: error.message }), "error");
        } finally {
            setBusy(false);
            updateSummary();
        }
    }

    async function nextStyleName() {
        const data = await request("/next-name", {
            method: "POST",
            body: JSON.stringify({base: t("newStyle"), names: state.styles.map(style => style.name)}),
        });
        if (typeof data.name !== "string" || !data.name.trim()) throw new Error("Invalid style name response");
        return data.name;
    }

    async function addStyle() {
        if (state.busy) return;
        setBusy(true);
        try {
            const name = await nextStyleName();
            const style = makeStyle({ name, prompt: "", negative_prompt: "" });
            state.styles.push(style);
            state.expanded.add(style.id);
            state.query = "";
            root.querySelector("#style-editor-search").value = "";
            markDirty();
            render();
            const card = [...root.querySelectorAll(".style-editor-card")].find(item => item.dataset.id === style.id);
            card?.querySelector('[data-field="name"]')?.focus();
        } catch (error) {
            setStatus(t("addError", {message: error.message}), "error");
        } finally {
            setBusy(false);
        }
    }

    function moveStyle(fromIndex, targetIndex, insertAfter) {
        if (state.busy) return;
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
        if (state.busy) return;
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
        if (state.busy) return;
        // Hold the same mutation lock while the clipboard promise is pending.
        setBusy(true);
        try {
            const value = await navigator.clipboard.readText();
            style[field] = value;
            const textarea = card.querySelector(`[data-field="${field}"]`);
            if (textarea) textarea.value = value;
            markDirty();
            flashClipboardButton(button, t("pasted"));
        } catch (error) {
            setStatus(t("clipboardReadError", { message: error.message }), "error");
        } finally {
            setBusy(false);
        }
    }

    function readSets(data) {
        state.sets = data.sets || [];
        if (!state.sets.some(set => set.id === state.generationSet)) state.generationSet = "";
        state.activeSet = data.active_set;
        state.setsRevision = data.sets_revision;
    }

    function setLabel(set) {
        return set.name ?? t("firstSet");
    }

    function destinationOptions(sets, selected) {
        return sets.map(set => `<option value="${escapeHtml(set.id)}" ${set.id === selected ? "selected" : ""}>${escapeHtml(setLabel(set))}</option>`).join("");
    }

    function cardTransferMarkup(style) {
        const others = state.sets.filter(set => set.id !== state.activeSet);
        return `<div class="style-editor-toolbar style-set-bar style-card-transfer">
            <label>${t("destination")} <select data-card-destination>
                ${destinationOptions(others, style.destination ?? state.destination)}
                <option value="" ${style.destination === "" ? "selected" : ""}>${t("newDestination")}</option>
            </select></label>
            <button type="button" data-action="set-move">${t("moveSet")}</button>
            <button type="button" data-action="set-copy">${t("copySet")}</button>
            <span role="status">${style.copiedTo ? escapeHtml(t("copiedTo", {name: style.copiedTo})) : ""}</span>
        </div>`;
    }

    function setTabMarkup(set, index) {
        const id = escapeHtml(set.id);
        const name = setLabel(set);
        const disabled = state.busy ? "disabled" : "";
        const tab = `<button type="button" data-set-id="${id}" draggable="${!state.busy}" aria-pressed="${set.id === state.activeSet}" ${disabled}>${escapeHtml(name)}</button>`;
        if (!state.orderingSets) return tab;
        const arrow = (step, label, symbol, edge) => `<button type="button" data-order-id="${id}" data-step="${step}" aria-label="${escapeHtml(t(label, {name}))}" ${state.busy || edge ? "disabled" : ""}>${symbol}</button>`;
        return `<span class="style-set-order-group">${arrow(-1, "shiftLeft", "←", index === 0)}${tab}${arrow(1, "shiftRight", "→", index === state.sets.length - 1)}</span>`;
    }

    async function reorderSet(id, position) {
        const order = state.sets.map(set => set.id);
        const from = order.indexOf(id);
        if (state.busy || from < 0 || position < 0 || position >= order.length || from === position) return;
        order.splice(from, 1);
        order.splice(position, 0, id);
        setBusy(true);
        try {
            readSets(await request("/sets", {method: "POST", body: JSON.stringify({
                action: "reorder", order, sets_revision: state.setsRevision,
            })}));
            render();
            refreshGenerationViews();
            setStatus(t("orderSaved"), "success");
        } catch (error) {
            setStatus(error.message, "error");
        } finally {
            setBusy(false);
        }
    }

    let generationRequest = 0;
    const pendingGenerationViews = new Map();

    function requestGenerationChoices(tab) {
        const input = document.querySelector(`#som_${tab}_style_view textarea, #som_${tab}_style_view input`);
        const field = document.getElementById(tab + "_styles");
        if (!input || !field || !input.closest(".som-independent-view")) return false;
        if (pendingGenerationViews.has(tab)) {
            pendingGenerationViews.set(tab, true);
            return true;
        }
        pendingGenerationViews.set(tab, false);
        // A click on the old choices while Gradio is replacing them would be lost.
        field.inert = true;
        document.addEventListener(`som-${tab}-choices-ready`, () => {
            const again = pendingGenerationViews.get(tab);
            pendingGenerationViews.delete(tab);
            field.inert = false;
            if (again) requestGenerationChoices(tab);
        }, {once: true});
        const view = state.generationSet || "all";
        input.value = `${view}/${++generationRequest}`;
        input.dispatchEvent(new Event("input", {bubbles: true}));
        return true;
    }

    function bindNativeStyleRefresh(tab) {
        // Forge's own refresh button normally resets the generation dropdown to the active CSV.
        const refresh = document.getElementById("refresh_" + tab + "_styles");
        if (refresh && !refresh.dataset.somRefresh) {
            refresh.dataset.somRefresh = "true";
            refresh.addEventListener("click", event => {
                if (requestGenerationChoices(tab)) event.stopImmediatePropagation();
            }, true);
        }
        const field = document.getElementById(tab + "_styles");
        const dialog = document.getElementById(tab + "_styles_dialog");
        if (!field || !dialog || field.dataset.somEditRefresh) return;
        field.dataset.somEditRefresh = "true";
        let edited = false;
        dialog.addEventListener("click", event => {
            const button = event.target.closest("button");
            if (button && [tab + "_edit_style_save", tab + "_edit_style_delete"].includes(button.id)) edited = true;
        });
        field.addEventListener("focusin", () => {
            if (edited) requestGenerationChoices(tab);
            edited = false;
        });
    }

    function refreshGenerationViews() {
        for (const tab of ["txt2img", "img2img"]) {
            requestGenerationChoices(tab);
        }
    }

    function setGenerationView(setId) {
        if (state.generationSet === setId || state.busy) return;
        state.generationSet = setId;
        syncGenerationSetPickers();
        refreshGenerationViews();
    }

    function syncGenerationSetPickers() {
        if (!state.sets.length) return;
        for (const tab of ["txt2img", "img2img"]) {
            const row = document.getElementById(tab + "_styles_row");
            if (!row) continue;
            const id = "style-order-manager-" + tab + "-picker";
            let picker = document.getElementById(id);
            if (!picker) {
                picker = document.createElement("div");
                picker.id = id;
                picker.className = "style-generation-set-picker";
                picker.innerHTML = '<label><span></span><select></select></label><small role="status"></small>';
                picker.querySelector("select").addEventListener("change", event => {
                    const target = event.target.value;
                    picker.querySelector("small").textContent = "";
                    setGenerationView(target);
                });
            }
            if (row.previousElementSibling !== picker) row.before(picker);
            const select = picker.querySelector("select");
            const supportsAll = !!document.getElementById("som_" + tab + "_style_view")?.classList.contains("som-independent-view");
            if (supportsAll) bindNativeStyleRefresh(tab);
            const active = state.generationSet;
            const version = JSON.stringify([state.setsRevision, state.language, supportsAll]);
            if (select.dataset.version !== version) {
                picker.querySelector("label span").textContent = t("setPicker");
                select.innerHTML = (supportsAll ? `<option value="">${t("allSets")}</option>` : "")
                    + destinationOptions(state.sets, active);
                select.dataset.version = version;
                picker.querySelector("small").textContent = "";
            }
            if (select.value !== active) select.value = active;
            const disabled = state.busy || !supportsAll;
            if (select.disabled !== disabled) select.disabled = disabled;
        }
    }

    function renderSets() {
        syncGenerationSetPickers();
        const panel = root.querySelector("#style-set-panel");
        if (!panel) return;
        panel.hidden = !state.sets.length;
        if (panel.hidden) return;
        const disabled = state.busy ? "disabled" : "";
        const others = state.sets.filter(set => set.id !== state.activeSet);
        if (!others.some(set => set.id === state.destination)) state.destination = others[0]?.id || "";
        panel.innerHTML = `<div class="style-editor-toolbar style-set-bar">
            <strong>${t("sets")}</strong>
            ${state.sets.map(setTabMarkup).join("")}
            <button type="button" data-set-action="create" ${disabled}>＋ ${t("newSet")}</button>
            <button type="button" data-set-action="rename" ${disabled}>${t("renameSet")}</button>
            ${others.length ? `<button type="button" data-set-action="order" aria-pressed="${state.orderingSets}" ${disabled}>${t(state.orderingSets ? "finishOrder" : "orderSets")}</button>` : ""}
            ${others.length ? `<button type="button" data-set-action="select" aria-pressed="${state.selecting}" ${disabled}>${t(state.selecting ? "finishSelect" : "selectRows")}</button>` : ""}
        </div>`;
        if (!state.selecting || !others.length) return;
        const blocked = state.busy || !state.selected.size ? "disabled" : "";
        panel.insertAdjacentHTML("beforeend", `<div class="style-editor-toolbar style-set-bar">
            <span>${t("selectedRows", {count: state.selected.size})}</span>
            <label>${t("destination")} <select data-destination ${disabled}>
                ${destinationOptions(others, state.destination)}
            </select></label>
            <button type="button" data-set-action="move" ${blocked}>${t("moveSet")}</button>
            <button type="button" data-set-action="copy" ${blocked}>${t("copySet")}</button>
        </div>`);
    }

    function dirtySwitchChoice() {
        const dialog = document.createElement("dialog");
        dialog.className = "style-set-dialog";
        dialog.innerHTML = `<form method="dialog"><p>${t("dirtySwitch")}</p>
            <div class="style-editor-toolbar"><button value="save">${t("saveSwitch")}</button>
            <button value="discard">${t("discardSwitch")}</button>
            <button value="cancel" autofocus>${t("cancel")}</button></div></form>`;
        root.append(dialog);
        return new Promise(resolve => {
            dialog.addEventListener("close", () => {
                const choice = dialog.returnValue;
                dialog.remove();
                resolve(choice);
            }, { once: true });
            dialog.showModal();
        });
    }

    async function setAction(action, target, cardIndex = null) {
        if (state.busy) return;
        if (action === "switch" && target === state.activeSet) return;
        if (action === "order") {
            state.orderingSets = !state.orderingSets;
            renderSets();
            return;
        }
        if (action === "select") {
            state.selecting = !state.selecting;
            state.selected.clear();
            render();
            return;
        }
        const transfer = action === "move" || action === "copy";
        const payload = {
            action, target, revision: state.revision, sets_revision: state.setsRevision,
            backup_folder: currentBackupFolder(),
            backup_count: Math.min(100, Math.max(1, Number(root.querySelector("#style-editor-backup-count").value) || 10)),
            backup_enabled: root.querySelector("#style-editor-backup-enabled").checked,
        };
        setBusy(true);
        try {
            if (action === "create" || action === "rename" || (transfer && cardIndex !== null && !target)) {
                const active = state.sets.find(set => set.id === state.activeSet);
                let number = state.sets.length + 1;
                const names = new Set(state.sets.map(setLabel));
                while (names.has(t("setBase") + number)) number++;
                const suggested = action === "rename" ? setLabel(active) : t("setBase") + number;
                payload.name = window.prompt(t("setName"), suggested)?.trim();
                if (!payload.name) return;
            }
            if (state.dirty && action !== "rename") {
                if (transfer) {
                    if (!window.confirm(t("saveTransfer"))) return;
                    payload.draft = state.styles;
                } else {
                    const choice = await dirtySwitchChoice();
                    if (choice === "save") payload.draft = state.styles;
                    else if (choice !== "discard") return;
                }
            }
            if (transfer) {
                payload.target = cardIndex === null ? state.destination : target || null;
                payload.indices = cardIndex === null
                    ? state.styles.flatMap((row, i) => state.selected.has(row.id) ? [i] : [])
                    : [cardIndex];
                payload.names = {};
            }
            let data;
            for (;;) {
                data = await request("/sets", {method: "POST", body: JSON.stringify(payload)});
                if (!data.conflicts) break;
                for (const conflict of data.conflicts) {
                    const name = window.prompt(t("collision", {name: conflict.name}), conflict.suggested);
                    if (name === null) return;
                    payload.names[conflict.index] = name.trim() ? name : null;
                }
            }
            readSets(data);
            if (cardIndex !== null) {
                const row = state.styles[cardIndex];
                if (data.transferred && action === "move") {
                    state.styles.splice(cardIndex, 1);
                    state.selected.delete(row.id);
                    state.expanded.delete(row.id);
                } else if (data.transferred) {
                    row.destination = data.destination || target;
                    row.copiedTo = setLabel(state.sets.find(set => set.id === row.destination));
                }
                state.revision = data.revision;
                state.dirty = false;
            } else if (action !== "rename") {
                state.styles = data.styles.map(makeStyle);
                state.revision = data.revision;
                state.selected.clear();
                state.expanded.clear();
                state.dirty = false;
                if (!transfer) {
                    state.selecting = false;
                    state.query = "";
                    root.querySelector("#style-editor-search").value = "";
                }
            }
            render();
            const name = setLabel(state.sets.find(set => set.id === (transfer ? (data.destination || payload.target) : state.activeSet)));
            let message = transfer ? t("transferred", {name, count: data.transferred}) : t("setReady", {name});
            if (data.refresh) {
                const refreshed = !data.restart_required && refreshForgeStyleControls();
                message += t(data.restart_required ? "restartNeeded" : refreshed ? "stylesRefreshed" : "stylesRefreshManual");
                await loadBackups();
            } else {
                refreshGenerationViews();
            }
            showCommittedStatus(message, data);
        } catch (error) {
            setStatus(error.message, "error");
        } finally {
            setBusy(false);
            updateSummary();
        }
    }

    function bindEvents() {
        const panel = root.querySelector("#style-set-panel");
        panel.addEventListener("click", event => {
            const button = event.target.closest("button");
            if (!button) return;
            if (button.dataset.orderId) {
                const from = state.sets.findIndex(set => set.id === button.dataset.orderId);
                reorderSet(button.dataset.orderId, from + Number(button.dataset.step));
            } else if (!state.orderingSets || !button.dataset.setId) {
                setAction(button.dataset.setAction || "switch", button.dataset.setId);
            }
        });
        let draggedSet = null;
        panel.addEventListener("dragstart", event => {
            const tab = event.target.closest("[data-set-id]");
            if (!tab || state.busy) return;
            draggedSet = tab.dataset.setId;
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", draggedSet);
        });
        function clearDropMarker() {
            panel.querySelectorAll("[data-drop-side]").forEach(tab => delete tab.dataset.dropSide);
        }
        panel.addEventListener("dragover", event => {
            const tab = event.target.closest("[data-set-id]");
            clearDropMarker();
            if (!draggedSet || !tab || tab.dataset.setId === draggedSet) return;
            event.preventDefault();
            const bounds = tab.getBoundingClientRect();
            tab.dataset.dropSide = event.clientX < bounds.left + bounds.width / 2 ? "before" : "after";
        });
        panel.addEventListener("drop", event => {
            const tab = event.target.closest("[data-set-id]");
            if (!draggedSet || !tab || !tab.dataset.dropSide) return;
            event.preventDefault();
            const others = state.sets.filter(set => set.id !== draggedSet);
            const position = others.findIndex(set => set.id === tab.dataset.setId);
            const after = tab.dataset.dropSide === "after";
            clearDropMarker();
            reorderSet(draggedSet, position + Number(after));
            draggedSet = null;
        });
        panel.addEventListener("dragend", () => { draggedSet = null; clearDropMarker(); });
        panel.addEventListener("change", event => {
            if (event.target.matches("[data-destination]")) state.destination = event.target.value;
        });
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
        backupFolder.addEventListener("input", () => { invalidateBackups(); persistSettings(); });
        backupFolder.addEventListener("change", loadBackups);
        root.querySelector("#style-editor-backup-now").addEventListener("click", createBackupNow);
        root.querySelector("#style-editor-browse-backup").addEventListener("click", browseBackupFolder);
        root.querySelector("#style-editor-reset-backup").addEventListener("click", resetBackupFolder);
        root.querySelector("#style-editor-backups-refresh").addEventListener("click", loadBackups);
        root.querySelector("#style-editor-backup-select").addEventListener("change", updateRestoreButton);
        root.querySelector("#style-editor-restore").addEventListener("click", restoreBackup);

        list.addEventListener("change", event => {
            if (state.busy) return;
            if (event.target.matches("[data-card-destination]")) {
                const row = state.styles[Number(event.target.closest(".style-editor-card").dataset.index)];
                row.destination = event.target.value;
                row.copiedTo = "";
                event.target.closest(".style-card-transfer").querySelector('[role="status"]').textContent = "";
                return;
            }
            if (!event.target.matches("[data-pick-style]")) return;
            const id = event.target.closest(".style-editor-card").dataset.id;
            if (event.target.checked) state.selected.add(id);
            else state.selected.delete(id);
            renderSets();
        });
        list.addEventListener("input", (event) => {
            if (state.busy) return;
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
            if (state.busy) return;
            const card = event.target.closest(".style-editor-card");
            if (!card) return;
            const index = Number(card.dataset.index);
            const style = state.styles[index];
            if (!style) return;
            if (event.target.closest(".style-editor-name")) return;
            const actionButton = event.target.closest("[data-action]")
                || event.target.closest(".style-editor-card-heading")?.querySelector('[data-action="toggle"]');
            if (!actionButton) return;
            const action = actionButton.dataset.action;

            if (action === "edit-name") {
                state.expanded.add(style.id);
                render();
                const input = list.querySelector(`.style-editor-card[data-index="${index}"] .style-editor-name`);
                input.focus();
                input.select();
                return;
            }
            if (action === "set-move" || action === "set-copy") {
                const destination = card.querySelector("[data-card-destination]").value;
                await setAction(action === "set-move" ? "move" : "copy", destination, index);
                return;
            }
            if (action === "save") {
                await saveStyles();
                return;
            }
            if (action === "delete") {
                if (!window.confirm(t("deleteConfirm", { name: style.name }))) return;
                state.styles.splice(index, 1);
                state.selected.delete(style.id);
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
            if (state.busy) { event.preventDefault(); return; }
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
            if (state.busy) return;
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
            if (state.busy) { event.preventDefault(); return; }
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
            <div id="style-set-panel" hidden></div>
            <div class="style-editor-toolbar">
                <label id="style-editor-search-label" class="style-editor-search-label" for="style-editor-search"></label>
                <input id="style-editor-search" type="search" autocomplete="off">
                <button id="style-editor-add" type="button"></button>
                <button id="style-editor-save" type="button" class="primary" disabled></button>
                <button id="style-editor-reload" type="button"></button>
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
        if (!candidate) return;
        if (candidate.dataset.ready === "true") {
            syncGenerationSetPickers();
            return;
        }
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
