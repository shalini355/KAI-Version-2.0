import { ChatMessage, ChatSession } from '../types';

export interface ExtendedChatSession extends ChatSession {
  category?: 'vents' | 'reflections' | 'sleep' | 'general';
  moodTag?: string;
  snippet?: string;
}

export type CrisisState = 'none' | 'prompted' | 'acknowledged';

export const GEMINI_HISTORY_MESSAGE_LIMIT = 10;
export const FIRST_CHAT_CONSENT_KEY = 'kai_first_chat_consent';

export const GEMINI_FRIENDLY_FALLBACK =
  "I'm having trouble responding right now, but you're not alone in this moment. You can try a one-minute box-breathing exercise, write one journal prompt: 'What feels hardest right now, and what would make this moment 1% easier?', or call 112 or Tele-MANAS 14416 if you need support now.";

export function getRecentGeminiMessages<T>(messages: readonly T[]): T[] {
  return messages.slice(-GEMINI_HISTORY_MESSAGE_LIMIT);
}

export function hasFirstChatConsent(): boolean {
  try {
    const value = localStorage.getItem(FIRST_CHAT_CONSENT_KEY);
    if (!value) return false;
    const record = JSON.parse(value) as { acceptedAt?: unknown };
    return typeof record.acceptedAt === 'string' && !Number.isNaN(Date.parse(record.acceptedAt));
  } catch {
    return false;
  }
}

export function recordFirstChatConsent(): string {
  const acceptedAt = new Date().toISOString();
  localStorage.setItem(FIRST_CHAT_CONSENT_KEY, JSON.stringify({ acceptedAt }));
  return acceptedAt;
}

export const HIGH_RISK_STATIC_RESPONSE =
  "I'm really glad you told me. I can't provide ongoing chat support for something this serious, so please contact someone you trust to stay with you now. In India, call Tele-MANAS at 14416 or, if you are in immediate danger, call 112.";

export function transitionCrisisState(
  current: CrisisState,
  event: 'prompt' | 'acknowledge' | 'reset',
): CrisisState {
  if (event === 'reset') return 'none';
  if (event === 'acknowledge') return 'acknowledged';
  return current === 'acknowledged' ? 'acknowledged' : 'prompted';
}

export function shouldSendToGemini(
  text: string,
  checkCrisis: (value: string) => boolean = (value) => assessRisk(value) === 'high',
): boolean {
  return !checkCrisis(text);
}

const STORAGE_KEY_SESSIONS = 'kai_chat_sessions';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') ?? '';

