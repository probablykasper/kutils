export function is_mac() {
	return /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)
}

type ShortcutOptions = {
	shift?: boolean
	alt?: boolean
	cmd_or_ctrl?: boolean
}

export function check_modifiers(e: KeyboardEvent | MouseEvent, options: ShortcutOptions = {}) {
	const target = {
		shift: options.shift || false,
		alt: options.alt || false,
		ctrl: (!is_mac() && options.cmd_or_ctrl) || false,
		meta: (is_mac() && options.cmd_or_ctrl) || false,
	}

	const pressed = {
		shift: !!e.shiftKey,
		alt: !!e.altKey,
		ctrl: !!e.ctrlKey,
		meta: !!e.metaKey,
	}

	return (
		pressed.shift === target.shift &&
		pressed.alt === target.alt &&
		pressed.ctrl === target.ctrl &&
		pressed.meta === target.meta
	)
}

export function check_shortcut(e: KeyboardEvent, key: string, options: ShortcutOptions = {}) {
	if (e.key.toUpperCase() !== key.toUpperCase()) return false
	return check_modifiers(e, options)
}
export function check_mouse_shortcut(e: MouseEvent, options: ShortcutOptions = {}) {
	return check_modifiers(e, options)
}
