<script lang="ts">
import { SunMoon } from 'lucide-svelte';
import { cardStore } from '$lib/stores/cardStore.svelte';
</script>

<div class="space-y-2">
	<label class="text-sm font-medium flex items-center gap-1">
		<SunMoon class="w-4 h-4" />
		テーマ
	</label>
	<div class="flex gap-4">
		<label class="flex items-center gap-2 cursor-pointer">
			<input
				type="radio"
				name="theme"
				value="dark"
				checked={cardStore.data.design.theme === 'dark'}
				onchange={() => cardStore.updateTheme('dark')}
				class="h-4 w-4 rounded-full border border-primary text-primary focus:ring-2 focus:ring-ring"
			/>
			<span class="text-sm">白文字・黒背景</span>
		</label>

		<label class="flex items-center gap-2 cursor-pointer">
			<input
				type="radio"
				name="theme"
				value="light"
				checked={cardStore.data.design.theme === 'light'}
				onchange={() => cardStore.updateTheme('light')}
				class="h-4 w-4 rounded-full border border-primary text-primary focus:ring-2 focus:ring-ring"
			/>
			<span class="text-sm">黒文字・白背景</span>
		</label>
	</div>
</div>
