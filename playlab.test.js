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
  console.log('ℹ️ Content-Type:', contentType); // Log the Content-Type for debugging
  if (!contentType || !contentType.includes('text/event-stream')) {
    const responseText = await res.text(); // Log the raw response for debugging
    console.error('❌ Unexpected response received:', responseText);
    throw new Error('Expected SSE stream but got a different response.');
  }

  console.log('✅ Message sent. Listening for server-sent events...');

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const events = chunk.split('\n\n'); // SSE events are separated by double newlines

    for (const event of events) {
      if (!event.trim()) continue;

      const [, eventLine, dataLine] = event.split('\n');
      const eventType = eventLine?.replace('event: ', '').trim();
      const data = dataLine?.replace('data: ', '').trim();

      console.log(`📡 Event received [${eventType || 'message'}]:`, data);
    }
  }

  console.log('✅ SSE stream ended.');
}

async function listMessages(conversationId) {
  const res = await fetch(`${BASE_URL}/projects/${PROJECT_ID}/conversations/${conversationId}/messages`, {
    method: 'GET',
    headers
  });

  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const responseText = await res.text(); // Log the raw response for debugging
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

(async () => {
  try {
    const conversationId = await createConversation();
    await sendMessage(conversationId, 'Test message from script!');
    await listMessages(conversationId);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();
