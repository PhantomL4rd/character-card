<script lang="ts">
import { cardStore } from '$lib/stores/cardStore.svelte';
import ImageUploader from './ImageUploader.svelte';
import WorldSelect from './WorldSelect.svelte';
import JobSelect from './JobSelect.svelte';
import PlayStyleSelect from './PlayStyleSelect.svelte';
import LoginTimeSelect from './LoginTimeSelect.svelte';
import ThemeSelector from './ThemeSelector.svelte';
import PositionSelector from './PositionSelector.svelte';
import { Input } from '$lib/components/ui/input';
import { Separator } from '$lib/components/ui/separator';
</script>

<div class="space-y-6">
	<div class="space-y-2">
		<label class="text-sm font-medium" for="character-name">
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

	<div class="relative">
		<Separator />
		<span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">プレイスタイル</span>
	</div>

	<PlayStyleSelect />

	<JobSelect />

	<div class="relative">
		<Separator />
		<span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">ログイン時間</span>
	</div>

	<LoginTimeSelect />

	<div class="relative">
		<Separator />
		<span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">デザイン</span>
	</div>

	<div class="flex flex-wrap gap-6">
		<ThemeSelector />
		<PositionSelector />
	</div>
</div>
