export interface CardData {
	// 基本情報
	characterName: string;
	dataCenter: string;
	world: string;

	// プレイスタイル
	playStyle: {
		contents: ContentType[];
		attitude: AttitudeType | null;
		jobs: string[];
	};

	// ログイン時間
	loginTime: {
		days: DayType[];
		times: TimeType[];
	};

	// 画像設定
	image: {
		src: string | null;
		rotation: 0 | 90 | 180 | 270;
		offset: { x: number; y: number } | null;
		zoom: number;
	};

	// デザイン設定
	design: {
		theme: 'dark' | 'light';
		orientation: 'landscape' | 'portrait';
		textPosition: {
			vertical: 'top' | 'center' | 'bottom';
			horizontal: 'left' | 'center' | 'right';
		};
	};
}

export type ContentType =
	| 'raid'
	| 'pvp'
	| 'housing'
	| 'gatherer-crafter'
	| 'glamour'
	| 'fishing'
	| 'gold-saucer'
	| 'special-field'
	| 'roleplay'
	| 'story'
	| 'gil-making'
	| 'other';

export type AttitudeType = 'hardcore' | 'casual' | 'enjoy' | 'other';
export type DayType = 'weekday' | 'weekend' | 'everyday' | 'irregular';
export type TimeType = 'morning' | 'afternoon' | 'night' | 'midnight';

export interface DataCenter {
	name: string;
	region: string;
	worlds: string[];
}

export interface Job {
	id: string;
	name: string;
	nameEn: string;
	role: string;
}

export interface Role {
	id: string;
	name: string;
	color: string;
}

export const CONTENT_LABELS: Record<ContentType, string> = {
	raid: 'レイド',
	pvp: 'PvP',
	housing: 'ハウジング',
	'gatherer-crafter': 'ギャザクラ',
	glamour: 'ミラプリ',
	fishing: '釣り',
	'mob-hunt': 'モブハン',
	'gold-saucer': 'ゴールドソーサー',
	'dd': 'DD',
	'special-field': '特殊フィールド',
	roleplay: 'ロールプレイ',
	story: 'ストーリー',
	'gil-making': '金策'
};

export const ATTITUDE_LABELS: Record<AttitudeType, string> = {
	hardcore: 'ガチ勢',
	casual: 'まったり',
	enjoy: 'エンジョイ'
};

export const DAY_LABELS: Record<DayType, string> = {
	weekday: '平日',
	weekend: '週末',
	everyday: '毎日',
	irregular: '不定期'
};

export const TIME_LABELS: Record<TimeType, string> = {
	morning: '朝',
	afternoon: '昼',
	night: '夜',
	midnight: '深夜'
};
