<script lang="ts">
	import { RotateCw, Undo, Gamepad2, Clock } from 'lucide-svelte';
	import { cardStore } from '$lib/stores/cardStore.svelte';
	import { CONTENT_LABELS, ATTITUDE_LABELS, DAY_LABELS, TIME_LABELS } from '$lib/types/card';
	import type { CroppedArea } from '$lib/types/card';
	import jobsData from '$lib/data/jobs.json';
	import Cropper from 'svelte-easy-crop';
	import { calculateOverlayStyles, type OverlayStyles } from '$lib/utils/overlayStyle';
	import { getFontFamily } from '$lib/data/fonts';

	interface Props {
		interactive?: boolean;
	}
	let { interactive = false }: Props = $props();

	let crop = $state({ x: 0, y: 0 });
	let zoom = $state(1);
	let minZoom = $state(1);
	let rotatedImageSrc = $state<string | null>(null);
	let imageSize = $state<{ width: number; height: number } | null>(null);
	let isResetting = $state(false);
	let containerEl: HTMLDivElement | undefined = $state();
	let cropSize = $state<{ width: number; height: number } | undefined>(undefined);
	let overlayStyles = $state<OverlayStyles | null>(null);

	const themeColors = $derived(
		cardStore.data.design.theme === 'dark'
			? { bg: 'rgba(0, 0, 0, 0.6)', text: '#ffffff' }
			: { bg: 'rgba(255, 255, 255, 0.6)', text: '#000000' }
	);

	// コピーライト：白文字＋黒縁取り（8方向text-shadow）
	const copyrightOutline = '-1px -1px 0 #000, 0 -1px 0 #000, 1px -1px 0 #000, -1px 0 0 #000, 1px 0 0 #000, -1px 1px 0 #000, 0 1px 0 #000, 1px 1px 0 #000';

	// ユーザー選択フォント
	const fontFamily = $derived(getFontFamily(cardStore.data.design.fontFamily));

	const positionClasses = $derived(() => {
		const v = { top: 'items-start', center: 'items-center', bottom: 'items-end' };
		const h = { left: 'justify-start', center: 'justify-center', right: 'justify-end' };
		const pos = cardStore.data.design.textPosition;
		return `${v[pos.vertical]} ${h[pos.horizontal]}`;
	});

	const selectedJobs = $derived(
		cardStore.data.playStyle.jobs
			.map((id) => jobsData.jobs.find((j) => j.id === id))
			.filter((j): j is (typeof jobsData.jobs)[number] => j !== undefined)
	);

	const contentLabels = $derived(
		cardStore.data.playStyle.contents.map((c) => CONTENT_LABELS[c])
	);

	const attitudeLabel = $derived(
		cardStore.data.playStyle.attitude ? ATTITUDE_LABELS[cardStore.data.playStyle.attitude] : ''
	);

	const dayLabels = $derived(cardStore.data.loginTime.days.map((d) => DAY_LABELS[d]).join('・'));
	const timeLabels = $derived(cardStore.data.loginTime.times.map((t) => TIME_LABELS[t]).join('・'));

	const hasPlayStyle = $derived(
		cardStore.data.playStyle.contents.length > 0 ||
			cardStore.data.playStyle.attitude ||
			selectedJobs.length > 0
	);

	const hasLoginTime = $derived(
		cardStore.data.loginTime.days.length > 0 || cardStore.data.loginTime.times.length > 0
	);

	// カードの向きはストアのorientation設定から決定
	const isPortrait = $derived(cardStore.data.design.orientation === 'portrait');
	const aspectClass = $derived(isPortrait ? 'aspect-[3/4]' : 'aspect-[16/9]');
	const aspect = $derived(isPortrait ? 3 / 4 : 16 / 9);

	// Cropperに渡す画像（回転済み）- nullの場合はundefinedに変換
	const displayImage = $derived(rotatedImageSrc ?? cardStore.data.image.src ?? undefined);

	function handleCropComplete(event: { pixels: CroppedArea; percent: CroppedArea }) {
		if (isResetting) return;
		// ピクセル単位のクロップ領域をストアに保存
		cardStore.updateCroppedArea(event.pixels);
	}

	/**
	 * 画像がクロップ領域を完全にカバーするために必要な最小ズームを計算
	 *
	 * svelte-easy-cropの仕様:
	 * - zoom=1 で画像がクロップ領域に「フィット」（contain方式）
	 * - 画像のアスペクト比がクロップ領域より横長の場合、高さが足りなくなる
	 * - 画像のアスペクト比がクロップ領域より縦長の場合、幅が足りなくなる
	 * - どちらの場合も、minZoom > 1 にして画像を拡大し、隙間をなくす
	 *
	 * @param imgWidth - 画像の幅（回転適用後）
	 * @param imgHeight - 画像の高さ（回転適用後）
	 * @param cropAspect - クロップ領域のアスペクト比（幅/高さ）
	 * @returns 最小ズームレベル（1以上）
	 */
	function calcMinZoom(imgWidth: number, imgHeight: number, cropAspect: number): number {
		// 無効な入力に対する防御的処理
		if (imgWidth <= 0 || imgHeight <= 0 || cropAspect <= 0) {
			return 1;
		}

		const imageAspect = imgWidth / imgHeight;

		if (imageAspect > cropAspect) {
			// 画像が横長：高さが不足するためズームが必要
			return Math.max(1, imageAspect / cropAspect);
		} else if (imageAspect < cropAspect) {
			// 画像が縦長：幅が不足するためズームが必要
			return Math.max(1, cropAspect / imageAspect);
		}

		// 同じアスペクト比の場合、zoom=1で十分
		return 1;
	}

	// 画像サイズを取得
	function getImageSize(src: string): Promise<{ width: number; height: number }> {
		return new Promise((resolve) => {
			const img = new Image();
			img.onload = () => resolve({ width: img.width, height: img.height });
			img.src = src;
		});
	}

	// Canvasで画像を回転
	async function rotateImageCanvas(src: string, degrees: number): Promise<{ src: string; width: number; height: number }> {
		return new Promise((resolve) => {
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');
				if (!ctx) return;

				const isRotated90or270 = degrees === 90 || degrees === 270;
				canvas.width = isRotated90or270 ? img.height : img.width;
				canvas.height = isRotated90or270 ? img.width : img.height;

				ctx.translate(canvas.width / 2, canvas.height / 2);
				ctx.rotate((degrees * Math.PI) / 180);
				ctx.drawImage(img, -img.width / 2, -img.height / 2);

				resolve({
					src: canvas.toDataURL('image/png'),
					width: canvas.width,
					height: canvas.height
				});
			};
			img.src = src;
		});
	}

	// ズームを最小値にリセット
	function resetZoomToMin() {
		if (imageSize) {
			isResetting = true;
			const newMinZoom = Math.max(1, calcMinZoom(imageSize.width, imageSize.height, aspect));
			minZoom = newMinZoom;
			zoom = newMinZoom;
			crop = { x: 0, y: 0 };
			// 次のマイクロタスクでフラグを解除
			queueMicrotask(() => {
				isResetting = false;
			});
		}
	}

	async function rotateImage() {
		if (!cardStore.data.image.src) return;

		const current = cardStore.data.image.rotation;
		const next = ((current + 90) % 360) as 0 | 90 | 180 | 270;
		cardStore.updateRotation(next);

		// 元画像から回転画像を生成
		const result = await rotateImageCanvas(cardStore.data.image.src, next);
		rotatedImageSrc = result.src;
		imageSize = { width: result.width, height: result.height };
		resetZoomToMin();
	}

	function resetPosition() {
		resetZoomToMin();
	}

	// 画像変更時
	$effect(() => {
		if (cardStore.data.image.src) {
			const rotation = cardStore.data.image.rotation;
			if (rotation === 0) {
				rotatedImageSrc = null;
				getImageSize(cardStore.data.image.src).then(size => {
					imageSize = size;
					resetZoomToMin();
				});
			} else {
				rotateImageCanvas(cardStore.data.image.src, rotation).then(result => {
					rotatedImageSrc = result.src;
					imageSize = { width: result.width, height: result.height };
					resetZoomToMin();
				});
			}
		}
	});

	// カードの向き変更時にズームを再計算
	$effect(() => {
		const _ = cardStore.data.design.orientation;
		if (imageSize) {
			resetZoomToMin();
		}
	});

	// コンテナサイズを監視（ResizeObserverで安定的に取得）
	$effect(() => {
		if (!containerEl) return;

		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (entry) {
				const { width, height } = entry.contentRect;
				if (width > 0 && height > 0) {
					cropSize = { width, height };
					// オーバーレイスタイルを計算
					overlayStyles = calculateOverlayStyles(width, cardStore.data.design.orientation);
				}
			}
		});

		observer.observe(containerEl);
		return () => observer.disconnect();
	});

	// 向き変更時にオーバーレイスタイルを再計算
	$effect(() => {
		if (cropSize) {
			overlayStyles = calculateOverlayStyles(cropSize.width, cardStore.data.design.orientation);
		}
	});
