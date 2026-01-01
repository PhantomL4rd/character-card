import type { CardData } from '$lib/types/card';
import { CONTENT_LABELS, ATTITUDE_LABELS, DAY_LABELS, TIME_LABELS } from '$lib/types/card';
import jobsData from '$lib/data/jobs.json';

// 出力解像度
const OUTPUT_SIZES = {
	landscape: { width: 2560, height: 1440 },
	portrait: { width: 1080, height: 1440 }
};

// プレビューサイズ（Tailwindのmax-w-2xl, max-w-md）
const PREVIEW_SIZES = {
	landscape: 672, // max-w-2xl
	portrait: 448   // max-w-md
};

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
	const ctx = canvas.getContext('2d')!;

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

	const isPortrait = cardData.design.orientation === 'portrait';
	const previewWidth = isPortrait ? PREVIEW_SIZES.portrait : PREVIEW_SIZES.landscape;
	const scale = outputSize.width / previewWidth; // プレビューサイズに対するスケール
	const padding = 16 * scale;
	const boxPadding = 8 * scale;
	const borderRadius = 8 * scale;
	const maxWidth = outputSize.width * 0.75;

	// テーマに応じた色設定
	const isDark = cardData.design.theme === 'dark';
	const bgColor = isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)';
	const textColor = isDark ? '#ffffff' : '#000000';

	// フォント設定
	const titleFontSize = 20 * scale;
	const smallFontSize = 10 * scale;
	const tinyFontSize = 8 * scale;
	const iconSize = 12 * scale;
	const jobIconSize = 12 * scale;

	// ジョブ情報
	const selectedJobs = cardData.playStyle.jobs
		.map((id) => jobsData.jobs.find((j) => j.id === id))
		.filter((j): j is (typeof jobsData.jobs)[number] => j !== undefined);

	// ジョブアイコンを事前に読み込み
	const jobIcons = await loadJobIcons(selectedJobs);

	// プレイスタイル・ログイン時間の有無
	const hasPlayStyle =
		cardData.playStyle.contents.length > 0 ||
		cardData.playStyle.attitude ||
		selectedJobs.length > 0;
	const hasLoginTime =
		cardData.loginTime.days.length > 0 || cardData.loginTime.times.length > 0;

	ctx.save();

	// テキスト内容を事前計算してボックスサイズを決定
	type TextLine = {
		type: 'title' | 'subtitle' | 'section' | 'content' | 'jobs';
		text?: string;
		jobs?: typeof selectedJobs;
	};

	const lines: TextLine[] = [];

	// キャラクター名
	lines.push({ type: 'title', text: cardData.characterName });

	// データセンター・ワールド
	if (cardData.dataCenter) {
		const dcText = cardData.world
			? `${cardData.world} @ ${cardData.dataCenter}`
			: cardData.dataCenter;
		lines.push({ type: 'subtitle', text: dcText });
	}

	// ジョブアイコン
	if (selectedJobs.length > 0) {
		lines.push({ type: 'jobs', jobs: selectedJobs });
	}

	// プレイスタイル
	if (hasPlayStyle) {
		lines.push({ type: 'section', text: 'プレイスタイル' });
		const attitudeLabel = cardData.playStyle.attitude
			? ATTITUDE_LABELS[cardData.playStyle.attitude]
			: '';
		const contentLabels = cardData.playStyle.contents.map((c) => CONTENT_LABELS[c]);
		const styleText = [attitudeLabel, ...contentLabels].filter(Boolean).join(' / ');
		if (styleText) {
			lines.push({ type: 'content', text: styleText });
		}
	}

	// ログイン時間
	if (hasLoginTime) {
		lines.push({ type: 'section', text: 'ログイン' });
		const dayLabels = cardData.loginTime.days.map((d) => DAY_LABELS[d]).join('・');
		const timeLabels = cardData.loginTime.times.map((t) => TIME_LABELS[t]).join('・');
		const loginText = [dayLabels, timeLabels].filter(Boolean).join('・');
		if (loginText) {
			lines.push({ type: 'content', text: loginText });
		}
	}

	// ボックスサイズを計算
	let boxWidth = 0;
	let boxHeight = boxPadding * 2;
	const lineHeights: number[] = [];

	for (const line of lines) {
		let lineHeight: number;
		let lineWidth: number;

		switch (line.type) {
			case 'title':
				ctx.font = `bold ${titleFontSize}px sans-serif`;
				lineWidth = ctx.measureText(line.text!).width;
				lineHeight = titleFontSize * 1.3;
				break;
			case 'subtitle':
				ctx.font = `${smallFontSize}px sans-serif`;
				lineWidth = ctx.measureText(line.text!).width;
				lineHeight = smallFontSize * 1.4;
				break;
			case 'jobs':
				lineWidth = line.jobs!.length * (jobIconSize + 2 * scale);
				lineHeight = jobIconSize * 1.5;
				break;
			case 'section':
				ctx.font = `bold ${tinyFontSize}px sans-serif`;
				lineWidth = ctx.measureText(line.text!).width + iconSize + 4 * scale;
				lineHeight = tinyFontSize * 1.8;
				break;
			case 'content':
				ctx.font = `${tinyFontSize}px sans-serif`;
				lineWidth = ctx.measureText(line.text!).width + 4 * scale; // インデント分
				lineHeight = tinyFontSize * 1.4;
				break;
			default:
				lineWidth = 0;
				lineHeight = 0;
		}

		boxWidth = Math.max(boxWidth, lineWidth);
		lineHeights.push(lineHeight);
		boxHeight += lineHeight;
	}

	boxWidth = Math.min(boxWidth + boxPadding * 2, maxWidth);

	// テキスト位置を計算
	const pos = cardData.design.textPosition;
	let boxX: number, boxY: number;

	switch (pos.horizontal) {
		case 'left':
			boxX = padding;
			break;
		case 'center':
			boxX = (outputSize.width - boxWidth) / 2;
			break;
		case 'right':
			boxX = outputSize.width - boxWidth - padding;
			break;
	}

	switch (pos.vertical) {
		case 'top':
			boxY = padding;
			break;
		case 'center':
			boxY = (outputSize.height - boxHeight) / 2;
			break;
		case 'bottom':
			boxY = outputSize.height - boxHeight - padding;
			break;
	}

	// 背景ボックスを描画（角丸 + ぼかし効果は再現できないのでソリッドに）
	ctx.fillStyle = bgColor;
	ctx.beginPath();
	ctx.roundRect(boxX, boxY, boxWidth, boxHeight, borderRadius);
	ctx.fill();

	// テキストを描画
	ctx.fillStyle = textColor;
	let currentY = boxY + boxPadding;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		currentY += lineHeights[i];

		switch (line.type) {
			case 'title':
				ctx.font = `bold ${titleFontSize}px sans-serif`;
				ctx.textBaseline = 'bottom';
				ctx.fillText(line.text!, boxX + boxPadding, currentY);
				break;

			case 'subtitle':
				ctx.font = `${smallFontSize}px sans-serif`;
				ctx.textBaseline = 'bottom';
				ctx.fillText(line.text!, boxX + boxPadding, currentY);
				break;

			case 'jobs':
				// ジョブアイコンを描画
				let jobX = boxX + boxPadding;
				const jobY = currentY - jobIconSize;
				for (const job of line.jobs!) {
					const icon = jobIcons.get(job.nameEn);
					if (icon) {
						ctx.drawImage(icon, jobX, jobY, jobIconSize, jobIconSize);
					}
					jobX += jobIconSize + 2 * scale;
				}
				break;

			case 'section':
				ctx.font = `bold ${tinyFontSize}px sans-serif`;
				ctx.textBaseline = 'bottom';
				// アイコン（ゲームパッド/時計）の代わりにテキストのみ
				ctx.fillText(line.text!, boxX + boxPadding, currentY);
				break;

			case 'content':
				ctx.font = `${tinyFontSize}px sans-serif`;
				ctx.textBaseline = 'bottom';
				ctx.fillText(line.text!, boxX + boxPadding + 4 * scale, currentY);
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
	const isPortrait = cardData.design.orientation === 'portrait';
	const previewWidth = isPortrait ? PREVIEW_SIZES.portrait : PREVIEW_SIZES.landscape;
	const scale = outputSize.width / previewWidth;
	const fontSize = 6 * scale;
	const padding = 8 * scale;

	ctx.save();

	ctx.font = `${fontSize}px sans-serif`;
	ctx.textBaseline = 'bottom';
	ctx.textAlign = 'right';

	const text = '\u00A9 SQUARE ENIX';
	const x = outputSize.width - padding;
	const y = outputSize.height - padding;

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
