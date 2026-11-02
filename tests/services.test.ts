import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { activityService } from '../src/services/activityService';
import { authService } from '../src/services/authService';
import {
  assessRisk,
  chatService,
  FIRST_CHAT_CONSENT_KEY,
  GEMINI_HISTORY_MESSAGE_LIMIT,
  getRecentGeminiMessages,
  hasFirstChatConsent,
  HIGH_RISK_STATIC_RESPONSE,
  GEMINI_FRIENDLY_FALLBACK,
  recordFirstChatConsent,
  shouldSendToGemini,
  transitionCrisisState,
} from '../src/services/chatService';
import { moodService } from '../src/services/moodService';
import { providerService } from '../src/services/providerService';
import { toLocalDateKey } from '../src/utils/date';
import { CrisisModal } from '../src/components/CrisisModal';

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
    expect(onError).toHaveBeenCalledWith(new Error('KAI response unavailable.'));
  });

  it('normalizes provider errors instead of saving raw provider text as a reply', async () => {
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
    expect(onError).toHaveBeenCalledWith(new Error('KAI response unavailable.'));
  });

  it('does not expose a Gemini provider error to the chat UI', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('{"error":"usage quota exceeded"}', {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
    const onError = vi.fn();

    await chatService.streamResponse(
      'session-1',
      [],
      'Please help',
      'english',
      'Friend',
      [],
      vi.fn(),
      vi.fn(),
      onError,
    );

    expect(onError).toHaveBeenCalledWith(new Error('KAI response unavailable.'));
    expect(onError.mock.calls[0]?.[0].message).not.toContain('usage quota');
  });

  it('normalizes a timeout rejection without exposing raw error text', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new DOMException('socket timed out after 30 seconds', 'AbortError')),
    );
    const onError = vi.fn();

    await chatService.streamResponse(
      'session-1',
      [],
      'I need support',
      'english',
      'Friend',
      [],
      vi.fn(),
      vi.fn(),
      onError,
    );

    expect(onError).toHaveBeenCalledWith(new Error('KAI response unavailable.'));
    expect(onError.mock.calls[0]?.[0].message).not.toContain('timed out');
  });

  it('provides static fallback support content for chat failures', () => {
    expect(GEMINI_FRIENDLY_FALLBACK).toContain('one-minute box-breathing exercise');
    expect(GEMINI_FRIENDLY_FALLBACK).toContain('journal prompt');
    expect(GEMINI_FRIENDLY_FALLBACK).toContain('112');
    expect(GEMINI_FRIENDLY_FALLBACK).toContain('14416');
  });

  it('still flags direct self-harm language for crisis support', () => {
    expect(chatService.checkCrisis('I want to die')).toBe(true);
    expect(chatService.checkCrisis('I am stressed about exams')).toBe(false);
  });

  it('does not reopen the crisis modal after the same high-risk message is acknowledged', () => {
    let state = transitionCrisisState('none', 'prompt');
    state = transitionCrisisState(state, 'acknowledge');

    expect(state).toBe('acknowledged');
    expect(shouldSendToGemini('I want to die', chatService.checkCrisis)).toBe(false);
    expect(HIGH_RISK_STATIC_RESPONSE).toContain('Tele-MANAS');
  });

  it('resets crisis state for a new conversation', () => {
    const acknowledged = transitionCrisisState('prompted', 'acknowledge');
    expect(transitionCrisisState(acknowledged, 'reset')).toBe('none');
    expect(transitionCrisisState('none', 'prompt')).toBe('prompted');
  });

  it('renders the immediate-danger emergency branch with 112 and Tele-MANAS only', () => {
    const markup = renderToStaticMarkup(
      React.createElement(CrisisModal, {
        isOpen: true,
        onClose: () => undefined,
        initialImmediateDanger: 'yes',
      }),
    );

    expect(markup).toContain('Call 112 now');
    expect(markup).toContain('Call Tele-MANAS 14416');
    expect(markup.toLowerCase()).toContain('talk to someone you trust');
    expect(markup).not.toContain('iCall');
    expect(markup).not.toContain('Continue talking to Kai');
  });

  it('renders the non-immediate support branch and allows continuing', () => {
    const markup = renderToStaticMarkup(
      React.createElement(CrisisModal, {
        isOpen: true,
        onClose: () => undefined,
        onContinueChat: () => undefined,
        initialImmediateDanger: 'no',
      }),
    );

    expect(markup).toContain('Tele-MANAS');
    expect(markup).toContain('iCall');
    expect(markup).toContain('112');
    expect(markup).toContain('Continue talking to Kai');
  });

  it('searches nearby psychiatrists with the selected search input', async () => {
    const providers = [
      {
        id: 'place-1',
        name: 'Clinic name',
        address: 'Kanpur, India',
        phoneNumber: '+91 1234567890',
        mapsUrl: 'https://maps.google.com/?cid=123',
      },
    ];
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ providers }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      providerService.findNearbyPsychiatrists({
        searchBy: 'text',
        location: 'Kanpur',
      }),
    ).resolves.toEqual(providers);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/providers/psychiatrists',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ searchBy: 'text', location: 'Kanpur' }),
      }),
    );
  });

  it('shows setup errors from the provider search API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'Add GOOGLE_MAPS_API_KEY on the server.' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    await expect(
      providerService.findNearbyPsychiatrists({
        searchBy: 'coordinates',
        latitude: 26.45,
        longitude: 80.33,
      }),
    ).rejects.toThrow('Add GOOGLE_MAPS_API_KEY on the server.');
  });

  it('rejects malformed provider results instead of trusting the response shape', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ providers: [{ id: 'place-1' }] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    await expect(
      providerService.findNearbyPsychiatrists({
        searchBy: 'text',
        location: 'Kanpur',
      }),
    ).rejects.toThrow('The provider search returned an invalid response.');
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

  it('records timestamped first-chat consent and only accepts it once', () => {
    expect(hasFirstChatConsent()).toBe(false);

    const acceptedAt = recordFirstChatConsent();

    expect(hasFirstChatConsent()).toBe(true);
    expect(JSON.parse(localStorage.getItem(FIRST_CHAT_CONSENT_KEY) || '{}')).toMatchObject({
      acceptedAt,
    });
  });

  it('limits Gemini history to the configured number of messages', () => {
    expect(GEMINI_HISTORY_MESSAGE_LIMIT).toBe(10);
    const messages = Array.from({ length: 15 }, (_, index) => `message-${index}`);

    expect(getRecentGeminiMessages(messages)).toEqual([
      'message-5',
      'message-6',
      'message-7',
      'message-8',
      'message-9',
      'message-10',
      'message-11',
      'message-12',
      'message-13',
      'message-14',
    ]);
  });

  it('deletes every KAI-prefixed localStorage key', () => {
    localStorage.setItem('kai_chat_sessions', '[]');
    localStorage.setItem('kai_first_chat_consent', '{}');
    localStorage.setItem('kai_user', '{}');
    localStorage.setItem('unrelated_app_key', 'keep');

    authService.wipeAllData();

    expect(localStorage.getItem('kai_chat_sessions')).toBeNull();
    expect(localStorage.getItem('kai_first_chat_consent')).toBeNull();
    expect(localStorage.getItem('kai_user')).toBeNull();
    expect(localStorage.getItem('unrelated_app_key')).toBe('keep');
  });
});
