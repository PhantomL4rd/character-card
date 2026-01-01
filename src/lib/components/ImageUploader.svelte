<script lang="ts">
	import { Image, Check, RefreshCw } from 'lucide-svelte';
	import { cardStore } from '$lib/stores/cardStore.svelte';

	let fileInput: HTMLInputElement;

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

	function triggerFileSelect() {
		fileInput?.click();
	}
</script>

<div class="form-control">
	<label class="label">
		<span class="label-text font-semibold flex items-center gap-1">
			<Image class="w-4 h-4" />
			スクリーンショット
		</span>
	</label>

	<!-- 隠しinput -->
	<input
		type="file"
		accept="image/jpeg,image/png,image/webp"
		onchange={handleFileSelect}
		bind:this={fileInput}
		class="hidden"
	/>

	{#if cardStore.data.image.src}
		<div class="flex items-center gap-2">
			<p class="text-sm text-success flex items-center gap-1">
				<Check class="w-4 h-4" />
				画像を読み込みました
			</p>
			<button type="button" class="btn btn-xs btn-ghost" onclick={triggerFileSelect}>
				<RefreshCw class="w-3 h-3" />
				変更
			</button>
		</div>
	{:else}
		<button type="button" class="btn btn-outline w-full" onclick={triggerFileSelect}>
			画像を選択
		</button>
	{/if}
</div>
