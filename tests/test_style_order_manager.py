"""CPU-only regression tests. Use a host venv; all CSV data lives in TemporaryDirectory."""
from __future__ import annotations

import ast
import importlib.util
import os
from pathlib import Path
import secrets
import sys
import tempfile
import types
import unittest
from collections import namedtuple
from unittest.mock import Mock, patch

import gradio as gr
from gradio.routes import App
from fastapi import Depends, FastAPI, HTTPException
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.testclient import TestClient


ROOT = Path(__file__).resolve().parents[1]
shared = types.ModuleType("modules.shared")
shared.cmd_opts = types.SimpleNamespace(api_auth=None)
callbacks = types.ModuleType("modules.script_callbacks")
callbacks.on_after_component = lambda callback: None
callbacks.on_app_started = lambda callback: None
callbacks.on_ui_tabs = lambda callback: None
modules = types.ModuleType("modules")
modules.shared = shared
modules.script_callbacks = callbacks
sys.modules.update({"modules": modules, "modules.shared": shared, "modules.script_callbacks": callbacks})
spec = importlib.util.spec_from_file_location("som_under_test", ROOT / "scripts/style_order_manager.py")
som = importlib.util.module_from_spec(spec)
spec.loader.exec_module(som)
STYLE = [{"name": "猫,\"style\"", "prompt": "positive,\"quote\"\n二行目", "negative_prompt": "bad\r\nline"}]
NEW = [{"name": "New", "prompt": "edited", "negative_prompt": ""}]


def gradio_host(auth=None):
    with gr.Blocks(analytics_enabled=False) as demo:
        gr.HTML("isolated test")
    demo.auth = auth
    return demo, App.create_app(demo)


