#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 3 ]]; then
  echo "usage: $0 <kernel-bin> <rootfs-dir> <initramfs-file>" >&2
  exit 1
fi

KERNEL_BIN="$1"
ROOTFS_DIR="$2"
INITRAMFS_FILE="$3"
MANIFEST_FILE="$ROOTFS_DIR/usr/share/orca/rootfs.manifest"

if [[ ! -f "$KERNEL_BIN" ]]; then
  echo "missing kernel artifact: $KERNEL_BIN" >&2
  exit 1
fi

if [[ ! -d "$ROOTFS_DIR" ]]; then
  echo "missing rootfs directory: $ROOTFS_DIR" >&2
  exit 1
fi

if [[ ! -f "$MANIFEST_FILE" ]]; then
  echo "missing manifest: $MANIFEST_FILE" >&2
  exit 1
fi

EXPECTED_MANIFEST="$(mktemp)"
ACTUAL_MANIFEST="$(mktemp)"
trap 'rm -f "$EXPECTED_MANIFEST" "$ACTUAL_MANIFEST"' EXIT

grep -v '^#' "$MANIFEST_FILE" | sed '/^$/d' > "$EXPECTED_MANIFEST"
(cd "$ROOTFS_DIR" && find . -mindepth 1 | LC_ALL=C sort) > "$ACTUAL_MANIFEST"

if ! diff -u "$EXPECTED_MANIFEST" "$ACTUAL_MANIFEST" >/dev/null; then
  echo "rootfs manifest mismatch" >&2
  diff -u "$EXPECTED_MANIFEST" "$ACTUAL_MANIFEST" >&2 || true
  exit 1
fi

echo "manifest verified"

if [[ -f "$INITRAMFS_FILE" ]]; then
  if ! command -v gzip >/dev/null 2>&1 || ! command -v cpio >/dev/null 2>&1; then
    echo "cannot verify initramfs contents without gzip and cpio" >&2
    exit 1
  fi

  INITRAMFS_LISTING="$(mktemp)"
  trap 'rm -f "$EXPECTED_MANIFEST" "$ACTUAL_MANIFEST" "$INITRAMFS_LISTING"' EXIT
  gzip -dc "$INITRAMFS_FILE" | cpio -it 2>/dev/null | LC_ALL=C sort > "$INITRAMFS_LISTING"

  grep -qx 'init' "$INITRAMFS_LISTING" || {
    echo "initramfs missing init" >&2
    exit 1
  }
  grep -qx 'usr/share/orca/rootfs.manifest' "$INITRAMFS_LISTING" || {
    echo "initramfs missing rootfs manifest" >&2
    exit 1
  }

  echo "initramfs verified"
else
  echo "initramfs artifact not present; skipping initramfs verification"
fi

if command -v readelf >/dev/null 2>&1; then
  readelf -l "$KERNEL_BIN" | grep -q 'LOAD' || {
    echo "kernel artifact missing loadable segments" >&2
    exit 1
  }
fi

echo "kernel verified"
echo "release verification passed"