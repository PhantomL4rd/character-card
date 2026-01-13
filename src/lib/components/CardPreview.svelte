<script lang="ts">
	import { cardStore } from '$lib/stores/cardStore.svelte';
	import type { CroppedArea } from '$lib/types/card';
	import { calculateOverlayStyles, type OverlayStyles } from '$lib/utils/overlayStyle';
	import { rotateImageCanvas } from '$lib/utils/imageTransform';
	import ImageCropper from './ImageCropper.svelte';
	import TextOverlay from './TextOverlay.svelte';
	import ImageControls from './ImageControls.svelte';

	interface Props {
		interactive?: boolean;
	}
	let { interactive = false }: Props = $props();

	let rotatedImageSrc = $state<string | null>(null);
	let containerEl: HTMLDivElement | undefined = $state();
	let overlayStyles = $state<OverlayStyles | null>(null);
	let cropperRef: ImageCropper | undefined = $state();

	// カードの向きはストアのorientation設定から決定
	const isPortrait = $derived(cardStore.data.design.orientation === 'portrait');
	const aspectClass = $derived(isPortrait ? 'aspect-[3/4]' : 'aspect-[16/9]');
	const aspect = $derived(isPortrait ? 3 / 4 : 16 / 9);

	// Cropperに渡す画像（回転済み）
	const displayImage = $derived(rotatedImageSrc ?? cardStore.data.image.src ?? undefined);

	function handleCropComplete(area: CroppedArea) {
		cardStore.updateCroppedArea(area);
	}

	async function rotateImage() {
		if (!cardStore.data.image.src) return;

		const current = cardStore.data.image.rotation;
		const next = ((current + 90) % 360) as 0 | 90 | 180 | 270;
		cardStore.updateRotation(next);

		// 元画像から回転画像を生成
		const result = await rotateImageCanvas(cardStore.data.image.src, next);
		rotatedImageSrc = result.src;
	}

	function handleOrientationChange(orientation: 'landscape' | 'portrait') {
		cardStore.updateOrientation(orientation);
	}

	function handleZoomChange(value: number) {
		cropperRef?.setZoom(value);
	}

	function handleReset() {
		cropperRef?.resetPosition();
	}

	// 画像変更時
	$effect(() => {
		if (cardStore.data.image.src) {
			const rotation = cardStore.data.image.rotation;
			if (rotation === 0) {
				rotatedImageSrc = null;
			} else {
				rotateImageCanvas(cardStore.data.image.src, rotation).then((result) => {
					rotatedImageSrc = result.src;
				});
			}
		}
	});

	// コンテナサイズを監視してオーバーレイスタイルを計算
	$effect(() => {
		if (!containerEl) return;

		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (entry) {
				const { width, height } = entry.contentRect;
				if (width > 0 && height > 0) {
					overlayStyles = calculateOverlayStyles(width, cardStore.data.design.orientation);
				}
			}
		});

		observer.observe(containerEl);
		return () => observer.disconnect();
	});

	// 向き変更時にオーバーレイスタイルを再計算
	$effect(() => {
		const orientation = cardStore.data.design.orientation;
		if (containerEl) {
			const { width } = containerEl.getBoundingClientRect();
			if (width > 0) {
				overlayStyles = calculateOverlayStyles(width, orientation);
			}
		}
	});
</script>

<div class="space-y-2">
	<div
		class="relative overflow-hidden {aspectClass} rounded-lg shadow-xl bg-base-300"
		bind:this={containerEl}
	>
		{#if cardStore.data.image.src}
			<ImageCropper
				bind:this={cropperRef}
				image={displayImage}
				{aspect}
				{interactive}
				onCropComplete={handleCropComplete}
			/>
		{:else}
			<div class="absolute inset-0 flex items-center justify-center text-base-content/50">
				<span class="text-sm">画像をアップロードしてください</span>
			</div>
		{/if}

		<!-- テキストオーバーレイ -->
		{#if overlayStyles}
			<TextOverlay cardData={cardStore.data} {overlayStyles} />
		{/if}
	</div>

	{#if interactive}
		<ImageControls
			{isPortrait}
			hasImage={!!cardStore.data.image.src}
			zoom={cropperRef?.getZoom() ?? 1}
			minZoom={cropperRef?.getMinZoom() ?? 1}
			maxZoom={cropperRef?.getMaxZoom() ?? 10}
			onOrientationChange={handleOrientationChange}
			onRotate={rotateImage}
			onReset={handleReset}
			onZoomChange={handleZoomChange}
		/>
	{/if}
</div>
