import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 5000);
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = new Set(
  (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);
const localDevelopmentOrigins = new Set([`http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`]);

app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", ...(!isProduction ? ["'unsafe-inline'"] : [])],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        styleSrcAttr: ["'unsafe-inline'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'", ...(!isProduction ? ['ws:', 'wss:'] : [])],
      },
    },
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.has(origin) ||
        (!isProduction && localDevelopmentOrigins.has(origin))
      ) {
        callback(null, true);
      } else {
        callback(new Error('Origin is not allowed.'));
      }
    },
  }),
);
app.use(express.json({ limit: '32kb' }));

const chatRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        sender: z.enum(['user', 'kai']),
        text: z.string().max(8_000),
      }),
    )
    .max(80),
  language: z.enum(['english', 'hinglish']).default('english'),
  userName: z.string().max(80).optional(),
  focusAreas: z.array(z.string().max(80)).max(20).optional(),
});

function getGeminiHttpStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('status' in error)) return undefined;
  return typeof error.status === 'number' ? error.status : undefined;
}

// Initialize GoogleGenAI SDK safely
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Streaming Chat API endpoint
app.post('/api/chat/stream', chatRateLimit, async (req: Request, res: Response) => {
  const parsedRequest = chatRequestSchema.safeParse(req.body);
  if (!parsedRequest.success) {
    res.status(400).json({ error: 'Invalid chat request.' });
    return;
  }

  const { messages, language, userName, focusAreas } = parsedRequest.data;

  if (!ai) {
    res.status(503).json({ error: 'Chat is not configured on this server.' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const langInstruction =
    language === 'hinglish'
      ? 'The user prefers Hinglish (conversational Hindi written in Roman English script, e.g. "kaisa lag raha hai", "tension mat lo"). Reply naturally in empathetic Hinglish.'
      : "The user prefers English. Use plain, natural English, matching the user's tone.";

  const systemInstruction = `You are Kai, a supportive chat companion for college students and young adults in India. Sound like a thoughtful person, not a counsellor or customer-support agent. Use plain words and the language the user is using; use Hinglish only when they do. Keep each reply to 2-5 short sentences. Do not use headings, bullet points, or em dashes. Do not repeat the user's message back to them. Vary your opening: do not default to "I'm sorry to hear that" or "It sounds like". Acknowledge what matters, then offer at most one useful next step when it fits. Sometimes a simple follow-up is enough; don't end every reply with a question or advice. Don't claim to know exactly how someone feels, and don't promise privacy, safety, or an outcome.

You are not a therapist. Do not diagnose, prescribe, or present medical advice. If someone may hurt themselves, mentions suicide, or is in immediate danger, respond directly and calmly. Encourage them to contact Tele-MANAS at 14416 or a trusted person now. Do not bury that guidance under a breathing exercise or generic reassurance.

Examples of the voice to use:
User: I have two exams tomorrow and I haven't started. I'm cooked.
Kai: Two exams in one day is a lot to hold. We don't need to solve the whole week right now. Which paper is first?

User: everyone in my hostel seems fine and i'm the only one panicking
Kai: Hostel corridors can make it look like everyone else has life sorted. You don't have to perform "fine" here. Want to tell me what's setting the panic off tonight?

User: placement season is making me feel like a failure. my friends got offers already
Kai: That comparison hits hard when offers are coming in around you. Their timeline isn't a score for your life. What part of placements is weighing on you most right now?

User: I don't need advice. I just want to say this somewhere.
Kai: Go ahead. I can just listen; you don't have to turn it into a plan.

User: yaar kal viva hai and kuch yaad nahi ho raha
Kai: Viva se pehle dimaag blank ho jaana kaafi common hai. Abhi poora syllabus nahi, bas pehla topic kholo. Kis subject ka viva hai?

User: ghar pe sab bolte hain engineering kar lo, but mujhe pata nahi mujhe chahiye bhi ya nahi
Kai: It gets confusing when everyone's plan for you is louder than your own. You don't need a final answer tonight. Kab se ye doubt zyada aa raha hai?

User: aaj mess ka khana bhi nahi khaya, bas room mein pada raha
Kai: Aaj kaafi low-energy lag raha hai. Kya paani ya kuch chhota sa kha paana possible hai? We can keep this very small.

User: mujhe lag raha hai khud ko hurt kar dunga
Kai: I'm glad you told me. Please move away from anything you could use to hurt yourself and call Tele-MANAS on 14416 now, or tell someone you trust to stay with you. Are you in immediate danger right now?

User details: Name is ${userName || 'Friend'}. Focus areas: ${
    focusAreas && focusAreas.length > 0 ? focusAreas.join(', ') : 'not specified'
  }.
Language preference: ${langInstruction}`;

  try {
    const contents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];

    if (Array.isArray(messages)) {
      for (const msg of messages) {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text || '' }],
        });
      }
    }

    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: 'Hello Kai' }],
      });
    }

    const responseStream = await (async () => {
      let attempt = 0;
      while (true) {
        try {
          return await ai.models.generateContentStream({
            model: 'gemini-3.5-flash-lite',
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });
        } catch (error: unknown) {
          const status = getGeminiHttpStatus(error);
          const canRetry =
            status === 408 || status === 429 || (status !== undefined && status >= 500);
          if (!canRetry || attempt >= 1) throw error;
          await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 250));
          attempt += 1;
        }
      }
    })();

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error: unknown) {
    const status = getGeminiHttpStatus(error);
    const errorMessage =
      status === 401 || status === 403
        ? 'Gemini rejected the server key or access. Check GEMINI_API_KEY and API permissions.'
        : status === 429
          ? 'Gemini is at its usage limit. Try again later or check the provider quota.'
          : status === 404
            ? 'The configured Gemini model is unavailable. Check the model name and access.'
            : typeof status === 'number' && status >= 500
              ? 'Gemini is temporarily unavailable. Try again shortly.'
              : 'Gemini could not generate a reply. Check the server logs and provider status.';

    console.error(
      `Gemini chat request failed${typeof status === 'number' ? ` (HTTP ${status})` : ''}.`,
    );
    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    res.end();
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(apiKey) });
});

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0');
}

startServer();
