<script lang="ts">
import { Gamepad2, Heart } from 'lucide-svelte';
import { cardStore } from '$lib/stores/cardStore.svelte';
import type { ContentType, AttitudeType } from '$lib/types/card';
import { CONTENT_LABELS, ATTITUDE_LABELS } from '$lib/data/labels';
import { Button } from '$lib/components/ui/button';

const contentTypes = Object.entries(CONTENT_LABELS) as [ContentType, string][];
const attitudeTypes = Object.entries(ATTITUDE_LABELS) as [AttitudeType, string][];

const MAX_CONTENTS = 5;
const isMaxSelected = $derived(cardStore.data.playStyle.contents.length >= MAX_CONTENTS);
</script>

<div class="space-y-4">
	<div class="space-y-2">
		<label class="text-sm font-medium flex items-center gap-1">
			<Gamepad2 class="w-4 h-4" />
			コンテンツ種別
			<span class="text-xs text-muted-foreground">（最大{MAX_CONTENTS}つ）</span>
		</label>
		<div class="flex flex-wrap gap-2">
			{#each contentTypes as [type, label]}
				{@const isSelected = cardStore.data.playStyle.contents.includes(type)}
				<Button
					size="sm"
					variant={isSelected ? 'default' : 'ghost'}
					disabled={!isSelected && isMaxSelected}
					onclick={() => cardStore.toggleContent(type)}
				>
					{label}
				</Button>
			{/each}
		</div>
	</div>

	<div class="space-y-2">
		<label class="text-sm font-medium flex items-center gap-1">
			<Heart class="w-4 h-4" />
			プレイ姿勢
		</label>
		<div class="flex flex-wrap gap-2">
			{#each attitudeTypes as [type, label]}
				<Button
					size="sm"
					variant={cardStore.data.playStyle.attitude === type ? 'default' : 'ghost'}
					onclick={() => cardStore.updateAttitude(type)}
				>
					{label}
				</Button>
			{/each}
		</div>
	</div>
</div>
