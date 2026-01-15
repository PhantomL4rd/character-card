<script lang="ts">
import { cardStore } from '$lib/stores/cardStore.svelte';
import { Check } from 'lucide-svelte';

// 進捗計算: キャラクター名で50%、画像で50%
const progress = $derived(() => {
  let value = 0;
  if (cardStore.data.characterName.trim().length > 0) value += 50;
  if (cardStore.data.image.src !== null) value += 50;
  return value;
});

const isComplete = $derived(progress() === 100);
</script>

<div class="space-y-2">
	<!-- Progress Bar -->
	<div class="flex items-center gap-3">
		<div class="flex-1 h-2 bg-muted rounded-full overflow-hidden">
			<div
				class="h-full rounded-full transition-all duration-300 ease-out"
				class:bg-primary={!isComplete}
				class:bg-green-500={isComplete}
				style="width: {progress()}%"
			></div>
		</div>
		<span class="text-sm font-medium min-w-[3rem] text-right">
			{#if isComplete}
				<span class="text-green-500 flex items-center gap-1">
					<Check class="w-4 h-4" />
					完了
				</span>
			{:else}
				{progress()}%
			{/if}
		</span>
	</div>

	<!-- Missing Requirements -->
	{#if !cardStore.canExport && cardStore.missingRequirements.length > 0}
		<p class="text-sm text-muted-foreground">
			{cardStore.missingRequirements.join('と')}が必要です
		</p>
	{/if}
</div>
