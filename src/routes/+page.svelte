<script lang="ts">
	export let data;
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<form method="post" action="?/fetch">
	<!-- <input type="text" name="name" /> -->
	<input type="submit" value="Récupérer" />
</form>

{#each data.jobs as job}
	<p>{job.intitule}</p>
{/each}
