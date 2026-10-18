import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { activityService } from '../src/services/activityService';
import { authService } from '../src/services/authService';
import { chatService } from '../src/services/chatService';
import { moodService } from '../src/services/moodService';
import { toLocalDateKey } from '../src/utils/date';

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

  it('formats dates using the user’s local calendar date', () => {
    const date = new Date(2026, 9, 19, 0, 15);

    expect(toLocalDateKey(date)).toBe('2026-10-19');
  });

  it('replaces a same-day check-in at the same time of day', () => {
    const first = moodService.logMood('sad', 3, [], '', 'evening');
    const replacement = moodService.logMood('calm', 8, [], '', 'evening');
    moodService.logMood('happy', 9, [], '', 'morning');

    expect(replacement.date).toBe(first.date);
    expect(moodService.getMoods()).toHaveLength(2);
    expect(moodService.getMoods()[0].value).toBe('happy');
    expect(moodService.getMoods()[1].value).toBe('calm');
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

  it('reports an error when the chat stream has no reply text', async () => {
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

    expect(onComplete).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(
      new Error("Kai couldn't reply just now. Please try again."),
    );
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

describe('local profiles', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates and reopens a saved profile by case-insensitive email', async () => {
    const created = await authService.signup('  Asha  ', ' ASHA@example.com ');
    const opened = await authService.login('asha@EXAMPLE.com');

    expect(created.name).toBe('Asha');
    expect(created.email).toBe('asha@example.com');
    expect(opened.id).toBe(created.id);
    expect(JSON.parse(localStorage.getItem('kai_user') || 'null')).toMatchObject({
      id: created.id,
      email: 'asha@example.com',
    });
  });

  it('does not silently create a profile during login', async () => {
    await expect(authService.login('unknown@example.com')).rejects.toThrow(
      'No local profile matches that email.',
    );
    expect(localStorage.getItem('kai_users_db')).toBeNull();
    expect(localStorage.getItem('kai_user')).toBeNull();
  });

  it('rejects duplicate local profile emails', async () => {
    await authService.signup('Asha', 'asha@example.com');

    await expect(authService.signup('Another name', 'ASHA@example.com')).rejects.toThrow(
      'A local profile already uses that email.',
    );
  });

  it('persists profile edits so the updated email can reopen the profile', async () => {
    const profile = await authService.signup('Asha', 'asha@example.com');
    authService.updateProfile({ name: 'Asha Patel', email: 'ASHA.PATEL@example.com' });
    authService.logout();

    const reopened = await authService.login('asha.patel@example.com');

    expect(reopened).toMatchObject({
      id: profile.id,
      name: 'Asha Patel',
      email: 'asha.patel@example.com',
    });
  });

  it('allows guests to update their name without an email', () => {
    authService.loginAsGuest();

    const updated = authService.updateProfile({ name: 'Guest Demo' });

    expect(updated).toMatchObject({ name: 'Guest Demo', email: '', isGuest: true });
  });
});
