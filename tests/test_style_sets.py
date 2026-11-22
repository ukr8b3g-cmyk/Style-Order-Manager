"""Named-set regressions using only the temporary host CSV."""
import unittest
from unittest.mock import patch

import test_style_order_manager as fixture

som = fixture.som


class StyleSetTests(unittest.TestCase):
    setUp = fixture.StyleTests.setUp
    post = fixture.StyleTests.post

    def summary(self):
        return self.client.get(som.API_PREFIX + "/styles").json()

    def change(self, action, **payload):
        return self.post("sets", action=action, **{
            "sets_revision": self.summary()["sets_revision"], **payload,
        })

    def test_lazy_migration_external_edits_and_stale_editor(self):
        original = self.path.read_bytes()
        self.assertEqual(self.summary()["active_set"], "first")
        self.assertFalse(som._catalog_path(self.path).exists())
        self.assertEqual(self.path.read_bytes(), original)
        first_revision = self.summary()["revision"]
        som._write_styles(self.path, fixture.NEW)
        new = self.change("create", name="新セット", revision=first_revision).json()
        self.assertEqual(new["styles"], [])
        self.assertEqual(self.summary()["active_set"], new["active_set"])
        self.assertEqual(self.change("rename", name="SDXL").json()["sets"][1]["name"], "SDXL")
        self.assertEqual(self.change("switch", target="first").json()["styles"], fixture.NEW)
        # Two sets may have identical CSV content. A stale panel must still be refused.
        self.assertEqual(self.post("save", styles=[], sets_revision=new["sets_revision"]).status_code, 409)
        self.assertEqual(self.post("restore", backup_name="", sets_revision=new["sets_revision"]).status_code, 409)

    def test_move_copy_order_and_per_item_collision_choices(self):
        rows = [{"name": n, "prompt": str(i), "negative_prompt": "陰"} for i, n in enumerate(["A", "Straße", "C"])]
        som._write_styles(self.path, rows)
        target = self.change("create", name="Set 2").json()["active_set"]
        self.change("switch", target="first")
        self.assertEqual(self.change("copy", indices=[2, 0, 1], target=target).json()["styles"], rows)
        version = self.summary()["sets_revision"]
        conflicts = self.change("move", indices=[1, 2], target=target, names={"1": "STRASSE"}).json()["conflicts"]
        self.assertEqual([item["index"] for item in conflicts], [1, 2])
        self.assertEqual(self.summary()["sets_revision"], version)
        moved = self.change("move", indices=[1, 2], target=target, names={"1": None, "2": "C copy"}).json()
        self.assertEqual(moved["styles"], rows[:2])
        self.assertEqual(self.change("switch", target=target).json()["styles"], rows + [{**rows[2], "name": "C copy"}])

    def test_reorder_preserves_active_csv_and_rejects_stale_or_incomplete_order(self):
        target = self.change("create", name="Other").json()["active_set"]
        before = self.summary()
        csv = self.path.read_bytes()
        fixture.shared.prompt_styles.reload.reset_mock()
        ordered = self.change("reorder", order=[target, "first"]).json()
        self.assertEqual(ordered["active_set"], target)
        self.assertEqual([item["id"] for item in self.summary()["sets"]], [target, "first"])
        self.assertEqual(self.change("reorder", order=["first", target], sets_revision=before["sets_revision"]).status_code, 409)
        self.assertEqual(self.change("reorder", order=[target, target]).status_code, 400)
        self.assertEqual(self.path.read_bytes(), csv)
        fixture.shared.prompt_styles.reload.assert_not_called()

    def test_move_directly_to_new_destination(self):
        result = self.change("move", name="画像", indices=[0]).json()
        self.assertEqual(result["active_set"], "first")
        self.assertEqual(result["styles"], [])
        self.assertEqual(self.change("switch", target=result["destination"]).json()["styles"], fixture.STYLE)

    def test_save_and_switch_conflict_retains_external_csv(self):
        stale = self.summary()["revision"]
        som._write_styles(self.path, fixture.NEW)
        self.assertEqual(self.change("create", name="X", draft=fixture.STYLE, revision=stale).status_code, 409)
        self.assertEqual(self.summary()["styles"], fixture.NEW)
        new = self.change("create", name="X", draft=fixture.STYLE).json()
        self.assertEqual(new["styles"], [])
        self.assertEqual(self.change("switch", target="first").json()["styles"], fixture.STYLE)

    def test_interrupted_commit_recovers_from_csv_revision(self):
        store = som._store_json

        def fail_final(path, catalog):
            if "pending" not in catalog:
                raise OSError("interrupted")
            store(path, catalog)

        with patch.object(som, "_store_json", side_effect=fail_final):
            response = self.change("create", name="Other")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["catalog_warning"], "interrupted")
        after = self.summary()
        self.assertEqual(after["styles"], [])
        self.assertEqual(after["active_set"], after["sets"][1]["id"])
        self.assertEqual(self.change("switch", target="first").json()["styles"], fixture.STYLE)
