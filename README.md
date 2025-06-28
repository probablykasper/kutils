# k5kit

Utilities for TypeScript and Svelte

## Virtual grid
High-performance virtual grid. Renders rows as HTML elements directly for better scroll performance instead of relying on a JS framework (which means custom markup needs to be created with JS).

[Virtual grid + KSelection usage example](src/routes/+page.svelte)

Features:
- Renders rows as HTML elements directly instead of using a JS framework (for better scroll performance)
- Rows can be dynamically loaded
- Columns can have fixed and percentage widths

## KSelection
Row-based selection manager, with both a JS and Svelte implementation..

[Virtual grid + KSelection usage example](src/routes/+page.svelte)

Features:
- Multi-selection
- Full OS-like mouse and keyboard support. Shift selection (with proper anchoring), Cmd/Ctrl selection, arrow keys, Alt/Option+ArrowKeys, Cmd/Ctrl+A, Esc to deselect, etc.
- Stays intact when rows are added or removed
- Easy to integrate with the virtual grid

## Auto snapshot

Automatically snapshot Svelte form values for `input`, `textarea` and `select` elements.

The `name` attribute is used as the key. If you need to use a different key than the `name` attribute, you can alternatively specify it with the `data-snapsho` attribute.

Usage:
```svelte
<script>
	import { auto_snapshot } from 'k5kit'
	const snapshotter = auto_snapshot()
	export const snapshot = snapshotter
</script>
<div use:snapshotter.container>
	<input type="text" name="first_name" />
</div>
```

## Shortcut checking

```js
import { check_shortcut, check_modifiers } from 'k5kit'
check_shortcut(e, 'A') // 'A' with no modifiers pressed
check_shortcut(e, 'A', 'shift', 'alt', 'cmdOrCtrl')
check_modifiers(e) // Check that no modifiers are pressed (useful for mouse events)
check_modifiers(e, 'shift', 'alt', 'cmdOrCtrl')
```
