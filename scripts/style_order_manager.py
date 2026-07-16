from __future__ import annotations

import csv
import os
import shutil
import tempfile
import threading
from datetime import datetime
from pathlib import Path

import gradio as gr
from fastapi import Body, FastAPI
from fastapi.responses import JSONResponse
from starlette.concurrency import run_in_threadpool

from modules import script_callbacks, shared


TAB_TITLE = "Style Order Manager"
TAB_ID = "style_order_manager"
API_PREFIX = "/style-order-manager/v1"
CSV_FIELDS = ("name", "prompt", "negative_prompt")
BACKUP_FOLDER_NAME = "styles_backups"
SAVE_LOCK = threading.Lock()


def _style_path() -> Path:
    prompt_styles = getattr(shared, "prompt_styles", None)
    default_path = getattr(prompt_styles, "default_path", None)
    if default_path:
        return Path(default_path)

    configured = getattr(shared, "styles_filename", "styles.csv")
    if isinstance(configured, (list, tuple)):
        configured = configured[0] if configured else "styles.csv"
    path = Path(configured)
    if not path.is_absolute():
        path = Path(getattr(shared, "data_path", Path.cwd())) / path
    return path


def _backup_dir(style_path: Path) -> Path:
    return style_path.parent / BACKUP_FOLDER_NAME


def _resolve_backup_dir(style_path: Path, configured: str | None = None) -> Path:
    raw_path = str(configured or "").strip()
    if not raw_path or raw_path == BACKUP_FOLDER_NAME:
        return _backup_dir(style_path)

    path = Path(raw_path).expanduser()
    return path if path.is_absolute() else style_path.parent / path


def _read_styles(style_path: Path) -> list[dict[str, str]]:
    if not style_path.is_file():
        raise FileNotFoundError(f"styles.csv not found: {style_path}")

    with style_path.open("r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        if tuple(reader.fieldnames or ()) != CSV_FIELDS:
            raise ValueError("CSV header must be name,prompt,negative_prompt")

        styles = []
        for row in reader:
            if row.get(None):
                raise ValueError("CSV contains an unexpected extra column")
            values = {field: row.get(field) or "" for field in CSV_FIELDS}
            if not any(value.strip() for value in values.values()):
                continue
            styles.append(values)
        return styles


def _write_styles(style_path: Path, styles: list[dict[str, str]]) -> None:
    file_descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{style_path.name}.",
        suffix=".tmp",
        dir=style_path.parent,
    )
    try:
        with os.fdopen(file_descriptor, "w", encoding="utf-8-sig", newline="") as file:
            writer = csv.DictWriter(file, fieldnames=CSV_FIELDS, lineterminator="\n")
            writer.writeheader()
            writer.writerows(styles)
        os.replace(temporary_name, style_path)
    finally:
        if os.path.exists(temporary_name):
            os.unlink(temporary_name)


def _normalise_styles(raw_styles) -> list[dict[str, str]]:
    if not isinstance(raw_styles, list):
        raise ValueError("styles must be a list")

    styles = []
    seen_names = set()
    for index, item in enumerate(raw_styles, start=1):
        if not isinstance(item, dict):
            raise ValueError(f"Style {index} is invalid")

        values = {}
        for field in CSV_FIELDS:
            value = item.get(field, "")
            if value is None:
                value = ""
            if not isinstance(value, str):
                value = str(value)
            if "\x00" in value:
                raise ValueError(f"Style {index} contains an invalid character")
            values[field] = value

        if not values["name"].strip():
            raise ValueError(f"Style {index} has an empty name")
        name_key = values["name"].casefold()
        if name_key in seen_names:
            raise ValueError(f"Duplicate style name: {values['name']}")
        seen_names.add(name_key)
        styles.append(values)
    return styles


def _cleanup_backups(backup_dir: Path, style_path: Path, keep_count: int) -> None:
    if not backup_dir.is_dir():
        return
    backups = [
        path
        for path in backup_dir.glob(f"{style_path.stem}_*.csv")
        if path.is_file()
    ]
    backups.sort(key=lambda path: (path.stat().st_mtime_ns, path.name), reverse=True)
    for path in backups[keep_count:]:
        path.unlink()


def _list_backups(backup_dir: Path, style_path: Path) -> list[dict]:
    if not backup_dir.is_dir():
        return []

    backups = [
        path
        for path in backup_dir.glob(f"{style_path.stem}_*.csv")
        if path.is_file()
    ]
    backups.sort(key=lambda path: (path.stat().st_mtime_ns, path.name), reverse=True)
    return [
        {
            "name": path.name,
            "modified": int(path.stat().st_mtime * 1000),
            "size": path.stat().st_size,
        }
        for path in backups
    ]


def _selected_backup_path(backup_dir: Path, style_path: Path, backup_name: str) -> Path:
    name = str(backup_name or "")
    candidate = (backup_dir / name).resolve()
    if (
        not name
        or Path(name).name != name
        or not name.lower().startswith(f"{style_path.stem.lower()}_")
        or candidate.suffix.lower() != ".csv"
        or candidate.parent != backup_dir.resolve()
        or not candidate.is_file()
    ):
        raise ValueError("Invalid backup file")
    return candidate


def _pick_backup_folder(initial_dir: Path) -> str:
    import tkinter as tk
    from tkinter import filedialog

    root = tk.Tk()
    root.withdraw()
    root.attributes("-topmost", True)
    try:
        return filedialog.askdirectory(
            initialdir=str(initial_dir),
            mustexist=True,
            title="Style Order Manager バックアップ保存先",
        )
    finally:
        root.destroy()


def _error(message: str, status_code: int = 400):
    return JSONResponse({"error": message}, status_code=status_code)


