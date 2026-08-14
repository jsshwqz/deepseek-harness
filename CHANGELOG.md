# Changelog

All notable changes to DeepSeek Harness are documented in this file.
This fork follows the Keep a Changelog format.

## [0.1.3] - 2026-08-14

### Added

- **Web selection quote/copy overlay plugin** (ui-selection-quote): mouse-text-selection in the chat transcript now surfaces a compact floating toolbar offering **Copy** (raw text) and **Quote** (markdown blockquote, '> '-prefixed lines) with one-second check-icon feedback. Packaged as a standalone, browser-only client plugin so it stays decoupled from the core conversation package.
  - Copy writes the exact selection to the clipboard.
  - Quote writes the selection as a markdown blockquote for pasting straight back into the conversation as quoted context.
  - Toolbar dismisses on scroll, outside click, or end of success feedback.
  - Detection via document.mouseup, gated on [data-chat-flow] anchor.
  - Own 'selection' locale namespace (quote/quoted); copy/copied resolve through the shared 'common' namespace.
- **conversation.view.overlay slot** declared in ui-conversation: a kind: list, session-scoped extension point for in-chat overlays. Owns the runtime children table; the SlotMap type lives in ui-selection-quote (dependency-direction-matching). Other plugins may stack additional contributors into it without touching conversation code.
- **scripts/dual-push.sh**: one-command release mirror that pushes branches to both the GitHub (jsshwqz) and Gitee (gitee) remotes; no args pushes all local branches, args select specific ones.
- **Gitee mirror** of the fork (gitee.com/jsshwqz/deepseek-harness), kept in sync with GitHub for regions where GitHub connectivity is unreliable.

### Changed

- Unified the published version across all ~70+ @deepseek-ai/dsh-* packages and the root workspace from 0.1.0-rc.5 to **0.1.3** (223 files).
- Web app bundle (web-app/cordis.patch.yml) now wires the ui-selection-quote plugin into the browser roster alongside the existing sidebar plugins.

### Documentation

- ui-selection-quote README expanded with a Quickstart, the conversation.view.overlay extension-point description, a localization guide, and build/test notes so downstream users can install and extend the plugin without reading source.

### Branches

- main / master point at 47f9438 (upstream 0.1.0-rc.5) as the release baseline; 0.1.3 builds on top of it.
- feat/selection-quote — the isolated web-only selection plugin branch (plugin + docs + dual-push script).
- feat/selection-quote-overlay — the DSH Desktop client line plus the selection overlay (kept separate from the web plugin per the branch-split decision).
- fix/verified-runtime-bugs — three verified runtime fixes.

## [0.1.2] - 2025-...

## [0.1.1] - 2025-...

## [0.1.0-rc.5] - 2025-...

Initial public rc line of the DSH package family. (Earlier tags are retained for continuity; detailed per-tag notes live in the upstream history.)

<!--
Release checklist (dual-mirror):
  1. bump version across packages
  2. git tag -a vX.Y.Z -m "release(dsh): X.Y.Z"
  3. push main + tag to github + gitee
  4. bash scripts/dual-push.sh   # keep feature branches mirrored
-->
