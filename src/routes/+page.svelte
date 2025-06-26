<script lang="ts">
	import { KSelection } from '$lib/selection-svelte.ts'
	import { RefreshLevel, VirtualGrid } from '$lib/virtual-grid.ts'

	function generate_source_items(count: number) {
		return Array.from({ length: count }, () => String(Math.random()).slice(2))
	}
	let source_items = generate_source_items(500_000)

	const virtual_grid = VirtualGrid.create(source_items, {
		row_prepare(source_item, index) {
			return {
				id: source_item,
				n: index + 1,
				b: source_item,
			}
		},
		row_render(element, item, index) {
			element.classList.toggle('odd', index % 2 === 0)
			element.classList.toggle('selected', $selection.has(item.id))
		},
	})
	const columns = [
		{ name: 'n', key: 'n', width: 100 },
		{ name: 'id', key: 'id', width: 50, is_pct: true },
		{ name: 'b', key: 'b', width: 50, is_pct: true },
	]
	$effect(() => {
		virtual_grid.set_columns(columns)
	})

	const selection = new KSelection(source_items, {
		scroll_to({ index }) {
			virtual_grid.scroll_to_index(index)
		},
	})
	$effect(() => {
		selection.update_all_items(source_items)
	})
	$effect(() => {
		$selection
		virtual_grid.refresh(RefreshLevel.AllRows)
	})
</script>

<div class="h-screen max-h-screen gap-2 flex flex-col p-5">
	<h1 class="text-3xl">Virtual grid with row selection</h1>
	<p>{Intl.NumberFormat().format(500_000)} rows</p>
	<!-- Virtual grid viewport -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		class="h-full relative overflow-y-auto bg-black/50 border border-white/20 outline-none"
		tabindex="0"
		{@attach selection.attach_events((e) => {
			return virtual_grid.get_row_index_from_event(e)
		})}
	>
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
			user-select: none;
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
		.selected {
			background-color: hsl(224, 100%, 51%);
			color: white;
		}
	}
</style>
