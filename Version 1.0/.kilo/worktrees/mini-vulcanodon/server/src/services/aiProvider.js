const { mistralApiKey, geminiApiKey, groqApiKey } = require('../config');

const OVERALL_TIMEOUT_MS = 25000;
const PROVIDER_TIMEOUT_MS = 15000;
const FALLBACK_REPLY = "Kai is having trouble responding right now. Please try again in a moment.";

// Wraps a promise with a per-provider timeout
function withTimeout(promise, ms, providerName) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${providerName} timed out after ${ms}ms`)), ms)
    )
  ]);
}

// ── Mistral ──────────────────────────────────────────────────────────────────
async function mistralAdapter(messages) {
  if (!mistralApiKey) throw new Error('Mistral API key not configured');
  const { Mistral } = await import('@mistralai/mistralai');
  const client = new Mistral({ apiKey: mistralApiKey });

  // Try large first, fall back to small within the same adapter
  for (const model of ['mistral-large-latest', 'mistral-small-latest']) {
    try {
      const result = await withTimeout(
        client.chat.complete({ model, messages }),
        PROVIDER_TIMEOUT_MS,
        `mistral/${model}`
      );
      return result.choices?.[0]?.message?.content || null;
    } catch (err) {
      const isRateLimit = err.status === 429 || err.statusCode === 429;
      const isTierError = err.status === 403 || err.statusCode === 403 || err.code === 'tier_not_allowed';
      // Only retry on rate-limit/tier errors; propagate everything else
      if (model === 'mistral-large-latest' && (isRateLimit || isTierError)) continue;
      throw err;
    }
  }
  throw new Error('Mistral: both models failed');
}

// ── Gemini ───────────────────────────────────────────────────────────────────
async function geminiAdapter(messages) {
  if (!geminiApiKey) throw new Error('Gemini API key not configured');
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // Gemini separates systemInstruction from the conversation turns
  const systemMsg = messages.find(m => m.role === 'system');
  const turns = messages.filter(m => m.role !== 'system');

  // Gemini uses 'user'/'model' roles (not 'assistant')
  const history = turns.slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));
  const lastUserMessage = turns[turns.length - 1]?.content || '';

  const chat = model.startChat({
    systemInstruction: systemMsg?.content,
    history
  });

  const result = await withTimeout(
    chat.sendMessage(lastUserMessage),
    PROVIDER_TIMEOUT_MS,
    'gemini'
  );
  return result.response.text() || null;
}

// ── Groq ─────────────────────────────────────────────────────────────────────
async function groqAdapter(messages) {
  if (!groqApiKey) throw new Error('Groq API key not configured');
  const Groq = require('groq-sdk');
  const client = new Groq({ apiKey: groqApiKey });

  const completion = await withTimeout(
    client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages,
      max_tokens: 1024
    }),
    PROVIDER_TIMEOUT_MS,
    'groq'
  );
  return completion.choices?.[0]?.message?.content || null;
}

// ── Fallback chain ────────────────────────────────────────────────────────────
const PROVIDERS = [
  { name: 'mistral', fn: mistralAdapter },
  { name: 'gemini',  fn: geminiAdapter  },
  { name: 'groq',    fn: groqAdapter    }
];

async function getChatResponse(messages) {
  const overallDeadline = Date.now() + OVERALL_TIMEOUT_MS;

  for (const { name, fn } of PROVIDERS) {
    if (Date.now() >= overallDeadline) break;
    try {
      const reply = await fn(messages);
      if (reply) {
        console.info(`[AI] Request served by: ${name}`);
        return reply;
      }
    } catch (err) {
      console.warn(`[AI] ${name} failed: ${err.message}`);
    }
  }

  console.warn('[AI] Request served by: none — all providers failed');
  return FALLBACK_REPLY;
}

module.exports = { getChatResponse };
