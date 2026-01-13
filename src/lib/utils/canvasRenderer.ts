import type { CardData } from '$lib/types/card';
import { OUTPUT_SIZES, getExportStyles } from './overlayStyle';
import { getFontFamily } from '$lib/data/fonts';
import { buildOverlayContent } from './overlayContent';

interface RenderOptions {
	cardData: CardData;
	rotatedImageSrc: string | null;
}

/**
 * Canvas APIを使用してカード画像をレンダリングする
 */
export async function renderCardToCanvas(options: RenderOptions): Promise<Blob> {
	const { cardData } = options;
	const isPortrait = cardData.design.orientation === 'portrait';
	const outputSize = isPortrait ? OUTPUT_SIZES.portrait : OUTPUT_SIZES.landscape;

	const canvas = document.createElement('canvas');
	canvas.width = outputSize.width;
	canvas.height = outputSize.height;
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Failed to get 2d context');
	}

	// 1. 背景画像を描画
	await drawBackgroundImage(ctx, options, outputSize);

	// 2. テキストオーバーレイを描画
	await drawTextOverlay(ctx, cardData, outputSize);

	// 3. コピーライトを描画
	drawCopyright(ctx, cardData, outputSize);

	// BlobとしてPNGを生成
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (blob) {
					resolve(blob);
				} else {
					reject(new Error('Failed to create blob'));
				}
			},
			'image/png',
			1.0
		);
	});
}

/**
 * 背景画像をクロップして描画
 */
async function drawBackgroundImage(
	ctx: CanvasRenderingContext2D,
	options: RenderOptions,
	outputSize: { width: number; height: number }
): Promise<void> {
	const { cardData, rotatedImageSrc } = options;
	const imageSrc = rotatedImageSrc ?? cardData.image.src;

	if (!imageSrc) {
		// 画像がない場合はグレー背景
		ctx.fillStyle = '#374151';
		ctx.fillRect(0, 0, outputSize.width, outputSize.height);
		return;
	}

	const img = await loadImage(imageSrc);
	const croppedArea = cardData.image.croppedArea;

	if (croppedArea && croppedArea.width > 0 && croppedArea.height > 0) {
		// croppedAreaPixelsを使用して正確にクロップ
		ctx.drawImage(
			img,
			croppedArea.x,
			croppedArea.y,
			croppedArea.width,
			croppedArea.height,
			0,
			0,
			outputSize.width,
			outputSize.height
		);
	} else {
		// クロップ情報がない場合はアスペクト比を維持してフィット
		const imgAspect = img.width / img.height;
		const canvasAspect = outputSize.width / outputSize.height;

		let sx = 0,
			sy = 0,
			sWidth = img.width,
			sHeight = img.height;

		if (imgAspect > canvasAspect) {
			// 画像が横長 → 左右をクロップ
			sWidth = img.height * canvasAspect;
			sx = (img.width - sWidth) / 2;
		} else {
			// 画像が縦長 → 上下をクロップ
			sHeight = img.width / canvasAspect;
			sy = (img.height - sHeight) / 2;
		}

		ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, outputSize.width, outputSize.height);
	}
}

/**
 * テキストオーバーレイを描画
 */
