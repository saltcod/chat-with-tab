export function scrapePageContent(): string {
  // Get the page title
  const title = document.title || 'Untitled Page'

  // Get the current URL
  const url = window.location.href

  // Get main content - try different selectors for better content extraction
  const contentSelectors = ['main', 'article', '[role="main"]', '.content', '.main', '#content', '#main', 'body']

  let mainContent = ''
  for (const selector of contentSelectors) {
    const element = document.querySelector(selector)
    if (element && element.textContent) {
      mainContent = element.textContent.trim()
      if (mainContent.length > 100) break // Found substantial content
    }
  }

  // If no main content found, get body text
  if (!mainContent) {
    mainContent = document.body?.textContent?.trim() || ''
  }

  // Clean up the content - remove extra whitespace and limit length
  const cleanedContent = mainContent.replace(/\s+/g, ' ').replace(/\n+/g, '\n').trim().substring(0, 8000) // Limit to 8000 characters to avoid token limits

  // Get visible text from headings for better context
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
    .map((h) => h.textContent?.trim())
    .filter(Boolean)
    .slice(0, 10) // Limit to first 10 headings

  const headingsText = headings.length > 0 ? `\n\nPage Headings:\n${headings.join('\n')}` : ''

  return `Page: ${title}
URL: ${url}${headingsText}

Content:
${cleanedContent}`
}
