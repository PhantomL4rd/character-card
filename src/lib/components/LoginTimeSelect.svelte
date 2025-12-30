<script lang="ts">
	import { cardStore } from '$lib/stores/cardStore.svelte';
	import { DAY_LABELS, TIME_LABELS, type DayType, type TimeType } from '$lib/types/card';

	const dayTypes = Object.entries(DAY_LABELS) as [DayType, string][];
	const timeTypes = Object.entries(TIME_LABELS) as [TimeType, string][];
</script>

<div class="space-y-4">
	<div class="form-control">
		<label class="label">
			<span class="label-text font-semibold">ログイン曜日</span>
		</label>
		<div class="flex flex-wrap gap-2">
			{#each dayTypes as [type, label]}
				<button
					type="button"
					class="btn btn-sm"
					class:btn-primary={cardStore.data.loginTime.days.includes(type)}
					class:btn-ghost={!cardStore.data.loginTime.days.includes(type)}
					onclick={() => cardStore.toggleDay(type)}
				>
					{label}
				</button>
			{/each}
		</div>
	</div>

	<div class="form-control">
		<label class="label">
			<span class="label-text font-semibold">ログイン時間帯</span>
		</label>
		<div class="flex flex-wrap gap-2">
			{#each timeTypes as [type, label]}
				<button
					type="button"
					class="btn btn-sm"
					class:btn-primary={cardStore.data.loginTime.times.includes(type)}
					class:btn-ghost={!cardStore.data.loginTime.times.includes(type)}
					onclick={() => cardStore.toggleTime(type)}
				>
					{label}
				</button>
			{/each}
		</div>
	</div>
</div>
