/**
 * 表示用ラベル定義
 * UI表示に使用するラベル文字列を定義
 */

import type { ContentType, AttitudeType, DayType, TimeType } from '$lib/types/card';

export const CONTENT_LABELS: Record<ContentType, string> = {
  raid: 'レイド',
  pvp: 'PvP',
  housing: 'ハウジング',
  chat: '雑談',
  'gatherer-crafter': 'ギャザクラ',
  glamour: 'ミラプリ',
  fishing: '釣り',
  'mob-hunt': 'モブハン',
  'gold-saucer': 'ゴールドソーサー',
  dd: 'DD',
  'special-field': '特殊フィールド',
  roleplay: 'ロールプレイ',
  achievement: 'アチーブ集め',
  'treasure-map': '地図',
  'gil-making': '金策',
  roulette: 'ルレ'
};

export const ATTITUDE_LABELS: Record<AttitudeType, string> = {
  hardcore: 'ガチ勢',
  casual: 'まったり',
  enjoy: 'エンジョイ',
  lonely: 'ぼっち'
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
