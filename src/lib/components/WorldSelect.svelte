<script lang="ts">
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

<div class="form-control">
	<label class="label">
		<span class="label-text font-semibold">データセンター / World</span>
	</label>
	<div class="flex gap-2">
		<select
			class="select select-bordered flex-1"
			value={cardStore.data.dataCenter}
			onchange={handleDCChange}
		>
			<option value="">DCを選択</option>
			{#each worldsData.dataCenters as dc}
				<option value={dc.name}>{dc.name} ({dc.region})</option>
			{/each}
		</select>

		<select
			class="select select-bordered flex-1"
			value={cardStore.data.world}
			onchange={handleWorldChange}
			disabled={!cardStore.data.dataCenter}
		>
			<option value="">Worldを選択</option>
			{#each availableWorlds as world}
				<option value={world}>{world}</option>
			{/each}
		</select>
	</div>
</div>
