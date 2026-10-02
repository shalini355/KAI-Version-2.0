import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { activityService } from '../src/services/activityService';
import { chatService } from '../src/services/chatService';
import { moodService } from '../src/services/moodService';

function createStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(String(key), String(value)),
  };
}

describe('local data services', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts with no fabricated mood entries or streak', () => {
    expect(moodService.getMoods()).toEqual([]);
    expect(moodService.getStreak()).toBe(0);
  });

  it('counts only activity the user records', () => {
    expect(activityService.getWeeklyStats().totalSessions).toBe(0);

    activityService.logActivity('breathing', 3, 'Box breathing');

    expect(activityService.getWeeklyStats()).toMatchObject({
      totalMinutes: 3,
      totalSessions: 1,
      breathingMinutes: 3,
    });
  });

  it('creates a blank conversation without seeded transcripts', () => {
    expect(chatService.getSessions()).toEqual([]);

    const session = chatService.createSession('english');

    expect(session.title).toBe('New conversation');
    expect(chatService.getSessions()).toHaveLength(1);
  });

  it('uses a plain fallback when the chat stream has no reply text', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('data: [DONE]\n\n')));
    const onComplete = vi.fn();
    const onError = vi.fn();

    await chatService.streamResponse(
      'session-1',
      [],
      'I feel stuck',
      'english',
      'Friend',
      [],
      vi.fn(),
      onComplete,
      onError,
    );

    expect(onComplete).toHaveBeenCalledWith(
      'That sounds hard to sit with. Want to tell me what part is weighing on you most?',
    );
    expect(onError).not.toHaveBeenCalled();
  });

  it('surfaces provider errors instead of saving a fallback as a reply', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response('data: {"error":"Gemini is at its usage limit."}\n\ndata: [DONE]\n\n'),
        ),
    );
    const onComplete = vi.fn();
    const onError = vi.fn();

    await chatService.streamResponse(
      'session-1',
      [],
      'Please help me plan my day.',
      'english',
      'Friend',
      [],
      vi.fn(),
      onComplete,
      onError,
    );

    expect(onComplete).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(new Error('Gemini is at its usage limit.'));
  });

  it('still flags direct self-harm language for crisis support', () => {
    expect(chatService.checkCrisis('I want to die')).toBe(true);
    expect(chatService.checkCrisis('I am stressed about exams')).toBe(false);
  });
});