/**
 * API route for interacting with Playlab AI.
 * This route provides modular access to Playlab's conversation and summarization capabilities.
 * It is designed to be reusable across the application.
 */

import { NextRequest, NextResponse } from 'next/server';

const PLAYLAB_API_KEY = process.env.PLAYLAB_API_KEY;
const PLAYLAB_PROJECT_ID = process.env.PLAYLAB_PROJECT_ID;
const PLAYLAB_BASE_URL = 'https://www.playlab.ai/api/v1';

if (!PLAYLAB_API_KEY || !PLAYLAB_PROJECT_ID) {
  console.error('Playlab API credentials are not configured.');
}

/**
 * Adds logging to debug the Playlab API request and response.
 */
export async function POST(request: NextRequest) {
  try {
    // No auth check: internal route for AI summarization

    // I expect a simple JSON payload with a 'message' field
    const { message } = await request.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid message field' }, { status: 400 });
    }

    console.log('Sending to Playlab API:', { message });

    // Step 1: create a new conversation on Playlab
    const createConversationResponse = await fetch(`${PLAYLAB_BASE_URL}/projects/${PLAYLAB_PROJECT_ID}/conversations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PLAYLAB_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!createConversationResponse.ok) {
      const err = await createConversationResponse.text();
      return NextResponse.json({ error: 'Failed to create conversation', details: err }, { status: createConversationResponse.status });
    }

    const { conversation: { id: conversationId } = {} } = await createConversationResponse.json();
    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID not returned by Playlab' },
        { status: 500 }
      );
    }

    // Step 2: send the incoming message as the first prompt
    const response = await fetch(`${PLAYLAB_BASE_URL}/projects/${PLAYLAB_PROJECT_ID}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PLAYLAB_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: { message } }),
    });

    // handle non-stream (plain/text or JSON) responses
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/event-stream')) {
      // not a streaming response: read full body
      const text = await response.text();
      console.log('Non-streamed AI response:', text);
      // try parsing SSE-style lines if present, only provider-side
      const lines = text.split(/\r?\n/);
      const parsed = lines
        .filter(line => line.startsWith('data: '))
        .map(line => line.replace('data: ', '').trim())
        .filter(payload => payload && payload !== '[DONE]')
        .map(payload => {
          try {
            const json = JSON.parse(payload);
            // only use streaming deltas or provider messages
            return json.delta ?? (json.source === 'provider' ? json.content : '');
          } catch {
            return '';
          }
        })
        .join('');
      if (parsed) {
        console.log('Parsed SSE data from non-stream text:', parsed);
        return NextResponse.json({ result: parsed });
      }
      // fallback: return raw text
      return NextResponse.json({ result: text });
    }

    // Process SSE stream from Playlab to build result
    const reader = response.body?.getReader();
    if (!reader) {
      return NextResponse.json({ error: 'No response body from Playlab' }, { status: 500 });
    }
    const decoder = new TextDecoder('utf-8');
    let result = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split(/\r?\n/)) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.replace('data: ', '').trim();
        if (!payload || payload === '[DONE]') continue;
        try {
          const parsed = JSON.parse(payload);
          result += parsed.delta ?? parsed.content ?? '';
        } catch {
          result += payload;
        }
      }
    }
    // log the aggregated AI response on the server
    console.log('Aggregated AI response:', result);
    // return the cleaned AI response
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error in AI route:', error);
    return NextResponse.json(
      { error: 'Internal error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
