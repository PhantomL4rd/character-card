<script lang="ts">
	import { cardStore } from '$lib/stores/cardStore.svelte';
	import ImageUploader from './ImageUploader.svelte';
	import WorldSelect from './WorldSelect.svelte';
	import JobSelect from './JobSelect.svelte';
	import PlayStyleSelect from './PlayStyleSelect.svelte';
	import LoginTimeSelect from './LoginTimeSelect.svelte';
	import ThemeSelector from './ThemeSelector.svelte';
	import PositionSelector from './PositionSelector.svelte';
</script>

<div class="space-y-6">
	<div class="form-control">
		<label class="label" for="character-name">
			<span class="label-text font-semibold">キャラクター名 <span class="text-error">*</span></span>
		</label>
		<input
			id="character-name"
			type="text"
			placeholder="Firstname Lastname"
			class="input input-bordered w-full"
			value={cardStore.data.characterName}
			oninput={(e) => cardStore.updateCharacterName(e.currentTarget.value)}
		/>
	</div>

	<WorldSelect />

	<ImageUploader />

	<div class="divider">プレイスタイル</div>

	<PlayStyleSelect />

	<JobSelect />

	<div class="divider">ログイン時間</div>

	<LoginTimeSelect />

	<div class="divider">デザイン</div>

	<div class="flex flex-wrap gap-6">
		<ThemeSelector />
		<PositionSelector />
	</div>
</div>
