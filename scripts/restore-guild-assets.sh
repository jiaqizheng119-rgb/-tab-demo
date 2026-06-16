#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GUILD="$ROOT/public/guild"

mkdir -p "$GUILD"/{icons,checkin,president-card,publish-sheet}

download() {
  local url="$1"
  local out="$2"
  mkdir -p "$(dirname "$out")"
  if curl -fsSL --retry 3 "$url" -o "$out"; then
    echo "OK  $out"
  else
    echo "FAIL $out" >&2
    return 1
  fi
}

# Core guild home assets (latest transcript mappings)
download "https://www.figma.com/api/mcp/asset/f8bde97a-7511-46fc-b4bf-e3528b29d9af" "$GUILD/guild-avatar.png"
download "https://www.figma.com/api/mcp/asset/7c4dbd9e-115b-4461-ae95-3ca742c8775a" "$GUILD/achievement-badge-base.png"
download "https://www.figma.com/api/mcp/asset/8d1c13fa-eaea-4224-ba6c-198b097dbe82" "$GUILD/achievement-badge-overlay.png"
download "https://www.figma.com/api/mcp/asset/9780b83b-1fef-4705-add2-8c9fd99c33cf" "$GUILD/checkin-btn-bg.png"
download "https://www.figma.com/api/mcp/asset/1b269162-0cd7-4f66-a610-10575341fa54" "$GUILD/podium.png"
download "https://www.figma.com/api/mcp/asset/1e127a41-e0ab-450a-89b3-c5ef676a965c" "$GUILD/sparkle-stars.png"
download "https://www.figma.com/api/mcp/asset/fe44f4f2-435a-469e-8bdf-bbf08bbd3fa9" "$GUILD/task-card-tab.png"
download "https://www.figma.com/api/mcp/asset/cb9ba1c3-aa75-4daf-9aa5-ece583fd544e" "$GUILD/task-card-bg.svg"
download "https://www.figma.com/api/mcp/asset/c14a0e28-89f1-4249-9bdb-91efd8579454" "$GUILD/task-card-mask.svg"
download "https://www.figma.com/api/mcp/asset/853a8d8a-8cee-43f1-96b5-f661fc614101" "$GUILD/task-progress.svg"

# Check-in modal
download "https://www.figma.com/api/mcp/asset/46cd6156-f50f-4dc2-bef2-041f70367243" "$GUILD/checkin/exp-coin.svg"
download "https://www.figma.com/api/mcp/asset/48fb2394-eb59-4be2-9dac-17eab9fbf321" "$GUILD/checkin/mascot.png"

# President card layers
download "https://www.figma.com/api/mcp/asset/605b0636-74e6-4afc-a33b-30f486103f63" "$GUILD/president-card/base.png"
download "https://www.figma.com/api/mcp/asset/57d3e6b7-c6e8-415d-a022-65c6071b0687" "$GUILD/president-card/tag.png"
download "https://www.figma.com/api/mcp/asset/a990625d-cd70-4b02-b0d2-276ee23ec16f" "$GUILD/president-card/emblem.png"
download "https://www.figma.com/api/mcp/asset/5abd2ab8-c79a-4d4c-9b9a-8ed769d93a1f" "$GUILD/president-card/badges.png"
download "https://www.figma.com/api/mcp/asset/16aba8c6-14b8-40b3-844a-64e497682554" "$GUILD/president-card/name-brace.svg"
download "https://www.figma.com/api/mcp/asset/a8f5b3f4-1eeb-4acc-bcf8-6ede0b5ca2a9" "$GUILD/president-card/president-text.svg"

# Games & influence
download "https://www.figma.com/api/mcp/asset/e18447a7-c5e4-4412-bb12-9ad58c328dda" "$GUILD/game-zimu.png"
download "https://www.figma.com/api/mcp/asset/0fc6611b-dbb7-4bde-b951-78c99f8e8f0a" "$GUILD/game-lincoln.png"
download "https://www.figma.com/api/mcp/asset/a58ed453-b12d-4ede-9e43-6300177f02a2" "$GUILD/game-fish.png"
download "https://www.figma.com/api/mcp/asset/7ada13d5-7c31-4731-9591-db040233adaf" "$GUILD/influence-1.png"
download "https://www.figma.com/api/mcp/asset/d1e33001-c8d7-41d4-a18a-2a567461fabe" "$GUILD/influence-2.png"
download "https://www.figma.com/api/mcp/asset/e3d107f7-45e2-48d2-942d-1443167d4a0e" "$GUILD/influence-3.png"
download "https://www.figma.com/api/mcp/asset/6c8207fb-a7d6-4762-847b-7c9ab4d0efd4" "$GUILD/game-player-3.png"
download "https://www.figma.com/api/mcp/asset/cdc1463e-1455-47a6-a405-d775fa8bb8d8" "$GUILD/game-player-4.png"

