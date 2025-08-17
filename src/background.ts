chrome.runtime.onInstalled.addListener(() => {
  console.log('Page Chat installed')
})

// Handle AI chat requests from content script
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log('Background script received message:', message, 'from:', sender)

  if (message.type === 'CHAT_REQUEST') {
    try {
      // Call the AI API - replace with your actual Vercel URL
      const apiUrl = 'https://chat-with-tab-c3sv.vercel.app/api/chat'
      console.log('Calling API at:', apiUrl)

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: message.messages,
          pageContent: message.pageContent,
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.text()
      sendResponse({ success: true, message: data })
    } catch (error) {
      console.error('AI API error:', error)
      sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' })
    }
    return true // Keep the message channel open for async response
  }
})

// Log any runtime errors
chrome.runtime.onSuspend.addListener(() => {
  console.log('Background script suspending')
})

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  console.log('Extension icon clicked for tab:', tab.id, tab.url)

  if (tab.id) {
    try {
      // Check if we can inject scripts on this tab
      const tabInfo = await chrome.tabs.get(tab.id)
      console.log('Tab info:', tabInfo.url, tabInfo.status)

      // Skip chrome:// and other restricted URLs
      if (tabInfo.url?.startsWith('chrome://') || tabInfo.url?.startsWith('chrome-extension://')) {
        console.log('Cannot inject on chrome:// URLs')
        return
      }

      // Try to send message to content script with retries
      let retries = 0
      const maxRetries = 10
      const retryDelay = 200

      const trySendMessage = async (): Promise<void> => {
        try {
          console.log(`Attempting to send message (attempt ${retries + 1}/${maxRetries})`)
          await chrome.tabs.sendMessage(tab.id!, { action: 'togglePanel' })
          console.log('Toggle message sent successfully!')
        } catch (error) {
          retries++
          console.log(`Message send failed (attempt ${retries}):`, error)

          if (retries < maxRetries) {
            console.log(`Retrying in ${retryDelay}ms...`)
            setTimeout(trySendMessage, retryDelay)
          } else {
            console.error('Failed to send message after all retries')
            console.log('The content script might not be loaded. Try refreshing the page and clicking the extension icon again.')
          }
        }
      }

      await trySendMessage()
    } catch (error) {
      console.error('Failed to handle extension click:', error)
    }
  }
})
