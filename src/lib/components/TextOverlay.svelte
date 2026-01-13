<script lang="ts">
	import { Gamepad2, Clock } from 'lucide-svelte';
	import type { CardData } from '$lib/types/card';
	import type { OverlayStyles } from '$lib/utils/overlayStyle';
	import { getFontFamily } from '$lib/data/fonts';
	import {
		buildOverlayContent,
		getAttitudeLabel,
		getContentLabels,
		getDayLabelsText,
		getTimeLabelsText
	} from '$lib/utils/overlayContent';

	interface Props {
		cardData: CardData;
		overlayStyles: OverlayStyles;
	}

	let { cardData, overlayStyles }: Props = $props();

	const themeColors = $derived(
		cardData.design.theme === 'dark'
			? { bg: 'rgba(0, 0, 0, 0.6)', text: '#ffffff' }
			: { bg: 'rgba(255, 255, 255, 0.6)', text: '#000000' }
	);

	const fontFamily = $derived(getFontFamily(cardData.design.fontFamily));

	const positionClasses = $derived(() => {
		const v = { top: 'items-start', center: 'items-center', bottom: 'items-end' };
		const h = { left: 'justify-start', center: 'justify-center', right: 'justify-end' };
		const pos = cardData.design.textPosition;
		return `${v[pos.vertical]} ${h[pos.horizontal]}`;
	});

	// 共通ユーティリティでコンテンツを構築
	const overlayContent = $derived(buildOverlayContent(cardData));
	const { selectedJobs, hasPlayStyle, hasLoginTime } = $derived(overlayContent);

	// ラベル取得に共通ヘルパーを使用
	const attitudeLabel = $derived(getAttitudeLabel(cardData.playStyle.attitude));
	const contentLabels = $derived(getContentLabels(cardData.playStyle.contents));
	const dayLabels = $derived(getDayLabelsText(cardData.loginTime.days));
	const timeLabels = $derived(getTimeLabelsText(cardData.loginTime.times));

	// コピーライト：白文字＋黒縁取り（8方向text-shadow）
	const copyrightOutline =
		'-1px -1px 0 #000, 0 -1px 0 #000, 1px -1px 0 #000, -1px 0 0 #000, 1px 0 0 #000, -1px 1px 0 #000, 0 1px 0 #000, 1px 1px 0 #000';
</script>

<!-- テキストオーバーレイ -->
{#if cardData.characterName}
	<div
		class="absolute inset-0 flex pointer-events-none z-10 {positionClasses()}"
		style="padding: {overlayStyles.padding}px;"
	>
		<div
			style="
				background: {themeColors.bg};
				color: {themeColors.text};
				padding: {overlayStyles.boxPadding}px;
				border-radius: {overlayStyles.borderRadius}px;
				max-width: {overlayStyles.maxWidth}px;
				backdrop-filter: blur(4px);
				font-family: {fontFamily};
			"
		>
			<h2
				style="font-size: {overlayStyles.titleFontSize}px; font-weight: bold; line-height: {overlayStyles.lineSpacing};"
			>
				{cardData.characterName}
			</h2>

			{#if cardData.dataCenter}
				<p style="font-size: {overlayStyles.subtitleFontSize}px; line-height: {overlayStyles.lineSpacing};">
					{#if cardData.world}
						{cardData.world} @ {cardData.dataCenter}
					{:else}
						{cardData.dataCenter}
					{/if}
				</p>
			{/if}

			{#if selectedJobs.length > 0}
				<div
					style="display: flex; flex-wrap: wrap; gap: {overlayStyles.jobGap}px; margin-top: {overlayStyles.jobGap}px;"
				>
					{#each selectedJobs as job}
						<img
							src="/icons/jobs/{job.nameEn}.png"
							alt={job.name}
							style="width: {overlayStyles.jobIconSize}px; height: {overlayStyles.jobIconSize}px;"
							title={job.name}
						/>
					{/each}
				</div>
			{/if}

			{#if hasPlayStyle && (attitudeLabel || contentLabels.length > 0)}
				<div style="font-size: {overlayStyles.sectionFontSize}px; margin-top: {overlayStyles.jobGap}px;">
					<div
						style="display: flex; align-items: center; gap: {overlayStyles.jobGap / 2}px; font-weight: 600;"
					>
						<Gamepad2 size={overlayStyles.sectionIconSize} style="flex-shrink: 0;" />
						<span>プレイスタイル</span>
					</div>
					<div
						style="margin-top: {overlayStyles.jobGap / 2}px; margin-left: {overlayStyles.contentIndent}px; display: flex; flex-wrap: wrap; gap: {overlayStyles.jobGap / 2}px;"
					>
						{#if attitudeLabel}
							<span style="font-weight: 500; white-space: nowrap;">{attitudeLabel}</span>
						{/if}
						{#each contentLabels as label, i}
							<span style="white-space: nowrap;">{i > 0 || attitudeLabel ? '/ ' : ''}{label}</span>
						{/each}
					</div>
				</div>
			{/if}

			{#if hasLoginTime}
				<div style="font-size: {overlayStyles.sectionFontSize}px; margin-top: {overlayStyles.jobGap}px;">
					<div
						style="display: flex; align-items: center; gap: {overlayStyles.jobGap / 2}px; font-weight: 600;"
					>
						<Clock size={overlayStyles.sectionIconSize} style="flex-shrink: 0;" />
						<span>ログイン</span>
					</div>
					<div
						style="margin-top: {overlayStyles.jobGap / 2}px; margin-left: {overlayStyles.contentIndent}px;"
					>
						{dayLabels}
						{#if dayLabels && timeLabels}・{/if}
						{timeLabels}
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<!-- コピーライト -->
<div
	class="absolute text-white pointer-events-none z-10"
	style="
		bottom: {overlayStyles.copyrightPadding}px;
		right: {overlayStyles.copyrightPadding}px;
		font-size: {overlayStyles.copyrightFontSize}px;
		text-shadow: {copyrightOutline};
	"
>
	© SQUARE ENIX
</div>
