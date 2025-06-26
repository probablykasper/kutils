<script lang="ts">
	import { VirtualGrid } from '$lib/virtual-grid.ts'

	function generate_source_items(count: number) {
		return Array.from({ length: count }, (_, i) => String(Math.random()).slice(2))
	}

	const virtual_grid = VirtualGrid.create(generate_source_items(50_000), {
		row_prepare(source_item, index) {
			return {
				a: index + 1,
				b: source_item,
				c: source_item,
			}
		},
		row_render(element, _item, index) {
			element.classList.toggle('odd', index % 2 === 0)
		},
	})
	const columns = [
		{ name: 'a', key: 'a', width: 100 },
		{ name: 'b', key: 'b', width: 50, is_pct: true },
		{ name: 'c', key: 'c', width: 50, is_pct: true },
	]
	$effect(() => {
		virtual_grid.set_columns(columns)
	})

	let item_count = $state(50_000)
	$effect(() => {
		virtual_grid.set_source_items(generate_source_items(item_count))
	})
</script>

<div class="h-screen max-h-screen gap-2 flex flex-col p-5">
	<h1 class="text-3xl">Virtual grid</h1>
	<div>
		<select class="appearance-auto w-auto bg-gray-700" bind:value={item_count}>
			{#each [50_000, 500_000] as size}
				<option value={size}>{Intl.NumberFormat().format(size)} rows</option>
			{/each}
		</select>
	</div>
	<!-- Virtual grid viewport -->
	<div class="h-full relative overflow-y-auto bg-black/50 border border-white/20">
		<!-- Virtual grid content -->
		<div class="virtual-grid" {@attach virtual_grid.attach()}></div>
	</div>
</div>

<style>
	.virtual-grid :global {
		.row {
			height: 24px;
			width: 100%;
			position: absolute;
		}
		.cell {
			display: block;
			height: 100%;
			position: absolute;
			height: 24px;
		}
		.odd {
			background-color: hsl(0, 0%, 10%);
		}
	}
</style>
