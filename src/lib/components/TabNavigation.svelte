<script lang="ts">
	interface Props {
		currentStep: number;
		onStepChange: (step: number) => void;
	}

	const { currentStep, onStepChange }: Props = $props();

	const tabs = [
		{ index: 0, label: '基本' },
		{ index: 1, label: 'スタイル' },
		{ index: 2, label: '時間' },
		{ index: 3, label: '出力' }
	];
</script>

<div class="btm-nav btm-nav-sm bg-base-200 border-t border-base-300 z-20">
	{#each tabs as tab}
		<button
			type="button"
			class="text-sm"
			class:active={currentStep === tab.index}
			onclick={() => onStepChange(tab.index)}
		>
			<span class="text-xs">{tab.label}</span>
		</button>
	{/each}
</div>
