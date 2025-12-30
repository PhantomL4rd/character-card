import { domToPng } from 'modern-screenshot';

export interface ExportOptions {
	quality?: number;
	scale?: number;
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

export async function exportCardAsImage(options: ExportOptions = {}): Promise<void> {
	const cardElement = document.getElementById('card-preview');
	if (!cardElement) {
		throw new Error('Card element not found');
	}

	const { scale = 4 } = options;

	const dataUrl = await domToPng(cardElement, {
		scale,
		quality: 1.0
	});

	const link = document.createElement('a');
	link.download = generateFileName();
	link.href = dataUrl;
	link.click();
}
