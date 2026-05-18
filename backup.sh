#!/bin/sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

SLUG="$1"

if [ -z "$SLUG" ]; then
    echo "使い方: $0 <slug>"
    echo "例:     $0 cyber-vs"
    exit 1
fi

SRC_DIR="$SCRIPT_DIR/ow2-victory-counter-rs/assets"
DEST_DIR="$SCRIPT_DIR/designs/$SLUG"

if [ ! -d "$SRC_DIR" ]; then
    echo "エラー: コピー元が見つかりません: $SRC_DIR"
    exit 1
fi

mkdir -p "$DEST_DIR"

for file in counter.html counter.css counter.js preview.html; do
    if [ -f "$SRC_DIR/$file" ]; then
        cp "$SRC_DIR/$file" "$DEST_DIR/$file"
    fi
done

echo "コピー完了: $SRC_DIR -> $DEST_DIR"

if [ ! -f "$DEST_DIR/metadata.json" ]; then
    echo "注意: $DEST_DIR/metadata.json がありません。作成してください。"
fi
