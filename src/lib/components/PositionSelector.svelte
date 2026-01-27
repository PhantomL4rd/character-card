<script lang="ts">
import { Move, Circle } from 'lucide-svelte';
import { cardStore } from '$lib/stores/cardStore.svelte';
import { Button } from '$lib/components/ui/button';

const verticals = ['top', 'center', 'bottom'] as const;
const horizontals = ['left', 'center', 'right'] as const;

function setPosition(v: (typeof verticals)[number], h: (typeof horizontals)[number]) {
  cardStore.updateTextPosition(v, h);
}

function isSelected(v: string, h: string) {
  return (
    cardStore.data.design.textPosition.vertical === v &&
    cardStore.data.design.textPosition.horizontal === h
  );
}
</script>

<div class="space-y-2">
	<label class="text-sm font-medium flex items-center gap-1">
		<Move class="size-4" />
		テキスト位置
	</label>
	<div class="grid grid-cols-3 gap-1 w-32">
		{#each verticals as v}
			{#each horizontals as h}
				{@const positionLabel = `${v === 'top' ? '上' : v === 'center' ? '中央' : '下'}${h === 'left' ? '左' : h === 'center' ? '中央' : '右'}`}
				<Button
					size="icon-sm"
					variant={isSelected(v, h) ? 'default' : 'ghost'}
					onclick={() => setPosition(v, h)}
					aria-label={positionLabel}
				>
					<Circle class="size-3" fill="currentColor" />
				</Button>
			{/each}
		{/each}
	</div>
</div>
