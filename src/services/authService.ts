import { User } from '../types';

const STORAGE_KEY_USER = 'kai_user';
const STORAGE_KEY_USERS_DB = 'kai_users_db';

function getSavedUsers(): User[] {
  const raw = localStorage.getItem(STORAGE_KEY_USERS_DB);
  if (!raw) return [];

  let users: unknown;
  try {
    users = JSON.parse(raw);
  } catch {
    throw new Error('Saved local profiles are unreadable. Clear this browser’s KAI profile data.');
  }

  if (
    !Array.isArray(users) ||
    !users.every(
      (user) =>
        typeof user === 'object' &&
        user !== null &&
        typeof user.id === 'string' &&
        typeof user.name === 'string' &&
        typeof user.email === 'string',
    )
  ) {
    throw new Error('Saved local profiles are invalid. Clear this browser’s KAI profile data.');
  }

  return users;
}

export const authService = {
  getCurrentUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) return null;
    try {
      const user: User = JSON.parse(raw);
      if (user.id === 'user_riya_01') {
        localStorage.removeItem(STORAGE_KEY_USER);
        return null;
      }
      return user;
    } catch {
      localStorage.removeItem(STORAGE_KEY_USER);
      return null;
    }
  },

  async login(email: string): Promise<User> {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) throw new Error('Enter the email used for this local profile.');

    const user = getSavedUsers().find(
      (savedUser) => savedUser.email.trim().toLowerCase() === normalizedEmail,
    );
    if (!user) {
      throw new Error(
        'No local profile matches that email. Create a profile or continue as a guest.',
      );
    }

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    return user;
  },

  async signup(name: string, email: string): Promise<User> {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedName || !normalizedEmail) {
      throw new Error('Enter a name and email to create a local profile.');
    }

    const users = getSavedUsers();
    if (users.some((user) => user.email.trim().toLowerCase() === normalizedEmail)) {
      throw new Error('A local profile already uses that email. Open it or choose another email.');
    }

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: normalizedName,
      email: normalizedEmail,
      isGuest: false,
      preferredLanguage: 'english',
      focusAreas: [],
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
    return newUser;
  },

  loginAsGuest(): User {
    const guestUser: User = {
      id: 'guest_' + Math.random().toString(36).substring(2, 9),
      name: 'Guest',
      email: '',
      isGuest: true,
      preferredLanguage: 'english',
      focusAreas: ['stress', 'sleep'],
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(guestUser));
    return guestUser;
  },

  updateProfile(updates: Partial<User>): User {
    const current = this.getCurrentUser();
    if (!current) throw new Error('No active profile.');
    const normalizedUpdates = {
      ...updates,
      ...(typeof updates.name === 'string' ? { name: updates.name.trim() } : {}),
      ...(typeof updates.email === 'string' ? { email: updates.email.trim().toLowerCase() } : {}),
    };
    const updated = { ...current, ...normalizedUpdates };

    if (!updated.name || (!current.isGuest && !updated.email)) {
      throw new Error(
        current.isGuest ? 'A profile name is required.' : 'A profile name and email are required.',
      );
    }

    if (!current.isGuest) {
      const users = getSavedUsers();
      if (
        users.some(
          (user) =>
            user.id !== current.id &&
            user.email.trim().toLowerCase() === updated.email.toLowerCase(),
        )
      ) {
        throw new Error('Another local profile already uses that email.');
      }

      const index = users.findIndex((user) => user.id === current.id);
      if (index < 0) throw new Error('The saved local profile could not be found.');
      users[index] = updated;
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(users));
    }

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
    return updated;
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEY_USER);
  },

  wipeAllData(): void {
    for (let index = localStorage.length - 1; index >= 0; index--) {
      const key = localStorage.key(index);
      if (key?.startsWith('kai_')) localStorage.removeItem(key);
    }
  },

  exportAllData(): string {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('kai_')) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    return JSON.stringify(data, null, 2);
  },
};
