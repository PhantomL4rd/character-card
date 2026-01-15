<script lang="ts">
import CardPreview from './CardPreview.svelte';
import ProgressIndicator from './ProgressIndicator.svelte';
import StepBasicInfo from './steps/StepBasicInfo.svelte';
import StepPlayStyle from './steps/StepPlayStyle.svelte';
import StepLoginTime from './steps/StepLoginTime.svelte';
import StepDesign from './steps/StepDesign.svelte';
import { cardStore } from '$lib/stores/cardStore.svelte';

interface Props {
  currentStep: number;
  isExporting: boolean;
  exportError: string | null;
  onExport: () => void;
}

const { currentStep, isExporting, exportError, onExport }: Props = $props();

const isPortrait = $derived(cardStore.data.design.orientation === 'portrait');
</script>

<div class="p-4 space-y-4">
	<!-- プレビュー -->
	<div class={isPortrait ? 'max-w-md mx-auto' : 'max-w-2xl mx-auto'}>
		<CardPreview interactive={true} />
	</div>

	<!-- 進捗表示 -->
	<ProgressIndicator />

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
