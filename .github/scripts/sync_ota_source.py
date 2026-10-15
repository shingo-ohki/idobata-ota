#!/usr/bin/env python3
"""Prepare a safe Ota-source sync from two pinned GitHub source archives.

Never import source Git history; never overwrite a locally changed path when
the upstream also changed that path since the previous imported SHA.
"""
import argparse
import hashlib
import io
import os
from pathlib import Path, PurePosixPath
import stat
import tarfile

SENSITIVE_NAMES = {
    ".git", ".github", ".env", ".gitmodules", "app.yaml"
}
SENSITIVE_SUFFIXES = (".pem", ".key", ".p12", ".pfx")
BASELINE = Path(".github/ota-upstream-base.sha")
PENDING = Path(".github/OTA_SYNC_PENDING.md")
MAX_FILE_BYTES = 25 * 1024 * 1024
MAX_TOTAL_BYTES = 180 * 1024 * 1024
MAX_ENTRIES = 10000


def allowed(path: str) -> bool:
    parts = PurePosixPath(path).parts
    if not parts or path.startswith("/") or any(x in (".", "..") for x in parts):
        raise ValueError(f"Unsafe archive path: {path!r}")
    if any(x in SENSITIVE_NAMES or x.startswith(".env.") for x in parts):
        return False
    if any(x.endswith(SENSITIVE_SUFFIXES) for x in parts):
        return False
    return True


def entries(archive_path: str) -> dict[str, tuple[bytes, bool]]:
    result = {}
    total = 0
    root = None
    with tarfile.open(archive_path, "r:gz") as archive:
        members = archive.getmembers()
        if len(members) > MAX_ENTRIES:
            raise ValueError("Too many files in source archive")
        for member in members:
            parts = PurePosixPath(member.name).parts
            if not parts or any(part in (".", "..") for part in parts):
                raise ValueError("Invalid source path")
            if root is None:
                root = parts[0]
            if parts[0] != root:
                raise ValueError("Multiple archive roots")
            if not (member.isfile() or member.isdir()):
                raise ValueError(f"Non-regular source entry: {member.name}")
            if len(parts) == 1 or member.isdir():
                continue
            rel = "/".join(parts[1:])
            if not allowed(rel):
                continue
            if member.size > MAX_FILE_BYTES:
                raise ValueError(f"Source file too large: {rel}")
            total += member.size
            if total > MAX_TOTAL_BYTES:
                raise ValueError("Source archive too large")
            if rel in result:
                raise ValueError(f"Duplicate source file: {rel}")
            fp = archive.extractfile(member)
            if fp is None:
                raise ValueError(f"Unreadable source file: {rel}")
            result[rel] = (fp.read(), bool(member.mode & 0o111))
    return result


def local(path: str) -> tuple[bytes, bool] | None:
    p = Path(path)
    if p.is_symlink():
        raise ValueError(f"Refusing to replace a local symlink: {path}")
    if not p.exists():
        return None
    if not p.is_file():
        raise ValueError(f"Refusing to replace a non-file: {path}")
    return p.read_bytes(), bool(p.stat().st_mode & 0o111)


def put(path: str, state: tuple[bytes, bool] | None) -> None:
    p = Path(path)
    if state is None:
        p.unlink()
        return
    content, executable = state
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_bytes(content)
    p.chmod(0o755 if executable else 0o644)


def listing(paths: list[str], maximum: int = 90) -> str:
    if not paths:
        return "- なし\n"
    chosen = paths[:maximum]
    rows = [f"- \`{p.replace(chr(96), '')}\`" for p in chosen]
    if len(paths) > maximum:
        rows.append(f"- ほか {len(paths) - maximum} 件（ログを参照）")
    return "\n".join(rows) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-tar", required=True)
    parser.add_argument("--head-tar", required=True)
    parser.add_argument("--base-sha", required=True)
    parser.add_argument("--source-sha", required=True)
    parser.add_argument("--report", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    for sha in (args.base_sha, args.source_sha):
        if len(sha) != 40 or any(x not in "0123456789abcdef" for x in sha):
            raise ValueError("Invalid SHA")
    current_base = BASELINE.read_text(encoding="utf-8").strip()
    if current_base != args.base_sha:
        raise ValueError("Baseline changed unexpectedly")

    old = entries(args.base_tar)
    new = entries(args.head_tar)
    safe = []
    conflicts = []
    already = []
    for path in sorted(set(old) | set(new)):
        before, after = old.get(path), new.get(path)
        if before == after:
            continue  # No Ota change; preserve EngageWorks work.
        ours = local(path)
        if ours == after:
            already.append(path)
        elif ours == before:
            safe.append(path)
        else:
            conflicts.append(path)

    # Apply only AFTER the full comparison. No overlapping path is overwritten.
    for path in safe:
        put(path, new.get(path))

    summary = f"""## Ota更新の競合チェック

- 比較の起点（前回取り込んだ太田さん版）: \`{args.base_sha}\`
- 今回の太田さん版: \`{args.source_sha}\`
- **安全に取り込めるファイル**: {len(safe)} 件
- **両者が変更した衝突候補（自動上書きしない）**: {len(conflicts)} 件
- 既に最新版と一致: {len(already)} 件

### 衝突候補：人が内容を確認してください

{listing(conflicts)}
同じファイルが変更された場合の保守的な判定です。
**同じ行が衝突したと断定していません。** PR本文だけでなく差分を確認してください。

### 自動で取り込む変更

{listing(safe)}
### 注意

- 太田さん版のGit履歴は取得・mergeしていません。
- EngageWorks側だけが変更したファイルは保持しました。
- 衝突ファイルは元のEngageWorks版の内容を保持しています。
- 未解決の衝突があるPRは**マージしないでください**。
  衝突箇所を解決して再検査した後にマージします。
- このチェックは依存関係・API・仕様の意味的な衝突までは検出しません。
"""
    if conflicts:
        PENDING.write_text(
            "# 未解決：太田さん版との差分衝突\n\n"
            "このファイルは同期Actionが生成しました。"
            "衝突箇所がすべて解決するまでPRをマージしないでください。\n\n"
            + summary,
            encoding="utf-8",
        )
    else:
        # Advancing the baseline is safe only once all paths agree or are
        # safely updated. Don't forget upstream changes that still conflict.
        BASELINE.write_text(args.source_sha + "\n", encoding="utf-8")
        PENDING.unlink(missing_ok=True)

    Path(args.report).write_text(summary, encoding="utf-8")
    with open(args.output, "a", encoding="utf-8") as f:
        f.write(f"collisions={len(conflicts)}\n")
        f.write(f"safe={len(safe)}\n")
    print(f"Source paths reviewed: {len(set(old) | set(new))}")
    print(f"Safe: {len(safe)}; conflicts: {len(conflicts)}; already current: {len(already)}")


if __name__ == "__main__":
    main()
