import type { CardData } from '$lib/types/card';
import { renderCardToCanvas } from './canvasRenderer';
import { rotateImageCanvas } from './imageTransform';

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

export async function exportCardAsImage(options: ExportOptions): Promise<void> {
	const { cardData } = options;

	// 回転済み画像を生成
	let rotatedImageSrc: string | null = null;
	if (cardData.image.src && cardData.image.rotation !== 0) {
		const result = await rotateImageCanvas(cardData.image.src, cardData.image.rotation);
		rotatedImageSrc = result.src;
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
