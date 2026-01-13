<script lang="ts">
	import { slide } from 'svelte/transition';
	import { ChevronDown, AlertCircle } from 'lucide-svelte';
	import type { Snippet, ComponentType } from 'svelte';

	interface Props {
		id: string;
		title: string;
		icon: ComponentType;
		isExpanded: boolean;
		hasWarning?: boolean;
		children: Snippet;
		onToggle: () => void;
	}

	let {
		id,
		title,
		icon: Icon,
		isExpanded,
		hasWarning = false,
		children,
		onToggle
	}: Props = $props();
</script>

<div class="bg-base-100 border border-base-300 overflow-hidden">
	<!-- Header / Toggle Button -->
	<button
		type="button"
		class="w-full flex items-center justify-between p-4 text-left hover:bg-base-200/50 transition-colors duration-150"
		aria-expanded={isExpanded}
		aria-controls="accordion-content-{id}"
		onclick={onToggle}
	>
		<div class="flex items-center gap-3">
			<Icon class="w-5 h-5 text-primary" />
			<span class="font-semibold text-base">{title}</span>
			{#if hasWarning}
				<span class="text-warning" title="未入力の必須項目があります">
					<AlertCircle class="w-4 h-4" />
				</span>
			{/if}
		</div>
		<ChevronDown
			class="w-5 h-5 text-base-content/60 transition-transform duration-300"
			style="transform: rotate({isExpanded ? 180 : 0}deg)"
		/>
	</button>

	<!-- Content -->
	{#if isExpanded}
		<div
			id="accordion-content-{id}"
			class="px-4 pb-4"
			transition:slide={{ duration: 300 }}
		>
			{@render children()}
		</div>
	{/if}
</div>
