<script lang="ts">
	import { User, Palette, Clock, Download } from 'lucide-svelte';

	interface Props {
		currentStep: number;
		onStepChange: (step: number) => void;
	}

	const { currentStep, onStepChange }: Props = $props();

	const tabs = [
		{ index: 0, label: '基本', icon: User },
		{ index: 1, label: 'スタイル', icon: Palette },
		{ index: 2, label: '時間', icon: Clock },
		{ index: 3, label: '出力', icon: Download }
	];
</script>

<div class="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pb-[env(safe-area-inset-bottom)]">
	<div class="container mx-auto px-4">
		<div class="flex justify-center items-center h-16">
			<div class="flex space-x-8">
				{#each tabs as tab}
					<button
						type="button"
						class="flex flex-col items-center justify-center p-2 rounded-lg min-w-[80px] {currentStep === tab.index ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent'}"
						onclick={() => onStepChange(tab.index)}
					>
						<tab.icon class="size-6 mb-1" />
						<span class="text-xs font-medium">{tab.label}</span>
					</button>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	button {
		user-select: none;
		-webkit-user-select: none;
	}

	button:active {
		transform: scale(0.95);
	}

	button:focus-visible {
		outline: 2px solid hsl(var(--primary));
		outline-offset: 2px;
	}
</style>
