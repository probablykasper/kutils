<script lang="ts">
	import '../app.css'

	const { children } = $props()
</script>

{@render children()}

<style>
	:global(html) {
		color-scheme: dark;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
			'Helvetica Neue', sans-serif;
	}
</style>
