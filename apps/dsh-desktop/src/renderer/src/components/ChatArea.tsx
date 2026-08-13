import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useEffect, useRef } from 'react'
import type { Message } from '../lib/types.js'

interface Props {
  messages: Message[]
  isLoading: boolean
  response: string
  activeSession: { model?: string } | null
}

function MessageBubble({ message }: { message: Message }) {
  return (
    <div className="message">
      <div className={['message-avatar', message.role].join(' ')}>
        {message.role === 'user' ? 'Y' : 'D'}
      </div>
      <div className="message-content">
        <div className="message-sender">
          {message.role === 'user' ? 'You' : 'DSH Agent'}
          <span className="timestamp">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="message-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}

export function ChatArea({ messages, isLoading, response, activeSession }: Props) {
  const messagesEnd = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  if (messages.length === 0) {
    return (
      <div className="chat-area">
        <div className="welcome">
          <div className="welcome-logo">DH</div>
          <div className="welcome-title">DeepSeek Harness Desktop</div>
          <div className="welcome-sub">
            A multi-platform desktop client for the DeepSeek Harness agent framework. 
            Connect to your AI coding agent directly from your desktop.
          </div>
          <div className="welcome-actions">
            <span className="welcome-action">Cmd+N <span className="key">new</span></span>
            <span className="welcome-action">Cmd+B <span className="key">sidebar</span></span>
            <span className="welcome-action">Cmd+, <span className="key">settings</span></span>
            <span className="welcome-action">Cmd+Enter <span className="key">send</span></span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-area">
      {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
      {isLoading && (
        <div className="message">
          <div className="message-avatar assistant">D</div>
          <div className="message-content">
            <div className="message-sender">DSH Agent</div>
            <div className="typing-indicator"><span /><span /><span /></div>
          </div>
        </div>
      )}
      <div ref={messagesEnd} />
    </div>
  )
}