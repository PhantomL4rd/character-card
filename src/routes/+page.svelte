<script lang="ts">
	import { tick } from 'svelte';
	import { cardStore } from '$lib/stores/cardStore.svelte';
	import { exportCardAsImage } from '$lib/utils/imageExport';
	import CardPreview from '$lib/components/CardPreview.svelte';
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
			await tick(); // DOMの更新を待つ
			await exportCardAsImage();
		} catch (e) {
			exportError = e instanceof Error ? e.message : '画像の生成に失敗しました';
		} finally {
			isExporting = false;
		}
	}
</script>

<svelte:head>
	<title>FF14 Character Card Generator</title>
</svelte:head>

<div class="flex flex-col min-h-screen pb-16">
	<!-- Form: スクロール可能 -->
	<div class="flex-1">
		<WizardForm
			{currentStep}
			{isExporting}
			{exportError}
			onExport={handleExport}
		/>
	</div>

	<!-- Tabs: 画面下部に固定 -->
	<TabNavigation {currentStep} onStepChange={handleStepChange} />
</div>

<!-- エクスポート用の非表示CardPreview（フルサイズ） -->
<div class="fixed -left-[9999px] top-0">
	<div class="w-[640px]">
		<CardPreview interactive={false} exportMode={true} />
	</div>
</div>
