# ow-counter-gallery

[ow2-victory-counter](https://github.com/ow-utils/ow2-victory-counter) のカスタムカウンターデザインを管理・公開するギャラリーリポジトリ。

## リポジトリ構造

```
designs/
  {slug}/                 # デザインごとのディレクトリ（kebab-case）
    counter.html          # OBS に表示する HTML 本文（head/body タグ不要）
    counter.css           # スタイル
    counter.js            # カウンター値の反映・アニメーション
    preview.html          # ブラウザ単体で動作確認できるプレビュー
    metadata.json         # デザインのメタデータ
    screenshot.png        # プレビュー画像（任意）
index.html                # GitHub Pages ギャラリーページ（予定）
backup.sh                 # ow2-victory-counter-rs/assets/ からのバックアップ用
```

## デザインのファイル仕様

### counter.html

- `<body>` の中身だけを記述する（`<!DOCTYPE>`, `<html>`, `<head>`, `<body>` タグは書かない）
- 値を表示する要素には `data-counter` / `data-meta` 属性を付ける

カウンター値:
- `data-counter="victories"`
- `data-counter="defeats"`
- `data-counter="draws"`

補助情報:
- `data-meta="winrate"`
- `data-meta="last-updated"`
- `data-meta="last-outcome"`

### counter.css

- `body { background: transparent; }` を含めること（OBS のブラウザソースで透過合成するため）
- 外部フォント（Google Fonts 等）の `@import` は使用可

### counter.js

- `/api/status` で初期値を取得し、`/events` の SSE で更新を受け取る
- `data-counter` / `data-meta` 属性を持つ要素へ値を反映する
- この取得・反映ロジックは壊さないこと

### preview.html

- ブラウザで直接開いてデザインを確認できる自己完結型の HTML
- `fetch` と `EventSource` をモックし、ボタンで勝敗を増減できるコントロールを含める
- 同ディレクトリの `counter.css` と `counter.js` を読み込む

### metadata.json

```json
{
  "name": "表示名",
  "slug": "kebab-case-slug",
  "description": "デザインの説明",
  "author": "作者名",
  "tags": ["タグ1", "タグ2"],
  "obs_size": { "width": 640, "height": 400 },
  "created": "YYYY-MM-DD"
}
```

- `slug` はディレクトリ名と一致させる
- `obs_size` は OBS ブラウザソースの推奨サイズ

## 新しいデザインの追加手順

1. `designs/` に新しいディレクトリを作成（kebab-case のスラッグ名）
2. `counter.html`, `counter.css`, `counter.js`, `preview.html`, `metadata.json` を配置
3. `preview.html` をブラウザで開いて動作確認
4. 任意で `screenshot.png` を追加

## デザインの適用方法

デザインを ow2-victory-counter で使うには:

1. このリポジトリからデザインの `counter.html`, `counter.css`, `counter.js` をコピー
2. `ow2-victory-counter-rs/assets/` に配置
3. OBS のブラウザソースを再読込

## 表示（GitHub Pages）

GitHub Pages で静的ギャラリーとして公開する。各デザインの `metadata.json` とスクリーンショットを使い、一覧・プレビューを提供する。

## AI によるデザイン作成時の注意

- 編集対象は `designs/{slug}/` 内のファイルのみ
- `counter.html` は body の中身だけ（html/head/body タグ不要）
- `data-counter="victories"` と `data-counter="defeats"` は必ず残す
- `counter.js` を変更する場合も `/api/status` と `/events` の取得処理は壊さない
- `preview.html` は既存のものをテンプレートとして参照し、同じモック構造を維持する
