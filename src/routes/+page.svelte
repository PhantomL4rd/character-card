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

<div class="flex flex-col min-h-dvh pb-[calc(4rem+env(safe-area-inset-bottom))]">
	<!-- Header -->
	<header class="h-14 bg-primary text-primary-foreground">
		<div class="flex items-center h-full max-w-2xl mx-auto px-4 gap-2">
			<IdCard class="size-6" />
			<h1 class="text-xl font-bold text-balance">キャラカウィザード</h1>
		</div>
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
