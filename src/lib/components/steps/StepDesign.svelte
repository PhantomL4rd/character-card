<script lang="ts">
import { Download, Loader2 } from 'lucide-svelte';
import { cardStore } from '$lib/stores/cardStore.svelte';
import ThemeSelector from '../ThemeSelector.svelte';
import PositionSelector from '../PositionSelector.svelte';
import FontSelector from '../FontSelector.svelte';
import { Button } from '$lib/components/ui/button';

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
		<div class="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
			{exportError}
		</div>
	{/if}

	<Button
		class="w-full"
		disabled={!cardStore.canExport || isExporting}
		onclick={onExport}
	>
		{#if isExporting}
			<Loader2 class="w-5 h-5 animate-spin" />
			生成中...
		{:else}
			<Download class="w-5 h-5" />
			ダウンロード
		{/if}
	</Button>

	{#if !cardStore.canExport}
		<p class="text-sm text-center text-muted-foreground">
			{cardStore.missingRequirements.join('と')}を入力してください
		</p>
	{/if}
</div>
