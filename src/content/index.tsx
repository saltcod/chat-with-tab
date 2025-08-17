import React from 'react'
import { createRoot } from 'react-dom/client'
import { sendChatMessage, type ChatMessage } from '../services/chatService'

// Debug: Log that content script is loading
console.log('Page Chat content script loading...', new Date().toISOString())

// Mount a shadow-root so styles don’t clash with the page
const HOST_ID = 'pc-host'
if (!document.getElementById(HOST_ID)) {
  const host = document.createElement('div')
  host.id = HOST_ID
  document.documentElement.appendChild(host)

  const shadow = host.attachShadow({ mode: 'open' })
  const mount = document.createElement('div')
  const style = document.createElement('style')
  style.textContent = `
    .pc-wrap { position: fixed; left: 0; right: 0; bottom: 0; z-index: 2147483647; }
    .pc-panel {
      width: 100%;
      max-height: 50vh;
      background: #111827; /* slate-900 */
      color: #e5e7eb;      /* gray-200 */
      border-top: 1px solid #374151; /* gray-700 */
      box-shadow: 0 -8px 24px rgba(0,0,0,0.3);
      transform: translateY(calc(100% - 36px)); /* show header when closed */
      transition: transform .18s ease;
      font: 13px/1.4 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    }
    .pc-panel.open { transform: translateY(0); }
    .pc-header {
      display:flex; align-items:center; gap:.5rem;
      padding:.5rem .75rem; background:#0b1020; border-bottom:1px solid #374151;
      cursor: default; user-select:none;
    }
    .pc-title { font-weight:600; font-size:12px; opacity:.9; }
    .pc-body { padding:.75rem; }
    .pc-btn {
      background:#1f2937; border:1px solid #374151; padding:.25rem .5rem; border-radius:.5rem;
      color:#e5e7eb; cursor:pointer;
    }
    .pc-row { display:flex; gap:.5rem; margin-top:.5rem; }
    textarea, input {
      background:#0b1020; color:#e5e7eb; border:1px solid #374151; border-radius:.5rem;
      padding:.5rem; width:100%;
    }
    .pc-messages {
      max-height: 300px; overflow-y: auto; margin-bottom: 1rem;
    }
    .pc-welcome {
      text-align: center; padding: 1rem; opacity: 0.7;
    }
    .pc-message {
      margin-bottom: 0.75rem; padding: 0.5rem; border-radius: 0.5rem;
    }
    .pc-message.user {
      background: #1f2937; margin-left: 1rem;
    }
    .pc-message.assistant {
      background: #0b1020; margin-right: 1rem;
    }
    .pc-message-content {
      margin-bottom: 0.25rem; line-height: 1.4;
    }
    .pc-message-time {
      font-size: 11px; opacity: 0.5;
    }
  `
  shadow.append(style, mount)

  function App() {
    const [open, setOpen] = React.useState(false)
    const [question, setQuestion] = React.useState('')
    const [messages, setMessages] = React.useState<ChatMessage[]>([])
    const [isLoading, setIsLoading] = React.useState(false)

    React.useEffect(() => {
      // Listen for messages from the background script
      const handleMessage = (message: { action: string }) => {
        console.log('Page Chat received message:', message)
        if (message.action === 'togglePanel') {
          console.log('Toggling panel...')
          setOpen((prev) => !prev)
        }
      }

      console.log('Page Chat setting up message listener...')
      chrome.runtime.onMessage.addListener(handleMessage)
      return () => chrome.runtime.onMessage.removeListener(handleMessage)
    }, [])

    const handleSendMessage = async () => {
      if (!question.trim() || isLoading) return

      const userMessage: ChatMessage = {
        role: 'user',
        content: question.trim(),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setQuestion('')
      setIsLoading(true)

      try {
        const response = await sendChatMessage(question.trim(), messages)

        if (response.error) {
          throw new Error(response.error)
        }

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
      } catch (error) {
        console.error('Chat error:', error)
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
      }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
      }
    }

    return (
      <div className="pc-wrap">
        <div className={`pc-panel ${open ? 'open' : ''}`}>
          <div className="pc-header">
            <span className="pc-title">Page Chat</span>
            <button className="pc-btn" onClick={() => setOpen(false)}>
              Hide
            </button>
          </div>
          <div className="pc-body">
            <div className="pc-messages">
              {messages.length === 0 ? (
                <div className="pc-welcome">
                  <div>✅ Page Chat ready!</div>
                  <div>Ask me anything about this page.</div>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className={`pc-message ${msg.role}`}>
                    <div className="pc-message-content">{msg.content}</div>
                    <div className="pc-message-time">{msg.timestamp.toLocaleTimeString()}</div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="pc-message assistant">
                  <div className="pc-message-content">Thinking...</div>
                </div>
              )}
            </div>
            <div className="pc-row">
              <input
                placeholder="Ask about this page…"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button className="pc-btn" onClick={handleSendMessage} disabled={!question.trim() || isLoading}>
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  createRoot(mount).render(<App />)
}
