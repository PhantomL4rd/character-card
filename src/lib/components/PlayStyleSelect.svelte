<script lang="ts">
	import { Gamepad2, Heart } from 'lucide-svelte';
	import { cardStore } from '$lib/stores/cardStore.svelte';
	import {
		CONTENT_LABELS,
		ATTITUDE_LABELS,
		type ContentType,
		type AttitudeType
	} from '$lib/types/card';

	const contentTypes = Object.entries(CONTENT_LABELS) as [ContentType, string][];
	const attitudeTypes = Object.entries(ATTITUDE_LABELS) as [AttitudeType, string][];

	const MAX_CONTENTS = 5;
	const isMaxSelected = $derived(cardStore.data.playStyle.contents.length >= MAX_CONTENTS);
</script>

<div class="space-y-4">
	<div class="form-control">
		<label class="label">
			<span class="label-text font-semibold flex items-center gap-1">
				<Gamepad2 class="w-4 h-4" />
				コンテンツ種別
				<span class="text-xs opacity-60">（最大{MAX_CONTENTS}つ）</span>
			</span>
		</label>
		<div class="flex flex-wrap gap-2">
			{#each contentTypes as [type, label]}
				{@const isSelected = cardStore.data.playStyle.contents.includes(type)}
				<button
					type="button"
					class="btn btn-sm"
					class:btn-primary={isSelected}
					class:btn-ghost={!isSelected}
					disabled={!isSelected && isMaxSelected}
					onclick={() => cardStore.toggleContent(type)}
				>
					{label}
				</button>
			{/each}
		</div>
	</div>

	<div class="form-control">
		<label class="label">
			<span class="label-text font-semibold flex items-center gap-1">
				<Heart class="w-4 h-4" />
				プレイ姿勢
			</span>
		</label>
		<div class="flex flex-wrap gap-2">
			{#each attitudeTypes as [type, label]}
				<button
					type="button"
					class="btn btn-sm"
					class:btn-primary={cardStore.data.playStyle.attitude === type}
					class:btn-ghost={cardStore.data.playStyle.attitude !== type}
					onclick={() => cardStore.updateAttitude(type)}
				>
					{label}
				</button>
			{/each}
		</div>
	</div>
</div>
