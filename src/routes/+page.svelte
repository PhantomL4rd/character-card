<script lang="ts">
import { IdCard } from 'lucide-svelte';
import { cardStore } from '$lib/stores/cardStore.svelte';
import { exportCardAsImage } from '$lib/utils/imageExport';
import WizardForm from '$lib/components/WizardForm.svelte';
import TabNavigation from '$lib/components/TabNavigation.svelte';

let currentStep = $state(0);
let isExporting = $state(false);
let exportError = $state<string | null>(null);

function handleStepChange(step: number) {
  currentStep = step;
}

async function handleExport() {
  if (!cardStore.canExport) return;

  isExporting = true;
  exportError = null;

  try {
    await exportCardAsImage({ cardData: cardStore.data });
  } catch (e) {
    exportError = e instanceof Error ? e.message : '画像の生成に失敗しました';
  } finally {
    isExporting = false;
  }
}
</script>

<svelte:head>
	<title>キャラカウィザード</title>
</svelte:head>

<div class="flex flex-col min-h-screen pb-16">
	<!-- Header -->
	<header class="flex items-center h-14 bg-primary text-primary-foreground px-4 gap-2">
		<IdCard class="w-6 h-6" />
		<h1 class="text-xl font-bold">キャラカウィザード</h1>
	</header>

	<!-- Form: スクロール可能 -->
	<div class="flex-1">
		<WizardForm
			{currentStep}
			{isExporting}
			{exportError}
			onExport={handleExport}
		/>
	</div>

	<!-- Footer: Copyright -->
	<footer class="text-center text-xs text-muted-foreground py-2">
		© SQUARE ENIX
	</footer>

	<!-- Tabs: 画面下部に固定 -->
	<TabNavigation {currentStep} onStepChange={handleStepChange} />
</div>
