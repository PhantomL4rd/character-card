/**
 * オーバーレイのスタイル計算ロジック
 * プレビューとエクスポートで同じサイズ感を実現するための共通モジュール
 */

// 出力解像度（エクスポート基準）
export const OUTPUT_SIZES = {
	landscape: { width: 2560, height: 1440 },
	portrait: { width: 1080, height: 1440 }
};

// 基準となるフォントサイズ（出力解像度での値）
const BASE_STYLES = {
	titleFontSize: 80,      // キャラクター名
	subtitleFontSize: 60,   // DC/World
	sectionFontSize: 40,    // セクションヘッダー
	contentFontSize: 36,    // コンテンツ
	jobIconSize: 72,        // ジョブアイコン
	sectionIconSize: 32,    // セクションアイコン
	padding: 32,            // 外側パディング
	boxPadding: 32,         // ボックス内パディング
	borderRadius: 32,       // 角丸
	maxWidthRatio: 0.75,    // 最大幅の割合
	lineSpacing: 1.3,       // 行間
	jobGap: 8,              // ジョブアイコン間隔
	contentIndent: 16,      // コンテンツのインデント
	copyrightFontSize: 24,  // コピーライト
	copyrightPadding: 32,   // コピーライトの余白
};

export interface OverlayStyles {
	titleFontSize: number;
	subtitleFontSize: number;
	sectionFontSize: number;
	contentFontSize: number;
	jobIconSize: number;
	sectionIconSize: number;
	padding: number;
	boxPadding: number;
	borderRadius: number;
	maxWidth: number;
	lineSpacing: number;
	jobGap: number;
	contentIndent: number;
	copyrightFontSize: number;
	copyrightPadding: number;
}

/**
 * プレビューサイズに応じたオーバーレイスタイルを計算
 * @param previewWidth - プレビューの実際の幅（px）
 * @param orientation - カードの向き
 */
export function calculateOverlayStyles(
	previewWidth: number,
	orientation: 'landscape' | 'portrait'
): OverlayStyles {
	const outputSize = OUTPUT_SIZES[orientation];
	const scale = previewWidth / outputSize.width;

	return {
		titleFontSize: BASE_STYLES.titleFontSize * scale,
		subtitleFontSize: BASE_STYLES.subtitleFontSize * scale,
		sectionFontSize: BASE_STYLES.sectionFontSize * scale,
		contentFontSize: BASE_STYLES.contentFontSize * scale,
		jobIconSize: BASE_STYLES.jobIconSize * scale,
		sectionIconSize: BASE_STYLES.sectionIconSize * scale,
		padding: BASE_STYLES.padding * scale,
		boxPadding: BASE_STYLES.boxPadding * scale,
		borderRadius: BASE_STYLES.borderRadius * scale,
		maxWidth: previewWidth * BASE_STYLES.maxWidthRatio,
		lineSpacing: BASE_STYLES.lineSpacing,
		jobGap: BASE_STYLES.jobGap * scale,
		contentIndent: BASE_STYLES.contentIndent * scale,
		copyrightFontSize: BASE_STYLES.copyrightFontSize * scale,
		copyrightPadding: BASE_STYLES.copyrightPadding * scale,
	};
}

/**
 * エクスポート用のスタイルを取得（出力解像度そのまま）
 */
export function getExportStyles(orientation: 'landscape' | 'portrait'): OverlayStyles {
	const outputSize = OUTPUT_SIZES[orientation];
	return {
		titleFontSize: BASE_STYLES.titleFontSize,
		subtitleFontSize: BASE_STYLES.subtitleFontSize,
		sectionFontSize: BASE_STYLES.sectionFontSize,
		contentFontSize: BASE_STYLES.contentFontSize,
		jobIconSize: BASE_STYLES.jobIconSize,
		sectionIconSize: BASE_STYLES.sectionIconSize,
		padding: BASE_STYLES.padding,
		boxPadding: BASE_STYLES.boxPadding,
		borderRadius: BASE_STYLES.borderRadius,
		maxWidth: outputSize.width * BASE_STYLES.maxWidthRatio,
		lineSpacing: BASE_STYLES.lineSpacing,
		jobGap: BASE_STYLES.jobGap,
		contentIndent: BASE_STYLES.contentIndent,
		copyrightFontSize: BASE_STYLES.copyrightFontSize,
		copyrightPadding: BASE_STYLES.copyrightPadding,
	};
}
