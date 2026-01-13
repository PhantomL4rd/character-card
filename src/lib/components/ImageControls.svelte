<script lang="ts">
	import { RotateCw, Undo } from 'lucide-svelte';

	interface Props {
		isPortrait: boolean;
		hasImage: boolean;
		zoom: number;
		minZoom: number;
		maxZoom: number;
		onOrientationChange: (orientation: 'landscape' | 'portrait') => void;
		onRotate: () => void;
		onReset: () => void;
		onZoomChange: (zoom: number) => void;
	}

	let {
		isPortrait,
		hasImage,
		zoom,
		minZoom,
		maxZoom,
		onOrientationChange,
		onRotate,
		onReset,
		onZoomChange
	}: Props = $props();
</script>

<!-- カードの向き切替 -->
<div class="flex items-center gap-2">
	<button
		type="button"
		class="btn btn-sm flex-1"
		class:btn-primary={!isPortrait}
		class:btn-outline={isPortrait}
		onclick={() => onOrientationChange('landscape')}
	>
		横長
	</button>
	<button
		type="button"
		class="btn btn-sm flex-1"
		class:btn-primary={isPortrait}
		class:btn-outline={!isPortrait}
		onclick={() => onOrientationChange('portrait')}
	>
		縦長
	</button>
</div>

{#if hasImage}
	<!-- 画像操作 -->
	<div class="flex items-center gap-2">
		<button type="button" class="btn btn-sm btn-outline flex-1 gap-1" onclick={onRotate}>
			<RotateCw class="w-4 h-4" />
			画像回転
		</button>
		<button type="button" class="btn btn-sm btn-ghost flex-1 gap-1" onclick={onReset}>
			<Undo class="w-4 h-4" />
			リセット
		</button>
	</div>
	<div class="flex items-center gap-2">
		<span class="text-xs">ズーム</span>
		<input
			type="range"
			min={minZoom}
			max={maxZoom}
			step="0.1"
			value={zoom}
			oninput={(e) => onZoomChange(Number(e.currentTarget.value))}
			class="range range-xs flex-1"
		/>
	</div>
{/if}
