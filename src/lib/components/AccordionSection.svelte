<script lang="ts">
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

let { id, title, icon: Icon, isExpanded, hasWarning = false, children, onToggle }: Props = $props();
</script>

<div class="bg-card border border-border rounded-lg overflow-hidden">
	<!-- Header / Toggle Button -->
	<button
		type="button"
		class="w-full flex items-center justify-between p-4 text-left hover:bg-accent/50"
		aria-expanded={isExpanded}
		aria-controls="accordion-content-{id}"
		onclick={onToggle}
	>
		<div class="flex items-center gap-3">
			<Icon class="size-5 text-primary" />
			<span class="font-semibold text-base">{title}</span>
			{#if hasWarning}
				<span class="text-amber-500" title="未入力の必須項目があります">
					<AlertCircle class="size-4" />
				</span>
			{/if}
		</div>
		<ChevronDown
			class="size-5 text-muted-foreground transition-transform duration-200"
			style="transform: rotate({isExpanded ? 180 : 0}deg)"
		/>
	</button>

	<!-- Content -->
	{#if isExpanded}
		<div
			id="accordion-content-{id}"
			class="accordion-content px-4 pb-4"
		>
			{@render children()}
		</div>
	{/if}
</div>

<style>
	.accordion-content {
		animation: accordion-open 200ms ease-out;
	}

	@keyframes accordion-open {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
