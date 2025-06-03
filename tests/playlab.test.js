// playlab-test.js

// Import environment variables from .env file using ES module syntax
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.PLAYLAB_API_KEY;
const PROJECT_ID = process.env.PLAYLAB_PROJECT_ID;
const BASE_URL = 'https://www.playlab.ai/api/v1';

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json'
};

async function createConversation() {
  const res = await fetch(`${BASE_URL}/projects/${PROJECT_ID}/conversations`, {
    method: 'POST',
    headers,
    body: JSON.stringify({}) // No instructionVariables
  });

  if (res.status === 404) {
    console.error('❌ Error: Endpoint not found. Please check the BASE_URL and PROJECT_ID.');
    throw new Error('API endpoint not found (404).');
  }

  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    console.error('❌ Non-JSON response received. Status:', res.status);
    console.error('❌ Headers:', JSON.stringify([...res.headers]));
    throw new Error('Expected JSON response but got non-JSON content.');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(`Create Conversation Failed: ${JSON.stringify(data)}`);

  console.log('✅ Conversation created:', data.conversation.id);
  return data.conversation.id;
}

async function sendMessage(conversationId, message = 'Hello from test script') {
  const res = await fetch(`${BASE_URL}/projects/${PROJECT_ID}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ input: { message } })
  });

  const contentType = res.headers.get('content-type');
  console.log('ℹ️ Content-Type:', contentType);
  if (!contentType || (!contentType.includes('text/event-stream') && !contentType.includes('text/plain'))) {
    const responseText = await res.text();
    console.error('❌ Unexpected response received:', responseText);
    throw new Error('Expected SSE stream but got a different response.');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let assistantReply = ''; // accumulate full assistant message

  // add a blank line before streaming for clarity
  process.stdout.write('\n');

  // Process SSE stream, extracting only meaningful deltas or content
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split(/\r?\n/);
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue; // skip other SSE lines
      const payload = line.replace('data: ', '').trim();
      if (payload === '' || payload === '[DONE]') continue;
      try {
        const parsed = JSON.parse(payload);
        if (parsed.delta) {
          process.stdout.write(parsed.delta);
          assistantReply += parsed.delta;
        } else if (parsed.content) {
          process.stdout.write(parsed.content);
          assistantReply += parsed.content;
        }
      } catch {
        // non-JSON payload, print raw
        process.stdout.write(payload);
        assistantReply += payload;
      }
    }
  }

  console.log('\n✅ Assistant response complete.');
  return assistantReply;
}

// Define listMessages to optionally fetch conversation history
async function listMessages(conversationId) {
  const res = await fetch(`${BASE_URL}/projects/${PROJECT_ID}/conversations/${conversationId}/messages`, {
    method: 'GET',
    headers
  });

  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const responseText = await res.text();
    console.error('❌ Non-JSON response received:', responseText);
    throw new Error('Expected JSON response but got non-JSON content.');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(`List Messages Failed: ${JSON.stringify(data)}`);

  console.log('✅ Message history:');
  data.messages.forEach((msg, i) => {
    console.log(`(${i + 1}) [${msg.source}] ${msg.content}`);
  });
}

import readline from 'readline/promises';
import { stdin, stdout } from 'node:process';

// Interactive CLI main function
(async () => {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  try {
    const conversationId = await createConversation();
    let continueChat = true;
    while (continueChat) {
      const message = await rl.question('Enter your message: ');
      await sendMessage(conversationId, message);
      const listAnswer = await rl.question('List message history? (y/n): ');
      if (listAnswer.trim().toLowerCase() === 'y') {
        await listMessages(conversationId);
      }
      const again = await rl.question('Send another message? (y/n): ');
      continueChat = again.trim().toLowerCase() === 'y';
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    rl.close();
  }
})();
