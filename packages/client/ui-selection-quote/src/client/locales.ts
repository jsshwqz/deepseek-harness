/** `selection` namespace dictionaries: the floating selection toolbar. */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  /** Copy the selected text formatted as a markdown blockquote. */
  'quote': '引用',
  /** Confirms the quoted text was written to the clipboard. */
  'quoted': '已引用',
} satisfies Record<string, string>

/** The selection namespace key union. */
export type SelectionKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'quote': 'Quote',
  'quoted': 'Quoted',
} satisfies Record<SelectionKey, string>
