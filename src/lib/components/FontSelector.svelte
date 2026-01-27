<script lang="ts">
import { Type } from 'lucide-svelte';
import { cardStore } from '$lib/stores/cardStore.svelte';
import { FONTS } from '$lib/data/fonts';
</script>

<div class="space-y-2">
	<label class="text-sm font-medium flex items-center gap-1">
		<Type class="size-4" />
		フォント
	</label>
	<div class="flex flex-col gap-1">
		{#each FONTS as font}
			<label class="flex items-center gap-2 cursor-pointer py-1">
				<input
					type="radio"
					name="font"
					value={font.id}
					checked={cardStore.data.design.fontFamily === font.id}
					onchange={() => cardStore.updateFontFamily(font.id)}
					class="size-4 rounded-full border border-primary text-primary focus:ring-2 focus:ring-ring"
				/>
				<span class="text-sm" style="font-family: {font.fontFamily};">{font.name}</span>
			</label>
		{/each}
	</div>
</div>
