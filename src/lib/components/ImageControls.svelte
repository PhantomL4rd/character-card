<script lang="ts">
import { RotateCw, Undo } from 'lucide-svelte';
import { Button } from '$lib/components/ui/button';
import { Slider } from '$lib/components/ui/slider';

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

function handleZoomChange(value: number[]) {
  onZoomChange(value[0]);
}
</script>

<!-- カードの向き切替 -->
<div class="flex items-center gap-2">
	<Button
		size="sm"
		variant={!isPortrait ? 'default' : 'outline'}
		class="flex-1"
		onclick={() => onOrientationChange('landscape')}
	>
		横長
	</Button>
	<Button
		size="sm"
		variant={isPortrait ? 'default' : 'outline'}
		class="flex-1"
		onclick={() => onOrientationChange('portrait')}
	>
		縦長
	</Button>
</div>

{#if hasImage}
	<!-- 画像操作 -->
	<div class="flex items-center gap-2">
		<Button size="sm" variant="outline" class="flex-1 gap-1" onclick={onRotate}>
			<RotateCw class="size-4" />
			画像回転
		</Button>
		<Button size="sm" variant="ghost" class="flex-1 gap-1" onclick={onReset}>
			<Undo class="size-4" />
			リセット
		</Button>
	</div>
	<div class="flex items-center gap-2">
		<span class="text-xs text-muted-foreground">ズーム</span>
		<Slider
			type="single"
			value={[zoom]}
			min={minZoom}
			max={maxZoom}
			step={0.1}
			onValueChange={handleZoomChange}
			class="flex-1"
		/>
	</div>
{/if}