# Reuse influence avatars for members / players when dedicated assets unavailable
cp "$GUILD/influence-1.png" "$GUILD/member-1.png"
cp "$GUILD/influence-2.png" "$GUILD/member-2.png"
cp "$GUILD/influence-3.png" "$GUILD/member-3.png"
cp "$GUILD/influence-1.png" "$GUILD/game-top1-1.png"
cp "$GUILD/influence-2.png" "$GUILD/game-player-1.png"
cp "$GUILD/influence-3.png" "$GUILD/game-player-2.png"

# Icons
download "https://www.figma.com/api/mcp/asset/077d15b4-40a8-43c3-9b85-2fe1a5dc2167" "$GUILD/icons/nav-back.svg"
download "https://www.figma.com/api/mcp/asset/dded9bee-82b8-4434-ae89-b3d509c4f9a1" "$GUILD/icons/nav-share.svg"
download "https://www.figma.com/api/mcp/asset/53a53b37-e5fc-4d79-a852-bea5305f3697" "$GUILD/icons/status-cellular.svg"
download "https://www.figma.com/api/mcp/asset/ad698e60-1c52-4e9d-9db5-69c001cda03b" "$GUILD/icons/status-wifi.svg"
download "https://www.figma.com/api/mcp/asset/14f9439e-85b3-4c46-8301-0d122ba2d8cc" "$GUILD/icons/status-battery.svg"
download "https://www.figma.com/api/mcp/asset/b52af2fb-2d34-4447-a89b-f8ce6c3b8cd8" "$GUILD/icons/arrow-more.svg"
download "https://www.figma.com/api/mcp/asset/5a7a98c8-5924-4ed5-9ca5-ad400f38f241" "$GUILD/icons/arrow-chevron.svg"
download "https://www.figma.com/api/mcp/asset/579a82cc-9bc2-42c7-b554-b10cecdf1ed6" "$GUILD/icons/megaphone.svg"
download "https://www.figma.com/api/mcp/asset/5e81bf63-1709-4aa3-ac2a-9557f58edbcf" "$GUILD/icons/gamepad.svg"
download "https://www.figma.com/api/mcp/asset/74f97389-65e5-4ab4-82cc-ac157b4b14f1" "$GUILD/icons/chart.svg"

# Publish sheet icons
download "https://www.figma.com/api/mcp/asset/0ffb075b-8385-4770-acd1-7ebdc23a1867" "$GUILD/publish-sheet/icon-tile-cake.png"
download "https://www.figma.com/api/mcp/asset/41f0debc-d5b6-4d10-bdd3-6cc480b101e0" "$GUILD/publish-sheet/icon-pixel-heart.png"
download "https://www.figma.com/api/mcp/asset/b94d4289-b098-4a1d-aabd-dd032fcb5cd2" "$GUILD/publish-sheet/icon-profile.png"
download "https://www.figma.com/api/mcp/asset/dcdf2b85-1d5c-46ee-a010-152b93ae74b6" "$GUILD/publish-sheet/icon-pk.png"
download "https://www.figma.com/api/mcp/asset/ae806037-b47f-4a3d-af5c-665e8a5926b4" "$GUILD/publish-sheet/icon-support.png"
download "https://www.figma.com/api/mcp/asset/34b2355d-f679-4fed-a459-8de307e185e2" "$GUILD/publish-sheet/icon-game-bg.svg"
download "https://www.figma.com/api/mcp/asset/949a15cc-f595-4b55-87f6-a87a58e3a425" "$GUILD/publish-sheet/icon-game-fg.svg"

echo ""
echo "Restored $(find "$GUILD" -type f | wc -l | tr -d ' ') files under public/guild/"
