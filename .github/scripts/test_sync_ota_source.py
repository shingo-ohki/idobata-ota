#!/usr/bin/env python3
"""Offline tests for the safety-critical source synchronizer."""
import io
import os
from pathlib import Path
import sys
import tarfile
import tempfile
import unittest
from unittest.mock import patch

from sync_ota_source import main

BASE_SHA = "a" * 40
NEXT_SHA = "b" * 40

def archive(path, files):
    with tarfile.open(path, "w:gz") as tar:
        info = tarfile.TarInfo("repo-test/")
        info.type = tarfile.DIRTYPE
        tar.addfile(info)
        for name, data in files.items():
            info = tarfile.TarInfo("repo-test/" + name)
            info.size = len(data)
            info.mode = 0o644
            tar.addfile(info, io.BytesIO(data))

class TestSync(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.original = os.getcwd()
        os.chdir(self.tmp.name)
        Path(".github").mkdir()
        Path(".github/ota-upstream-base.sha").write_text(BASE_SHA + "\n")

    def tearDown(self):
        os.chdir(self.original)
        self.tmp.cleanup()

    def run_sync(self, old, new):
        archive(Path("old.tar.gz"), old)
        archive(Path("new.tar.gz"), new)
        args = ["sync", "--base-tar", "old.tar.gz", "--head-tar", "new.tar.gz",
                "--base-sha", BASE_SHA, "--source-sha", NEXT_SHA,
                "--report", "report.md", "--output", "result.txt"]
        with patch.object(sys, "argv", args):
            main()
        return Path("report.md").read_text()

    def test_independent_changes_stay(self):
        Path("a.txt").write_bytes(b"old")
        Path("keep.txt").write_bytes(b"EngageWorks edit")
        Path("local-only.txt").write_bytes(b"local")
        result = self.run_sync(
            {"a.txt": b"old", "keep.txt": b"old"},
            {"a.txt": b"new", "keep.txt": b"old"})
        self.assertEqual(Path("a.txt").read_bytes(), b"new")
        self.assertEqual(Path("keep.txt").read_bytes(), b"EngageWorks edit")
        self.assertEqual(Path("local-only.txt").read_bytes(), b"local")
        self.assertEqual(Path(".github/ota-upstream-base.sha").read_text().strip(), NEXT_SHA)
        self.assertFalse(Path(".github/OTA_SYNC_PENDING.md").exists())
        self.assertIn("衝突候補", result)

    def test_same_path_collision_does_not_overwrite(self):
        Path("same.txt").write_bytes(b"local")
        Path("safe.txt").write_bytes(b"old")
        result = self.run_sync(
            {"same.txt": b"base", "safe.txt": b"old"},
            {"same.txt": b"upstream", "safe.txt": b"new"})
        self.assertEqual(Path("same.txt").read_bytes(), b"local")
        self.assertEqual(Path("safe.txt").read_bytes(), b"new")
        self.assertEqual(Path(".github/ota-upstream-base.sha").read_text().strip(), BASE_SHA)
        self.assertTrue(Path(".github/OTA_SYNC_PENDING.md").exists())
        self.assertIn("same.txt", result)

    def test_delete_protects_local_modified_path(self):
        Path("safe.txt").write_bytes(b"old")
        Path("modified.txt").write_bytes(b"local")
        self.run_sync(
            {"safe.txt": b"old", "modified.txt": b"old"}, {})
        self.assertFalse(Path("safe.txt").exists())
        self.assertEqual(Path("modified.txt").read_bytes(), b"local")

    def test_new_path_collision(self):
        Path("created.txt").write_bytes(b"local")
        r = self.run_sync({}, {"created.txt": b"upstream"})
        self.assertEqual(Path("created.txt").read_bytes(), b"local")
        self.assertIn("created.txt", r)

    def test_sensitive_files_excluded(self):
        self.run_sync({}, {
            "idea-discussion/backend/app.yaml": b"excluded",
            ".github/workflows/other.yml": b"excluded",
            "src/.env.production": b"excluded",
            "normal.txt": b"yes",
        })
        self.assertFalse(Path("idea-discussion/backend/app.yaml").exists())
        self.assertFalse(Path(".github/workflows/other.yml").exists())
        self.assertFalse(Path("src/.env.production").exists())
        self.assertEqual(Path("normal.txt").read_bytes(), b"yes")

if __name__ == "__main__":
    unittest.main()
