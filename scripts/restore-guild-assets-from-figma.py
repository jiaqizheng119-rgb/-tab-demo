#!/usr/bin/env python3
"""Re-download guild assets from fresh Figma MCP URLs (valid ~7 days)."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GUILD = ROOT / "public" / "guild"

# Mapped from get_design_context on node 43:10900 (guild home) + 48:2 (checkin)
DOWNLOADS: dict[str, str] = {
    # Status bar + nav
    "https://www.figma.com/api/mcp/asset/b7386bc5-5736-4856-a8cc-aed00f2bf543": "icons/status-cellular.svg",
    "https://www.figma.com/api/mcp/asset/59c21a85-d2a0-4917-b3ce-f7353ace5ecb": "icons/status-wifi.svg",
    "https://www.figma.com/api/mcp/asset/7dd1e18c-f64f-4c80-bc94-88454717f61d": "icons/status-battery.svg",
    "https://www.figma.com/api/mcp/asset/8a7fcc35-cd0d-4425-9f5c-3bdebcb75841": "icons/nav-back.svg",
    "https://www.figma.com/api/mcp/asset/1295d9e0-f1ca-4337-999b-f1695fe8678d": "icons/nav-share.svg",
    # Header
    "https://www.figma.com/api/mcp/asset/fb02a37a-d155-4a88-991b-2fb1d9b4961b": "guild-avatar.png",
    "https://www.figma.com/api/mcp/asset/296cd588-fe55-40b9-aff0-556110f076b5": "checkin-btn-bg.png",
    "https://www.figma.com/api/mcp/asset/43ccb7bf-9843-4a48-acbc-3ae6569fa704": "icons/arrow-chevron.svg",
    "https://www.figma.com/api/mcp/asset/35d14df2-989f-48ba-993b-f0f20ba0036c": "member-3.png",
    "https://www.figma.com/api/mcp/asset/9aef82cf-3b32-4f6e-ae49-8d1162bb621b": "member-2.png",
    "https://www.figma.com/api/mcp/asset/028e4ecb-5290-43f9-a594-9d6043ad2f7c": "member-1.png",
    # President card
    "https://www.figma.com/api/mcp/asset/8b8cdd95-34e2-4b69-b98d-3bfe50fb069a": "president-card/base.png",
    "https://www.figma.com/api/mcp/asset/dd048562-8829-4049-8b6e-6d1c4f9727cc": "president-card/tag.png",
    "https://www.figma.com/api/mcp/asset/c0cbc470-de2f-40de-a18f-07e9f4d02b7c": "president-card/name-brace.svg",
    "https://www.figma.com/api/mcp/asset/f5924b0b-16f2-4f69-8ae6-70bda2309764": "president-card/president-text.svg",
    "https://www.figma.com/api/mcp/asset/af31a74c-0b4f-461f-9b9a-4a0709f2c364": "president-card/badges.png",
    # Task card
    "https://www.figma.com/api/mcp/asset/e2ed2616-de5e-4a5f-bd3f-9736907784ef": "achievement-badge-base.png",
    "https://www.figma.com/api/mcp/asset/d3bf63f8-17d1-4871-8de5-5f79d1e5c02d": "achievement-badge-overlay.png",
    "https://www.figma.com/api/mcp/asset/54aff376-0821-4510-b3f8-764367e5047b": "task-card-tab.png",
    "https://www.figma.com/api/mcp/asset/b52af2fb-2d34-4447-a89b-f8ce6c3b8cd8": "icons/arrow-more.svg",
    # Activity + section icons
    "https://www.figma.com/api/mcp/asset/e9c806ac-3f7d-4663-9348-c4df41d74a03": "icons/megaphone.svg",
    "https://www.figma.com/api/mcp/asset/cc97643e-67a3-4113-be16-a96c0cbee373": "icons/sparkle.svg",
    "https://www.figma.com/api/mcp/asset/33755ce6-adc2-4ec6-8d96-ba7a1c5cfae8": "icons/chart.svg",
    "https://www.figma.com/api/mcp/asset/54b9a7a8-1bd1-4447-b042-4d01ca7a0867": "icons/gamepad.svg",
    # Games
    "https://www.figma.com/api/mcp/asset/84f3bcca-f417-430d-824b-1cfbd05377fe": "game-zimu.png",
    "https://www.figma.com/api/mcp/asset/f9ae1e4c-4829-4d31-8674-c31ad08b2fce": "game-lincoln.png",
    "https://www.figma.com/api/mcp/asset/1a0d6de7-4689-43d4-a8b4-a8c9eae41d94": "game-fish.png",
    "https://www.figma.com/api/mcp/asset/132be5f8-a748-49cd-82c3-1433175317bd": "game-player-1.png",
    "https://www.figma.com/api/mcp/asset/1814c048-2e71-4f46-a39b-c60e02f3ee92": "game-player-2.png",
    "https://www.figma.com/api/mcp/asset/10e01ec1-f41c-43df-9e4d-82f7ab6bf3a9": "game-player-3.png",
    "https://www.figma.com/api/mcp/asset/a84ac61d-4134-4a59-839b-da444940fccf": "game-player-4.png",
    "https://www.figma.com/api/mcp/asset/5a83b175-6605-4e02-94e8-c9b230ba9dc1": "game-top1-1.png",
    # Influence
    "https://www.figma.com/api/mcp/asset/b5ae100b-d7fd-48f9-89df-a1decf767613": "sparkle-stars.png",
    "https://www.figma.com/api/mcp/asset/d4a377f5-c2e2-47de-9bd5-a168c5317862": "podium.png",
    "https://www.figma.com/api/mcp/asset/2def1ad3-6850-42d9-ab83-6b695325d0ad": "influence-2.png",
    "https://www.figma.com/api/mcp/asset/6fb9a2b3-9a07-458d-aefb-87b9178e42cf": "influence-1.png",
    "https://www.figma.com/api/mcp/asset/c29e83f3-bda2-421c-bb4d-000fdfc100e2": "influence-3.png",
    # Chat hall footer icons
    "https://www.figma.com/api/mcp/asset/85752ddb-efd3-491f-a5fc-b534b1a49196": "icons/chat-hall.svg",
    "https://www.figma.com/api/mcp/asset/450591da-e322-41f4-ab64-2eccec0acdbe": "icons/live.svg",
    "https://www.figma.com/api/mcp/asset/54be74ac-de85-430a-bd2f-bea6d0b6a382": "icons/more-dots.svg",
    "https://www.figma.com/api/mcp/asset/868688cd-46ca-4e61-98e4-956994ea31da": "icons/more-dots-alt.svg",
    "https://www.figma.com/api/mcp/asset/fc7ad49f-7c8e-4969-aba4-752d1e834fa2": "icons/add-people.svg",
    # Check-in modal (node 48:2)
    "https://www.figma.com/api/mcp/asset/063f60d3-5c78-45f8-94a4-cf585a417102": "checkin/mascot.png",
    "https://www.figma.com/api/mcp/asset/cbdbfa80-8945-4db4-9552-c5f01eccc895": "checkin/exp-coin.svg",
    # Task card SVG backgrounds (re-fetch if still valid)
    "https://www.figma.com/api/mcp/asset/cb9ba1c3-aa75-4daf-9aa5-ece583fd544e": "task-card-bg.svg",
    "https://www.figma.com/api/mcp/asset/c14a0e28-89f1-4249-9bdb-91efd8579454": "task-card-mask.svg",
    "https://www.figma.com/api/mcp/asset/853a8d8a-8cee-43f1-96b5-f661fc614101": "task-progress.svg",
    # Publish sheet (legacy URLs — best effort)
    "https://www.figma.com/api/mcp/asset/0ffb075b-8385-4770-acd1-7ebdc23a1867": "publish-sheet/icon-tile-cake.png",
    "https://www.figma.com/api/mcp/asset/41f0debc-d5b6-4d10-bdd3-6cc480b101e0": "publish-sheet/icon-pixel-heart.png",
    "https://www.figma.com/api/mcp/asset/b94d4289-b098-4a1d-aabd-dd032fcb5cd2": "publish-sheet/icon-profile.png",
    "https://www.figma.com/api/mcp/asset/dcdf2b85-1d5c-46ee-a010-152b93ae74b6": "publish-sheet/icon-pk.png",
    "https://www.figma.com/api/mcp/asset/ae806037-b47f-4a3d-af5c-665e8a5926b4": "publish-sheet/icon-support.png",
    "https://www.figma.com/api/mcp/asset/34b2355d-f679-4fed-a459-8de307e185e2": "publish-sheet/icon-game-bg.svg",
    "https://www.figma.com/api/mcp/asset/949a15cc-f595-4b55-87f6-a87a58e3a425": "publish-sheet/icon-game-fg.svg",
}


def main() -> int:
    ok, fail = 0, 0
    for url, rel in DOWNLOADS.items():
        out = GUILD / rel
        out.parent.mkdir(parents=True, exist_ok=True)
        result = subprocess.run(
            ["curl", "-fsSL", "--retry", "3", url, "-o", str(out)],
            capture_output=True,
            text=True,
        )
        if result.returncode == 0 and out.stat().st_size > 0:
            print(f"OK  {rel}")
            ok += 1
        else:
            print(f"FAIL {rel}: {result.stderr.strip()}", file=sys.stderr)
            fail += 1
            if out.exists():
                out.unlink(missing_ok=True)

    # president-card/emblem — use tag layer asset as fallback from older export
    emblem = GUILD / "president-card/emblem.png"
    tag = GUILD / "president-card/tag.png"
    if not emblem.exists() and tag.exists():
        emblem.write_bytes(tag.read_bytes())
        print("COPY president-card/emblem.png <- tag.png")

    print(f"\nDone: {ok} ok, {fail} failed, {len(list(GUILD.rglob('*')))} files under public/guild/")
    return 0 if fail == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
