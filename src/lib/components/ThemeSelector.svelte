<script lang="ts">
	import { cardStore } from '$lib/stores/cardStore.svelte';
</script>

<div class="form-control">
	<label class="label">
		<span class="label-text font-semibold">テーマ</span>
	</label>
	<div class="flex gap-4">
		<label class="label cursor-pointer gap-2">
			<input
				type="radio"
				name="theme"
				value="dark"
				checked={cardStore.data.design.theme === 'dark'}
				onchange={() => cardStore.updateTheme('dark')}
				class="radio radio-sm"
			/>
			<span class="label-text">白文字・黒背景</span>
		</label>

		<label class="label cursor-pointer gap-2">
			<input
				type="radio"
				name="theme"
				value="light"
				checked={cardStore.data.design.theme === 'light'}
				onchange={() => cardStore.updateTheme('light')}
				class="radio radio-sm"
			/>
			<span class="label-text">黒文字・白背景</span>
		</label>
	</div>
</div>
