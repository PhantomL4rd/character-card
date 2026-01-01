# プレビュー領域仕様

## 概要

CardPreviewコンポーネントは、svelte-easy-cropを使用して画像のクロップ・ズーム・パン操作を提供する。ユーザーがどのような画像をアップロードしても、カード領域に隙間（背景が見える部分）が発生しないよう、最小ズームレベルを自動計算する。

## svelte-easy-cropの動作仕様

### zoom=1の挙動

svelte-easy-cropでは`zoom=1`のとき、画像がクロップ領域に**contain方式**でフィットする：

- 画像の長辺がクロップ領域に収まるようにスケールされる
- アスペクト比が異なる場合、短辺側に隙間が発生する

```
例: 横長画像（16:9）を縦長カード（3:4）に表示
┌─────────┐
│ ░░░░░░░ │  ← 上下に隙間（背景が見える）
│ ┌─────┐ │
│ │ 画像 │ │
│ └─────┘ │
│ ░░░░░░░ │
└─────────┘
```

### minZoomの役割

`minZoom`プロパティを設定することで、ズームの下限を制限できる。適切な`minZoom`を設定すると、隙間が発生しない状態を保証できる。

## 最小ズーム計算ロジック

### 計算式

```typescript
function calcMinZoom(imgWidth: number, imgHeight: number, cropAspect: number): number {
  const imageAspect = imgWidth / imgHeight;

  if (imageAspect > cropAspect) {
    // 画像が横長：高さが不足 → 高さを合わせるためズーム
    return imageAspect / cropAspect;
  } else if (imageAspect < cropAspect) {
    // 画像が縦長：幅が不足 → 幅を合わせるためズーム
    return cropAspect / imageAspect;
  }

  // 同じアスペクト比：zoom=1で隙間なし
  return 1;
}
```

### パラメータ

| パラメータ | 説明 |
|-----------|------|
| `imgWidth` | 画像の幅（回転適用後） |
| `imgHeight` | 画像の高さ（回転適用後） |
| `cropAspect` | クロップ領域のアスペクト比（幅/高さ） |

### カード向きによるcropAspect

| 向き | アスペクト比 | cropAspect値 |
|------|-------------|--------------|
| 横長 | 16:9 | 1.778 |
| 縦長 | 3:4 | 0.75 |

## ケース別の動作

### ケース1: 横長画像 → 横長カード

```
画像: 16:9 (aspect = 1.78)
カード: 16:9 (cropAspect = 1.78)
計算: imageAspect == cropAspect
結果: minZoom = 1
```

アスペクト比が一致するため、zoom=1で隙間なし。

### ケース2: 横長画像 → 縦長カード

```
画像: 16:9 (aspect = 1.78)
カード: 3:4 (cropAspect = 0.75)
計算: imageAspect (1.78) > cropAspect (0.75)
結果: minZoom = 1.78 / 0.75 = 2.37
```

画像が横長なので、高さを合わせるために2.37倍ズームが必要。

### ケース3: 縦長画像 → 横長カード

```
画像: 3:4 (aspect = 0.75)
カード: 16:9 (cropAspect = 1.78)
計算: imageAspect (0.75) < cropAspect (1.78)
結果: minZoom = 1.78 / 0.75 = 2.37
```

画像が縦長なので、幅を合わせるために2.37倍ズームが必要。

### ケース4: 縦長画像 → 縦長カード

```
画像: 3:4 (aspect = 0.75)
カード: 3:4 (cropAspect = 0.75)
計算: imageAspect == cropAspect
結果: minZoom = 1
```

アスペクト比が一致するため、zoom=1で隙間なし。

### ケース5: 正方形画像

```
画像: 1:1 (aspect = 1.0)
カード（横長）: 16:9 (cropAspect = 1.78)
計算: imageAspect (1.0) < cropAspect (1.78)
結果: minZoom = 1.78 / 1.0 = 1.78

カード（縦長）: 3:4 (cropAspect = 0.75)
計算: imageAspect (1.0) > cropAspect (0.75)
結果: minZoom = 1.0 / 0.75 = 1.33
```

## 画像回転時の処理

画像が90度または270度回転すると、幅と高さが入れ替わる。

```
元画像: 1920x1080 (16:9, aspect = 1.78)
90度回転後: 1080x1920 (9:16, aspect = 0.56)
```

回転後の寸法で`calcMinZoom`を再計算することで、回転後も隙間が発生しない。

### 回転時のフロー

```
1. ユーザーが回転ボタンをクリック
2. rotateImageCanvas()で画像を回転
3. 回転後の画像サイズを取得
4. resetZoomToMin()を呼び出し
5. calcMinZoom()で新しいminZoomを計算
6. minZoomとzoomを更新
7. Cropperに新しいminZoomを適用
```

## 関連ファイル

| ファイル | 役割 |
|---------|------|
| `src/lib/components/CardPreview.svelte` | プレビューコンポーネント、calcMinZoom関数 |
| `src/lib/stores/cardStore.svelte.ts` | 画像・回転・クロップ状態の管理 |
| `src/lib/types/card.ts` | CroppedArea型定義 |
