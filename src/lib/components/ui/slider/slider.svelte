<script lang="ts">
import { cn } from '$lib/utils.js';

interface Props {
  value?: number[];
  class?: string;
  type?: 'single' | 'multiple';
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
  disabled?: boolean;
}

let {
  value = $bindable([0]),
  class: className,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  disabled = false
}: Props = $props();

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement;
  const newValue = [Number(target.value)];
  value = newValue;
  onValueChange?.(newValue);
}
</script>

<div
	data-slot="slider"
	class={cn(
		"relative flex w-full touch-none items-center select-none",
		className
	)}
>
	<input
		type="range"
		{min}
		{max}
		{step}
		{disabled}
		value={value[0]}
		oninput={handleInput}
		class="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer
			[&::-webkit-slider-thumb]:appearance-none
			[&::-webkit-slider-thumb]:w-4
			[&::-webkit-slider-thumb]:h-4
			[&::-webkit-slider-thumb]:rounded-full
			[&::-webkit-slider-thumb]:bg-white
			[&::-webkit-slider-thumb]:border
			[&::-webkit-slider-thumb]:border-primary
			[&::-webkit-slider-thumb]:shadow-sm
			[&::-webkit-slider-thumb]:cursor-pointer
			[&::-moz-range-thumb]:w-4
			[&::-moz-range-thumb]:h-4
			[&::-moz-range-thumb]:rounded-full
			[&::-moz-range-thumb]:bg-white
			[&::-moz-range-thumb]:border
			[&::-moz-range-thumb]:border-primary
			[&::-moz-range-thumb]:shadow-sm
			[&::-moz-range-thumb]:cursor-pointer
			disabled:opacity-50
			disabled:cursor-not-allowed"
	/>
</div>
