# OW2 Victory Counter — Design Gallery

[ow2-victory-counter](https://github.com/ow-utils/ow2-victory-counter) のカスタムカウンターデザイン集です。

**ギャラリー:** https://ow-utils.github.io/ow-counter-gallery/

## 使い方

1. ギャラリーページまたは `designs/` から好みのデザインを選ぶ
2. デザインフォルダ内の `counter.html`、`counter.css`、`counter.js` をダウンロード
3. ow2-victory-counter の `assets/` フォルダに配置する
4. OBS のブラウザソースを再読込する

## ローカルでギャラリーを動かす

GitHub Pages 相当の表示をローカルで確認するには、リポジトリルートで静的 HTTP サーバを起動します（`fetch` を使うため `file://` 直開きでは動きません）。

```bash
# Python
python3 -m http.server 8000
# または Node
npx --yes http-server -p 8000
```

ブラウザで開く:

- ギャラリー一覧: <http://localhost:8000/>
- 個別プレビュー: <http://localhost:8000/designs/preview.html?design=cyber-vs>

プレビュー画面の下部に WIN / LOSE / Reset ボタンがあり、値の変化とアニメーションを確認できます。

## デザインを追加する

新しいデザインの投稿を歓迎します。手順は [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

## ライセンス

このリポジトリは二層のライセンス構成になっています。

- **ギャラリーのコード**（`designs/` 以外）: [GNU GPL v3](LICENSE)
- **デザイン**（`designs/` 以下）: 各デザインの `metadata.json` に記載（[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) を基本とします）

デザインを使用・改変・再配布する際は、著作者のクレジット表示と同一ライセンスでの公開が必要です。