</script>

<style>
	/* svelte-easy-cropの暗いオーバーレイと枠を非表示（グリッド線は表示） */
	:global(.reactEasyCrop_Container) {
		overflow: hidden !important;
		background: transparent !important;
	}
	:global(.reactEasyCrop_CropArea) {
		border: none !important;
		box-shadow: 0 0 0 9999px transparent !important;
		color: transparent !important;
	}
	/* 画像の外側の背景を透明に、境界線を消す */
	:global(.reactEasyCrop_Image) {
		background: transparent !important;
		border: none !important;
		outline: none !important;
	}
	/* Cropper内部の全要素の境界を消す */
	:global(.reactEasyCrop_Container *) {
		border: none !important;
		outline: none !important;
	}
	/* グリッド線は表示する（補助線として活用） */
	:global(.reactEasyCrop_CropAreaGrid::before),
	:global(.reactEasyCrop_CropAreaGrid::after) {
		border-color: rgba(255, 255, 255, 0.5) !important;
	}
</style>

<div class="space-y-2">
	<div
		class="relative overflow-hidden {aspectClass} rounded-lg shadow-xl bg-base-300"
		bind:this={containerEl}
	>
		{#if cardStore.data.image.src}
			<div class="absolute inset-0">
				<Cropper
					image={displayImage}
					bind:crop
					bind:zoom
					{aspect}
					{minZoom}
					maxZoom={Math.max(10, minZoom + 5)}
					{cropSize}
					cropShape="rect"
					showGrid={interactive}
					oncropcomplete={handleCropComplete}
				/>
			</div>
		{:else}
			<div class="absolute inset-0 flex items-center justify-center text-base-content/50">
				<span class="text-sm">画像をアップロードしてください</span>
			</div>
		{/if}

		<!-- テキストオーバーレイ -->
		{#if cardStore.data.characterName && overlayStyles}
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
					<h2 style="font-size: {overlayStyles.titleFontSize}px; font-weight: bold; line-height: {overlayStyles.lineSpacing};">
						{cardStore.data.characterName}
					</h2>

					{#if cardStore.data.dataCenter}
						<p style="font-size: {overlayStyles.subtitleFontSize}px; line-height: {overlayStyles.lineSpacing};">
							{#if cardStore.data.world}
								{cardStore.data.world} @ {cardStore.data.dataCenter}
							{:else}
								{cardStore.data.dataCenter}
							{/if}
						</p>
					{/if}

					{#if selectedJobs.length > 0}
						<div style="display: flex; flex-wrap: wrap; gap: {overlayStyles.jobGap}px; margin-top: {overlayStyles.jobGap}px;">
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

					{#if hasPlayStyle}
						<div style="font-size: {overlayStyles.sectionFontSize}px; margin-top: {overlayStyles.jobGap}px;">
							<div style="display: flex; align-items: center; gap: {overlayStyles.jobGap / 2}px; font-weight: 600;">
								<Gamepad2 size={overlayStyles.sectionIconSize} style="flex-shrink: 0;" />
								<span>プレイスタイル</span>
							</div>
							<div style="margin-top: {overlayStyles.jobGap / 2}px; margin-left: {overlayStyles.contentIndent}px; display: flex; flex-wrap: wrap; gap: {overlayStyles.jobGap / 2}px;">
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
							<div style="display: flex; align-items: center; gap: {overlayStyles.jobGap / 2}px; font-weight: 600;">
								<Clock size={overlayStyles.sectionIconSize} style="flex-shrink: 0;" />
								<span>ログイン</span>
							</div>
							<div style="margin-top: {overlayStyles.jobGap / 2}px; margin-left: {overlayStyles.contentIndent}px;">
								{dayLabels}
								{#if dayLabels && timeLabels}・{/if}
								{timeLabels}
							</div>
						</div>
					{/if}
				</div>
			</div>
		{/if}

		{#if overlayStyles}
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
		{/if}
	</div>

	{#if interactive}
		<!-- カードの向き切替 -->
		<div class="flex items-center gap-2">
			<button
				type="button"
				class="btn btn-sm flex-1"
				class:btn-primary={!isPortrait}
				class:btn-outline={isPortrait}
				onclick={() => cardStore.updateOrientation('landscape')}
			>
				横長
			</button>
			<button
				type="button"
				class="btn btn-sm flex-1"
				class:btn-primary={isPortrait}
				class:btn-outline={!isPortrait}
				onclick={() => cardStore.updateOrientation('portrait')}
			>
				縦長
			</button>
		</div>

		{#if cardStore.data.image.src}
			<!-- 画像操作 -->
			<div class="flex items-center gap-2">
				<button type="button" class="btn btn-sm btn-outline flex-1 gap-1" onclick={rotateImage}>
					<RotateCw class="w-4 h-4" />
					画像回転
				</button>
				<button type="button" class="btn btn-sm btn-ghost flex-1 gap-1" onclick={resetPosition}>
					<Undo class="w-4 h-4" />
					リセット
				</button>
			</div>
			<div class="flex items-center gap-2">
				<span class="text-xs">ズーム</span>
				<input
					type="range"
					min={minZoom}
					max={Math.max(10, minZoom + 5)}
					step="0.1"
					bind:value={zoom}
					class="range range-xs flex-1"
				/>
			</div>
		{/if}
	{/if}
</div>
