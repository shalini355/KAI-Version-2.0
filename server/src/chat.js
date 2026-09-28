const { Message } = require('./models');
const { mistralApiKey } = require('./config');
const { getChatResponse } = require('./services/aiProvider');

const SYSTEM_PROMPT = `You are Kai, a warm and empathetic mental wellness companion. You are non-clinical, fluent in English and Hinglish, and never diagnose, prescribe, or replace a qualified professional. Listen carefully, reflect feelings, ask gentle open questions, and suggest small practical steps. Keep replies concise and human. If someone may be in immediate danger, encourage contacting local emergency services and trusted people.`;

const crisisPattern = /\b(kill myself|end my life|suicid|self[- ]?harm|hurt myself|marna|jaan dena|khudkushi|khud ko nuksan)\b/i;

async function tryMistralStream(messages, model) {
  const { Mistral } = await import('@mistralai/mistralai');
  const client = new Mistral({ apiKey: mistralApiKey });
  return client.chat.stream({ model, messages });
}

async function postChat(req, res, next) {
  try {
    const text = String(req.body.message || '').trim();
    if (!text || text.length > 4000) return res.status(400).json({ message: 'Please send a message under 4000 characters.' });

    // Crisis detection — runs before any AI call, regardless of provider
    if (crisisPattern.test(text)) {
      const crisisReply = 'I am really sorry you are carrying this right now. You deserve immediate, human support. Please visit Resources for urgent help, contact local emergency services, or reach out to someone you trust and stay with them.';
      await Message.create([{ userId: req.user.id, role: 'user', content: text }, { userId: req.user.id, role: 'assistant', content: crisisReply }]);
      return res.json({ message: crisisReply, crisis: true });
    }

    const recent = await Message.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(12).lean();
    const history = recent.reverse().map(({ role, content }) => ({ role, content }));
    const messages = [{ role: 'system', content: SYSTEM_PROMPT }, ...history, { role: 'user', content: text }];

    // Streaming path — attempt Mistral stream; if it fails, fall through to
    // the unified fallback chain and emit the reply as a single SSE done event
    if (mistralApiKey && req.headers.accept?.includes('text/event-stream')) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let reply = '';
      let streamed = false;

      for (const model of ['mistral-large-latest', 'mistral-small-latest']) {
        try {
          const stream = await tryMistralStream(messages, model);
          for await (const event of stream) {
            const token = event.data?.choices?.[0]?.delta?.content || '';
            if (token) { reply += token; res.write(`data: ${JSON.stringify({ token })}\n\n`); }
          }
          streamed = true;
          break;
        } catch (err) {
          const isRetryable = err.status === 429 || err.statusCode === 429 || err.status === 403 || err.statusCode === 403;
          if (model === 'mistral-large-latest' && isRetryable) continue;
          console.warn(`[AI] mistral stream failed (${model}): ${err.message}`);
          break;
        }
      }

      // If Mistral streaming failed entirely, use the fallback chain
      if (!streamed) {
        reply = await getChatResponse(messages);
      }

      res.write(`data: ${JSON.stringify({ done: true, message: reply })}\n\n`);
      res.end();
      await Message.create([{ userId: req.user.id, role: 'user', content: text }, { userId: req.user.id, role: 'assistant', content: reply }]);
      return;
    }

    // Non-streaming path — goes straight through the unified fallback chain
    const reply = await getChatResponse(messages);
    await Message.create([{ userId: req.user.id, role: 'user', content: text }, { userId: req.user.id, role: 'assistant', content: reply }]);
    res.json({ message: reply, crisis: false });
  } catch (err) { next(err); }
}

async function getHistory(req, res, next) {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 30), 1), 100);
    const [messages, total] = await Promise.all([
      Message.find({ userId: req.user.id }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Message.countDocuments({ userId: req.user.id })
    ]);
    res.json({ messages: messages.reverse(), page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
}

module.exports = { postChat, getHistory, crisisPattern };
