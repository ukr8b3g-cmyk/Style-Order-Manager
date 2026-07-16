# Style Order Manager

[日本語 README](README_ja.md)

![Style Order Manager in the WebUI Extensions tab](docs/images/extensions-tab.png)

A compact style order manager for Forge Neo and compatible Automatic1111-style WebUI forks. It manages `styles.csv` with a focus on drag-and-drop reordering.

Style Order Manager was created around one simple idea: keep each style on a compact, easy-to-scan single line so reordering a large `styles.csv` stays quick and comfortable. It is intentionally lightweight and includes the minimum practical features—search, edit, add, delete, save, backup, and restore—without trying to be an advanced style-management suite.

## Compatibility

- Forge Neo: verified in the current development environment
- ReForge: expected to work; verification is pending
- Automatic1111: built on the standard extension APIs; not verified yet

## Features

- Drag-and-drop style reordering
- Search, add, delete, and edit `name`, `prompt`, and `negative_prompt`
- Compact collapsed cards; click a card to show the positive/negative prompts
- Unsaved-change indicator and explicit Save action
- Backup before saving, with a selectable folder and retention count
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

## Backup and restore

Backups are enabled by default and retain 10 files. The standard relative path is:

```text
styles_backups
```

This folder is created next to `styles.csv`. If `styles.csv` is in the WebUI root, the resolved path is `<webui-directory>\styles_backups`.

Before a restore, the current `styles.csv` is saved as a safety backup. Old backup files beyond the configured retention count are removed automatically.

## Extension layout

```text
style-order-manager/
├─ javascript/style_order_manager.js
├─ scripts/style_order_manager.py
├─ docs/images/extensions-tab.png
├─ style.css
├─ README.md
├─ README_ja.md
└─ .gitignore
```

No `install.py` is needed because the extension uses only WebUI and Python standard-library functionality.

## Extension index registration

The WebUI Extensions tab obtains its available-extension list from an external JSON index. Registration is a separate index update using the repository URL, display name, description, date, and tags such as `tab` and `UI related`.
