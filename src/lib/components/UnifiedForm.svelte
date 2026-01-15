<script lang="ts">
import { User, Palette, Clock, Download, Loader2 } from 'lucide-svelte';
import { cardStore } from '$lib/stores/cardStore.svelte';
import AccordionSection from './AccordionSection.svelte';
import ProgressIndicator from './ProgressIndicator.svelte';
import WorldSelect from './WorldSelect.svelte';
import ImageUploader from './ImageUploader.svelte';
import PlayStyleSelect from './PlayStyleSelect.svelte';
import JobSelect from './JobSelect.svelte';
import LoginTimeSelect from './LoginTimeSelect.svelte';
import ThemeSelector from './ThemeSelector.svelte';
import PositionSelector from './PositionSelector.svelte';
import FontSelector from './FontSelector.svelte';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';

interface Props {
  isExporting: boolean;
  exportError: string | null;
  onExport: () => void;
}

const { isExporting, exportError, onExport }: Props = $props();

type SectionId = 'basic' | 'playStyle' | 'loginTime' | 'design';
let expandedSection = $state<SectionId | null>('basic');

function toggleSection(id: SectionId) {
  expandedSection = expandedSection === id ? null : id;
}

// 基本情報セクションに警告が必要かどうか
const basicHasWarning = $derived(
  cardStore.data.characterName.trim().length === 0 || cardStore.data.image.src === null
);
</script>

<div class="space-y-4">
	<!-- Progress Indicator -->
	<div class="px-1">
		<ProgressIndicator />
	</div>

	<!-- Accordion Sections -->
	<div class="space-y-3">
		<!-- 基本情報 -->
		<AccordionSection
			id="basic"
			title="基本情報"
			icon={User}
			isExpanded={expandedSection === 'basic'}
			hasWarning={basicHasWarning}
			onToggle={() => toggleSection('basic')}
		>
			{#snippet children()}
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
			{/snippet}
		</AccordionSection>

		<!-- プレイスタイル -->
		<AccordionSection
			id="playStyle"
			title="プレイスタイル"
			icon={Palette}
			isExpanded={expandedSection === 'playStyle'}
			onToggle={() => toggleSection('playStyle')}
		>
			{#snippet children()}
				<div class="space-y-6">
					<PlayStyleSelect />
					<JobSelect />
				</div>
			{/snippet}
		</AccordionSection>

		<!-- ログイン時間 -->
		<AccordionSection
			id="loginTime"
			title="ログイン時間"
			icon={Clock}
			isExpanded={expandedSection === 'loginTime'}
			onToggle={() => toggleSection('loginTime')}
		>
			{#snippet children()}
				<LoginTimeSelect />
			{/snippet}
		</AccordionSection>

		<!-- デザイン -->
		<AccordionSection
			id="design"
			title="デザイン"
			icon={Palette}
			isExpanded={expandedSection === 'design'}
			onToggle={() => toggleSection('design')}
		>
			{#snippet children()}
				<div class="space-y-4">
					<ThemeSelector />
					<PositionSelector />
					<FontSelector />
				</div>
			{/snippet}
		</AccordionSection>
	</div>

	<!-- Export Section -->
	<div class="pt-4 space-y-3">
		{#if exportError}
			<div class="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
				{exportError}
			</div>
		{/if}

		<Button
			class="w-full"
			variant={cardStore.canExport && !isExporting ? 'default' : 'secondary'}
			disabled={!cardStore.canExport || isExporting}
			onclick={onExport}
		>
			{#if isExporting}
				<Loader2 class="w-5 h-5 animate-spin" />
				生成中...
			{:else}
				<Download class="w-5 h-5" />
				ダウンロード
			{/if}
		</Button>
	</div>
</div>
