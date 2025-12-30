<script lang="ts">
	import CardPreview from './CardPreview.svelte';
	import StepBasicInfo from './steps/StepBasicInfo.svelte';
	import StepPlayStyle from './steps/StepPlayStyle.svelte';
	import StepLoginTime from './steps/StepLoginTime.svelte';
	import StepDesign from './steps/StepDesign.svelte';

	interface Props {
		currentStep: number;
		isExporting: boolean;
		exportError: string | null;
		onExport: () => void;
	}

	const { currentStep, isExporting, exportError, onExport }: Props = $props();
</script>

<div class="p-4 space-y-4">
	<!-- プレビュー -->
	<div class="max-w-md mx-auto">
		<CardPreview interactive={true} exportMode={false} />
	</div>

	<!-- ステップコンテンツ -->
	{#if currentStep === 0}
		<StepBasicInfo />
	{:else if currentStep === 1}
		<StepPlayStyle />
	{:else if currentStep === 2}
		<StepLoginTime />
	{:else if currentStep === 3}
		<StepDesign {isExporting} {exportError} {onExport} />
	{/if}
</div>
