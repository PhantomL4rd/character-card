<script lang="ts">
import { Calendar, Clock } from 'lucide-svelte';
import { cardStore } from '$lib/stores/cardStore.svelte';
import type { DayType, TimeType } from '$lib/types/card';
import { DAY_LABELS, TIME_LABELS } from '$lib/data/labels';
import { Button } from '$lib/components/ui/button';

const dayTypes = Object.entries(DAY_LABELS) as [DayType, string][];
const timeTypes = Object.entries(TIME_LABELS) as [TimeType, string][];
</script>

<div class="space-y-4">
	<div class="space-y-2">
		<label class="text-sm font-medium flex items-center gap-1">
			<Calendar class="size-4" />
			ログイン曜日
		</label>
		<div class="flex flex-wrap gap-2">
			{#each dayTypes as [type, label]}
				<Button
					size="sm"
					variant={cardStore.data.loginTime.days.includes(type) ? 'default' : 'ghost'}
					onclick={() => cardStore.toggleDay(type)}
				>
					{label}
				</Button>
			{/each}
		</div>
	</div>

	<div class="space-y-2">
		<label class="text-sm font-medium flex items-center gap-1">
			<Clock class="size-4" />
			ログイン時間帯
		</label>
		<div class="flex flex-wrap gap-2">
			{#each timeTypes as [type, label]}
				<Button
					size="sm"
					variant={cardStore.data.loginTime.times.includes(type) ? 'default' : 'ghost'}
					onclick={() => cardStore.toggleTime(type)}
				>
					{label}
				</Button>
			{/each}
		</div>
	</div>
</div>
