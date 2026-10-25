"""Committed CSV operations must remain successful when retention fails."""
from pathlib import Path
import os
import unittest
from unittest.mock import patch

import test_style_order_manager as fixtures

som = fixtures.som


class BackupCommitTests(unittest.TestCase):
    setUp = fixtures.StyleTests.setUp
    post = fixtures.StyleTests.post
    legacy = fixtures.StyleTests.legacy

    def test_save_cleanup_failure_returns_committed_revision_and_reloads_host(self):
        old_revision = som._revision(self.path)
        old_bytes = self.path.read_bytes()
        with patch.object(som, "_cleanup_backups", side_effect=PermissionError("locked backup")):
            response = self.post("save", styles=fixtures.NEW)
        self.assertEqual(response.status_code, 200, response.text)
        body = response.json()
        self.assertEqual(body["styles"], fixtures.NEW)
        self.assertEqual(body["revision"], som._revision(self.path))
        self.assertNotEqual(body["revision"], old_revision)
        self.assertIn("locked backup", body["cleanup_warning"])
        self.assertEqual((self.backups / body["backup_file"]).read_bytes(), old_bytes)
        fixtures.shared.prompt_styles.reload.assert_called_once()
        self.assertEqual(self.post("save", revision=old_revision, styles=fixtures.NEW).status_code, 409)
        self.assertEqual(self.post("save", revision=body["revision"], styles=fixtures.STYLE).status_code, 200)

    def test_restore_cleanup_failure_returns_committed_revision_and_safety_copy(self):
        backup = self.legacy()
        old_bytes = self.path.read_bytes()
        with patch.object(som, "_cleanup_backups", side_effect=PermissionError("locked backup")):
            response = self.post("restore", backup_name=backup.name)
        self.assertEqual(response.status_code, 200, response.text)
        body = response.json()
        self.assertEqual(body["styles"], fixtures.NEW)
        self.assertEqual(body["revision"], som._revision(self.path))
        self.assertEqual(self.path.read_bytes(), backup.read_bytes())
        self.assertEqual((self.backups / body["safety_backup_file"]).read_bytes(), old_bytes)
        self.assertIn("locked backup", body["cleanup_warning"])
        fixtures.shared.prompt_styles.reload.assert_called_once()

    def test_manual_backup_cleanup_failure_reports_created_copy(self):
        old_bytes = self.path.read_bytes()
        with patch.object(som, "_cleanup_backups", side_effect=PermissionError("locked backup")):
            response = self.post("backup")
        self.assertEqual(response.status_code, 200, response.text)
        body = response.json()
        self.assertEqual((self.backups / body["backup_file"]).read_bytes(), old_bytes)
        self.assertEqual(self.path.read_bytes(), old_bytes)
        self.assertIn("locked backup", body["cleanup_warning"])

    def test_cleanup_and_reload_warnings_are_independent(self):
        fixtures.shared.prompt_styles.reload.side_effect = RuntimeError("reload unavailable")
        with patch.object(som, "_cleanup_backups", side_effect=PermissionError("locked backup")):
            response = self.post("save", styles=fixtures.NEW)
        self.assertEqual(response.status_code, 200, response.text)
        body = response.json()
        self.assertTrue(body["restart_required"])
        self.assertEqual(body["reload_warning"], "reload unavailable")
        self.assertEqual(body["cleanup_warning"], "locked backup")
        self.assertEqual(body["revision"], som._revision(self.path))

    def test_actual_retention_unlink_failure_keeps_new_safety_backup(self):
        old = self.legacy()
        unlink = Path.unlink

        def fail_locked(path, *args, **kwargs):
            if path == old:
                raise PermissionError("simulated locked file")
            return unlink(path, *args, **kwargs)

        with patch.object(Path, "unlink", fail_locked):
            response = self.post("save", styles=fixtures.NEW)
        self.assertEqual(response.status_code, 200, response.text)
        body = response.json()
        self.assertIn("locked file", body["cleanup_warning"])
        self.assertTrue(old.is_file())
        self.assertTrue((self.backups / body["backup_file"]).is_file())
        self.assertEqual(som._read_styles(self.path), fixtures.NEW)
        fixtures.shared.prompt_styles.reload.assert_called_once()

    def test_replace_failure_remains_error_and_does_not_run_postcommit_work(self):
        for action in ["save", "restore"]:
            with self.subTest(action=action):
                old = self.path.read_bytes()
                fixtures.shared.prompt_styles.reload.reset_mock()
                backup = self.legacy()
                helper = "_write_styles" if action == "save" else "_restore_atomic"
                with patch.object(som, helper, side_effect=PermissionError("replacement failed")), \
                        patch.object(som, "_cleanup_backups") as cleanup:
                    response = self.post(action, styles=fixtures.NEW, backup_name=backup.name)
                self.assertEqual(response.status_code, 500)
                self.assertEqual(self.path.read_bytes(), old)
                cleanup.assert_not_called()
                fixtures.shared.prompt_styles.reload.assert_not_called()

    def test_normal_success_has_no_cleanup_warning(self):
        response = self.post("save", styles=fixtures.NEW)
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.json()["cleanup_warning"])

    def test_listing_binds_absolute_folder_even_when_csv_path_is_relative(self):
        original = Path.cwd()
        try:
            os.chdir(self.path.parent)
            fixtures.shared.prompt_styles.default_path = "styles.csv"
            response = self.post("backups", backup_folder="backups")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()["folder"], str(self.backups.resolve()))
        finally:
            os.chdir(original)


if __name__ == "__main__":
    unittest.main()
