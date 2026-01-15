import type { FontFamily } from '$lib/data/fonts';

export interface CroppedArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

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
    croppedArea: CroppedArea | null;
  };

  // デザイン設定
  design: {
    theme: 'dark' | 'light';
    orientation: 'landscape' | 'portrait';
    textPosition: {
      vertical: 'top' | 'center' | 'bottom';
      horizontal: 'left' | 'center' | 'right';
    };
    fontFamily: FontFamily;
  };
}

export type ContentType =
  | 'raid'
  | 'pvp'
  | 'housing'
  | 'chat'
  | 'gatherer-crafter'
  | 'glamour'
  | 'fishing'
  | 'mob-hunt'
  | 'gold-saucer'
  | 'dd'
  | 'special-field'
  | 'roleplay'
  | 'achievement'
  | 'treasure-map'
  | 'gil-making'
  | 'roulette';

export type AttitudeType = 'hardcore' | 'casual' | 'enjoy' | 'lonely';
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
