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

## Quickstart

This plugin ships on the `feat/selection-quote` branch. To enable it in a
local harness build:

```bash
git fetch origin feat/selection-quote
git checkout feat/selection-quote
pnpm install
pnpm run bundle          # rebuilds lib/ (tsdown) for this package
pnpm dsh --profile web   # start the web app with the plugin wired in
```

The plugin is registered in `packages/bundle/web-app/cordis.patch.yml` under
id `ui-selection-quote`, so the web app bundle picks it up automatically once
the branch is checked out. Verify it is present in the browser roster:

```bash
pnpm dsh --profile web --help  # confirm the bundle builds without errors
```

Once running, select any text in the conversation transcript and a small
Copy / Quote bar appears above the selection.

## Extension point: `conversation.view.overlay`

The plugin declares one empty-owner slot, `conversation.view.overlay`, into
which it renders its toolbar. This is the deliberate, minimal extension point
between the conversation view (owned by `ui-conversation`) and overlay
features (owned by plugins).

- **ui-conversation** owns the runtime children table and renders the slot at
  the top of the chat scrollport, before the message column.
- **ui-selection-quote** (this package) owns the SlotMap *type* and registers
  the toolbar component into that slot via `ctx.slots.inject(...)`.
- **You / other plugins** may register additional contributors into
  `conversation.view.overlay` to add further in-chat overlays (annotation
  bars, highlight chips, etc.) without touching the conversation code. The
  slot is `kind: list`, so multiple contributors stack.

This dependency direction (conversation declares the runtime hole, plugin
declares the type) follows the same pattern as
`conversation.input.overlay` / `ui-input-trigger`, and keeps the overlay
feature fully replaceable from outside the core package.

## Localization

The plugin registers a `selection` locale namespace with `quote` and
`quoted` keys. The `copy` / `copied` labels resolve through the shared
`common` namespace (auto-fallback), so contributors only need to add new
`selection` keys. Dictionaries live in `src/client/locales.ts`;
`zh` is the key-set source of truth, `en` is checked complete against it.

## Build

Browser-only client plugin (`dsh.client.platform: web`). The node half
exports a no-op `apply`. Run `pnpm run bundle` (or `pnpm --filter
@deepseek-ai/dsh-client-ui-selection-quote bundle`) to regenerate `lib/`;
the test ladder is `pnpm run test:gui`, and if your change alters assembled
browser output, add `DSH_SNAPSHOT=replay pnpm run test:web`.

## Release / mirror

This feature is released on the `feat/selection-quote` branch of the
fork. The fork is mirrored to Gitee (`gitee.com/jsshwqz/deepseek-harness`)
alongside the GitHub remote; see the fork-level `CONTRIBUTING` notes for
dual-push release procedure.

## Known Limitations and Deferred Work

- Selection is detected at `mouseup`; a selection that begins outside the chat
  column and ends inside it is not picked up (the anchor node drives the check).
- The toolbar measures its width from a fixed constant (two buttons); adding
  actions later requires bumping that value.
- The plugin is untested here (no `pnpm`/`tsc` in the authoring environment);
  run `pnpm run test:gui` in a proper dev environment before shipping.