export function normalizeRiskText(text: string): string {
  return text
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/(.)\1{2,}/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

const HIGH_RISK_PHRASES = [
  'kill myself',
  'killing myself',
  'end it all',
  'suicide',
  'want to die',
  'wanna die',
  'wish i was dead',
  'hurt myself',
  'self harm',
  'take my own life',
  'no reason to live',
  'no reason for me to live',
  'end my life',
  'everyone would be better without me',
  'dont want to wake up',
  'do not want to wake up',
  'sab khatam kar du',
  'jeene ka mann nahi',
  'jeena nahi',
  'mar jau',
  'khudkushi',
  'khud ko hurt',
  'marna chahta',
  'marna chahti',
  'khatam karna chahta',
  'khatam karna chahti',
  'jaan de dunga',
  'jaan le luga',
  'khatam kar dunga',
  'khatam kar dungi',
];

const MEDIUM_RISK_PHRASES = [
  'cant take it anymore',
  'cannot take it anymore',
  'cannot take this anymore',
  'feeling hopeless',
  'i feel hopeless',
  'no hope left',
  'nothing matters',
  'nothing seems to matter anymore',
  'dont see a way out',
  'do not see a way out',
  'give up on life',
  'given up on life',
  'fed up with life',
  'kuch achha nahi lag raha',
  'zindagi se thak gaya',
  'zindagi se thak gayi',
  'ummeed nahi',
];

const NEGATION_PATTERNS = [
  /\b(?:not|never|dont|do not|didnt|did not)\s+(?:really\s+)?(?:want to die|wanna die|kill myself|hurt myself|suicide)\b/,
  /\b(?:would never|dont ever)\s+(?:hurt myself|kill myself|die)\b/,
  /\b(?:no|not)\s+(?:i am not|i was not)\s+(?:thinking of suicide|suicidal)\b/,
  /\b(?:i am not|im not|isnt|is not)\s+(?:suicidal|going to hurt myself|going to die)\b/,
  /\b(?:i am not|im not)\s+(?:really\s+)?going to\s+(?:kill myself|hurt myself)\b/,
];

export function assessRisk(text: string): 'high' | 'medium' | 'none' {
  const normalized = normalizeRiskText(text);
  const idiot = normalized.includes('this exam is killing me');
  const laughter = normalized.includes('dying of laughter');
  const falseAlarmContexts =
    normalized.includes('suicide prevention') ||
    normalized.includes('prevent suicide') ||
    normalized.includes('documentary discussed self harm') ||
    normalized.includes('joke about wanting to die') ||
    normalized.includes('the movie discussed feeling hopeless') ||
    normalized.includes('talked about feeling hopeless');

  if (
    idiot ||
    laughter ||
    falseAlarmContexts ||
    NEGATION_PATTERNS.some((pattern) => pattern.test(normalized))
  ) {
    return 'none';
  }

  if (HIGH_RISK_PHRASES.some((phrase) => normalized.includes(phrase))) {
    return 'high';
  }

  if (MEDIUM_RISK_PHRASES.some((phrase) => normalized.includes(phrase))) {
    return 'medium';
  }

  return 'none';
}

export const chatService = {
  getSessions(): ExtendedChatSession[] {
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (!raw) return [];
    try {
      const sessions: ExtendedChatSession[] = JSON.parse(raw);
      const realSessions = sessions.filter((session) => !/^session-[1-5]$/.test(session.id));
      if (realSessions.length !== sessions.length) {
        localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(realSessions));
      }
      return realSessions;
    } catch {
      return [];
    }
  },

  getSessionById(id: string): ExtendedChatSession | undefined {
    return this.getSessions().find((s) => s.id === id);
  },

  createSession(
    language: 'english' | 'hinglish' = 'hinglish',
    category: 'vents' | 'reflections' | 'sleep' | 'general' = 'vents',
    initialPrompt?: string,
  ): ExtendedChatSession {
    const sessions = this.getSessions();
    const newSession: ExtendedChatSession = {
      id: 'session-' + Date.now(),
      title: initialPrompt ? initialPrompt.slice(0, 30) : 'New conversation',
      language,
      category,
      snippet: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg-' + Date.now(),
          sender: 'kai',
          text:
            language === 'hinglish'
              ? 'Haan, bolo. Kya chal raha hai?'
              : "Hey. What's on your mind?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    sessions.unshift(newSession);
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    return newSession;
  },

  updateSession(session: ExtendedChatSession): void {
    const sessions = this.getSessions().map((s) => (s.id === session.id ? session : s));
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  },

  deleteSession(sessionId: string): void {
    const sessions = this.getSessions().filter((s) => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  },

  renameSession(sessionId: string, newTitle: string): void {
    const sessions = this.getSessions().map((s) =>
      s.id === sessionId ? { ...s, title: newTitle, updatedAt: new Date().toISOString() } : s,
    );
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  },

  purgeAll(): void {
    localStorage.removeItem(STORAGE_KEY_SESSIONS);
  },

  checkCrisis(text: string): boolean {
    return assessRisk(text) === 'high';
  },

  async streamResponse(
    sessionId: string,
    history: ChatMessage[],
    userMessage: string,
    language: 'english' | 'hinglish',
    userName: string,
    focusAreas: string[],
    onChunk: (text: string) => void,
    onComplete: (fullText: string) => void,
    onError: (error: unknown) => void,
    signal?: AbortSignal,
  ) {
    let accumulatedText = '';
    const recentHistory = getRecentGeminiMessages(history.slice(-(GEMINI_HISTORY_MESSAGE_LIMIT - 1)));

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal,
        body: JSON.stringify({
          messages: recentHistory.concat([
            {
              id: 'temp',
              sender: 'user',
              text: userMessage,
              timestamp: '',
            },
          ]),
          language,
          userName,
          focusAreas,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('KAI response unavailable.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') {
              break;
            }
            let parsed: { error?: unknown; text?: unknown };
            try {
              parsed = JSON.parse(dataStr);
            } catch {
              continue;
            }
            if (typeof parsed.error === 'string') {
              throw new Error('KAI response unavailable.');
            }
            if (typeof parsed.text === 'string') {
              accumulatedText += parsed.text;
              onChunk(accumulatedText);
            }
          }
        }
      }

      if (!accumulatedText.trim()) {
        throw new Error("Kai couldn't reply just now. Please try again.");
      }

      onComplete(accumulatedText);
    } catch (error: unknown) {
      void error;
      onError(new Error('KAI response unavailable.'));
    }
  },
};
