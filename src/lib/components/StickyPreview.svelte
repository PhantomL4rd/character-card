<script lang="ts">
	import { cardStore } from '$lib/stores/cardStore.svelte';
	import type { CroppedArea } from '$lib/types/card';
	import { calculateOverlayStyles, type OverlayStyles } from '$lib/utils/overlayStyle';
	import { rotateImageCanvas } from '$lib/utils/imageTransform';
	import ImageCropper from './ImageCropper.svelte';
	import TextOverlay from './TextOverlay.svelte';
	import ImageControlsOverlay from './ImageControlsOverlay.svelte';

	interface Props {
		isMobile?: boolean;
	}

	let { isMobile = false }: Props = $props();

	let rotatedImageSrc = $state<string | null>(null);
	let containerEl: HTMLDivElement | undefined = $state();
	let overlayStyles = $state<OverlayStyles | null>(null);
	let cropperRef: ImageCropper | undefined = $state();
	let showControls = $state(false);

	// カードの向きはストアのorientation設定から決定
	const isPortrait = $derived(cardStore.data.design.orientation === 'portrait');
	const aspectClass = $derived(isPortrait ? 'aspect-[3/4]' : 'aspect-[16/9]');
	const aspect = $derived(isPortrait ? 3 / 4 : 16 / 9);

	// Cropperに渡す画像（回転済み）
	const displayImage = $derived(rotatedImageSrc ?? cardStore.data.image.src ?? undefined);

	function handleCropComplete(area: CroppedArea) {
		cardStore.updateCroppedArea(area);
	}

	function handlePreviewClick() {
		if (cardStore.data.image.src) {
			showControls = !showControls;
		}
	}

	function handleCloseControls() {
		showControls = false;
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

<div class={isMobile ? 'sticky-preview' : 'layout-split-preview'}>
	<!-- Preview Container -->
	<div
		class="relative overflow-hidden {aspectClass} rounded-lg shadow-xl bg-base-300 cursor-pointer {isPortrait ? 'max-w-[280px] mx-auto' : ''}"
		bind:this={containerEl}
		onclick={handlePreviewClick}
		onkeydown={(e) => e.key === 'Enter' && handlePreviewClick()}
		role="button"
		tabindex="0"
		aria-label="画像コントロールを開く"
	>
		{#if cardStore.data.image.src}
			<ImageCropper
				bind:this={cropperRef}
				image={displayImage}
				{aspect}
				interactive={true}
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

		<!-- 画像コントロールオーバーレイ -->
		<ImageControlsOverlay
			visible={showControls}
			{cropperRef}
			onClose={handleCloseControls}
		/>
	</div>

	<!-- Hint for mobile -->
	{#if isMobile && cardStore.data.image.src && !showControls}
		<p class="text-xs text-center text-base-content/50 mt-2">
			タップして画像を調整
		</p>
	{/if}
</div>
