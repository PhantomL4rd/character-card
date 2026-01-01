# 画像エクスポート仕様

## 概要

カードプレビューで調整した画像をPNG形式でエクスポートする機能。Canvas APIを使用して高解像度の画像を生成し、プレビューと完全に一致した見た目を保証する。

## アーキテクチャ

```
exportCardAsImage() [imageExport.ts]
    │
    ├── 回転画像の生成（必要な場合）
    │
    └── renderCardToCanvas() [canvasRenderer.ts]
            │
            ├── 1. drawBackgroundImage() - 背景画像のクロップ描画
            ├── 2. drawTextOverlay() - テキストオーバーレイ描画
            └── 3. drawCopyright() - コピーライト描画
```

## 出力解像度

| 向き | 解像度 | アスペクト比 |
|------|--------|-------------|
| 横長 | 2560 x 1440 | 16:9 |
| 縦長 | 1080 x 1440 | 3:4 |

## プレビューとの対応

プレビューサイズから出力サイズへのスケール変換を行う：

```typescript
const PREVIEW_SIZES = {
  landscape: 672,  // max-w-2xl (Tailwind)
  portrait: 448    // max-w-md (Tailwind)
};

const OUTPUT_SIZES = {
  landscape: { width: 2560, height: 1440 },
  portrait: { width: 1080, height: 1440 }
};

// スケール計算
const scale = outputSize.width / previewWidth;
// 横長: 2560 / 672 = 3.81倍
// 縦長: 1080 / 448 = 2.41倍
```

## 背景画像の描画

### croppedAreaを使用した正確なクロップ

svelte-easy-cropから取得した`croppedAreaPixels`を使用して、プレビューと完全に一致した領域を切り出す。

```typescript
interface CroppedArea {
  x: number;      // クロップ開始X座標（ピクセル）
  y: number;      // クロップ開始Y座標（ピクセル）
  width: number;  // クロップ幅（ピクセル）
  height: number; // クロップ高さ（ピクセル）
}
```

### Canvas drawImageの使用

```typescript
ctx.drawImage(
  img,                    // 元画像
  croppedArea.x,          // ソースX
  croppedArea.y,          // ソースY
  croppedArea.width,      // ソース幅
  croppedArea.height,     // ソース高さ
  0,                      // 出力X
  0,                      // 出力Y
  outputSize.width,       // 出力幅
  outputSize.height       // 出力高さ
);
```

### フォールバック（croppedAreaがない場合）

クロップ情報がない場合は、アスペクト比を維持して中央クロップを行う：

```typescript
if (imgAspect > canvasAspect) {
  // 画像が横長 → 左右をクロップ
  sWidth = img.height * canvasAspect;
  sx = (img.width - sWidth) / 2;
} else {
  // 画像が縦長 → 上下をクロップ
  sHeight = img.width / canvasAspect;
  sy = (img.height - sHeight) / 2;
}
```

## 画像回転の処理

回転が設定されている場合、エクスポート前に回転済み画像を生成する。

```typescript
async function rotateImageCanvas(src: string, degrees: number): Promise<string> {
  const isRotated90or270 = degrees === 90 || degrees === 270;
  canvas.width = isRotated90or270 ? img.height : img.width;
  canvas.height = isRotated90or270 ? img.width : img.height;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((degrees * Math.PI) / 180);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
}
```

## テキストオーバーレイ

### レイアウト構造

```
┌─────────────────────────────────┐
│ [キャラクター名]                   │  ← title (20px * scale, bold)
│ [ワールド @ データセンター]          │  ← subtitle (10px * scale)
│ [ジョブアイコン] [ジョブアイコン]...  │  ← jobs (12px * scale)
│ プレイスタイル                      │  ← section (8px * scale, bold)
│   ガチ勢 / レイド / PvP            │  ← content (8px * scale)
│ ログイン                           │  ← section
│   平日・夜                         │  ← content
└─────────────────────────────────┘
```

### テーマ対応

| テーマ | 背景色 | 文字色 |
|--------|--------|--------|
| ダーク | rgba(0, 0, 0, 0.6) | #ffffff |
| ライト | rgba(255, 255, 255, 0.6) | #000000 |

### テキスト位置

`cardData.design.textPosition`に基づいて配置：

| vertical | horizontal | 配置 |
|----------|------------|------|
| top | left | 左上 |
| top | center | 上中央 |
| top | right | 右上 |
| center | left | 左中央 |
| center | center | 中央 |
| center | right | 右中央 |
| bottom | left | 左下 |
| bottom | center | 下中央 |
| bottom | right | 右下 |

## コピーライト

右下に固定で「© SQUARE ENIX」を表示。白文字に黒縁取り（8方向）で視認性を確保。

```typescript
// 黒い縁取り（8方向）
const offsets = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0],          [1, 0],
  [-1, 1],  [0, 1],  [1, 1]
];
for (const [ox, oy] of offsets) {
  ctx.fillText(text, x + ox, y + oy);  // 黒で描画
}
ctx.fillText(text, x, y);  // 白で上書き
```

## ファイル名生成

タイムスタンプベースのファイル名を自動生成：

```
characa-YYYYMMDD-HHMMSS.png
例: characa-20260101-180000.png
```

## エクスポートフロー

```
1. ユーザーがエクスポートボタンをクリック
2. exportCardAsImage()が呼び出される
3. 回転が設定されている場合、回転済み画像を生成
4. renderCardToCanvas()でCanvasにレンダリング
   - 背景画像をcroppedAreaに基づいてクロップ描画
   - テキストオーバーレイを描画
   - コピーライトを描画
5. canvas.toBlob()でPNG Blobを生成
6. ダウンロードリンクを作成してクリック
7. ファイルがダウンロードされる
```

## 関連ファイル

| ファイル | 役割 |
|---------|------|
| `src/lib/utils/imageExport.ts` | エクスポート処理のエントリーポイント |
| `src/lib/utils/canvasRenderer.ts` | Canvas APIによるレンダリング |
| `src/lib/types/card.ts` | CardData型定義 |
| `src/routes/+page.svelte` | エクスポートボタンのUI |

## プレビューとエクスポートの一致保証

プレビュー（CardPreview）とエクスポート（canvasRenderer）で同じデータソースを使用：

| データ | プレビュー | エクスポート |
|--------|-----------|-------------|
| 画像位置 | svelte-easy-crop の crop/zoom | croppedAreaPixels |
| 回転 | rotatedImageSrc | 同じロジックで回転 |
| テキスト位置 | Tailwindクラス | Canvas座標計算 |
| テーマ | Tailwindクラス | 同じ色定義 |
| コピーライト | text-shadow CSS | 8方向オフセット描画 |
