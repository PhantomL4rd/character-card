<script lang="ts">
import { User } from 'lucide-svelte';
import { cardStore } from '$lib/stores/cardStore.svelte';
import WorldSelect from '../WorldSelect.svelte';
import ImageUploader from '../ImageUploader.svelte';
import { Input } from '$lib/components/ui/input';
</script>

<div class="space-y-6">
	<div class="space-y-2">
		<label class="text-sm font-medium flex items-center gap-1" for="character-name">
			<User class="w-4 h-4" />
			キャラクター名 <span class="text-destructive">*</span>
		</label>
		<Input
			id="character-name"
			type="text"
			placeholder="Firstname Lastname"
			value={cardStore.data.characterName}
			oninput={(e) => cardStore.updateCharacterName(e.currentTarget.value)}
		/>
	</div>

	<WorldSelect />

	<ImageUploader />
</div>
