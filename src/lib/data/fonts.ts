/**
 * フォント定義モジュール
 * オーバーレイテキストに使用可能なフォントを定義
 */

export type FontFamily = 'system' | 'noto-sans-jp' | 'mplus-rounded' | 'noto-serif-jp' | 'zen-maru';

export interface FontDefinition {
	id: FontFamily;
	name: string;
	fontFamily: string;
}

/**
 * 利用可能なフォント一覧
 */
export const FONTS: readonly FontDefinition[] = [
	{
		id: 'system',
		name: 'システム',
		fontFamily:
			"'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif"
	},
	{
		id: 'noto-sans-jp',
		name: 'Noto Sans JP',
		fontFamily: "'Noto Sans JP', sans-serif"
	},
	{
		id: 'mplus-rounded',
		name: 'M PLUS Rounded',
		fontFamily: "'M PLUS Rounded 1c', sans-serif"
	},
	{
		id: 'noto-serif-jp',
		name: 'Noto Serif JP',
		fontFamily: "'Noto Serif JP', serif"
	},
	{
		id: 'zen-maru',
		name: 'Zen Maru Gothic',
		fontFamily: "'Zen Maru Gothic', sans-serif"
	}
] as const;

/**
 * フォントIDからCSS font-family文字列を取得
 */
export function getFontFamily(id: FontFamily): string {
	const font = FONTS.find((f) => f.id === id);
	return font?.fontFamily ?? FONTS[0].fontFamily;
}

/**
 * フォントIDが有効かどうかを検証
 */
export function isValidFontFamily(id: string): id is FontFamily {
	return FONTS.some((f) => f.id === id);
}
