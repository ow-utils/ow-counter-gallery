# デザインの追加方法

このリポジトリにカスタムカウンターデザインを追加する手順です。

## ライセンス

このリポジトリは [CC0 1.0](LICENSE) で公開されています。PR を送ることで、あなたのデザインも CC0（パブリックドメイン）として提供されることに同意したものとみなします。

## 前提知識

- デザインは [ow2-victory-counter](https://github.com/ow-utils/ow2-victory-counter) の OBS ブラウザソースとして表示されます
- 編集するのは HTML / CSS / JavaScript のみで、ビルドツールは不要です
- カウンターの仕様は [how-to-customize-counter.md](https://github.com/ow-utils/ow2-victory-counter/blob/main/how-to-customize-counter.md) を参照してください

## ファイル構成

`designs/{slug}/` ディレクトリに以下のファイルを配置します。`slug` は英小文字・数字・ハイフンの kebab-case にしてください。

| ファイル | 必須 | 説明 |
|---|---|---|
| `counter.html` | ○ | OBS に表示する HTML 本文 |
| `counter.css` | ○ | スタイル |
| `counter.js` | ○ | カウンター値の反映・アニメーション |
| `preview.html` | ○ | ブラウザ単体で動作確認できるプレビュー |
| `metadata.json` | ○ | デザインのメタデータ |
| `screenshot.png` | - | ギャラリーやPR説明用のスクリーンショット |

## 各ファイルの要件

### counter.html

- `<body>` の中身だけを記述してください（`<!DOCTYPE>`, `<html>`, `<head>`, `<body>` タグは不要）
- 以下の `data-counter` 属性を持つ要素を必ず含めてください
  - `data-counter="victories"` — 勝利数
  - `data-counter="defeats"` — 敗北数
- 任意で使える属性:
  - `data-counter="draws"` — 引き分け数
  - `data-meta="winrate"` — 勝率
  - `data-meta="last-updated"` — 最終更新日時
  - `data-meta="last-outcome"` — 直近の結果

### counter.css

- `body { background: transparent; }` を含めてください（OBS で透過合成するため）
- 外部フォント（Google Fonts 等）の `@import` は使用できます

### counter.js

- `/api/status` で初期値を取得し、`/events` の SSE で更新を受け取るロジックを含めてください
- 既存デザイン（`designs/cyber-vs/counter.js`）をベースにするのが簡単です
- アニメーションやエフェクトは自由に変更できますが、値の取得・反映ロジックは壊さないでください

### preview.html

- ブラウザで直接開いてデザインを確認できる自己完結型の HTML です
- `fetch` と `EventSource` をモックし、ボタンで勝敗を増減できるコントロールを含めてください
- 既存デザイン（`designs/cyber-vs/preview.html`）をテンプレートとして使うのが簡単です

### metadata.json

```json
{
  "name": "デザインの表示名",
  "slug": "ディレクトリ名と同じスラッグ",
  "description": "デザインの簡単な説明",
  "author": "あなたの名前またはGitHubユーザー名",
  "tags": ["タグ1", "タグ2"],
  "obs_size": { "width": 640, "height": 400 },
  "created": "YYYY-MM-DD"
}
```

- `slug` はディレクトリ名と一致させてください
- `obs_size` は OBS ブラウザソースの推奨サイズです

## 手順

1. このリポジトリを fork する
2. `designs/` に新しいディレクトリを作成する（例: `designs/my-design/`）
3. 上記のファイルを配置する
4. `designs/index.json` にスラッグを追加する
5. `preview.html` をブラウザで開いて動作を確認する
   - 勝敗ボタンで数値が増えること
   - アニメーションが動作すること
   - 背景が透過であること（暗い背景と明るい背景の両方で確認）
6. PR を作成する

## PR の説明に含めてほしいこと

- デザインのスクリーンショットまたは動作 GIF
- どんな場面を想定したデザインか（例: コンパクトに配置したい、派手な演出が欲しい等）
- OBS での推奨サイズ

## 既存デザインをベースにする場合

`designs/cyber-vs/` を丸ごとコピーしてからカスタマイズするのが最も簡単です。

```powershell
Copy-Item -Recurse designs\cyber-vs designs\my-design
```

その後、各ファイルと `metadata.json` を編集してください。
