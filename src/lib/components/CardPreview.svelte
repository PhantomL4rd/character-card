<script lang="ts">
	import { untrack } from 'svelte';
	import { cardStore } from '$lib/stores/cardStore.svelte';
	import { CONTENT_LABELS, ATTITUDE_LABELS, DAY_LABELS, TIME_LABELS } from '$lib/types/card';
	import jobsData from '$lib/data/jobs.json';
	import Cropper from 'svelte-easy-crop';

	interface Props {
		interactive?: boolean;
		exportMode?: boolean;
	}
	let { interactive = false, exportMode = false }: Props = $props();

	let crop = $state({ x: 0, y: 0 });
	let zoom = $state(1);
	let minZoom = $state(1);
	let rotatedImageSrc = $state<string | null>(null);
	let imageSize = $state<{ width: number; height: number } | null>(null);
	let isResetting = $state(false);
	let containerEl: HTMLDivElement | undefined = $state();
	let cropSize = $state<{ width: number; height: number } | undefined>(undefined);

	const themeClasses = $derived(
		cardStore.data.design.theme === 'dark' ? 'bg-black/70 text-white' : 'bg-white/70 text-black'
	);

	const copyrightClasses = $derived(
		cardStore.data.design.theme === 'dark' ? 'text-white/60' : 'text-black/60'
	);

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
		cardStore.data.playStyle.contents.map((c) => CONTENT_LABELS[c]).join(' / ')
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
	const aspectClass = $derived(isPortrait ? 'aspect-[9/16]' : 'aspect-[16/9]');
	const aspect = $derived(isPortrait ? 9 / 16 : 16 / 9);

	// Cropperに渡す画像（回転済み）- nullの場合はundefinedに変換
	const displayImage = $derived(rotatedImageSrc ?? cardStore.data.image.src ?? undefined);

	function handleCropComplete() {
		if (isResetting) return;
		cardStore.updateImageOffset(crop.x, crop.y, zoom);
	}

	// 空白ができない最小ズームを計算
	function calcMinZoom(imgWidth: number, imgHeight: number, cropAspect: number): number {
		const imageAspect = imgWidth / imgHeight;
		// 画像がクロップ領域を完全にカバーするための最小ズーム
		if (imageAspect > cropAspect) {
			// 画像が横長 → 高さが足りないので、高さを合わせるためにズームが必要
			return imageAspect / cropAspect;
		} else {
			// 画像が縦長 → 幅が足りないので、幅を合わせるためにズームが必要
			return cropAspect / imageAspect;
		}
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
				const ctx = canvas.getContext('2d')!;

				const isRotated90or270 = degrees === 90 || degrees === 270;
				canvas.width = isRotated90or270 ? img.height : img.width;
				canvas.height = isRotated90or270 ? img.width : img.height;

				ctx.translate(canvas.width / 2, canvas.height / 2);
				ctx.rotate((degrees * Math.PI) / 180);
				ctx.drawImage(img, -img.width / 2, -img.height / 2);

				resolve({
					src: canvas.toDataURL('image/jpeg', 0.9),
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
			// untrackでストア更新を依存関係から除外し、無限ループを防ぐ
			untrack(() => {
				cardStore.updateImageOffset(0, 0, newMinZoom);
			});
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
				}
			}
		});

		observer.observe(containerEl);
		return () => observer.disconnect();
	});
</script>

<style>
	/* svelte-easy-cropの暗いオーバーレイと枠を非表示（グリッド線は表示） */
	:global(.reactEasyCrop_Container) {
		overflow: hidden !important;
	}
	:global(.reactEasyCrop_CropArea) {
		border: none !important;
		box-shadow: 0 0 0 9999px transparent !important;
		color: transparent !important;
	}
	/* グリッド線は表示する（補助線として活用） */
	:global(.reactEasyCrop_CropAreaGrid::before),
	:global(.reactEasyCrop_CropAreaGrid::after) {
		border-color: rgba(255, 255, 255, 0.5) !important;
	}
</style>

<div class="space-y-2">
	<div
		id={exportMode ? 'card-preview' : undefined}
		class="relative overflow-hidden rounded-lg shadow-xl {aspectClass} bg-base-300"
		bind:this={containerEl}
	>
		{#if cardStore.data.image.src}
			<!-- Cropperを常に使用（エクスポート時はグリッド非表示） -->
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
					showGrid={interactive && !exportMode}
					oncropcomplete={handleCropComplete}
				/>
			</div>
		{:else}
			<div class="absolute inset-0 flex items-center justify-center text-base-content/50">
				<span class="text-sm">画像をアップロードしてください</span>
			</div>
		{/if}

		<!-- テキストオーバーレイ -->
		{#if cardStore.data.characterName}
			<div class="absolute inset-0 flex p-4 {positionClasses()} pointer-events-none z-10">
				<div class="{themeClasses} p-2 rounded-lg backdrop-blur-sm max-w-[85%]">
					<h2 class="text-sm font-bold">{cardStore.data.characterName}</h2>

					{#if cardStore.data.world && cardStore.data.dataCenter}
						<p class="text-[8px] opacity-80">{cardStore.data.world} @ {cardStore.data.dataCenter}</p>
					{/if}

					{#if selectedJobs.length > 0}
						<div class="flex flex-wrap gap-0.5 mt-1">
							{#each selectedJobs as job}
								<img
									src="/icons/jobs/{job.nameEn}.png"
									alt={job.name}
									class="w-2 h-2"
									title={job.name}
								/>
							{/each}
						</div>
					{/if}

					{#if hasPlayStyle}
						<div class="text-[8px] mt-1 opacity-90">
							{#if attitudeLabel}
								<span class="mr-2 font-medium">{attitudeLabel}</span>
							{/if}
							{#if contentLabels}
								<span>{contentLabels}</span>
							{/if}
						</div>
					{/if}

					{#if hasLoginTime}
						<div class="text-[8px] mt-0.5 opacity-80">
							{dayLabels}
							{#if dayLabels && timeLabels}・{/if}
							{timeLabels}
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<div class="absolute bottom-2 right-2 text-[6px] {copyrightClasses} pointer-events-none z-10">
			© SQUARE ENIX
		</div>
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
				<button type="button" class="btn btn-sm btn-outline flex-1" onclick={rotateImage}>
					🔄 画像回転
				</button>
				<button type="button" class="btn btn-sm btn-ghost flex-1" onclick={resetPosition}>
					↩️ リセット
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
