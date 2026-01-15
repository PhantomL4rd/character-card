<script lang="ts">
import { RotateCw, Undo, Maximize2, Minimize2 } from 'lucide-svelte';
import { cardStore } from '$lib/stores/cardStore.svelte';
import type ImageCropper from './ImageCropper.svelte';
import { Button } from '$lib/components/ui/button';
import { Slider } from '$lib/components/ui/slider';

interface Props {
  visible: boolean;
  cropperRef: ImageCropper | undefined;
  onClose: () => void;
}

let { visible, cropperRef, onClose }: Props = $props();

const isPortrait = $derived(cardStore.data.design.orientation === 'portrait');
const hasImage = $derived(!!cardStore.data.image.src);

function handleOrientationChange(orientation: 'landscape' | 'portrait') {
  cardStore.updateOrientation(orientation);
}

function handleRotate() {
  if (!cardStore.data.image.src) return;
  const current = cardStore.data.image.rotation;
  const next = ((current + 90) % 360) as 0 | 90 | 180 | 270;
  cardStore.updateRotation(next);
}

function handleReset() {
  cropperRef?.resetPosition();
}

function handleZoomChange(value: number[]) {
  cropperRef?.setZoom(value[0]);
}

// ズーム値の取得（リアクティブに更新するためinterval使用は避ける）
let zoomValue = $state([1]);
let minZoom = $state(1);
let maxZoom = $state(10);

$effect(() => {
  if (cropperRef && visible) {
    zoomValue = [cropperRef.getZoom()];
    minZoom = cropperRef.getMinZoom();
    maxZoom = cropperRef.getMaxZoom();
  }
});
</script>

{#if visible && hasImage}
	<!-- Overlay backdrop - click to close -->
	<button
		type="button"
		class="absolute inset-0 z-20"
		onclick={onClose}
		aria-label="コントロールを閉じる"
	></button>

	<!-- Control Panel -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="absolute bottom-4 left-4 right-4 z-30 bg-background border border-border shadow-lg rounded-lg p-4 space-y-3"
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.stopPropagation()}
		role="group"
		aria-label="画像コントロール"
	>
		<!-- Orientation Toggle -->
		<div class="flex items-center gap-2">
			<Button
				size="sm"
				variant={!isPortrait ? 'default' : 'outline'}
				class="flex-1"
				onclick={() => handleOrientationChange('landscape')}
			>
				<Maximize2 class="w-4 h-4" />
				横長
			</Button>
			<Button
				size="sm"
				variant={isPortrait ? 'default' : 'outline'}
				class="flex-1"
				onclick={() => handleOrientationChange('portrait')}
			>
				<Minimize2 class="w-4 h-4" />
				縦長
			</Button>
		</div>

		<!-- Image Controls -->
		<div class="flex items-center gap-2">
			<Button
				size="sm"
				variant="outline"
				class="flex-1 gap-1"
				onclick={handleRotate}
			>
				<RotateCw class="w-4 h-4" />
				回転
			</Button>
			<Button
				size="sm"
				variant="ghost"
				class="flex-1 gap-1"
				onclick={handleReset}
			>
				<Undo class="w-4 h-4" />
				リセット
			</Button>
		</div>

		<!-- Zoom Slider -->
		<div class="flex items-center gap-3">
			<span class="text-xs text-muted-foreground min-w-[3rem]">ズーム</span>
			<Slider
				type="single"
				value={zoomValue}
				min={minZoom}
				max={maxZoom}
				step={0.1}
				onValueChange={handleZoomChange}
				class="flex-1"
			/>
		</div>
	</div>
{/if}
