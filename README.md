# Style Order Manager

[日本語 README](README_ja.md)

![Style Order Manager tab in the WebUI](docs/images/extensions-tab.png)

A compact style order manager for Forge Neo and compatible Automatic1111-style WebUI forks. It manages `styles.csv` with a focus on drag-and-drop reordering.

Style Order Manager was created around one simple idea: keep each style on a compact, easy-to-scan single line so reordering a large `styles.csv` stays quick and comfortable. It is intentionally lightweight and includes the minimum practical features—search, edit, add, delete, save, backup, and restore—without trying to be an advanced style-management suite.

It was also created because a large `styles.csv` becomes difficult to understand and maintain when edited directly in a text editor. This focused UI keeps the order and contents easy to scan without becoming a feature-heavy editor.

## Compatibility

- Forge Neo: verified in the current development environment
- ReForge: verified
- Automatic1111: built on the standard extension APIs; not verified yet

## Features

- Drag-and-drop style reordering
- Search, add, delete, and edit `name`, `prompt`, and `negative_prompt`
- Compact one-line cards with move buttons, drag handles, and a dedicated expand triangle
- Copy and paste controls shown only in the expanded prompt editor
- Unsaved-change indicator and explicit Save action
- Automatic backup before saving plus a manual **Back up now** action
- Backup list and restore action
- Theme-aware controls for dark and light WebUI themes
- English default UI with an `EN / JA` switch

## Requirements

- Forge Neo, ReForge, or a compatible Automatic1111-style WebUI
- Standard `styles.csv` format with the header `name,prompt,negative_prompt`
- No additional Python packages are required

## Installation

### Install from the Extensions tab

1. Open **Extensions** → **Install from URL**.
2. Enter:

   `https://github.com/ukr8b3g-cmyk/Style-Order-Manager`

3. Install the extension, apply/restart the WebUI, and open the **Style Order Manager** tab.

### Manual installation

Clone this repository into the WebUI `extensions` folder:

```powershell
git clone https://github.com/ukr8b3g-cmyk/Style-Order-Manager.git <webui-directory>\extensions\style-order-manager
```

Restart the WebUI after installation.

## Usage

1. Open the **Style Order Manager** tab.
2. Drag the `☷` handle to reorder styles.
3. Click a card to inspect or edit its full contents.
4. Press **Save** to write the new order and edits to `styles.csv`.

The CSV header is preserved as `name,prompt,negative_prompt`.

After saving or restoring, Style Order Manager automatically refreshes the WebUI's txt2img/img2img Styles lists. Save also updates the backup list. If a compatible fork does not expose the standard refresh control, use its Styles refresh button manually.

Editing, deleting, moving, dragging, and pasting are locked while saving, loading, or restoring. Clipboard paste holds that lock until the clipboard read completes. Restore explicitly warns before discarding unsaved edits.

### Concurrent edits

Each load returns a revision (SHA-256 of the exact CSV bytes). Save and restore require that revision. If another tab or an external writer changed the CSV, the operation returns HTTP 409 and leaves your draft in the editor. Copy your draft before reloading, then apply it to the latest list. There is no automatic merge or force overwrite. Older cached clients that omit a revision must reload the WebUI page.

The extension serializes its own operations in one backend process and checks the revision again immediately before replacing the CSV. External editors, host style writes, and other backend processes do not share this lock: a write between the last check and replacement can still race. Avoid simultaneous external writes. This is conflict detection, not an operating-system transaction across all writers.

### Open the prompt editor

Press the **pencil button** in the WebUI prompt controls to open the prompt/style editing screen.

![Open the prompt editor from the pencil button](docs/images/prompt-editor.png)

## Backup and restore

Automatic backups are enabled by default and retain 10 files. **Back up now** immediately copies the saved `styles.csv`; unsaved editor changes are not included. The standard relative path is:

```text
styles_backups
```

This folder is created next to `styles.csv`. If `styles.csv` is in the WebUI root, the resolved path is `<webui-directory>\styles_backups`.

Before a restore, the current `styles.csv` is saved as a safety backup. Restore validates a temporary file beside the CSV and then atomically replaces the destination. A copy or replacement failure leaves the original CSV intact and keeps any completed safety backup. If the CSV is missing, reload the list and restore a valid backup; no pre-restore copy is needed.

Retention counts only the extension's exact reserved filename formats: `<stem>_YYYYMMDD_HHMMSS_fff.csv`, optionally ending in `_manual` or `_pre_restore` before `.csv`. Existing three-digit millisecond names remain supported; new backups use six-digit microseconds and an exclusive create, avoiding name collisions. Files such as `styles_custom.csv`, invalid dates, and symbolic links are excluded from list, restore, and cleanup. Historical files have no ownership metadata, so do not name unrelated files with these reserved formats; prefer a dedicated backup folder.

Ordering uses the creation timestamp in the name, rather than the copied CSV's mtime. New names advance beyond the latest recognized backup even if the clock moves backwards. Cleanup explicitly retains the new backup, or the pre-restore safety copy, including when the retention count is one. After a failed restore, safety copies may temporarily exceed the retention count; they are kept for recovery.

### Authentication and subpaths

All seven extension endpoints follow the host's existing authentication. In UI mode they reuse Gradio's `/login_check` dependency, including session-cookie variants and Gradio 4 external authentication. In API-only mode they reuse the host `/sdapi/v1/options` dependencies, including `--api-auth` Basic authentication. UI sessions follow Gradio authentication even when the host has separate API credentials. Without host authentication, the extension follows the host's unauthenticated mode. An unknown host authentication contract disables the extension endpoints instead of exposing them.

No credentials, authentication settings, or network settings are changed by the extension. Frontend requests use Gradio's configured root (with a pathname fallback) for both root URLs and `--subpath` deployments. A proxy still needs to forward the extension paths and login cookies, as it does for the host UI.

## Regression tests

Use an existing compatible host virtual environment; the Python tests use only temporary CSVs/backups and never import the GPU backend:

```powershell
<webui-directory>\venv\Scripts\python.exe -B tests\test_style_order_manager.py
node --check javascript\style_order_manager.js
```

The optional browser tests require an existing Playwright installation and Edge. They intercept every API request and test the real extension DOM with delayed saves, clipboard promises, restore confirmation, conflict responses, and subpaths:

```powershell
node tests\test_style_order_manager_ui.cjs
```

See [the audit fix verification record](docs/audit-fixes-2026-10-01.md) for the tested host versions and remaining live-UI limits.

## Extension layout

```text
style-order-manager/
├─ javascript/style_order_manager.js
├─ scripts/style_order_manager.py
├─ docs/images/extensions-tab.png
├─ docs/images/prompt-editor.png
├─ style.css
├─ README.md
├─ README_ja.md
└─ .gitignore
```

No `install.py` is needed because the extension uses only WebUI and Python standard-library functionality.

## Extension index registration

The WebUI Extensions tab obtains its available-extension list from an external JSON index. Registration is a separate index update using the repository URL, display name, description, date, and tags such as `tab` and `UI related`.