def api_style_editor(_: gr.Blocks, app: FastAPI):
    @app.get(f"{API_PREFIX}/styles")
    async def get_styles():
        style_path = _style_path()
        try:
            styles = _read_styles(style_path)
        except FileNotFoundError as error:
            return _error(str(error), 404)
        except (OSError, ValueError) as error:
            return _error(str(error), 500)

        return {
            "styles": styles,
            "file": style_path.name,
            "backup_folder": BACKUP_FOLDER_NAME,
        }

    @app.post(f"{API_PREFIX}/reload")
    async def reload_styles():
        style_path = _style_path()
        try:
            if shared.prompt_styles is not None:
                shared.prompt_styles.reload()
            styles = _read_styles(style_path)
        except FileNotFoundError as error:
            return _error(str(error), 404)
        except (OSError, ValueError) as error:
            return _error(str(error), 500)

        return {"styles": styles, "file": style_path.name}

    @app.post(f"{API_PREFIX}/select-backup-folder")
    async def select_backup_folder():
        style_path = _style_path()
        initial_dir = _backup_dir(style_path)
        if not initial_dir.is_dir():
            initial_dir = style_path.parent
        try:
            selected = await run_in_threadpool(_pick_backup_folder, initial_dir)
        except (OSError, RuntimeError) as error:
            return _error(f"Could not open the folder picker: {error}", 500)
        except Exception as error:
            return _error(f"Could not open the folder picker: {error}", 500)
        return {"folder": selected or ""}

    @app.post(f"{API_PREFIX}/backups")
    async def list_backups(payload: dict = Body(...)):
        style_path = _style_path()
        try:
            backup_dir = _resolve_backup_dir(style_path, payload.get("backup_folder"))
            backups = _list_backups(backup_dir, style_path)
        except (AttributeError, OSError, TypeError, ValueError) as error:
            return _error(str(error), 400)
        return {"backups": backups, "folder": str(backup_dir)}

    @app.post(f"{API_PREFIX}/restore")
    async def restore_styles(payload: dict = Body(...)):
        style_path = _style_path()
        try:
            backup_dir = _resolve_backup_dir(style_path, payload.get("backup_folder"))
            backup_path = _selected_backup_path(backup_dir, style_path, payload.get("backup_name"))
            restored_styles = _normalise_styles(_read_styles(backup_path))
            backup_count = int(payload.get("backup_count", 10))
            if not 1 <= backup_count <= 100:
                raise ValueError("backup_count must be between 1 and 100")
        except (AttributeError, OSError, TypeError, ValueError) as error:
            return _error(str(error), 400)

        if not style_path.is_file():
            return _error(f"styles.csv not found: {style_path}", 404)

        safety_backup_name = None
        try:
            with SAVE_LOCK:
                backup_dir.mkdir(parents=True, exist_ok=True)
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")[:-3]
                safety_backup_path = backup_dir / f"{style_path.stem}_{timestamp}_pre_restore.csv"
                shutil.copy2(style_path, safety_backup_path)
                safety_backup_name = safety_backup_path.name
                shutil.copy2(backup_path, style_path)
                if shared.prompt_styles is not None:
                    shared.prompt_styles.reload()
                _cleanup_backups(backup_dir, style_path, backup_count)
        except (OSError, ValueError) as error:
            return _error(f"Could not restore styles.csv: {error}", 500)

        return {
            "styles": restored_styles,
            "file": style_path.name,
            "restored_file": backup_path.name,
            "safety_backup_file": safety_backup_name,
            "folder": str(backup_dir),
            "restart_required": False,
        }

    @app.post(f"{API_PREFIX}/save")
    async def save_styles(payload: dict = Body(...)):
        style_path = _style_path()
        try:
            styles = _normalise_styles(payload.get("styles"))
            backup_enabled = bool(payload.get("backup_enabled", True))
            backup_count = int(payload.get("backup_count", 10))
            backup_dir = _resolve_backup_dir(style_path, payload.get("backup_folder"))
            if not 1 <= backup_count <= 100:
                raise ValueError("backup_count must be between 1 and 100")
        except (AttributeError, TypeError, ValueError) as error:
            return _error(str(error), 400)

        if not style_path.is_file():
            return _error(f"styles.csv not found: {style_path}", 404)

        backup_name = None
        try:
            with SAVE_LOCK:
                if backup_enabled:
                    backup_dir.mkdir(parents=True, exist_ok=True)
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")[:-3]
                    backup_path = backup_dir / f"{style_path.stem}_{timestamp}.csv"
                    shutil.copy2(style_path, backup_path)
                    backup_name = backup_path.name

                _write_styles(style_path, styles)
                if shared.prompt_styles is not None:
                    shared.prompt_styles.reload()
                if backup_enabled:
                    _cleanup_backups(backup_dir, style_path, backup_count)
        except (OSError, ValueError) as error:
            return _error(f"Could not save styles.csv: {error}", 500)

        return {
            "styles": styles,
            "file": style_path.name,
            "backup_file": backup_name,
            "backup_folder": str(backup_dir),
            "restart_required": False,
        }


def on_ui_tabs():
    with gr.Blocks(analytics_enabled=False) as style_editor_ui:
        gr.HTML(
            '<div id="style-order-manager-app" class="style-editor-app" aria-live="polite">'
            '<div class="style-editor-loading">Style Order Manager を読み込んでいます...</div>'
            "</div>",
            elem_id="style_order_manager_mount",
        )
    return [(style_editor_ui, TAB_TITLE, TAB_ID)]


script_callbacks.on_app_started(api_style_editor)
script_callbacks.on_ui_tabs(on_ui_tabs)
