import { ChatMessage, ChatSession } from '../types';

export interface ExtendedChatSession extends ChatSession {
  category?: 'vents' | 'reflections' | 'sleep' | 'general';
  moodTag?: string;
  snippet?: string;
}

const STORAGE_KEY_SESSIONS = 'kai_chat_sessions';

const CRISIS_KEYWORDS = [
  'kill myself',
  'end it all',
  'suicide',
  'self harm',
  'want to die',
  'hurt myself',
  'take my own life',
  'no reason to live',
  'marna chahta',
  'marna chahti',
  'jeena nahi',
  'jeene ka mann nahi',
  'khud ko hurt',
  'mar jau',
  'khatam karna chahta',
  'khatam karna chahti',
  'khudkushi',
  'jaan de dunga',
  'jaan le luga',
  'end my life',
];

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
    const lower = text.toLowerCase().trim();
    return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
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
  ) {
    let accumulatedText = '';

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.concat([
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
        let message = 'Unable to connect to Kai server.';
        try {
          const payload = (await response.json()) as { error?: unknown };
          if (typeof payload.error === 'string') message = payload.error;
        } catch {
          // Keep the connection message when the server response is not JSON.
        }
        throw new Error(message);
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
              throw new Error(parsed.error);
            }
            if (typeof parsed.text === 'string') {
              accumulatedText += parsed.text;
              onChunk(accumulatedText);
            }
          }
        }
      }

      if (!accumulatedText) {
        accumulatedText =
          language === 'hinglish'
            ? 'Samajh aa raha hai ki yeh mushkil lag raha hai. Agar tum chaho, batao abhi sabse zyada kya bother kar raha hai.'
            : 'That sounds hard to sit with. Want to tell me what part is weighing on you most?';
      }

      onComplete(accumulatedText);
    } catch (error: unknown) {
      onError(error);
    }
  },
};
