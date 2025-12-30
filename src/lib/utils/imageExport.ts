import { toPng } from 'html-to-image';

export interface ExportOptions {
	quality?: number;
	pixelRatio?: number;
}

function generateFileName(): string {
	const now = new Date();
	const timestamp = now
		.toISOString()
		.slice(0, 19)
		.replace(/[-:]/g, '')
		.replace('T', '-');
	return `ff14-card-${timestamp}.png`;
}

export async function exportCardAsImage(options: ExportOptions = {}): Promise<void> {
	const cardElement = document.getElementById('card-preview');
	if (!cardElement) {
		throw new Error('Card element not found');
	}

	const { quality = 1.0, pixelRatio = 2 } = options;

	const dataUrl = await toPng(cardElement, {
		quality,
		pixelRatio,
		cacheBust: true
	});

	const link = document.createElement('a');
	link.download = generateFileName();
	link.href = dataUrl;
	link.click();
}
