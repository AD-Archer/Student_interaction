/**
 * aiService.ts
 * Provides a unified interface for AI summarization and chat, supporting Playlab as the primary provider and OpenAI as a fallback or override.
 *
 * Usage: Import and call aiService.summarize({ message, provider })
 * - By default, uses Playlab. Pass provider: 'openai' to force OpenAI.
 * - If Playlab fails, automatically falls back to OpenAI unless forced.
 *
 * This keeps all AI logic in one place, making it easy to swap providers or add more in the future.
 *
 * Environment variables required:
 *   PLAYLAB_API_KEY, PLAYLAB_PROJECT_ID for Playlab
 *   OPENAI_API_KEY for OpenAI
 */

import fetch from 'node-fetch'

const PLAYLAB_API_KEY = process.env.PLAYLAB_API_KEY
const PLAYLAB_PROJECT_ID = process.env.PLAYLAB_PROJECT_ID
const PLAYLAB_BASE_URL = 'https://www.playlab.ai/api/v1'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_BASE_URL = 'https://api.openai.com/v1'

/**
 * Calls Playlab API for summarization. Throws on error.
 */
async function summarizeWithPlaylab(message: string): Promise<string> {
  if (!PLAYLAB_API_KEY || !PLAYLAB_PROJECT_ID) throw new Error('Playlab credentials missing')
  // Step 1: create conversation
  const convRes = await fetch(`${PLAYLAB_BASE_URL}/projects/${PLAYLAB_PROJECT_ID}/conversations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PLAYLAB_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  })
  if (!convRes.ok) throw new Error('Playlab: failed to create conversation')
  // I assert the type here to avoid TS error
  const convJson = (await convRes.json()) as { conversation?: { id?: string } }
  const conversationId = convJson.conversation?.id
  if (!conversationId) throw new Error('Playlab: no conversation ID')
  // Step 2: send message
  const msgRes = await fetch(`${PLAYLAB_BASE_URL}/projects/${PLAYLAB_PROJECT_ID}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PLAYLAB_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: { message } }),
  })
  const contentType = msgRes.headers.get('content-type') || ''
  if (!contentType.includes('text/event-stream')) {
    const text = await msgRes.text()
    // Try to parse SSE-style lines if present
    const lines = text.split(/\r?\n/)
    const parsed = lines
      .filter(line => line.startsWith('data: '))
      .map(line => line.replace('data: ', '').trim())
      .filter(payload => payload && payload !== '[DONE]')
      .map(payload => {
        try {
          const json = JSON.parse(payload)
          return json.delta ?? (json.source === 'provider' ? json.content : '')
        } catch {
          return ''
        }
      })
      .join('')
    return parsed || text
  }
  // Streamed response (Node/Edge: ReadableStream is web standard)
  // I use a type guard to check for getReader without 'any'
  type MaybeReader = { getReader?: () => ReadableStreamDefaultReader<Uint8Array> }
  const body = msgRes.body as MaybeReader | undefined
  const reader = body?.getReader ? body.getReader() : undefined
  if (!reader) throw new Error('Playlab: no response body')
  const decoder = new TextDecoder('utf-8')
  let result = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    for (const line of chunk.split(/\r?\n/)) {
      if (!line.startsWith('data: ')) continue
      const payload = line.replace('data: ', '').trim()
      if (!payload || payload === '[DONE]') continue
      try {
        const parsed = JSON.parse(payload)
        result += parsed.delta ?? parsed.content ?? ''
      } catch {
        result += payload
      }
    }
  }
  return result
}

/**
 * Calls OpenAI API for summarization. Throws on error.
 */
async function summarizeWithOpenAI(message: string): Promise<string> {
  if (!OPENAI_API_KEY) throw new Error('OpenAI API key missing')
  const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert assistant. Summarize and analyze the following as requested.' },
        { role: 'user', content: message },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI: ${err}`)
  }
  // I assert the type here to avoid TS error
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
  return data.choices?.[0]?.message?.content || ''
}

/**
 * Unified AI service: tries Playlab, falls back to OpenAI, or uses OpenAI if forced.
 * @param opts.message - The message to summarize/analyze
 * @param opts.provider - 'playlab' | 'openai' | undefined
 */
export const aiService = {
  async summarize({ message, provider }: { message: string; provider?: 'playlab' | 'openai' }) {
    // If forced to OpenAI, use it
    if (provider === 'openai') return summarizeWithOpenAI(message)
    // Try Playlab first
    try {
      return await summarizeWithPlaylab(message)
    } catch (err) {
      // Only fallback if not forced to Playlab
      if (provider === 'playlab') throw err
      // Log and fallback
      console.warn('Playlab failed, falling back to OpenAI:', err)
      return summarizeWithOpenAI(message)
    }
  }
}
