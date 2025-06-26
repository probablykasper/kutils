export function is_mac() {
	return /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)
}

type Modifier = 'shift' | 'alt' | 'cmdOrCtrl'

/** Check the pressed modifiers for an event. This is strict, so if you pass no modifiers, it will return true if the event has no modifiers. */
export function check_modifiers(e: KeyboardEvent | MouseEvent, ...modifiers: Modifier[]) {
	let shift = false
	let alt = false
	let ctrl = false
	let meta = false
	for (const modifier of modifiers) {
		if (modifier === 'shift') {
			shift = true
		} else if (modifier === 'alt') {
			alt = true
		} else if (modifier === 'cmdOrCtrl') {
			ctrl = !is_mac()
			meta = !ctrl
		}
	}

	return (
		!!e.shiftKey === shift && !!e.altKey === alt && !!e.ctrlKey === ctrl && !!e.metaKey === meta
	)
}

/** Check the pressed key and modifiers for a keyboard event. This is strict, so if you pass no modifiers, it will return true if the event has no modifiers. */
export function check_shortcut(e: KeyboardEvent, key: string, ...modifiers: Modifier[]) {
	if (e.key.toUpperCase() !== key.toUpperCase()) return false
	return check_modifiers(e, ...modifiers)
}
