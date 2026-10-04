import { User } from '../types';

const STORAGE_KEY_USER = 'kai_user';
const STORAGE_KEY_USERS_DB = 'kai_users_db';

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

  login(email: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email || !password) {
          reject(new Error('Please enter both email and password.'));
          return;
        }
        if (password.length < 6) {
          reject(new Error('Password must be at least 6 characters.'));
          return;
        }

        const usersDb: User[] = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS_DB) || '[]');
        const existing = usersDb.find((u) => u.email.toLowerCase() === email.toLowerCase());

        const user: User = existing || {
          id: 'user_' + Date.now(),
          name: email.split('@')[0],
          email,
          isGuest: false,
          preferredLanguage: 'english',
          focusAreas: ['stress', 'studies'],
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        resolve(user);
      }, 300);
    });
  },

  signup(name: string, email: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!name || !email || !password) {
          reject(new Error('All fields are required.'));
          return;
        }
        if (password.length < 6) {
          reject(new Error('Password should be at least 6 characters.'));
          return;
        }

        const newUser: User = {
          id: 'user_' + Date.now(),
          name,
          email,
          isGuest: false,
          preferredLanguage: 'english',
          focusAreas: [],
          createdAt: new Date().toISOString(),
        };

        const usersDb: User[] = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS_DB) || '[]');
        usersDb.push(newUser);
        localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(usersDb));
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));

        resolve(newUser);
      }, 300);
    });
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
    const updated = { ...current, ...updates };
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
