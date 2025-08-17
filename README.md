# Page Chat Extension

A Chrome extension that adds AI chat functionality to any webpage, allowing you to ask questions about the current page content.

## Features

- 🤖 **AI Chat**: Ask questions about any webpage using OpenAI's GPT models
- 📄 **Page Context**: Automatically scrapes and provides page content to the AI
- 💬 **Real-time Chat**: Interactive chat interface with message history
- 🎨 **Modern UI**: Clean, dark-themed chat panel that slides up from the bottom
- ⚡ **Fast**: Built with Vite and optimized for performance

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set up OpenAI API

1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a Vercel account and deploy the API

### 3. Deploy the API

1. Create a new Vercel project
2. Copy the `api/chat/route.ts` file to your Vercel project
3. Add your OpenAI API key as an environment variable:
   - Go to your Vercel project settings
   - Add `OPENAI_API_KEY` with your actual API key
4. Deploy the project
5. Copy the deployment URL (e.g., `https://your-app.vercel.app`)

### 4. Update the API URL

In `src/background.ts`, replace the API URL:

```typescript
const response = await fetch('https://your-app.vercel.app/api/chat', {
```

### 5. Build the Extension

```bash
pnpm build:prod
```

### 6. Load in Chrome

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder

## Usage

1. Navigate to any webpage
2. Click the Page Chat extension icon in your browser toolbar
3. Type your question about the page
4. Press Enter or click Send
5. The AI will respond with context from the current page

## Development

```bash
# Development mode
pnpm dev

# Build for production
pnpm build:prod

# Lint code
pnpm lint
```

## Architecture

- **Content Script** (`src/content/index.tsx`): Injects the chat UI and handles user interactions
- **Background Script** (`src/background.ts`): Handles extension icon clicks and API calls
- **Chat Service** (`src/services/chatService.ts`): Manages chat functionality and page scraping
- **Page Scraper** (`src/utils/pageScraper.ts`): Extracts content from webpages
- **Vercel API** (`api/chat/route.ts`): Edge function that handles AI chat requests

## API Endpoint

The extension uses a Vercel Edge Function for AI chat:

```typescript
POST /api/chat
{
  "messages": [
    { "role": "user", "content": "What is this page about?" }
  ],
  "pageContent": "Page title and content..."
}
```

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT
