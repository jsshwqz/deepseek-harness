import { useEffect, useState, useCallback, useRef } from 'react'
import { Sidebar } from './components/Sidebar.js'
import { ChatArea } from './components/ChatArea.js'
import { Composer } from './components/Composer.js'
import { Header } from './components/Header.js'
import { StatusBar } from './components/StatusBar.js'
import { SettingsPanel } from './components/SettingsPanel.js'
import { useSessions } from './hooks/useSessions.js'
import { useRuntime } from './hooks/useRuntime.js'

export default function App() {
  const { sessions, activeSession, createSession, switchSession, renameSession, deleteSession } = useSessions()
  const { status, response, isLoading, prompt, messages } = useRuntime()
  const [showSettings, setShowSettings] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const handleNewSession = useCallback(() => {
    const s = createSession()
    switchSession(s.id)
  }, [createSession, switchSession])

  const handlePrompt = useCallback((content: string) => {
    if (!activeSession || !content.trim()) return
    prompt(activeSession.id, content.trim())
  }, [activeSession, prompt])

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    const unsub = window.dsDesktop.app.onNewSession(handleNewSession)
    return () => unsub()
  }, [handleNewSession])

  useEffect(() => {
    const unsub = window.dsDesktop.app.onToggleSidebar(() => setSidebarVisible(v => !v))
    return () => unsub()
  }, [])

  useEffect(() => {
    const unsub = window.dsDesktop.app.onOpenSettings(() => setShowSettings(true))
    return () => unsub()
  }, [])

  return (
    <div className="app">
      <div className="drag-layer" />
      {sidebarVisible && (
        <Sidebar
          sessions={sessions}
          activeId={activeSession?.id ?? null}
          onNew={handleNewSession}
          onSelect={switchSession}
          onRename={renameSession}
          onDelete={deleteSession}
        />
      )}
      <div className="main-area">
        <Header
          status={status}
          model={activeSession?.model ?? 'deepseek-v4-flash'}
          onToggleSidebar={() => setSidebarVisible(v => !v)}
          onOpenSettings={() => setShowSettings(true)}
        />
        <ChatArea
          messages={messages}
          isLoading={isLoading}
          response={response}
          activeSession={activeSession}
        />
        <div ref={chatEndRef} />
        <Composer
          onSend={handlePrompt}
          disabled={isLoading || !activeSession}
          placeholder={activeSession ? 'Type a message... (Cmd+Enter to send)' : 'Start a new session first'}
        />
        <StatusBar status={status} model={activeSession?.model ?? ''} />
      </div>
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}