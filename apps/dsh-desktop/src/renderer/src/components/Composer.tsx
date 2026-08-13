import { useRef, useEffect, useCallback } from 'react'

interface Props {
  onSend: (content: string) => void
  disabled: boolean
  placeholder: string
}

export function Composer({ onSend, disabled, placeholder }: Props) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = useCallback(() => {
    if (text.trim() && !disabled) {
      onSend(text.trim())
      setText('')
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
    }
  }, [text, disabled, onSend])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setText(val)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [])

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  return (
    <div className="composer">
      <div className="composer-input">
        <textarea
          ref={textareaRef}
          className="composer-textarea"
          rows={1}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
        />
        <div className="composer-actions">
          <button className="attach-btn" title="Attach file">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>
          <button className="send-btn" onClick={handleSubmit} disabled={disabled || !text.trim()} title="Send (Cmd/Ctrl+Enter)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}