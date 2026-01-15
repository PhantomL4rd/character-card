/**
 * 画像変換ユーティリティ
 * 画像の回転・サイズ取得などの共通処理を提供
 */

export interface RotateResult {
  src: string;
  width: number;
  height: number;
}

/**
 * 画像を指定角度で回転
 * @param src - 元画像のData URL
 * @param degrees - 回転角度（0, 90, 180, 270）
 * @returns 回転後の画像情報（Data URL、幅、高さ）
 */
export async function rotateImageCanvas(src: string, degrees: number): Promise<RotateResult> {
  // 0°の場合は処理をスキップして元画像を返す
  if (degrees === 0) {
    const size = await getImageSize(src);
    return { src, ...size };
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // フォールバック：元画像を返す
        resolve({ src, width: img.width, height: img.height });
        return;
      }

      const isRotated90or270 = degrees === 90 || degrees === 270;
      canvas.width = isRotated90or270 ? img.height : img.width;
      canvas.height = isRotated90or270 ? img.width : img.height;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((degrees * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      resolve({
        src: canvas.toDataURL('image/png'),
        width: canvas.width,
        height: canvas.height
      });
    };
    img.src = src;
  });
}

/**
 * 画像のサイズを取得
 * @param src - 画像のData URL
 * @returns 幅と高さ
 */
export function getImageSize(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.src = src;
  });
}
