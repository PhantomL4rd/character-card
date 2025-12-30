<script lang="ts">
	import { cardStore } from '$lib/stores/cardStore.svelte';
	import {
		CONTENT_LABELS,
		ATTITUDE_LABELS,
		type ContentType,
		type AttitudeType
	} from '$lib/types/card';

	const contentTypes = Object.entries(CONTENT_LABELS) as [ContentType, string][];
	const attitudeTypes = Object.entries(ATTITUDE_LABELS) as [AttitudeType, string][];
</script>

<div class="space-y-4">
	<div class="form-control">
		<label class="label">
			<span class="label-text font-semibold">コンテンツ種別</span>
		</label>
		<div class="flex flex-wrap gap-2">
			{#each contentTypes as [type, label]}
				<button
					type="button"
					class="btn btn-sm"
					class:btn-primary={cardStore.data.playStyle.contents.includes(type)}
					class:btn-ghost={!cardStore.data.playStyle.contents.includes(type)}
					onclick={() => cardStore.toggleContent(type)}
				>
					{label}
				</button>
			{/each}
		</div>
	</div>

	<div class="form-control">
		<label class="label">
			<span class="label-text font-semibold">プレイ姿勢</span>
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
