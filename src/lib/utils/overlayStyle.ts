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
const BASE_STYLES_LANDSCAPE = {
  titleFontSize: 80, // キャラクター名
  subtitleFontSize: 60, // DC/World
  sectionFontSize: 40, // セクションヘッダー
  contentFontSize: 36, // コンテンツ
  jobIconSize: 72, // ジョブアイコン
  sectionIconSize: 32, // セクションアイコン
  padding: 32, // 外側パディング
  boxPadding: 32, // ボックス内パディング
  borderRadius: 32, // 角丸
  maxWidthRatio: 0.75, // 最大幅の割合
  lineSpacing: 1.3, // 行間
  jobGap: 8, // ジョブアイコン間隔
  contentIndent: 16, // コンテンツのインデント
  copyrightFontSize: 24, // コピーライト
  copyrightPadding: 32 // コピーライトの余白
};

// 縦長用（出力幅が小さいので値も小さく）
const BASE_STYLES_PORTRAIT = {
  titleFontSize: 48,
  subtitleFontSize: 36,
  sectionFontSize: 28,
  contentFontSize: 24,
  jobIconSize: 48,
  sectionIconSize: 24,
  padding: 24,
  boxPadding: 24,
  borderRadius: 24,
  maxWidthRatio: 0.85,
  lineSpacing: 1.3,
  jobGap: 6,
  contentIndent: 12,
  copyrightFontSize: 18,
  copyrightPadding: 24
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
  const baseStyles = orientation === 'portrait' ? BASE_STYLES_PORTRAIT : BASE_STYLES_LANDSCAPE;
  const scale = previewWidth / outputSize.width;

  return {
    titleFontSize: baseStyles.titleFontSize * scale,
    subtitleFontSize: baseStyles.subtitleFontSize * scale,
    sectionFontSize: baseStyles.sectionFontSize * scale,
    contentFontSize: baseStyles.contentFontSize * scale,
    jobIconSize: baseStyles.jobIconSize * scale,
    sectionIconSize: baseStyles.sectionIconSize * scale,
    padding: baseStyles.padding * scale,
    boxPadding: baseStyles.boxPadding * scale,
    borderRadius: baseStyles.borderRadius * scale,
    maxWidth: previewWidth * baseStyles.maxWidthRatio,
    lineSpacing: baseStyles.lineSpacing,
    jobGap: baseStyles.jobGap * scale,
    contentIndent: baseStyles.contentIndent * scale,
    copyrightFontSize: baseStyles.copyrightFontSize * scale,
    copyrightPadding: baseStyles.copyrightPadding * scale
  };
}

/**
 * エクスポート用のスタイルを取得（出力解像度そのまま）
 */
export function getExportStyles(orientation: 'landscape' | 'portrait'): OverlayStyles {
  const outputSize = OUTPUT_SIZES[orientation];
  const baseStyles = orientation === 'portrait' ? BASE_STYLES_PORTRAIT : BASE_STYLES_LANDSCAPE;
  return {
    titleFontSize: baseStyles.titleFontSize,
    subtitleFontSize: baseStyles.subtitleFontSize,
    sectionFontSize: baseStyles.sectionFontSize,
    contentFontSize: baseStyles.contentFontSize,
    jobIconSize: baseStyles.jobIconSize,
    sectionIconSize: baseStyles.sectionIconSize,
    padding: baseStyles.padding,
    boxPadding: baseStyles.boxPadding,
    borderRadius: baseStyles.borderRadius,
    maxWidth: outputSize.width * baseStyles.maxWidthRatio,
    lineSpacing: baseStyles.lineSpacing,
    jobGap: baseStyles.jobGap,
    contentIndent: baseStyles.contentIndent,
    copyrightFontSize: baseStyles.copyrightFontSize,
    copyrightPadding: baseStyles.copyrightPadding
  };
}
