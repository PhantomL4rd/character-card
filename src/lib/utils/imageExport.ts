import type { CardData } from '$lib/types/card';
import { renderCardToCanvas } from './canvasRenderer';

export interface ExportOptions {
	cardData: CardData;
}

function generateFileName(): string {
	const now = new Date();
	const timestamp = now
		.toISOString()
		.slice(0, 19)
		.replace(/[-:]/g, '')
		.replace('T', '-');
	return `characa-${timestamp}.png`;
}

/**
 * Canvasで画像を回転
 */
async function rotateImageCanvas(
	src: string,
	degrees: number
): Promise<string> {
	if (degrees === 0) return src;

	return new Promise((resolve) => {
		const img = new Image();
		img.onload = () => {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d')!;

			const isRotated90or270 = degrees === 90 || degrees === 270;
			canvas.width = isRotated90or270 ? img.height : img.width;
			canvas.height = isRotated90or270 ? img.width : img.height;

			ctx.translate(canvas.width / 2, canvas.height / 2);
			ctx.rotate((degrees * Math.PI) / 180);
			ctx.drawImage(img, -img.width / 2, -img.height / 2);

			resolve(canvas.toDataURL('image/jpeg', 0.9));
		};
		img.src = src;
	});
}

export async function exportCardAsImage(options: ExportOptions): Promise<void> {
	const { cardData } = options;

	// 回転済み画像を生成
	let rotatedImageSrc: string | null = null;
	if (cardData.image.src && cardData.image.rotation !== 0) {
		rotatedImageSrc = await rotateImageCanvas(cardData.image.src, cardData.image.rotation);
	}

	const blob = await renderCardToCanvas({
		cardData,
		rotatedImageSrc
	});

	// BlobからURLを生成してダウンロード
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.download = generateFileName();
	link.href = url;
	link.click();

	// URLを解放
	URL.revokeObjectURL(url);
}