async function drawTextOverlay(
	ctx: CanvasRenderingContext2D,
	cardData: CardData,
	outputSize: { width: number; height: number }
): Promise<void> {
	if (!cardData.characterName) return;

	const styles = getExportStyles(cardData.design.orientation);

	// テーマに応じた色設定
	const isDark = cardData.design.theme === 'dark';
	const bgColor = isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)';
	const textColor = isDark ? '#ffffff' : '#000000';

	// ユーザー選択フォント
	const fontFamily = getFontFamily(cardData.design.fontFamily);

	// 共通ユーティリティでコンテンツを構築
	const { lines, selectedJobs } = buildOverlayContent(cardData);

	// ジョブアイコンを事前に読み込み
	const jobIcons = await loadJobIcons(selectedJobs);

	ctx.save();

	// ボックスサイズを計算
	let boxWidth = 0;
	let boxHeight = styles.boxPadding * 2;
	const lineHeights: number[] = [];

	for (const line of lines) {
		let lineHeight: number;
		let lineWidth: number;

		switch (line.type) {
			case 'title':
				ctx.font = `bold ${styles.titleFontSize}px ${fontFamily}`;
				lineWidth = ctx.measureText(line.text ?? '').width;
				lineHeight = styles.titleFontSize * styles.lineSpacing;
				break;
			case 'subtitle':
				ctx.font = `${styles.subtitleFontSize}px ${fontFamily}`;
				lineWidth = ctx.measureText(line.text ?? '').width;
				lineHeight = styles.subtitleFontSize * styles.lineSpacing;
				break;
			case 'jobs':
				lineWidth = (line.jobs ?? []).length * (styles.jobIconSize + styles.jobGap);
				lineHeight = styles.jobIconSize * 1.5;
				break;
			case 'section':
				ctx.font = `bold ${styles.sectionFontSize}px ${fontFamily}`;
				lineWidth = ctx.measureText(line.text ?? '').width + styles.sectionIconSize + styles.jobGap;
				lineHeight = styles.sectionFontSize * 1.8;
				break;
			case 'content':
				ctx.font = `${styles.contentFontSize}px ${fontFamily}`;
				lineWidth = ctx.measureText(line.text ?? '').width + styles.contentIndent;
				lineHeight = styles.contentFontSize * styles.lineSpacing;
				break;
			default:
				lineWidth = 0;
				lineHeight = 0;
		}

		boxWidth = Math.max(boxWidth, lineWidth);
		lineHeights.push(lineHeight);
		boxHeight += lineHeight;
	}

	boxWidth = Math.min(boxWidth + styles.boxPadding * 2, styles.maxWidth);

	// テキスト位置を計算
	const pos = cardData.design.textPosition;
	let boxX: number, boxY: number;

	switch (pos.horizontal) {
		case 'left':
			boxX = styles.padding;
			break;
		case 'center':
			boxX = (outputSize.width - boxWidth) / 2;
			break;
		case 'right':
			boxX = outputSize.width - boxWidth - styles.padding;
			break;
	}

	switch (pos.vertical) {
		case 'top':
			boxY = styles.padding;
			break;
		case 'center':
			boxY = (outputSize.height - boxHeight) / 2;
			break;
		case 'bottom':
			boxY = outputSize.height - boxHeight - styles.padding;
			break;
	}

	// 背景ボックスを描画（角丸 + ぼかし効果は再現できないのでソリッドに）
	ctx.fillStyle = bgColor;
	ctx.beginPath();
	ctx.roundRect(boxX, boxY, boxWidth, boxHeight, styles.borderRadius);
	ctx.fill();

	// テキストを描画
	ctx.fillStyle = textColor;
	let currentY = boxY + styles.boxPadding;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		currentY += lineHeights[i];

		switch (line.type) {
			case 'title':
				ctx.font = `bold ${styles.titleFontSize}px ${fontFamily}`;
				ctx.textBaseline = 'bottom';
				ctx.fillText(line.text ?? '', boxX + styles.boxPadding, currentY);
				break;

			case 'subtitle':
				ctx.font = `${styles.subtitleFontSize}px ${fontFamily}`;
				ctx.textBaseline = 'bottom';
				ctx.fillText(line.text ?? '', boxX + styles.boxPadding, currentY);
				break;

			case 'jobs': {
				// ジョブアイコンを描画
				let jobX = boxX + styles.boxPadding;
				const jobY = currentY - styles.jobIconSize;
				for (const job of line.jobs ?? []) {
					const icon = jobIcons.get(job.nameEn);
					if (icon) {
						ctx.drawImage(icon, jobX, jobY, styles.jobIconSize, styles.jobIconSize);
					}
					jobX += styles.jobIconSize + styles.jobGap;
				}
				break;
			}

			case 'section':
				ctx.font = `bold ${styles.sectionFontSize}px ${fontFamily}`;
				ctx.textBaseline = 'bottom';
				// アイコン（ゲームパッド/時計）の代わりにテキストのみ
				ctx.fillText(line.text ?? '', boxX + styles.boxPadding, currentY);
				break;

			case 'content':
				ctx.font = `${styles.contentFontSize}px ${fontFamily}`;
				ctx.textBaseline = 'bottom';
				ctx.fillText(line.text ?? '', boxX + styles.boxPadding + styles.contentIndent, currentY);
				break;
		}
	}

	ctx.restore();
}

/**
 * コピーライトを描画
 */
function drawCopyright(
	ctx: CanvasRenderingContext2D,
	cardData: CardData,
	outputSize: { width: number; height: number }
): void {
	const styles = getExportStyles(cardData.design.orientation);

	ctx.save();

	ctx.font = `${styles.copyrightFontSize}px sans-serif`;
	ctx.textBaseline = 'bottom';
	ctx.textAlign = 'right';

	const text = '\u00A9 SQUARE ENIX';
	const x = outputSize.width - styles.copyrightPadding;
	const y = outputSize.height - styles.copyrightPadding;

	// 黒い縁取り（8方向）
	ctx.fillStyle = '#000000';
	const offsets = [
		[-1, -1],
		[0, -1],
		[1, -1],
		[-1, 0],
		[1, 0],
		[-1, 1],
		[0, 1],
		[1, 1]
	];
	for (const [ox, oy] of offsets) {
		ctx.fillText(text, x + ox, y + oy);
	}

	// 白い文字
	ctx.fillStyle = '#ffffff';
	ctx.fillText(text, x, y);

	ctx.restore();
}

/**
 * 画像を読み込む
 */
function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
}

/**
 * ジョブアイコンを読み込む
 */
async function loadJobIcons(
	jobs: { nameEn: string }[]
): Promise<Map<string, HTMLImageElement>> {
	const icons = new Map<string, HTMLImageElement>();

	await Promise.all(
		jobs.map(async (job) => {
			try {
				const img = await loadImage(`/icons/jobs/${job.nameEn}.png`);
				icons.set(job.nameEn, img);
			} catch {
				// アイコンが読み込めない場合はスキップ
			}
		})
	);

	return icons;
}
