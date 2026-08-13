# @deepseek-ai/dsh-client-ui-selection-quote

Floating action toolbar for in-chat text selection. When the reader selects
non-empty text inside the chat flow, a compact bar appears anchored to the
selection offering **Copy** (raw text) and **Quote** (markdown blockquote,
`> `-prefixed lines).

## Model Experience

- **Copy**: writes the exact selected text to the clipboard with one-second
  success feedback (check icon swap).
- **Quote**: writes the selection formatted as a markdown blockquote (`> ` at
  the start of each line), so the reader can paste it straight back into the
  conversation as quoted context.
- The toolbar dismisses automatically on the next in-page scroll, a mousedown
  outside itself, or the end of a successful action feedback window.
- Copy and Quote labels follow the active locale (`selection` namespace); the
  shared `copy`/`copied` words resolve through the common fallback.

## Architecture

- Listens on `document.mouseup`; only selections whose anchor node sits inside
  the chat column (`[data-chat-flow]`) surface the toolbar.
- Renders a `position: fixed` plate into the chat view declared
  `conversation.view.overlay` slot, so the scrollport overflow never clips
  it and the feature lives entirely outside the conversation package code.
- Reuses the shared `writeClipboard` primitive and the tooltip-bg/lv3-shadow
  floating-chrome visual language.

## Package

- Browser-only client plugin (`dsh.client.platform: web`); the node half
  exports a no-op `apply`.
- Registers `selection` locale dictionary (`quote`, `quoted`) and declares the
  `conversation.view.overlay` SlotMap entry (ui-conversation owns the runtime
  children table; this package owns the type, matching the dependency
  direction).

## Known Limitations and Deferred Work

- Selection is detected at `mouseup`; a selection that begins outside the chat
  column and ends inside it is not picked up (the anchor node drives the check).
- The toolbar measures its width from a fixed constant (two buttons); adding
  actions later requires bumping that value.
