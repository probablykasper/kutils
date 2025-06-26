import { writable, type Writable } from 'svelte/store'
import { KSelection as KSelectionJS, type SelectionOptions } from './selection-js.ts'

export class KSelection<T> {
	readonly #selection: KSelectionJS<T>
	readonly #store: Writable<Set<T>>
	readonly subscribe: Writable<Set<T>>['subscribe']
	readonly items: Set<T>
	constructor(all_items: T[], options: SelectionOptions<T>) {
		this.#selection = new KSelectionJS(all_items, options)
		this.#store = writable(this.#selection.items)
		this.subscribe = this.#store.subscribe
		this.items = this.#selection.items
	}

	find_first_index() {
		return this.#selection.find_first_index()
	}
	find_first() {
		return this.#selection.find_first()
	}
	items_as_array() {
		return this.#selection.items_as_array()
	}
	get_selected_indexes() {
		return this.#selection.get_selected_indexes()
	}

	add_index(index: number) {
		this.#selection.add_index(index)
	}

	clear() {
		this.#selection.clear()
		this.#store.set(this.#selection.items)
	}
	update_all_items(all: T[]) {
		this.#selection.update_all_items(all)
		this.#store.set(this.#selection.items)
	}
	handle_mousedown(e: MouseEvent, index: number) {
		this.#selection.handle_mouse_down(e, index)
		this.#store.set(this.#selection.items)
	}
	handle_contextmenu(e: MouseEvent, index: number) {
		this.#selection.handle_contextmenu(e, index)
		this.#store.set(this.#selection.items)
	}
	handle_click(e: MouseEvent, index: number) {
		this.#selection.handle_click(e, index)
		this.#store.set(this.#selection.items)
	}
	handle_keydown(e: KeyboardEvent) {
		this.#selection.handle_keydown(e)
		this.#store.set(this.#selection.items)
	}
	/** This adds all row events, and keydown.
	 * The listener should return row index.
	 * Returns an unlisten function. */
	add_event_listeners(
		element: HTMLElement,
		listener: (e: MouseEvent | KeyboardEvent) => number | null,
	) {
		const handler = (e: MouseEvent | KeyboardEvent) => {
			const index = listener(e)
			const is_row_event = e instanceof MouseEvent
			if (Number.isInteger(index) || !is_row_event) {
				this.#selection.handle_events(e, index as number)
				this.#store.set(this.#selection.items)
			}
		}
		element.addEventListener('mousedown', handler)
		element.addEventListener('contextmenu', handler)
		element.addEventListener('click', handler)
		element.addEventListener('keydown', handler)
		return () => {
			element.removeEventListener('mousedown', handler)
			element.removeEventListener('contextmenu', handler)
			element.removeEventListener('click', handler)
			element.removeEventListener('keydown', handler)
		}
	}
	/** This adds all row events, and keydown. The listener should return row index. */
	attach_events(listener: (e: MouseEvent | KeyboardEvent) => number | null) {
		return (element: HTMLElement) => {
			const unlisten = this.add_event_listeners(element, (e) => {
				return listener(e)
			})
			return unlisten
		}
	}
}
