<script lang="ts">
import { Globe, ChevronDown } from 'lucide-svelte';
import { cardStore } from '$lib/stores/cardStore.svelte';
import worldsData from '$lib/data/worlds.json';

const selectedDC = $derived(
  worldsData.dataCenters.find((dc) => dc.name === cardStore.data.dataCenter)
);
const availableWorlds = $derived(selectedDC?.worlds ?? []);

function handleDCChange(event: Event) {
  const dc = (event.target as HTMLSelectElement).value;
  cardStore.updateDataCenter(dc);
}

function handleWorldChange(event: Event) {
  const world = (event.target as HTMLSelectElement).value;
  cardStore.updateWorld(world);
}
</script>

<div class="space-y-2">
	<label class="text-sm font-medium flex items-center gap-1">
		<Globe class="w-4 h-4" />
		データセンター / World
	</label>
	<div class="flex gap-2">
		<div class="relative flex-1">
			<select
				class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring appearance-none pr-8"
				value={cardStore.data.dataCenter}
				onchange={handleDCChange}
			>
				<option value="">DCを選択</option>
				{#each worldsData.dataCenters as dc}
					<option value={dc.name}>{dc.name} ({dc.region})</option>
				{/each}
			</select>
			<ChevronDown class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
		</div>

		<div class="relative flex-1">
			<select
				class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring appearance-none pr-8 disabled:cursor-not-allowed disabled:opacity-50"
				value={cardStore.data.world}
				onchange={handleWorldChange}
				disabled={!cardStore.data.dataCenter}
			>
				<option value="">Worldを選択</option>
				{#each availableWorlds as world}
					<option value={world}>{world}</option>
				{/each}
			</select>
			<ChevronDown class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
		</div>
	</div>
</div>
