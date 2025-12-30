<script lang="ts">
	import { User } from 'lucide-svelte';
	import { cardStore } from '$lib/stores/cardStore.svelte';
	import WorldSelect from '../WorldSelect.svelte';
	import ImageUploader from '../ImageUploader.svelte';
</script>

<div class="space-y-6">
	<div class="form-control">
		<label class="label" for="character-name">
			<span class="label-text font-semibold flex items-center gap-1">
				<User class="w-4 h-4" />
				キャラクター名 <span class="text-error">*</span>
			</span>
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
</div>
