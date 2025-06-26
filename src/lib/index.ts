export { check_shortcut, check_modifiers, is_mac } from './shortcuts.ts'
export { auto_snapshot } from './auto-snapshot.ts'
export { KSelection } from './selection-js.ts'

export function clamp_number(min: number, max: number, value: number) {
	if (value < min) return min
	if (value > max) return max
	return value
}
