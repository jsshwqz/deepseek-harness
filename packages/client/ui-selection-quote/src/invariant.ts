/**
 * Package-owned invariant companion for `@deepseek-ai/dsh-client-ui-selection-quote`.
 * @module @deepseek-ai/dsh-client-ui-selection-quote/invariant
 */

/* jscpd:ignore-start */
import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = '@deepseek-ai/dsh-client-ui-selection-quote'

/** Cordis companion plugin name. */
export const name = 'client-ui-selection-quote-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

/**
 * No runtime invariant: a pure-consumer plugin that listens on document
 * selection events and renders a floating overlay into a declared chat-view
 * slot. It emits no cordis events, owns no shared mutable state, and its
 * copy/quote behavior is asserted by this package's component specs.
 */
const install: InvariantInstaller = () => {}

/**
 * Register this package's invariant companion.
 * @param ctx - Cordis context carrying the invariant service.
 * @returns the installed registration's disposer after setup succeeds.
 */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
/* jscpd:ignore-end */
