<script lang="ts">
	import { cardStore } from '$lib/stores/cardStore.svelte';
	import jobsData from '$lib/data/jobs.json';

	const jobsByRole = $derived(
		jobsData.roles.map((role) => ({
			...role,
			jobs: jobsData.jobs.filter((job) => job.role === role.id)
		}))
	);
</script>

<div class="form-control">
	<label class="label">
		<span class="label-text font-semibold">ジョブ</span>
	</label>
	<div class="space-y-3">
		{#each jobsByRole as role}
			<div>
				<div class="text-sm font-medium mb-1" style="color: {role.color}">
					{role.name}
				</div>
				<div class="flex flex-wrap gap-1">
					{#each role.jobs as job}
						<button
							type="button"
							class="btn btn-sm gap-1"
							class:btn-primary={cardStore.data.playStyle.jobs.includes(job.id)}
							class:btn-ghost={!cardStore.data.playStyle.jobs.includes(job.id)}
							onclick={() => cardStore.toggleJob(job.id)}
						>
							<img src="/icons/jobs/{job.nameEn}.png" alt={job.name} class="w-5 h-5" />
							<span class="hidden sm:inline text-xs">{job.name}</span>
						</button>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
