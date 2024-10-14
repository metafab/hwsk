<script lang="ts">
	export let form;
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<div style="display: flex; flex-direction: column; gap: 1rem;">
	<form method="post" action="?/getMunicipalities">
		<input type="submit" value="Récupérer communes" />
	</form>

	<form method="post" action="?/fetch">
		<select name="city">
			<option value="rennes">Rennes</option>
			<option value="bordeaux">Bordeaux</option>
			<option value="paris">Paris</option>
		</select>
		<input type="number" name="count" value="10" min="1" max="150" />
		<input type="submit" value="Récupérer offres" />
	</form>
</div>

{#if form?.jobs}
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
