#!/usr/bin/env python3
"""Restore project files by replaying Write/StrReplace ops from agent transcripts."""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

PROJECT_ROOT = Path("/Users/zhengjiaqi/Desktop/figma-untitled-progress")
TRANSCRIPT = Path(
    "/Users/zhengjiaqi/.cursor/projects/Users-zhengjiaqi-Desktop-figma-untitled-progress/"
    "agent-transcripts/4d7da132-cd0c-46f7-a11d-922774392018/"
    "4d7da132-cd0c-46f7-a11d-922774392018.jsonl"
)
TRANSCRIPTS_ROOT = TRANSCRIPT.parent.parent


def normalize_rel(path: str) -> str | None:
    if not path:
        return None
    marker = "figma-untitled-progress/"
    if marker in path:
        rel = path.split(marker, 1)[1]
    elif path.startswith(str(PROJECT_ROOT)):
        rel = path[len(str(PROJECT_ROOT)) :].lstrip("/")
    else:
        return None
    return rel.replace("\\", "/")


def iter_ops(jsonl_path: Path):
    with jsonl_path.open(encoding="utf-8") as f:
        for line_no, line in enumerate(f):
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            msg = obj.get("message") or {}
            for item in msg.get("content") or []:
                if item.get("type") != "tool_use":
                    continue
                name = item.get("name")
                if name not in ("Write", "StrReplace"):
                    continue
                inp = item.get("input") or {}
                rel = normalize_rel(inp.get("path") or "")
                if rel is None:
                    continue
                yield line_no, name, rel, inp


def apply_op(content: str | None, name: str, inp: dict) -> tuple[str | None, bool]:
    if name == "Write":
        return inp.get("contents", ""), True
    if content is None:
        return None, False
    old = inp.get("old_string", "")
    new = inp.get("new_string", "")
    if old not in content:
        return content, False
    return content.replace(old, new, 1), True


def replay_last_write_then_strreplace(target: Path, rel: str) -> tuple[str | None, dict]:
    content: str | None = None
    last_write_line = -1
    stats = {"writes": 0, "strreplace_ok": 0, "strreplace_fail": 0}
    for line_no, name, r, inp in iter_ops(target):
        if r != rel:
            continue
        if name == "Write":
            content, _ = apply_op(content, name, inp)
            last_write_line = line_no
            stats["writes"] += 1
        elif name == "StrReplace" and line_no > last_write_line:
            content, ok = apply_op(content, name, inp)
            if ok:
                stats["strreplace_ok"] += 1
            else:
                stats["strreplace_fail"] += 1
    return content, stats


def replay_all_transcripts(rel: str) -> tuple[str | None, dict]:
    files = sorted(
        TRANSCRIPTS_ROOT.rglob("*.jsonl"),
        key=lambda p: os.path.getmtime(p),
    )
    content: str | None = None
    stats = {"writes": 0, "strreplace_ok": 0, "strreplace_fail": 0, "files": 0}
    seen_files: set[Path] = set()
    for fp in files:
        seen_files.add(fp)
        for _line_no, name, r, inp in iter_ops(fp):
            if r != rel:
                continue
            content, ok = apply_op(content, name, inp)
            if name == "Write":
                stats["writes"] += 1
            elif ok:
                stats["strreplace_ok"] += 1
            else:
                stats["strreplace_fail"] += 1
    stats["files"] = len(seen_files)
    return content, stats


def write_file(rel: str, content: str) -> Path:
    out = PROJECT_ROOT / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(content, encoding="utf-8")
    return out


def main() -> int:
    if not TRANSCRIPT.is_file():
        print(f"Transcript not found: {TRANSCRIPT}", file=sys.stderr)
        return 1

    # Priority targets and replay mode
    targets: list[tuple[str, str]] = [
        ("src/components/CheckinModal.tsx", "last_write_target"),
        ("src/guild-home.css", "all_transcripts"),
        ("src/data/guildHome.ts", "all_transcripts"),
        ("src/pages/GuildHome.tsx", "all_transcripts"),
        ("src/App.tsx", "all_transcripts"),
        ("package.json", "all_transcripts"),
        ("vite.config.ts", "all_transcripts"),
        ("vite.config.js", "all_transcripts"),
        ("src/main.tsx", "all_transcripts"),
        ("index.html", "all_transcripts"),
    ]

    restored: list[tuple[str, int, str, dict]] = []

    for rel, mode in targets:
        if mode == "last_write_target":
            content, stats = replay_last_write_then_strreplace(TRANSCRIPT, rel)
            method = "target:last_write+strreplace"
        else:
            content, stats = replay_all_transcripts(rel)
            method = "all_transcripts:write+strreplace"

        if content is None or content == "":
            print(f"SKIP (no content): {rel} stats={stats}")
            continue

        path = write_file(rel, content)
        size = path.stat().st_size
        restored.append((rel, size, method, stats))
        print(f"OK {rel} -> {size} bytes ({method}) stats={stats}")

    # Also restore every Write in the target transcript under project root
    extra: set[str] = set()
    for _line_no, name, rel, inp in iter_ops(TRANSCRIPT):
        if name != "Write":
            continue
        if rel in {r for r, _ in targets}:
            continue
        content = inp.get("contents", "")
        if not content:
            continue
        path = write_file(rel, content)
        extra.add(rel)
        print(f"OK (target Write) {rel} -> {path.stat().st_size} bytes")

    print("\n=== RESTORED FILES ===")
    all_files = [(r, s, m) for r, s, m, _ in restored] + [
        (r, (PROJECT_ROOT / r).stat().st_size, "target:Write") for r in sorted(extra)
    ]
    for rel, size, method in sorted(all_files, key=lambda x: x[0]):
        print(f"{size:>8}  {rel}  [{method}]")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
