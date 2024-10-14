<script lang="ts">
	import { City } from '$lib/City';

	const { form } = $props();
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
	>
		<select name="city">
			{#each Object.values(City).filter((city) => typeof city === 'string') as city}
				<option value={city}>{city}</option>
			{/each}
		</select>
		<input type="date" name="startDate" value={new Date().toISOString().split('T')[0]} />
		<input type="submit" value="Récupérer offres" />
	</form>

	<form method="post" action="?/emptyJobs">
		<input
			type="submit"
			value="Supprimer toutes les offres"
			style="background-color: red; color: white"
		/>
	</form>
</div>

{#if form?.jobs}
	<h2>Offres importées</h2>
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
