<script lang="ts">
	import { Image, Check } from 'lucide-svelte';
	import { cardStore } from '$lib/stores/cardStore.svelte';

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			cardStore.updateImage(e.target?.result as string);
		};
		reader.readAsDataURL(file);
	}
</script>

<div class="form-control">
	<label class="label">
		<span class="label-text font-semibold flex items-center gap-1">
			<Image class="w-4 h-4" />
			スクリーンショット
		</span>
	</label>
	<input
		type="file"
		accept="image/jpeg,image/png,image/webp"
		onchange={handleFileSelect}
		class="file-input file-input-bordered w-full"
	/>
	{#if cardStore.data.image.src}
		<p class="text-sm text-success mt-1 flex items-center gap-1">
			<Check class="w-4 h-4" />
			画像を読み込みました
		</p>
	{/if}
</div>
