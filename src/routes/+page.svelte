<script lang="ts">
	import { enhance } from '$app/forms';
	import { City } from '$lib/City';

	const { form } = $props();

	let fetching = $state(false);
	let deleting = $state(false);
</script>

<h1>Offres France Travail</h1>

<div style="display: flex; flex-direction: column; gap: 2rem;">
	<form method="post" action="?/getMunicipalities">
		<input type="submit" value="Récupérer communes" />
	</form>

	<form
		method="post"
		action="?/fetchJobs"
		style="display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-start; flex: 1"
		use:enhance={() => {
			fetching = true;

			return async ({ update }) => {
				await update({ reset: false });
				fetching = false;
			};
		}}
	>
		<select name="city">
			{#each Object.values(City).filter((city) => typeof city === 'string') as city}
				<option value={city}>{city}</option>
			{/each}
		</select>
		<input type="date" name="startDate" value={new Date().toISOString().split('T')[0]} />
		<button type="submit" disabled={fetching}>
			Récupérer offres
			{#if fetching}
				<img src="/loading.gif" alt="Chargement" style="width: 1rem; height: 1rem" />
			{/if}
		</button>
	</form>

	<form
		method="post"
		action="?/emptyJobs"
		use:enhance={() => {
			deleting = true;

			return async ({ update }) => {
				await update({ reset: false });
				deleting = false;
			};
		}}
	>
		<button type="submit" style="background-color: red; color: white" disabled={deleting}>
			Supprimer toutes les offres
			{#if deleting}
				<img src="/loading.gif" alt="Chargement" style="width: 1rem; height: 1rem" />
			{/if}
		</button>
	</form>
</div>

{#if form?.jobs}
	<h2>Offres importées ({form.jobs.length})</h2>
	<ul>
		{#each form.jobs as job}
			<li>
				{job.id} -
				{#if job.url}
					<a href={job.url}>{job.title}</a>
				{:else}
					{job.title}
				{/if}
				<div style="margin-left: 1rem; font-style: italic">
					{job.description.substring(0, 100)}...
				</div>
			</li>
		{/each}
	</ul>
{/if}

{#if form?.deletedCount !== undefined}
	<p>Nombre d'offres supprimées : {form.deletedCount}</p>
{/if}
