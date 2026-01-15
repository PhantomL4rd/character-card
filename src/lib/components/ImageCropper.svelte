<script lang="ts">
import Cropper from 'svelte-easy-crop';
import type { CroppedArea } from '$lib/types/card';

interface Props {
  image: string | undefined;
  aspect: number;
  interactive?: boolean;
  onCropComplete: (area: CroppedArea) => void;
  onImageSizeChange?: (size: { width: number; height: number }) => void;
}

let { image, aspect, interactive = false, onCropComplete, onImageSizeChange }: Props = $props();

let crop = $state({ x: 0, y: 0 });
let zoom = $state(1);
let minZoom = $state(1);
let imageSize = $state<{ width: number; height: number } | null>(null);
let isResetting = $state(false);
let containerEl: HTMLDivElement | undefined = $state();
let cropSize = $state<{ width: number; height: number } | undefined>(undefined);

/**
 * 画像がクロップ領域を完全にカバーするために必要な最小ズームを計算
 */
function calcMinZoom(imgWidth: number, imgHeight: number, cropAspect: number): number {
  if (imgWidth <= 0 || imgHeight <= 0 || cropAspect <= 0) {
    return 1;
  }

  const imageAspect = imgWidth / imgHeight;

  if (imageAspect > cropAspect) {
    return Math.max(1, imageAspect / cropAspect);
  } else if (imageAspect < cropAspect) {
    return Math.max(1, cropAspect / imageAspect);
  }

  return 1;
}

function resetZoomToMin() {
  if (imageSize) {
    isResetting = true;
    const newMinZoom = Math.max(1, calcMinZoom(imageSize.width, imageSize.height, aspect));
    minZoom = newMinZoom;
    zoom = newMinZoom;
    crop = { x: 0, y: 0 };
    queueMicrotask(() => {
      isResetting = false;
    });
  }
}

function handleCropComplete(event: { pixels: CroppedArea; percent: CroppedArea }) {
  if (isResetting) return;
  onCropComplete(event.pixels);
}

// 画像読み込み時にサイズを取得してminZoomを計算
$effect(() => {
  if (image) {
    const img = new Image();
    img.onload = () => {
      imageSize = { width: img.width, height: img.height };
      onImageSizeChange?.(imageSize);
      resetZoomToMin();
    };
    img.src = image;
  }
});

// アスペクト比変更時にズームを再計算
$effect(() => {
  const _ = aspect;
  if (imageSize) {
    resetZoomToMin();
  }
});

// コンテナサイズを監視
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

// 外部からアクセス可能なメソッドをexport
export function resetPosition() {
  resetZoomToMin();
}

export function setZoom(value: number) {
  zoom = value;
}

export function getZoom() {
  return zoom;
}

export function getMinZoom() {
  return minZoom;
}

export function getMaxZoom() {
  return Math.max(10, minZoom + 5);
}
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
	:global(.reactEasyCrop_Image) {
		background: transparent !important;
		border: none !important;
		outline: none !important;
	}
	:global(.reactEasyCrop_Container *) {
		border: none !important;
		outline: none !important;
	}
	:global(.reactEasyCrop_CropAreaGrid::before),
	:global(.reactEasyCrop_CropAreaGrid::after) {
		border-color: rgba(255, 255, 255, 0.5) !important;
	}
</style>

<div class="absolute inset-0" bind:this={containerEl}>
	{#if image}
		<Cropper
			{image}
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
	{/if}
</div>
