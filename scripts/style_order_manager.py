from __future__ import annotations

import csv
import hashlib
import io
import os
import re
import shutil
import tempfile
import threading
from datetime import datetime, timedelta
from pathlib import Path

import gradio as gr
from fastapi import APIRouter, Body, Depends, FastAPI
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

    return _parse_styles(style_path.read_bytes())


def _parse_styles(content: bytes) -> list[dict[str, str]]:
    with io.StringIO(content.decode("utf-8-sig"), newline="") as file:
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


def _revision(style_path: Path) -> str:
    try:
        return hashlib.sha256(style_path.read_bytes()).hexdigest()
    except FileNotFoundError:
        return "missing"


def _styles_snapshot(style_path: Path) -> dict:
    try:
        content = style_path.read_bytes()
    except FileNotFoundError:
        return {"styles": [], "revision": "missing", "missing_file": True}
    return {"styles": _parse_styles(content), "revision": hashlib.sha256(content).hexdigest()}


class RevisionConflict(ValueError):
    pass


def _check_revision(style_path: Path, expected) -> None:
    if not isinstance(expected, str) or expected != _revision(style_path):
        raise RevisionConflict("styles.csv changed or revision is missing. Reload before saving or restoring.")


def _write_styles(style_path: Path, styles: list[dict[str, str]], expected_revision=None) -> str:
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
            file.flush()
            os.fsync(file.fileno())
        revision = _revision(Path(temporary_name))
        if expected_revision is not None:
            _check_revision(style_path, expected_revision)
        os.replace(temporary_name, style_path)
        return revision
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


def _backup_created(style_path: Path, name: str) -> datetime | None:
    # Exact historical formats only; the prefix alone is not proof of a backup.
    match = re.fullmatch(
        re.escape(style_path.stem) + r"_(\d{8}_\d{6}_(?:\d{3}|\d{6}))(?:_(manual|pre_restore))?\.csv",
        name,
    )
    if match:
        try:
            return datetime.strptime(match[1], "%Y%m%d_%H%M%S_%f")
        except ValueError:
            pass
    return None


def _backup_files(backup_dir: Path, style_path: Path) -> list[Path]:
    if not backup_dir.is_dir():
        return []
    backups = [path for path in backup_dir.iterdir()
               if not path.is_symlink() and path.is_file() and _backup_created(style_path, path.name)]
    return sorted(backups, key=lambda path: (_backup_created(style_path, path.name), path.name), reverse=True)


def _cleanup_backups(backup_dir: Path, style_path: Path, keep_count: int, protected: Path) -> None:
    backups = _backup_files(backup_dir, style_path)
    # A newly created/safety backup must survive even if the clock moved backwards.
    protected = protected.resolve()
    others = [path.resolve() for path in backups if path.resolve() != protected]
    retained = {protected, *others[:keep_count - 1]}
    for path in backups:
        if path.resolve() not in retained:
            path.unlink()
    if not protected.is_file():
        raise OSError("The newly created backup was not retained")


def _create_backup(style_path: Path, backup_dir: Path, kind: str = "") -> Path:
    backup_dir.mkdir(parents=True, exist_ok=True)
    backups = _backup_files(backup_dir, style_path)
    created = datetime.now()
    if backups:
        created = max(created, _backup_created(style_path, backups[0].name) + timedelta(microseconds=1))
    suffix = f"_{kind}" if kind else ""
    while True:
        path = backup_dir / f"{style_path.stem}_{created:%Y%m%d_%H%M%S_%f}{suffix}.csv"
        try:
            output = path.open("xb")
            break
        except FileExistsError:
            created += timedelta(microseconds=1)
    try:
        with output, style_path.open("rb") as source:
            shutil.copyfileobj(source, output)
            output.flush()
            os.fsync(output.fileno())
    except BaseException:
        path.unlink(missing_ok=True)
        raise
    return path


def _restore_atomic(backup_path: Path, style_path: Path, expected_revision=None) -> tuple[list[dict[str, str]], str]:
    descriptor, temporary_name = tempfile.mkstemp(prefix=f".{style_path.name}.", suffix=".tmp", dir=style_path.parent)
    try:
        with os.fdopen(descriptor, "wb") as output, backup_path.open("rb") as source:
            shutil.copyfileobj(source, output)
            output.flush()
            os.fsync(output.fileno())
        restored = _normalise_styles(_read_styles(Path(temporary_name)))
        revision = _revision(Path(temporary_name))
        if expected_revision is not None:
            _check_revision(style_path, expected_revision)
        os.replace(temporary_name, style_path)
        return restored, revision
    finally:
        if os.path.exists(temporary_name):
            os.unlink(temporary_name)


