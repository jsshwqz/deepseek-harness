// Floating action toolbar for in-chat text selection. Copy writes the raw
// selection; Quote writes it formatted as a markdown blockquote. It sits
// fixed above (or below) the selection, dismisses on the next in-page scroll,
// a mousedown outside itself, or a successful action's feedback window.

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  IconCheckOutline16,
  IconCopyOutline16,
  Tooltip,
  writeClipboard,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import css from './SelectionOverlay.module.css'

interface SelectionInfo {
  text: string
  rect: DOMRect
}

/** Props: the empty-owner overlay slot the chat view declares, plus locale. */
interface Props extends PropsRuntime<'conversation.view.overlay'>, PropsLocale<'selection'> {}

const COPIED_FEEDBACK_MS = 1000
const TOOLBAR_WIDTH = 72

/** Whether a DOM node sits inside the rendered chat flow. */
function inChat(node: Node): boolean {
  if (node.nodeType === Node.ELEMENT_NODE) {
    return (node as HTMLElement).closest('[data-chat-flow]') !== null
  }
  return node.parentElement !== null && inChat(node.parentElement)
}

/**
 * Component-internal hook tracking the current in-chat text selection.
 * Not bound to any external source — a behavioral hook, allowed for a leaf.
 */
function useInChatSelection(): { info: SelectionInfo | null; dismiss: () => void } {
  const [info, setInfo] = useState<SelectionInfo | null>(null)
  const dismiss = useCallback(() => { setInfo(null) }, [])

  useEffect(() => {
    const onMouseUp = () => {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        dismiss()
        return
      }
      if (sel.anchorNode === null || !inChat(sel.anchorNode)) {
        dismiss()
        return
      }
      const text = sel.toString().trim()
      if (text.length === 0) {
        dismiss()
        return
      }
      setInfo({ text, rect: sel.getRangeAt(0).getBoundingClientRect() })
    }
    const onMdown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('[data-selection-toolbar]') !== null) return
      dismiss()
    }
    const onScroll = () => { dismiss() }

    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mousedown', onMdown, true)
    document.addEventListener('scroll', onScroll, { capture: true, passive: true })
    return () => {
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mousedown', onMdown, true)
      document.removeEventListener('scroll', onScroll, { capture: true, passive: true })
    }
  }, [dismiss])

  return { info, dismiss }
}

/** Local copy-with-feedback, modeled on the message IconActions chrome. */
function useCopy(text: string): { copied: boolean; onCopy: () => void } {
  const [copied, setCopied] = useState(false)
  const onCopy = useCallback(() => {
    if (copied) return
    void writeClipboard(text).then((ok) => {
      if (!ok) return
      setCopied(true)
      window.setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS)
    })
  }, [copied, text])
  return { copied, onCopy }
}

/** Blockquote glyph (no quote icon in the shared library). */
function QuoteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M3 3h3v3H5.25A1.75 1.75 0 0 0 7 7.75V11H3V3Zm6 0h3v3h-.75A1.75 1.75 0 0 0 11 7.75V11h-3V3Z" />
    </svg>
  )
}

export function SelectionOverlay({ t }: Props) {
  const { info: sel, dismiss } = useInChatSelection()
  if (sel === null) return null

  const quoteText = useMemo(
    () => sel.text.split('\n').map((line) => '> ' + line).join('\n'),
    [sel.text],
  )
  const { copied: copyCopied, onCopy } = useCopy(sel.text)
  const { copied: quoteCopied, onCopy: onQuote } = useCopy(quoteText)

  const handleCopy = useCallback(() => {
    onCopy()
    window.setTimeout(dismiss, COPIED_FEEDBACK_MS)
  }, [onCopy, dismiss])
  const handleQuote = useCallback(() => {
    onQuote()
    window.setTimeout(dismiss, COPIED_FEEDBACK_MS)
  }, [onQuote, dismiss])

  // Fixed positioning keeps the toolbar above the scrollport's overflow; clamp
  // the left edge so the plate never runs past the right viewport edge, and
  // flip below the selection when it would clip the top.
  const left = Math.min(Math.max(sel.rect.left, 8), window.innerWidth - TOOLBAR_WIDTH - 8)
  const above = sel.rect.top < 44
  const top = above ? sel.rect.bottom + 6 : sel.rect.top - 40

  return (
    <div
      className={css.toolbar}
      data-selection-toolbar=""
      role="toolbar"
      aria-label={t('quote')}
      style={{ left: left + 'px', top: top + 'px' }}
    >
      <Tooltip side="bottom" label={copyCopied ? t('copied') : t('copy')}>
        <button type="button" className={css.action} onClick={handleCopy} aria-label={t('copy')}>
          {copyCopied ? <IconCheckOutline16 /> : <IconCopyOutline16 />}
        </button>
      </Tooltip>
      <Tooltip side="bottom" label={quoteCopied ? t('quoted') : t('quote')}>
        <button type="button" className={css.action} onClick={handleQuote} aria-label={t('quote')}>
          {quoteCopied ? <IconCheckOutline16 /> : <QuoteIcon />}
        </button>
      </Tooltip>
    </div>
  )
}
