<script lang="ts">
	import { tick } from 'svelte';
	import { cardStore } from '$lib/stores/cardStore.svelte';
	import { exportCardAsImage } from '$lib/utils/imageExport';
	import InputForm from '$lib/components/InputForm.svelte';
	import CardPreview from '$lib/components/CardPreview.svelte';

	let isExporting = $state(false);
	let exportError = $state<string | null>(null);
	let isInteractive = $state(true);

	async function handleExport() {
		if (!cardStore.canExport) return;

		isExporting = true;
		exportError = null;

		try {
			// エクスポート時は静的モードに切り替え（グリッド線を非表示にする）
			isInteractive = false;
			await tick(); // DOMの更新を待つ

			await exportCardAsImage();
		} catch (e) {
			exportError = e instanceof Error ? e.message : '画像の生成に失敗しました';
		} finally {
			// エクスポート後はインタラクティブモードに戻す
			isInteractive = true;
			isExporting = false;
		}
	}
</script>

<svelte:head>
	<title>FF14 Character Card Generator</title>
</svelte:head>

<div class="container mx-auto p-4 max-w-6xl">
	<header class="text-center mb-8">
		<h1 class="text-2xl font-bold">FF14 Character Card</h1>
		<p class="text-base-content/70 text-sm mt-1">キャラクターカードを作成してSNSで共有しよう</p>
	</header>

	<div class="flex flex-col md:flex-row gap-8">
		<div class="w-full md:w-1/2">
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<InputForm />
				</div>
			</div>
		</div>

		<div class="w-full md:w-1/2">
			<div class="md:sticky md:top-4 space-y-4">
				<CardPreview interactive={isInteractive} />

				{#if exportError}
					<div class="alert alert-error">
						<span>{exportError}</span>
					</div>
				{/if}

				<button
					type="button"
					class="btn btn-primary w-full"
					disabled={!cardStore.canExport || isExporting}
					onclick={handleExport}
				>
					{#if isExporting}
						<span class="loading loading-spinner loading-sm"></span>
						生成中...
					{:else}
						📥 ダウンロード
					{/if}
				</button>

				{#if !cardStore.canExport}
					<p class="text-sm text-center text-base-content/60">
						キャラクター名を入力してください
					</p>
				{/if}
			</div>
		</div>
	</div>

	<footer class="text-center mt-12 text-sm text-base-content/50">
		<p>FINAL FANTASY XIV © SQUARE ENIX CO., LTD. All Rights Reserved.</p>
	</footer>
</div>
