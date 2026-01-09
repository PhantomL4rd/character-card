<script lang="ts">
	import { cardStore } from '$lib/stores/cardStore.svelte';
	import ThemeSelector from '../ThemeSelector.svelte';
	import PositionSelector from '../PositionSelector.svelte';
	import FontSelector from '../FontSelector.svelte';

	interface Props {
		isExporting: boolean;
		exportError: string | null;
		onExport: () => void;
	}

	const { isExporting, exportError, onExport }: Props = $props();
</script>

<div class="space-y-6">
	<div class="flex flex-col gap-4">
		<ThemeSelector />
		<PositionSelector />
		<FontSelector />
	</div>

	{#if exportError}
		<div class="alert alert-error">
			<span>{exportError}</span>
		</div>
	{/if}

	<button
		type="button"
		class="btn btn-primary w-full"
		disabled={!cardStore.canExport || isExporting}
		onclick={onExport}
	>
		{#if isExporting}
			<span class="loading loading-spinner loading-sm"></span>
			生成中...
		{:else}
			ダウンロード
		{/if}
	</button>

	{#if !cardStore.canExport}
		<p class="text-sm text-center text-base-content/60">
			{cardStore.missingRequirements.join('と')}を入力してください
		</p>
	{/if}
</div>
