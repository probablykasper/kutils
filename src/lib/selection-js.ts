import { check_mouse_shortcut, check_shortcut } from './shortcuts.ts'

export type SelectionOptions<T> = {
	scroll_to: (target: { item: T; index: number }) => void
	on_contextmenu?: (items: Set<T>) => void
}

export class KSelection<T> {
	/** Currently selected items. Disallowing assignment
	 * prevents the Svelte store from getting out of sync */
	readonly items = new Set<T>()
	/** Full list of items that can be selected */
	all: T[]
	/** The last added index */
	last_added: { index: number; item: T } | null = null
	/** An anchor index for shift selection. */
	shift_anchor: { index: number; item: T } | null = null
	/** Whether the user is current mouseup is a click or a selection update */
	possible_row_click = false

	scroll_to: SelectionOptions<T>['scroll_to']
	on_contextmenu: SelectionOptions<T>['on_contextmenu']

	constructor(all_items: T[], options: SelectionOptions<T>) {
		this.all = all_items
		this.scroll_to = options.scroll_to
		this.on_contextmenu = options.on_contextmenu
	}

	clear() {
		this.items.clear()
		this.last_added = null
		this.shift_anchor = null
	}

	/** Update the list of items that can be selected.
	 * Items that no longer exist are de-selected. */
	update_all_items(all: T[]) {
		this.all = all
		const keep = new Set(all.filter((item) => this.items.has(item)))
		for (const item of this.items) {
			if (!keep.has(item)) {
				this.items.delete(item)
			}
		}
		if (this.last_added !== null) {
			if (this.items.has(this.last_added.item)) {
				const index = this.all.indexOf(this.last_added.item)
				this.last_added = { index, item: this.last_added.item }
			} else {
				this.last_added = null
			}
		}
		if (this.shift_anchor !== null && !this.items.has(this.shift_anchor.item)) {
			if (this.items.has(this.shift_anchor.item)) {
				const index = this.all.indexOf(this.shift_anchor.item)
				this.shift_anchor = { index, item: this.shift_anchor.item }
			} else {
				this.shift_anchor = null
			}
		}
	}

	/** Get first selected index, or `null` if selection is empty */
	find_first_index() {
		const item_i = this.all.findIndex((item) => this.items.has(item))
		if (item_i === -1) {
			return null
		}
		return item_i
	}

	/** Get first selected item, or `undefined` if selection is empty */
	find_first() {
		const item_i = this.all.find((item) => this.items.has(item))
		return item_i
	}

	items_as_array() {
		return this.all.filter((item) => this.items.has(item))
	}

	get_selected_indexes() {
		const indexes = []
		for (let i = 0; i < this.all.length; i++) {
			if (this.items.has(this.all[i])) {
				indexes.push(i)
			}
		}
		return indexes
	}

