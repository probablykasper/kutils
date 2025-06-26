/**
 * Automatically snapshot Svelte form values for `input`, `textarea` and `select` elements.
 *
 * The `name` attribute is used as the key. If you need to use a different key than the `name` attribute, you can alternatively specify it with the `data-snapsho` attribute.
 *
 * ### Usage
 * ```svelte
 * <script>
 * 	const snapshotter = auto_snapshot()
 * 	export const snapshot = snapshotter
 * </script>
 * <div use:snapshotter.container>
 * 	<input type="text" name="first_name" />
 * </div>
 * ```
 *
 */
export function auto_snapshot() {
	let container_el: HTMLElement | undefined
	const selector = 'input[data-snapshot],textarea[data-snapshot],select[data-snapshot]'
	return {
		capture() {
			if (!container_el?.querySelectorAll) {
				throw new Error('auto_snapshot: container element not set')
			}
			const elements = container_el.querySelectorAll(selector)
			const values: Record<string, string> = {}
			for (const element of elements) {
				if (
					element instanceof HTMLInputElement ||
					element instanceof HTMLSelectElement ||
					element instanceof HTMLTextAreaElement
				) {
					let key = element.dataset.snapshot
					if (!key || key === 'true' || key === 'false') {
						key = element.name
					}
					values[key] = element.value
				}
			}
			return values
		},
		restore(value: Record<string, string>) {
			if (!container_el?.querySelectorAll) {
				throw new Error('auto_snapshot: container element not set')
			}
			const elements = container_el.querySelectorAll(selector)
			for (const element of elements) {
				if (
					element instanceof HTMLInputElement ||
					element instanceof HTMLSelectElement ||
					element instanceof HTMLTextAreaElement
				) {
					let key = element.dataset.snapshot
					if (!key || key === 'true' || key === 'false') {
						key = element.name
					}
					if (!value[key]) {
						continue
					}
					if (element instanceof HTMLInputElement && element.type === 'checkbox') {
						element.checked = value[key] === 'on'
					} else {
						element.value = value[key]
					}
					// Trigger Svelte state to updates
					element.dispatchEvent(new Event('change'))
					element.dispatchEvent(new Event('snapshot-restore'))
				}
			}
		},
		container(node: HTMLElement) {
			container_el = node
		},
	}
}
