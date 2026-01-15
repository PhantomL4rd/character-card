/**
 * オーバーレイコンテンツ構築ユーティリティ
 * TextOverlay.svelteとcanvasRenderer.tsで共通使用
 */

import type { CardData } from '$lib/types/card';
import { CONTENT_LABELS, ATTITUDE_LABELS, DAY_LABELS, TIME_LABELS } from '$lib/data/labels';
import jobsData from '$lib/data/jobs.json';

export type JobInfo = {
  id: string;
  name: string;
  nameEn: string;
  role: string;
};

export type OverlayLineType = 'title' | 'subtitle' | 'section' | 'content' | 'jobs';

export interface OverlayLine {
  type: OverlayLineType;
  text?: string;
  jobs?: JobInfo[];
  sectionIcon?: 'gamepad' | 'clock';
}

export interface OverlayContent {
  lines: OverlayLine[];
  selectedJobs: JobInfo[];
  hasPlayStyle: boolean;
  hasLoginTime: boolean;
}

/**
 * カードデータからオーバーレイ表示用のコンテンツを構築する
 */
export function buildOverlayContent(cardData: CardData): OverlayContent {
  const selectedJobs = cardData.playStyle.jobs
    .map((id) => jobsData.jobs.find((j) => j.id === id))
    .filter((j): j is JobInfo => j !== undefined);

  const hasPlayStyle =
    cardData.playStyle.contents.length > 0 ||
    cardData.playStyle.attitude !== null ||
    selectedJobs.length > 0;

  const hasLoginTime = cardData.loginTime.days.length > 0 || cardData.loginTime.times.length > 0;

  const lines: OverlayLine[] = [];

  // キャラクター名
  if (cardData.characterName) {
    lines.push({ type: 'title', text: cardData.characterName });
  }

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
  if (hasPlayStyle && (cardData.playStyle.attitude || cardData.playStyle.contents.length > 0)) {
    lines.push({ type: 'section', text: 'プレイスタイル', sectionIcon: 'gamepad' });
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
    lines.push({ type: 'section', text: 'ログイン', sectionIcon: 'clock' });
    const dayLabels = cardData.loginTime.days.map((d) => DAY_LABELS[d]).join('・');
    const timeLabels = cardData.loginTime.times.map((t) => TIME_LABELS[t]).join('・');
    const loginText = [dayLabels, timeLabels].filter(Boolean).join('・');
    if (loginText) {
      lines.push({ type: 'content', text: loginText });
    }
  }

  return {
    lines,
    selectedJobs,
    hasPlayStyle,
    hasLoginTime
  };
}

/**
 * 姿勢ラベルを取得
 */
export function getAttitudeLabel(attitude: CardData['playStyle']['attitude']): string {
  return attitude ? ATTITUDE_LABELS[attitude] : '';
}

/**
 * コンテンツラベルのリストを取得
 */
export function getContentLabels(contents: CardData['playStyle']['contents']): string[] {
  return contents.map((c) => CONTENT_LABELS[c]);
}

/**
 * 曜日ラベルを結合して取得
 */
export function getDayLabelsText(days: CardData['loginTime']['days']): string {
  return days.map((d) => DAY_LABELS[d]).join('・');
}

/**
 * 時間帯ラベルを結合して取得
 */
export function getTimeLabelsText(times: CardData['loginTime']['times']): string {
  return times.map((t) => TIME_LABELS[t]).join('・');
}
