import { JournalEntry, MoodType } from '../types';

const STORAGE_KEY_JOURNAL = 'kai_journal_entries';

export const ROTATING_PROMPTS = [
  'What is one tiny thing you can forgive yourself for today?',
  'What made your shoulders relax, even for two seconds, recently?',
  'If a friend were in your situation, what would you tell them?',
  'What is one boundary you maintained that kept your peace safe?',
  'What thought can you leave behind on this page before you rest?',
];

export const journalService = {
  getEntries(): JournalEntry[] {
    const raw = localStorage.getItem(STORAGE_KEY_JOURNAL);
    if (!raw) return [];
    try {
      const entries: JournalEntry[] = JSON.parse(raw);
      const actualEntries = entries.filter((entry) => !/^entry-[1-3]$/.test(entry.id));
      if (actualEntries.length !== entries.length) {
        localStorage.setItem(STORAGE_KEY_JOURNAL, JSON.stringify(actualEntries));
      }
      return actualEntries;
    } catch {
      return [];
    }
  },

  createEntry(
    title: string,
    content: string,
    moodTag?: MoodType,
    promptUsed?: string,
  ): JournalEntry {
    const entries = this.getEntries();
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const newEntry: JournalEntry = {
      id: 'entry-' + Date.now(),
      title: title || 'New reflection',
      content,
      moodTag,
      promptUsed,
      wordCount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    entries.unshift(newEntry);
    localStorage.setItem(STORAGE_KEY_JOURNAL, JSON.stringify(entries));
    return newEntry;
  },

  updateEntry(id: string, updates: Partial<JournalEntry>): JournalEntry {
    const entries = this.getEntries();
    let updatedEntry: JournalEntry | undefined;

    const newEntries = entries.map((entry) => {
      if (entry.id === id) {
        const content = updates.content !== undefined ? updates.content : entry.content;
        const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
        updatedEntry = {
          ...entry,
          ...updates,
          wordCount,
          updatedAt: new Date().toISOString(),
        };
        return updatedEntry;
      }
      return entry;
    });

    localStorage.setItem(STORAGE_KEY_JOURNAL, JSON.stringify(newEntries));
    return updatedEntry || entries[0];
  },

  deleteEntry(id: string): void {
    const entries = this.getEntries().filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEY_JOURNAL, JSON.stringify(entries));
  },
};
