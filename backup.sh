#!/bin/sh

# スクリプト自身のディレクトリの絶対パスを取得
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# タイムスタンプ（YYYYMMDDhhmmss）を取得
TIMESTAMP=$(date +%Y%m%d%H%M%S)

# コピー元とコピー先のパスを設定
SRC_DIR="$SCRIPT_DIR/ow2-victory-counter-rs/assets"
DEST_DIR="$SCRIPT_DIR/$TIMESTAMP"

# コピー元の存在確認
if [ ! -d "$SRC_DIR" ]; then
    echo "エラー: コピー元が見つかりません: $SRC_DIR"
    exit 1
fi

# コピーを実行
cp -a "$SRC_DIR" "$DEST_DIR"

echo "コピー完了: $SRC_DIR -> $DEST_DIR"
