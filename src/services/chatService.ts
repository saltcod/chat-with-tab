import { scrapePageContent } from '../utils/pageScraper'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatResponse {
  message: string
  error?: string
}

export async function sendChatMessage(message: string, conversationHistory: ChatMessage[] = []): Promise<ChatResponse> {
  try {
    // Scrape the current page content
    const pageContent = scrapePageContent()

    // Prepare messages for the API
    const messages = [
      ...conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: message,
      },
    ]

    // Send message to background script to handle API call
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        {
          type: 'CHAT_REQUEST',
          messages,
          pageContent,
        },
        (response) => {
          if (response.success) {
            resolve({ message: response.message })
          } else {
            resolve({ message: '', error: response.error })
          }
        }
      )
    })
  } catch (error) {
    console.error('Error sending chat message:', error)
    return {
      message: '',
      error: 'Failed to send message. Please try again.',
    }
  }
}
