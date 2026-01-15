<script lang="ts">
import { Image, Check, RefreshCw } from 'lucide-svelte';
import { cardStore } from '$lib/stores/cardStore.svelte';
import { Button } from '$lib/components/ui/button';

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

<div class="space-y-2">
	<label class="text-sm font-medium flex items-center gap-1">
		<Image class="w-4 h-4" />
		スクリーンショット
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
			<p class="text-sm text-green-600 flex items-center gap-1">
				<Check class="w-4 h-4" />
				画像を読み込みました
			</p>
			<Button variant="ghost" size="sm" onclick={triggerFileSelect}>
				<RefreshCw class="w-3 h-3" />
				変更
			</Button>
		</div>
	{:else}
		<Button variant="outline" class="w-full" onclick={triggerFileSelect}>
			画像を選択
		</Button>
	{/if}
</div>
