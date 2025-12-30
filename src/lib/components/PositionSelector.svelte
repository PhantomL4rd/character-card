<script lang="ts">
	import { cardStore } from '$lib/stores/cardStore.svelte';

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

<div class="form-control">
	<label class="label">
		<span class="label-text font-semibold">テキスト位置</span>
	</label>
	<div class="grid grid-cols-3 gap-1 w-32">
		{#each verticals as v}
			{#each horizontals as h}
				<button
					type="button"
					class="btn btn-sm btn-square"
					class:btn-primary={isSelected(v, h)}
					class:btn-ghost={!isSelected(v, h)}
					onclick={() => setPosition(v, h)}
				>
					●
				</button>
			{/each}
		{/each}
	</div>
</div>
