/** Registers the selection toolbar into the chat view's overlay slot. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { SelectionOverlay } from './SelectionOverlay.tsx'
import { en, zh, type SelectionKey } from './locales.ts'

export type { SelectionKey } from './locales.ts'

/**
 * Declare the overlay slot the chat view owns and the locale namespace this
 * plugin ships. The runtime children table lives in ui-conversation; the
 * SlotMap entry is declared here because dependency direction forbids
 * ui-conversation from importing this package.
 */
declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    /**
     * A floating overlay above the chat flow, rendered inside the scrollport
     * so it follows the transcript. Empty owner; the filling entry owns
     * everything (selection detection, positioning, actions). Filled by
     * ui-selection-quote; a replacement takes the whole overlay.
     */
    'conversation.view.overlay': { kind: 'list'; scope: 'session' }
  }
  interface LocaleNamespaceMap {
    /** Floating selection toolbar copy. */
    selection: SelectionKey
  }
}

/** Dictionary namespace owned by this plugin. */
const NS = 'selection'

/** Services this plugin reads: slot registration and locale registration. */
export const inject = ['slots', 'locale']

/**
 * Mount the selection toolbar into the chat view's overlay slot. Uses inject
 * so the contribution waits on ui-conversation's declaration and tears down
 * with it, leaving the caller's plugin fiber.
 * @param ctx - Client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-selection-quote: dictionaries')

  ctx.effect(() => ctx.slots.inject('conversation.view.overlay', () => ctx.slots.register({
    name: 'conversation.view.overlay',
    locale: NS,
  }, SelectionOverlay)), 'ui-selection-quote: overlay')
}