class AllGenerationStylesTests(unittest.TestCase):
    def test_native_editor_refresh_is_chained_after_each_write(self):
        def save_style():
            pass

        def delete_style():
            pass

        def refresh_styles():
            return gr.update(choices=["native"]), gr.update(choices=["native"])

        with gr.Blocks(analytics_enabled=False) as demo:
            dropdown = gr.Dropdown(elem_id="txt2img_styles")
            selection = gr.Dropdown(elem_id="txt2img_styles_edit_select")
            for write in [save_style, delete_style]:
                button = gr.Button()
                som._native_edit_completion(button, "txt2img")
                button.click(fn=write).then(refresh_styles, outputs=[dropdown, selection])
        dependencies = demo.get_config_file()["dependencies"]
        notifications = [dep for dep in dependencies if "som-native-styles-written" in (dep.get("js") or "")]
        self.assertEqual(len(notifications), 2)
        by_id = {dep.get("id", i): dep for i, dep in enumerate(dependencies)}
        for notification, write in zip(notifications, [save_style, delete_style]):
            refresh_id = notification["trigger_after"]
            edit_id = by_id[refresh_id]["trigger_after"]
            self.assertIs(demo.fns[edit_id].fn, write)
            generation, editor = demo.fns[refresh_id].fn()
            self.assertNotIn("choices", generation)
            self.assertNotIn("value", generation)
            self.assertEqual(editor["choices"], ["native"])

    def test_native_save_and_delete_before_dropdown_refresh(self):
        row = namedtuple("Row", "name prompt negative_prompt path")
        old = row("A", "old positive", "old negative", "primary.csv")
        db = types.SimpleNamespace(default_path="primary.csv", styles={"A": old},
                                   no_style=row("None", "", "", None), reload=Mock())
        catalog = {"active": "first", "sets": {"first": {"name": "One"},
                   "second": {"name": "Two", "styles": [{"name": "A", "prompt": "other", "negative_prompt": "other neg"}]}}}
        current, other = [value for _, value in som._all_generation_choices(db, catalog)]
        selected = [other, current]
        db.styles["A"] = old._replace(prompt="new positive", negative_prompt="new negative")
        self.assertEqual([db.styles.get(v).prompt for v in selected], ["other", "new positive"])
        self.assertEqual([db.styles[v].negative_prompt for v in selected], ["other neg", "new negative"])
        with patch.object(shared, "prompt_styles", db, create=True), patch.object(som, "_style_path"), patch.object(som, "_catalog", return_value=catalog):
            view, _ = som._generation_refresh(selected, "second/1/native")
            self.assertEqual(view["value"], selected)
            del db.styles["A"]
            self.assertIs(db.styles.get(current, db.no_style), db.no_style)
            with self.assertRaises(KeyError):
                db.styles[current]
            view, _ = som._generation_refresh(selected, "second/2/native")
            self.assertEqual(view["value"], [other])
            self.assertEqual([v for _, v in view["choices"]], [other])
            db.reload.assert_not_called()

    def test_plain_choices_apply_styles_and_keep_selections_across_filters(self):
        row = namedtuple("Row", "name prompt negative_prompt path")
        native = {"Same": row("Same", "first", "n1", "primary.csv"),
                  "Same  [Other]": row("Same  [Other]", "literal", "", "primary.csv")}
        db = types.SimpleNamespace(default_path="primary.csv", styles=native.copy(),
                                   no_style=row("None", "", "", None), reload=Mock())
        other = {"name": "Other", "styles": [
            {"name": "Same", "prompt": "second", "negative_prompt": "n2"},
            {"name": "Unique", "prompt": "third", "negative_prompt": "n3"}]}
        catalog = {"active": "first", "sets": {"first": {"name": "Common"}, "second": other}}
        with patch.object(som, "_PLAIN_STYLE_CHOICES", True), patch.object(shared, "prompt_styles", db, create=True), \
                patch.object(som, "_style_path", return_value=Path("primary.csv")), patch.object(som, "_catalog", return_value=catalog):
            options, _, keys = som._plain_generation_refresh([], "all/1", {})
            self.assertTrue(all(isinstance(label, str) for label in options["choices"]))
            self.assertEqual(len(keys), 4)
            self.assertEqual(db.styles["Same  [Other]"].prompt, "literal")
            selected = [label for label in options["choices"] if db.styles.get(label).negative_prompt in ("n2", "n3")]
            self.assertEqual(len(selected), 2)
            self.assertIn("Unique", selected)
            other["name"] = "Renamed"
            filtered, _, _ = som._plain_generation_refresh(selected, "first/2", keys)
            self.assertEqual(filtered["value"], ["Same  [Renamed]", "Unique"])
            self.assertTrue(set(filtered["value"]).issubset(filtered["choices"]))
            self.assertEqual([db.styles.get(label).prompt for label in filtered["value"]], ["second", "third"])
            self.assertEqual(dict(db.styles.items()), native)

    def test_order_duplicate_names_and_native_storage(self):
        row = namedtuple("Row", "name prompt negative_prompt path")
        native = {"Shared": row("Shared", "p1", "n1", "primary.csv"),
                  "Extra": row("Extra", "external", "", "external.csv")}
        db = types.SimpleNamespace(default_path="primary.csv", styles=native.copy(),
                                   no_style=row("None", "", "", None))
        catalog = {"active": "first", "sets": {
            "second": {"name": "Other", "styles": [{"name": "Shared", "prompt": "p2", "negative_prompt": "n2"}]},
            "first": {"name": "Common"},
        }}
        choices = som._all_generation_choices(db, catalog)
        self.assertEqual([name for name, _ in choices], ["Shared  [Other]", "Shared  [Common]", "Extra"])
        other, common, extra = [key for _, key in choices]
        self.assertEqual(db.styles.get(other).negative_prompt, "n2")
        self.assertEqual(db.styles[common].prompt, "p1")
        self.assertEqual(db.styles[extra].prompt, "external")
        self.assertEqual(dict(db.styles.items()), native)
        self.assertEqual(som._all_generation_choices(db, catalog), choices)
        with patch.object(shared, "prompt_styles", db, create=True), patch.object(db, "reload", create=True), \
                patch.object(som, "_style_path", return_value=Path("primary.csv")), patch.object(som, "_catalog", return_value=catalog):
            view, _ = som._generation_refresh([common, other], "second/1")
            self.assertEqual(view["value"], [common, other])
            self.assertEqual(view["choices"], choices)
            view, _ = som._generation_refresh([other], "second/2")
            self.assertNotIn(common, dict(view["choices"]).values())
            self.assertEqual(db.styles.get(common).prompt, "p1")
            self.assertEqual(db.styles.get(other).prompt, "p2")


class StyleTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="som-test-")
        self.addCleanup(self.temp.cleanup)
        self.path = Path(self.temp.name) / "styles.csv"
        self.backups = self.path.parent / "backups"
        self.backups.mkdir()
        som._write_styles(self.path, STYLE)
        shared.prompt_styles = types.SimpleNamespace(default_path=str(self.path), reload=Mock())
        shared.cmd_opts.api_auth = None
        demo, self.app = gradio_host()
        som.api_style_editor(demo, self.app)
        self.client = TestClient(self.app)
        self.addCleanup(self.client.close)

    def post(self, route, **payload):
        return self.client.post(som.API_PREFIX + "/" + route, json={
            "backup_folder": str(self.backups), "backup_count": 1,
            "revision": som._revision(self.path), **payload,
        })

    def legacy(self, suffix="", timestamp="20260101_120000_001"):
        name = f"styles_{timestamp}{suffix}.csv"
        p = self.backups / name
        som._write_styles(p, NEW)
        return p

    def test_retention_preserves_unrelated_files_and_legacy_formats(self):
        unrelated = ["styles_custom.csv", "styles_20261301_120000_001.csv", "styles_20260101_120000_001_notes.csv", "other_20260101_120000_001.csv"]
        for name in unrelated:
            (self.backups / name).write_text("do not delete", encoding="utf8")
        for i, suffix in enumerate(("", "_manual", "_pre_restore")):
            self.legacy(suffix, f"2026010{i + 1}_120000_001")
        listed = som._list_backups(self.backups, self.path)
        self.assertEqual(len(listed), 3)
        result = self.post("backup")
        self.assertEqual(result.status_code, 200, result.text)
        self.assertTrue((self.backups / result.json()["backup_file"]).is_file())
        self.assertEqual(len(som._list_backups(self.backups, self.path)), 1)
        for name in unrelated:
            self.assertEqual((self.backups / name).read_text(), "do not delete")

    def test_created_order_ignores_source_mtime_and_clock_rollback(self):
        self.legacy(timestamp="20990101_120000_001")
        os.utime(self.path, (1, 1))
        first = self.post("backup").json()["backup_file"]
        second = self.post("backup").json()["backup_file"]
        self.assertGreater(second, first)
        self.assertFalse((self.backups / first).exists())
        self.assertTrue((self.backups / second).exists())
        self.assertEqual((self.backups / second).read_bytes(), self.path.read_bytes())

    def test_restore_atomic_failure_keeps_original_and_safety_backup(self):
        source = self.legacy()
        original = self.path.read_bytes()
        with patch.object(som.os, "replace", side_effect=PermissionError("locked destination")):
            result = self.post("restore", backup_name=source.name)
        self.assertEqual(result.status_code, 500)
        self.assertEqual(self.path.read_bytes(), original)
        safety = list(self.backups.glob("*_pre_restore.csv"))
        self.assertEqual(len(safety), 1)
        self.assertEqual(safety[0].read_bytes(), original)
        self.assertTrue(source.exists())
        self.assertEqual(list(self.path.parent.glob(".styles.csv.*.tmp")), [])

    def test_partial_restore_copy_failure_keeps_original(self):
        source = self.legacy()
        original = self.path.read_bytes()
        real_copy = som.shutil.copyfileobj

        def fail_restore(src, dst):
            if Path(src.name).resolve() == source.resolve():
                dst.write(b"partial")
                raise OSError("disk full")
            return real_copy(src, dst)

        with patch.object(som.shutil, "copyfileobj", side_effect=fail_restore):
            result = self.post("restore", backup_name=source.name)
        self.assertEqual(result.status_code, 500)
        self.assertEqual(self.path.read_bytes(), original)
        self.assertEqual(list(self.path.parent.glob(".styles.csv.*.tmp")), [])

    def test_restore_missing_csv_and_preserve_exact_backup_bytes(self):
        source = self.legacy()
        content = source.read_bytes()
        self.path.unlink()
        data = self.client.post(som.API_PREFIX + "/reload").json()
        self.assertEqual(data["revision"], "missing")
        self.assertTrue(data["missing_file"])
        result = self.post("restore", backup_name=source.name)
        self.assertEqual(result.status_code, 200, result.text)
        self.assertIsNone(result.json()["safety_backup_file"])
        self.assertEqual(self.path.read_bytes(), content)
        self.assertEqual(result.json()["revision"], som._revision(self.path))

    def test_restore_retains_safety_copy_at_keep_one(self):
        source = self.legacy()
        original = self.path.read_bytes()
        result = self.post("restore", backup_name=source.name)
        self.assertEqual(result.status_code, 200, result.text)
        self.assertEqual(som._read_styles(self.path), NEW)
        safety = self.backups / result.json()["safety_backup_file"]
        self.assertEqual(safety.read_bytes(), original)
        self.assertEqual(len(som._list_backups(self.backups, self.path)), 1)

    def test_missing_restore_retains_backup_with_noncanonical_folder_path(self):
        source = self.legacy()
        self.path.unlink()
        result = self.post("restore", backup_name=source.name, backup_folder=str(self.backups / ".." / "backups"))
        self.assertEqual(result.status_code, 200, result.text)
        self.assertTrue(source.is_file())
        self.assertEqual(som._read_styles(self.path), NEW)

    def test_safety_backup_failure_blocks_restore(self):
        source = self.legacy()
        original = self.path.read_bytes()
        with patch.object(som, "_create_backup", side_effect=OSError("no space")):
            result = self.post("restore", backup_name=source.name)
        self.assertEqual(result.status_code, 500)
        self.assertEqual(self.path.read_bytes(), original)

    def test_backup_partial_failure_removes_incomplete_file(self):
        with patch.object(som.shutil, "copyfileobj", side_effect=OSError("full")):
            result = self.post("backup")
        self.assertEqual(result.status_code, 500)
        self.assertEqual(list(self.backups.iterdir()), [])

    def test_save_retains_backup_and_round_trips_csv(self):
        os.utime(self.path, (1, 1))
        self.legacy()
        result = self.post("save", styles=STYLE)
        self.assertEqual(result.status_code, 200, result.text)
        self.assertTrue((self.backups / result.json()["backup_file"]).exists())
        self.assertEqual(som._read_styles(self.path), STYLE)
        self.assertTrue(self.path.read_bytes().startswith(b"\xef\xbb\xbf"))

    def test_atomic_save_failure_keeps_original(self):
        original = self.path.read_bytes()
        with patch.object(som.os, "replace", side_effect=OSError("locked")):
            result = self.post("save", styles=NEW)
        self.assertEqual(result.status_code, 500)
        self.assertEqual(self.path.read_bytes(), original)

    def test_stale_tab_and_missing_revision_have_no_side_effects(self):
        revision = self.client.get(som.API_PREFIX + "/styles").json()["revision"]
        self.assertEqual(self.post("save", styles=NEW, revision=revision).status_code, 200)
        snapshot = {p.name: p.read_bytes() for p in self.backups.iterdir()}
        for expected in (revision, None):
            result = self.post("save", styles=STYLE, revision=expected)
            self.assertEqual(result.status_code, 409)
            self.assertEqual(som._read_styles(self.path), NEW)
            self.assertEqual({p.name: p.read_bytes() for p in self.backups.iterdir()}, snapshot)

    def test_external_edit_conflicts_with_save_and_restore(self):
        source = self.legacy()
        revision = som._revision(self.path)
        self.path.write_bytes(self.path.read_bytes() + b"\n")
        original = self.path.read_bytes()
        for action, values in (("save", {"styles": NEW}), ("restore", {"backup_name": source.name})):
            self.assertEqual(self.post(action, revision=revision, **values).status_code, 409)
            self.assertEqual(self.path.read_bytes(), original)
        self.assertEqual(len(list(self.backups.iterdir())), 1)

    def test_change_during_staging_is_checked_before_replace(self):
        original = som._write_styles

        def external_write(path, styles, expected_revision=None):
            self.path.write_text("external data", encoding="utf8")
            return original(path, styles, expected_revision)

        with patch.object(som, "_write_styles", side_effect=external_write):
            result = self.post("save", styles=NEW)
        self.assertEqual(result.status_code, 409)
        self.assertEqual(self.path.read_text(), "external data")

    def test_restore_rejects_path_traversal_and_unrelated_file(self):
        source = self.legacy()
        (self.backups / "styles_custom.csv").write_bytes(source.read_bytes())
        for name in ("../" + source.name, "..\\" + source.name, str(source), "styles_custom.csv", ""):
            with self.subTest(name=name):
                result = self.post("restore", backup_name=name)
                self.assertNotEqual(result.status_code, 200)
                self.assertEqual(som._read_styles(self.path), STYLE)

    def test_invalid_header_and_duplicate_names_remain_rejected(self):
        bad = self.legacy()
        bad.write_text("name,prompt,extra\na,b,c\n", encoding="utf8")
        self.assertNotEqual(self.post("restore", backup_name=bad.name).status_code, 200)
        self.assertEqual(self.post("save", styles=NEW + NEW).status_code, 400)

    def test_host_reload_failure_reports_committed_success(self):
        shared.prompt_styles.reload.side_effect = RuntimeError("host refresh failed")
        result = self.post("save", styles=NEW)
        self.assertEqual(result.status_code, 200)
        self.assertTrue(result.json()["restart_required"])
        self.assertEqual(result.json()["revision"], som._revision(self.path))


class AuthTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="som-auth-")
        self.addCleanup(self.temp.cleanup)
        self.path = Path(self.temp.name) / "styles.csv"
        som._write_styles(self.path, STYLE)
        shared.prompt_styles = types.SimpleNamespace(default_path=str(self.path), reload=Mock())
        shared.cmd_opts.api_auth = None

    def assert_all_routes(self, client, expected):
        routes = [r for r in client.app.routes if getattr(r, "path", "").startswith(som.API_PREFIX)]
        self.assertEqual(len(routes), 9)
        with patch.object(som, "_style_path", side_effect=AssertionError("unauthorized side effect")):
            for route in routes:
                method = next(iter(route.methods))
                response = client.request(method, route.path, json={} if method == "POST" else None)
                self.assertEqual(response.status_code, expected, route.path)

    def exercise_authorized_routes(self, client, **options):
        folder = str(Path(self.temp.name) / "authorized-backups")
        payload = {"backup_folder": folder, "backup_count": 10}
        self.assertEqual(client.get(som.API_PREFIX + "/styles", **options).status_code, 200)
        self.assertEqual(client.post(som.API_PREFIX + "/next-name", json={"base": "New Style", "names": []}, **options).status_code, 200)
        self.assertEqual(client.post(som.API_PREFIX + "/reload", **options).status_code, 200)
        self.assertEqual(client.post(som.API_PREFIX + "/backups", json=payload, **options).status_code, 200)
        with patch.object(som, "_pick_backup_folder", return_value=folder):
            self.assertEqual(client.post(som.API_PREFIX + "/select-backup-folder", **options).status_code, 200)
        backup = client.post(som.API_PREFIX + "/backup", json=payload, **options)
        self.assertEqual(backup.status_code, 200, backup.text)
        save = client.post(som.API_PREFIX + "/save", json={**payload, "styles": NEW, "revision": som._revision(self.path)}, **options)
        self.assertEqual(save.status_code, 200, save.text)
        restore = client.post(som.API_PREFIX + "/restore", json={**payload, "backup_name": backup.json()["backup_file"], "revision": save.json()["revision"]}, **options)
        self.assertEqual(restore.status_code, 200, restore.text)
        self.assertEqual(som._read_styles(self.path), STYLE)

    def test_native_gradio_anonymous_forged_and_authenticated_sessions(self):
        demo, app = gradio_host([("test-user", "test-password")])
        som.api_style_editor(demo, app)
        with TestClient(app) as client:
            self.assert_all_routes(client, 401)
            cookie_id = getattr(app, "cookie_id", None)
            cookie = "access-token" + (f"-{cookie_id}" if cookie_id else "")
            client.cookies.set(cookie, "forged")
            self.assert_all_routes(client, 401)
            client.cookies.clear()
            login = client.post("/login", data={"username": "test-user", "password": "test-password"})
            self.assertEqual(login.status_code, 200)
            response = client.get(som.API_PREFIX + "/styles")
            self.assertEqual(response.status_code, 200, response.text)
            self.assertEqual(response.json()["styles"], STYLE)
            # Secure/unsecure cookie variants must both use the native token store.
            token = next(iter(app.tokens))
            for key in (cookie, "access-token-unsecure" + (f"-{cookie_id}" if cookie_id else "")):
                client.cookies.clear()
                client.cookies.set(key, token)
                self.assertEqual(client.get(som.API_PREFIX + "/styles").status_code, 200)
                self.assertEqual(client.post(som.API_PREFIX + "/backups", json={}).status_code, 200)
            self.exercise_authorized_routes(client)
            app.tokens.clear()
            self.assert_all_routes(client, 401)

    def test_basic_does_not_bypass_gradio(self):
        demo, app = gradio_host([("test-user", "test-password")])
        shared.cmd_opts.api_auth = "test-user:test-password"
        som.api_style_editor(demo, app)
        with TestClient(app) as client:
            self.assertEqual(client.get(som.API_PREFIX + "/styles", auth=("test-user", "test-password")).status_code, 401)

    def test_external_gradio_auth_dependency(self):
        demo, app = gradio_host()
        if not hasattr(app, "auth_dependency"):
            self.skipTest("Gradio 3 has no auth_dependency contract")
        app.auth_dependency = lambda request: "test-user" if request.headers.get("x-test-auth") == "test-token" else None
        som.api_style_editor(demo, app)
        with TestClient(app) as client:
            self.assert_all_routes(client, 401)
            self.assertEqual(client.get(som.API_PREFIX + "/styles", headers={"x-test-auth": "test-token"}).status_code, 200)

    def test_unrecognized_hosts_register_no_routes(self):
        for demo, auth in ((object(), None), (None, None), (None, "enabled")):
            app = FastAPI()
            shared.cmd_opts.api_auth = auth
            with self.assertRaises(RuntimeError):
                som.api_style_editor(demo, app)
            self.assertFalse(any(getattr(r, "path", "").startswith(som.API_PREFIX) for r in app.routes))

    def test_api_only_native_basic_guard(self):
        # Execute the installed host's exact guard and registration methods, without importing GPU code.
        host = Path(os.environ.get("SOM_HOST_ROOT", sys.prefix)).parent if "SOM_HOST_ROOT" not in os.environ else Path(os.environ["SOM_HOST_ROOT"])
        source = host / "modules/api/api.py"
        tree = ast.parse(source.read_text(encoding="utf8"))
        api_class = next(n for n in tree.body if isinstance(n, ast.ClassDef) and n.name == "Api")
        methods = [n for n in api_class.body if isinstance(n, ast.FunctionDef) and n.name in ("auth", "add_api_route")]
        self.assertEqual(len(methods), 2)
        namespace = {"Depends": Depends, "HTTPBasic": HTTPBasic, "HTTPBasicCredentials": HTTPBasicCredentials,
                     "HTTPException": HTTPException, "compare_digest": secrets.compare_digest, "shared": shared}
        exec(compile(ast.Module(body=methods, type_ignores=[]), str(source), "exec"), namespace)
        app = FastAPI()
        api = types.SimpleNamespace(app=app, credentials={"test-user": "test-password"})
        api.auth = types.MethodType(namespace["auth"], api)
        api.add_api_route = types.MethodType(namespace["add_api_route"], api)
        shared.cmd_opts.api_auth = "test-user:test-password"
        api.add_api_route("/sdapi/v1/options", lambda: {}, methods=["GET"])
        som.api_style_editor(None, app)
        with TestClient(app) as client:
            self.assert_all_routes(client, 401)
            self.assertEqual(client.get(som.API_PREFIX + "/styles", auth=("test-user", "wrong")).status_code, 401)
            self.assertEqual(client.get(som.API_PREFIX + "/styles", auth=("test-user", "test-password")).status_code, 200)
            self.exercise_authorized_routes(client, auth=("test-user", "test-password"))

    def test_api_only_unprotected_contract_is_rejected_if_auth_configured(self):
        app = FastAPI()
        app.add_api_route("/sdapi/v1/options", lambda: {}, methods=["GET"])
        shared.cmd_opts.api_auth = "enabled"
        with self.assertRaises(RuntimeError):
            som.api_style_editor(None, app)
        shared.cmd_opts.api_auth = None
        som.api_style_editor(None, app)
        with TestClient(app) as client:
            self.assertEqual(client.get(som.API_PREFIX + "/styles").status_code, 200)


if __name__ == "__main__":
    unittest.main(verbosity=2)