	#get_shift_anchor() {
		if (this.shift_anchor !== null) return this.shift_anchor
		else return this.last_added
	}

	add_index(index: number) {
		if (index >= 0 && index < this.all.length) {
			this.items.add(this.all[index])
			this.last_added = { index, item: this.all[index] }
			this.shift_anchor = null
		}
	}

	add_index_unchecked(index: number) {
		this.items.add(this.all[index])
		this.last_added = { index, item: this.all[index] }
		this.shift_anchor = null
	}

	#add_index_in_shift_mode(index: number) {
		this.items.add(this.all[index])
		this.last_added = { index, item: this.all[index] }
	}

	#add_index_range_in_shift_mode(from_index: number, to_index: number) {
		// Direction here determines this.last_added
		if (from_index < to_index) {
			for (let i = from_index; i <= to_index; i++) {
				this.#add_index_in_shift_mode(i)
			}
		} else {
			for (let i = from_index; i >= to_index; i--) {
				this.#add_index_in_shift_mode(i)
			}
		}
	}

	#remove_range_in_shift_mode(from_i: number, to_i: number) {
		if (from_i < to_i) {
			for (let i = from_i; i <= to_i; i++) {
				this.items.delete(this.all[i])
			}
		} else {
			for (let i = from_i; i >= to_i; i--) {
				this.items.delete(this.all[i])
			}
		}
	}

	/** Shift-select to index */
	shift_select_to(to_index: number) {
		const anchor = this.#get_shift_anchor()
		const last_added = this.last_added
		if (last_added === null || anchor === null) {
			return this.items
		}

		if (anchor.index < to_index) {
			if (to_index < last_added.index) {
				// Retract selection closer to anchor
				this.#remove_range_in_shift_mode(to_index + 1, last_added.index)
			} else if (last_added.index < anchor.index) {
				// New shift selection is on the other side of anchor
				this.#remove_range_in_shift_mode(anchor.index - 1, last_added.index)
				this.#add_index_range_in_shift_mode(anchor.index, to_index)
			} else {
				this.#add_index_range_in_shift_mode(last_added.index, to_index)
			}
			this.last_added = { index: to_index, item: this.all[to_index] }
		} else {
			if (to_index > last_added.index) {
				// Retract selection closer to anchor
				this.#remove_range_in_shift_mode(to_index - 1, last_added.index)
			} else if (last_added.index > anchor.index) {
				// New shift selection is on the other side of anchor
				this.#remove_range_in_shift_mode(anchor.index + 1, last_added.index)
				this.#add_index_range_in_shift_mode(anchor.index, to_index)
			} else {
				this.#add_index_range_in_shift_mode(last_added.index, to_index)
			}
			this.last_added = { index: to_index, item: this.all[to_index] }
		}
		this.shift_anchor = anchor
	}

	/** Replace selection with the previous index, like perssing `ArrowUp` in a list. */
	go_backward() {
		if (this.all.length === 0) {
			return
		} else if (this.items.size === 0) {
			this.add_index_unchecked(this.all.length - 1)
		} else if (this.last_added !== null) {
			const prev_index = this.last_added.index - 1
			this.clear()
			this.add_index_unchecked(Math.max(prev_index, 0))
		}
	}

	/** Replace selection with the previous index, like perssing `ArrowDown` in a list. */
	go_forward() {
		if (this.all.length === 0) {
			return
		} else if (this.items.size === 0) {
			this.add_index_unchecked(0)
		} else if (this.last_added !== null) {
			const next_index = this.last_added.index + 1
			this.clear()
			this.add_index_unchecked(Math.min(next_index, this.all.length - 1))
		}
	}
	/** Expand or shrink selection backwards (shift+up) */
	shift_select_backward() {
		const anchor = this.#get_shift_anchor()
		this.shift_anchor = anchor
		if (anchor === null || this.last_added === null) {
			return
		}
		if (this.last_added.index <= anchor.index) {
			// add prev to selection
			for (let i = this.last_added.index; i >= 0; i--) {
				if (!this.items.has(this.all[i])) {
					this.#add_index_in_shift_mode(i)
					return
				}
			}
		} else {
			// remove first from selection
			this.items.delete(this.last_added.item)
			this.last_added = {
				index: this.last_added.index - 1,
				item: this.all[this.last_added.index - 1],
			}
		}
	}
	/** Expand or shrink selection forwards (shift+down) */
	shift_select_forward() {
		const anchor = this.#get_shift_anchor()
		this.shift_anchor = anchor
		if (anchor === null || this.last_added === null) {
			return
		}
		if (this.last_added.index >= anchor.index) {
			// add next to selection
			for (let i = this.last_added.index; i < this.all.length; i++) {
				if (!this.items.has(this.all[i])) {
					this.#add_index_in_shift_mode(i)
					return
				}
			}
		} else {
			// remove last from selection
			this.items.delete(this.last_added.item)
			this.last_added = {
				index: this.last_added.index + 1,
				item: this.all[this.last_added.index + 1],
			}
		}
	}
	#toggle(index: number) {
		if (this.items.has(this.all[index])) {
			if (this.last_added && this.last_added.item === this.all[index]) {
				this.last_added = null
			}
			this.items.delete(this.all[index])
		} else {
			this.add_index_unchecked(index)
		}
		this.shift_anchor = null
	}

	mouse_down_select(e: MouseEvent, index: number) {
		const is_selected = this.items.has(this.all[index])
		if (check_mouse_shortcut(e) && !is_selected) {
			this.clear()
			this.add_index_unchecked(index)
		} else if (check_mouse_shortcut(e, { cmd_or_ctrl: true }) && !is_selected) {
			this.add_index_unchecked(index)
		} else if (check_mouse_shortcut(e, { shift: true })) {
			this.shift_select_to(index)
		}
	}

	/** This does also handle keydown events, which aren't row events */
	handle_events(e: Event, index: number) {
		if (e instanceof MouseEvent) {
			if (e.type === 'mousedown') {
				this.handle_mouse_down(e, index)
			} else if (e.type === 'contextmenu') {
				this.handle_contextmenu(e, index)
			} else if (e.type === 'click') {
				this.handle_click(e, index)
			}
		} else if (e instanceof KeyboardEvent) {
			if (e.type === 'keydown') {
				this.handle_keydown(e)
			}
		}
	}

	handle_mouse_down(e: MouseEvent, index: number) {
		if (e.button !== 0) {
			return
		}
		if (this.items.has(this.all[index])) {
			this.possible_row_click = true
		}
		this.mouse_down_select(e, index)
	}
	handle_contextmenu(e: MouseEvent, index: number) {
		this.mouse_down_select(e, index)
		this.on_contextmenu?.(this.items)
	}
	handle_click(e: MouseEvent, index: number) {
		if (this.possible_row_click && e.button === 0) {
			if (check_mouse_shortcut(e)) {
				this.clear()
				this.add_index_unchecked(index)
			} else if (check_mouse_shortcut(e, { cmd_or_ctrl: true })) {
				this.#toggle(index)
			}
		}
		this.possible_row_click = false
	}
	handle_keydown(e: KeyboardEvent) {
		if (check_shortcut(e, 'Escape')) {
			this.clear()
		} else if (check_shortcut(e, 'A', { cmd_or_ctrl: true })) {
			if (this.all.length > 1) {
				this.#add_index_range_in_shift_mode(0, this.all.length - 1)
			}
		} else if (check_shortcut(e, 'ArrowUp')) {
			this.go_backward()
			if (this.last_added) this.scroll_to({ ...this.last_added })
		} else if (check_shortcut(e, 'ArrowUp', { shift: true })) {
			this.shift_select_backward()
			if (this.last_added) this.scroll_to({ ...this.last_added })
		} else if (check_shortcut(e, 'ArrowUp', { alt: true })) {
			this.clear()
			if (this.all.length > 1) {
				this.add_index_unchecked(0)
				if (this.last_added) this.scroll_to({ ...this.last_added })
			}
		} else if (check_shortcut(e, 'ArrowUp', { shift: true, alt: true })) {
			this.shift_select_to(0)
			if (this.last_added) this.scroll_to({ ...this.last_added })
		} else if (check_shortcut(e, 'ArrowDown')) {
			this.go_forward()
			if (this.last_added) this.scroll_to({ ...this.last_added })
		} else if (check_shortcut(e, 'ArrowDown', { shift: true })) {
			this.shift_select_forward()
			if (this.last_added) this.scroll_to({ ...this.last_added })
		} else if (check_shortcut(e, 'ArrowDown', { alt: true })) {
			this.clear()
			if (this.all.length > 1) {
				this.add_index_unchecked(this.all.length - 1)
				if (this.last_added) this.scroll_to({ ...this.last_added })
			}
		} else if (check_shortcut(e, 'ArrowDown', { shift: true, alt: true })) {
			this.shift_select_to(this.all.length - 1)
			if (this.last_added) this.scroll_to({ ...this.last_added })
		} else {
			return
		}
		e.preventDefault()
	}
}
