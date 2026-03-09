<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.scss';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		// @ts-expect-error
		import('bootstrap/dist/js/bootstrap.bundle.min.js');
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
