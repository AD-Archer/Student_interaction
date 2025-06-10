/**
 * API route for AI summarization/insights with provider fallback.
 * Uses Playlab by default, falls back to OpenAI if Playlab fails, or uses OpenAI if requested.
 *
 * To force OpenAI, pass { provider: 'openai' } in the JSON body or ?provider=openai as a query param.
 *
 * All AI logic is handled in lib/aiService.ts for maintainability.
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/aiService';

export async function POST(request: NextRequest) {
  try {
    // Accept provider override via body or query param
    const url = new URL(request.url);
    const queryProvider = url.searchParams.get('provider');
    const body = await request.json();
    const { message, provider: bodyProvider } = body;
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid message field' }, { status: 400 });
    }
    // Prefer body provider, then query param, then default
    const provider = (bodyProvider || queryProvider) as 'playlab' | 'openai' | undefined;
    // I call the unified AI service, which handles fallback
    const result = await aiService.summarize({ message, provider });
    return NextResponse.json({ result });
  } catch (error) {
    // I log and return error details for debugging
    console.error('Error in AI route:', error);
    return NextResponse.json(
      { error: 'Internal error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
