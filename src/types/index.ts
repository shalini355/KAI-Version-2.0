export type MoodType = 'happy' | 'calm' | 'okay' | 'sad' | 'anxious' | 'angry';

export interface User {
  id: string;
  name: string;
  email: string;
  isGuest?: boolean;
  avatar?: string;
  preferredLanguage?: 'english' | 'hinglish';
  focusAreas?: string[];
  reminderTime?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'kai';
  text: string;
  timestamp: string;
  rating?: 'like' | 'dislike';
  suggestion?: {
    type: 'breathing' | 'journal' | 'affirmation' | 'helpline';
    title: string;
    actionText: string;
    route: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  language: 'english' | 'hinglish';
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface MoodEntry {
  id: string;
  value: MoodType;
  intensity: number; // 1 to 10
  tags: string[];
  note?: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  date: string; // YYYY-MM-DD
  timestamp: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  moodTag?: MoodType;
  promptUsed?: string;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WellnessActivity {
  id: string;
  type: 'breathing' | 'journal' | 'affirmation' | 'chat';
  duration: number; // in minutes or seconds
  date: string; // YYYY-MM-DD
  timestamp: string;
  details?: string;
}

export interface Counselor {
  id: string;
  name: string;
  title: string;
  experience: string;
  languages: string[];
  specializations: string[];
  mode: 'online' | 'in-person' | 'both';
  location?: string;
  rating: number;
  phone: string;
  avatarColor: string;
  availableNow: boolean;
}

export interface Affirmation {
  id: string;
  category: 'confidence' | 'exam stress' | 'self-worth' | 'calm';
  quote: string;
  author?: string;
}
