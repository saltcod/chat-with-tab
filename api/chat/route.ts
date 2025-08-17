import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { messages, pageContent } = await req.json()

    // Create the system message with page context
    const systemMessage = {
      role: 'system' as const,
      content: `You are a helpful AI assistant that can see the current webpage the user is on.

Current page context:
${pageContent}

Please help the user with questions about this page or any other assistance they need. Be concise and helpful.`,
    }

    // Prepare messages for OpenAI
    const openaiMessages = [
      systemMessage,
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    ]

    // Ask OpenAI for a streaming chat completion
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: openaiMessages,
      max_tokens: 500,
      temperature: 0.7,
    })

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response)

    // Return a StreamingTextResponse, which can be consumed by the client
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(JSON.stringify({ error: 'Failed to process chat request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
