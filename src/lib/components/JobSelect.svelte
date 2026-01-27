<script lang="ts">
import { Swords } from 'lucide-svelte';
import { cardStore } from '$lib/stores/cardStore.svelte';
import jobsData from '$lib/data/jobs.json';
import { Button } from '$lib/components/ui/button';

const jobsByRole = $derived(
  jobsData.roles.map((role) => ({
    ...role,
    jobs: jobsData.jobs.filter((job) => job.role === role.id)
  }))
);
</script>

<div class="space-y-2">
	<label class="text-sm font-medium flex items-center gap-1">
		<Swords class="size-4" />
		ジョブ
	</label>
	<div class="space-y-3">
		{#each jobsByRole as role}
			<div>
				<div class="text-sm font-medium mb-1" style="color: {role.color}">
					{role.name}
				</div>
				<div class="flex flex-wrap gap-1">
					{#each role.jobs as job}
						<Button
							size="sm"
							variant={cardStore.data.playStyle.jobs.includes(job.id) ? 'default' : 'ghost'}
							onclick={() => cardStore.toggleJob(job.id)}
							class="gap-1"
						>
							<img src="/icons/jobs/{job.nameEn}.png" alt={job.name} class="size-5" />
							<span class="hidden sm:inline text-xs">{job.name}</span>
						</Button>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