def _list_backups(backup_dir: Path, style_path: Path) -> list[dict]:
    backups = _backup_files(backup_dir, style_path)
    return [
        {
            "name": path.name,
            "modified": int(_backup_created(style_path, path.name).timestamp() * 1000),
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
        or _backup_created(style_path, name) is None
        or (backup_dir / name).is_symlink()
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


def _reload_host_styles() -> str | None:
    try:
        if shared.prompt_styles is not None:
            shared.prompt_styles.reload()
    except Exception as error:
        # The file was committed; do not invite a retry with a stale revision.
        return str(error)
    return None


def _host_auth_dependencies(demo: gr.Blocks | None, app: FastAPI) -> list:
    # Reuse the host's complete dependency graph, including nested cookie/Basic guards.
    if demo is not None:
        for route in app.routes:
            if getattr(route, "path", None) == "/login_check" and "GET" in getattr(route, "methods", set()):
                return [Depends(route.endpoint)]
        raise RuntimeError("Style Order Manager: host Gradio login_check unavailable; API disabled")

    for route in app.routes:
        if getattr(route, "path", None) == "/sdapi/v1/options" and "GET" in getattr(route, "methods", set()):
            dependencies = list(route.dependencies)
            if getattr(getattr(shared, "cmd_opts", None), "api_auth", None) and not dependencies:
                break
            return dependencies
    raise RuntimeError("Style Order Manager: host API authentication contract unavailable; API disabled")


def api_style_editor(demo: gr.Blocks | None, app: FastAPI):
    router = APIRouter(prefix=API_PREFIX, dependencies=_host_auth_dependencies(demo, app))

    @router.get("/styles")
    async def get_styles():
        style_path = _style_path()
        try:
            with SAVE_LOCK:
                snapshot = _styles_snapshot(style_path)
        except FileNotFoundError as error:
            return _error(str(error), 404)
        except (OSError, ValueError) as error:
            return _error(str(error), 500)

        return {
            **snapshot,
            "file": style_path.name,
            "backup_folder": BACKUP_FOLDER_NAME,
        }

    @router.post("/reload")
    async def reload_styles():
        style_path = _style_path()
        try:
            with SAVE_LOCK:
                if style_path.is_file() and shared.prompt_styles is not None:
                    shared.prompt_styles.reload()
                snapshot = _styles_snapshot(style_path)
        except FileNotFoundError as error:
            return _error(str(error), 404)
        except (OSError, ValueError) as error:
            return _error(str(error), 500)

        return {**snapshot, "file": style_path.name}

    @router.post("/select-backup-folder")
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

    @router.post("/backups")
    async def list_backups(payload: dict = Body(...)):
        style_path = _style_path()
        try:
            backup_dir = _resolve_backup_dir(style_path, payload.get("backup_folder"))
            with SAVE_LOCK:
                backups = _list_backups(backup_dir, style_path)
        except (AttributeError, OSError, TypeError, ValueError) as error:
            return _error(str(error), 400)
        return {"backups": backups, "folder": str(backup_dir)}

    @router.post("/backup")
    async def create_backup(payload: dict = Body(...)):
        style_path = _style_path()
        try:
            backup_dir = _resolve_backup_dir(style_path, payload.get("backup_folder"))
            backup_count = int(payload.get("backup_count", 10))
            if not 1 <= backup_count <= 100:
                raise ValueError("backup_count must be between 1 and 100")
        except (AttributeError, TypeError, ValueError) as error:
            return _error(str(error), 400)

        if not style_path.is_file():
            return _error(f"styles.csv not found: {style_path}", 404)

        try:
            with SAVE_LOCK:
                backup_path = _create_backup(style_path, backup_dir, "manual")
                _cleanup_backups(backup_dir, style_path, backup_count, backup_path)
        except OSError as error:
            return _error(f"Could not back up styles.csv: {error}", 500)

        return {
            "backup_file": backup_path.name,
            "backup_folder": str(backup_dir),
        }

    @router.post("/restore")
    async def restore_styles(payload: dict = Body(...)):
        style_path = _style_path()
        try:
            backup_dir = _resolve_backup_dir(style_path, payload.get("backup_folder"))
            backup_count = int(payload.get("backup_count", 10))
            if not 1 <= backup_count <= 100:
                raise ValueError("backup_count must be between 1 and 100")
        except (AttributeError, OSError, TypeError, ValueError) as error:
            return _error(str(error), 400)

        safety_backup_name = None
        try:
            with SAVE_LOCK:
                _check_revision(style_path, payload.get("revision"))
                backup_path = _selected_backup_path(backup_dir, style_path, payload.get("backup_name"))
                _normalise_styles(_read_styles(backup_path))
                safety_backup_path = None
                if style_path.is_file():
                    safety_backup_path = _create_backup(style_path, backup_dir, "pre_restore")
                    safety_backup_name = safety_backup_path.name
                restored_styles, revision = _restore_atomic(backup_path, style_path, payload.get("revision"))
                # Retention runs only after replacement. Failed restores keep the safety copy.
                _cleanup_backups(backup_dir, style_path, backup_count, safety_backup_path or backup_path)
                reload_warning = _reload_host_styles()
        except RevisionConflict as error:
            return _error(str(error), 409)
        except (OSError, ValueError) as error:
            return _error(f"Could not restore styles.csv: {error}", 500)

        return {
            "styles": restored_styles,
            "revision": revision,
            "file": style_path.name,
            "restored_file": backup_path.name,
            "safety_backup_file": safety_backup_name,
            "folder": str(backup_dir),
            "restart_required": bool(reload_warning),
            "reload_warning": reload_warning,
        }

    @router.post("/save")
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
                _check_revision(style_path, payload.get("revision"))
                if backup_enabled:
                    backup_path = _create_backup(style_path, backup_dir)
                    backup_name = backup_path.name

                revision = _write_styles(style_path, styles, payload.get("revision"))
                if backup_enabled:
                    _cleanup_backups(backup_dir, style_path, backup_count, backup_path)
                reload_warning = _reload_host_styles()
        except RevisionConflict as error:
            return _error(str(error), 409)
        except (OSError, ValueError) as error:
            return _error(f"Could not save styles.csv: {error}", 500)

        return {
            "styles": styles,
            "revision": revision,
            "file": style_path.name,
            "backup_file": backup_name,
            "backup_folder": str(backup_dir),
            "restart_required": bool(reload_warning),
            "reload_warning": reload_warning,
        }

    app.include_router(router)


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
