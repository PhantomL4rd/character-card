<script lang="ts">
	import { Type } from 'lucide-svelte';
	import { cardStore } from '$lib/stores/cardStore.svelte';
	import { FONTS } from '$lib/data/fonts';
</script>

<div class="form-control">
	<label class="label">
		<span class="label-text font-semibold flex items-center gap-1">
			<Type class="w-4 h-4" />
			フォント
		</span>
	</label>
	<div class="flex flex-col gap-1">
		{#each FONTS as font}
			<label class="label cursor-pointer gap-2 justify-start py-1">
				<input
					type="radio"
					name="font"
					value={font.id}
					checked={cardStore.data.design.fontFamily === font.id}
					onchange={() => cardStore.updateFontFamily(font.id)}
					class="radio radio-sm"
				/>
				<span class="label-text" style="font-family: {font.fontFamily};">{font.name}</span>
			</label>
		{/each}
	</div>
</div>
