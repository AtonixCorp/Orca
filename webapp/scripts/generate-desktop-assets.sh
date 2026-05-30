#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_ICON="$ROOT_DIR/public/assets/logo/orca-catfish-favicon.svg"
ASSET_DIR="$ROOT_DIR/electron/assets"
PNG_ICON="$ASSET_DIR/icon.png"
ICO_ICON="$ASSET_DIR/icon.ico"

mkdir -p "$ASSET_DIR"

magick -background none "$SOURCE_ICON" -resize 1024x1024 "$PNG_ICON"
magick "$PNG_ICON" -define icon:auto-resize=256,128,64,48,32,16 "$ICO_ICON"

cat > "$ASSET_DIR/installer-sidebar.svg" <<'SVG'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 480" role="img" aria-labelledby="title desc">
  <title id="title">ORCA Operator installer banner</title>
  <desc id="desc">Branded sidebar art for ORCA Operator desktop installers.</desc>
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#07111b"/>
      <stop offset="55%" stop-color="#0b2234"/>
      <stop offset="100%" stop-color="#113a4a"/>
    </linearGradient>
    <radialGradient id="halo" cx="50%" cy="28%" r="52%">
      <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.26"/>
      <stop offset="100%" stop-color="#00e5ff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="320" height="480" fill="url(#bg)" rx="32"/>
  <rect width="320" height="480" fill="url(#halo)" rx="32"/>
  <path d="M160 72 236 106c13 5 22 18 23 33v45c0 59-37 92-99 116-62-24-99-57-99-116v-45c1-15 10-28 23-33Z" fill="none" stroke="#00e5ff" stroke-width="8" stroke-linejoin="round"/>
  <path d="M102 231c17-21 38-32 60-38-17-12-25-27-25-44 0-30 24-53 66-53 13 0 29 4 46 10-21 2-38 13-48 28 22 6 37 19 37 39 0 23-18 42-49 50 19 5 34 15 49 31-17-5-35-7-52-6-16 20-39 34-74 41 16-15 25-31 29-49-13 0-24-2-31-9Z" fill="#f4fbfd"/>
  <path d="M112 194c-24 5-42 18-53 39 23-7 42-8 60-4" fill="none" stroke="#00e5ff" stroke-width="7" stroke-linecap="round"/>
  <path d="M207 194c24 5 42 18 54 39-23-7-42-8-61-4" fill="none" stroke="#00e5ff" stroke-width="7" stroke-linecap="round"/>
  <text x="36" y="364" fill="#f7fbfc" font-family="Segoe UI, Arial, sans-serif" font-size="34" font-weight="700">ORCA Operator</text>
  <text x="36" y="395" fill="#a6c4ce" font-family="Segoe UI, Arial, sans-serif" font-size="15">Local-first robotics and security command station</text>
  <text x="36" y="427" fill="#7fe7b6" font-family="Segoe UI, Arial, sans-serif" font-size="14" letter-spacing="2">WINDOWS INSTALLER</text>
</svg>
SVG

magick -background none "$ASSET_DIR/installer-sidebar.svg" -resize 164x314 "$ASSET_DIR/installer-sidebar.bmp"
magick -background none "$ASSET_DIR/installer-sidebar.svg" -resize 150x57 "$ASSET_DIR/installer-header.bmp"

cat > "$ASSET_DIR/dmg-background.svg" <<'SVG'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 420" role="img" aria-labelledby="title desc">
  <title id="title">ORCA Operator DMG background</title>
  <desc id="desc">Desktop installer background for ORCA Operator on macOS.</desc>
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#07111b"/>
      <stop offset="58%" stop-color="#0d2334"/>
      <stop offset="100%" stop-color="#113c4e"/>
    </linearGradient>
    <radialGradient id="haloA" cx="28%" cy="18%" r="42%">
      <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#00e5ff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="haloB" cx="78%" cy="68%" r="35%">
      <stop offset="0%" stop-color="#67d5a5" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="#67d5a5" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="660" height="420" rx="28" fill="url(#bg)"/>
  <rect width="660" height="420" rx="28" fill="url(#haloA)"/>
  <rect width="660" height="420" rx="28" fill="url(#haloB)"/>
  <g transform="translate(82 58)">
    <path d="M92 8 182 46c15 6 26 21 28 38v54c0 69-43 108-118 137C17 246-26 207-26 138V84c2-17 13-32 28-38Z" fill="none" stroke="#00e5ff" stroke-width="10" stroke-linejoin="round"/>
    <path d="M26 189c20-24 44-38 71-45-20-14-29-32-30-53 0-37 29-64 79-64 17 0 36 4 55 12-25 2-46 15-58 34 27 7 45 23 45 47 0 28-23 50-58 60 23 7 41 18 58 37-20-6-41-8-63-7-19 24-47 40-89 49 19-18 30-37 35-59-16 0-28-3-37-11Z" fill="#f4fbfd"/>
    <path d="M38 141c-29 6-51 21-64 47 28-8 50-10 71-5" fill="none" stroke="#00e5ff" stroke-width="8" stroke-linecap="round"/>
    <path d="M150 141c29 6 51 21 64 47-28-8-50-10-72-5" fill="none" stroke="#00e5ff" stroke-width="8" stroke-linecap="round"/>
  </g>
  <text x="326" y="132" fill="#f8fbfc" font-family="SF Pro Display, Segoe UI, Arial, sans-serif" font-size="36" font-weight="700">ORCA Operator</text>
  <text x="326" y="170" fill="#a5c8d2" font-family="SF Pro Text, Segoe UI, Arial, sans-serif" font-size="18">Drag the app into Applications to install your local command station.</text>
  <text x="326" y="220" fill="#7fe7b6" font-family="SF Pro Text, Segoe UI, Arial, sans-serif" font-size="15" letter-spacing="2">MACOS DESKTOP CONTROL CENTER</text>
  <text x="86" y="338" fill="#b8d5dc" font-family="SF Pro Text, Segoe UI, Arial, sans-serif" font-size="14">Local-first mission maps, telemetry, live feeds, and AI detections.</text>
  <path d="M284 210h64" fill="none" stroke="#d5edf3" stroke-width="4" stroke-linecap="round" opacity="0.85"/>
  <path d="M522 210h54" fill="none" stroke="#d5edf3" stroke-width="4" stroke-linecap="round" opacity="0.85"/>
  <path d="M562 198 584 210 562 222" fill="none" stroke="#d5edf3" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>
</svg>
SVG

magick -background none "$ASSET_DIR/dmg-background.svg" -resize 660x420 "$ASSET_DIR/dmg-background.png"