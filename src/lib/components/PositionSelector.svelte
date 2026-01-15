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
		<Move class="w-4 h-4" />
		テキスト位置
	</label>
	<div class="grid grid-cols-3 gap-1 w-32">
		{#each verticals as v}
			{#each horizontals as h}
				<Button
					size="icon-sm"
					variant={isSelected(v, h) ? 'default' : 'ghost'}
					onclick={() => setPosition(v, h)}
				>
					<Circle class="w-3 h-3" fill="currentColor" />
				</Button>
			{/each}
		{/each}
	</div>
</div>
