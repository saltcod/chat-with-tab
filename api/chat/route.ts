import OpenAI from 'openai'

export const runtime = 'edge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

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
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
    ]

    // Get response from OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: openaiMessages,
      max_tokens: 500,
      temperature: 0.7,
    })

    return new Response(response.choices[0]?.message?.content || 'No response', {
      headers: { 'Content-Type': 'text/plain' },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(JSON.stringify({ error: 'Failed to process chat request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
