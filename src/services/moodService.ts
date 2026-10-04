import { MoodEntry, MoodType } from '../types';

const STORAGE_KEY_MOODS = 'kai_mood_logs';

export const MOOD_CONFIG: Record<
  MoodType,
  { label: string; sub: string; emoji: string; color: string; score: number }
> = {
  happy: { label: 'Happy', sub: 'Sunny', emoji: '✨', color: '#F6DD95', score: 9 },
  calm: { label: 'Calm', sub: 'Peaceful', emoji: '🌿', color: '#9ED3C4', score: 8 },
  okay: { label: 'Okay', sub: 'Neutral', emoji: '☁️', color: '#CBD5DC', score: 6 },
  sad: { label: 'Sad', sub: 'Heavy', emoji: '🌧️', color: '#93AEDA', score: 3 },
  anxious: { label: 'Anxious', sub: 'Racing', emoji: '🌪️', color: '#C6AEE3', score: 4 },
  angry: { label: 'Angry', sub: 'Fiery', emoji: '🔥', color: '#E8A9A0', score: 2 },
};

export const moodService = {
  getMoods(): MoodEntry[] {
    const raw = localStorage.getItem(STORAGE_KEY_MOODS);
    if (!raw) return [];
    try {
      const entries: MoodEntry[] = JSON.parse(raw);
      const actualEntries = entries.filter((entry) => !/^mood-\d{4}-\d{2}-\d{2}$/.test(entry.id));
      if (actualEntries.length !== entries.length) {
        localStorage.setItem(STORAGE_KEY_MOODS, JSON.stringify(actualEntries));
      }
      return actualEntries;
    } catch {
      return [];
    }
  },

  logMood(
    value: MoodType,
    intensity: number = 7,
    tags: string[] = [],
    note: string = '',
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' = 'morning',
  ): MoodEntry {
    const moods = this.getMoods();
    const todayStr = new Date().toISOString().split('T')[0];

    // Remove any existing entry for today with same timeOfDay or prepend
    const newEntry: MoodEntry = {
      id: 'mood-' + Date.now(),
      value,
      intensity,
      tags,
      note,
      timeOfDay,
      date: todayStr,
      timestamp: new Date().toISOString(),
    };

    moods.unshift(newEntry);
    localStorage.setItem(STORAGE_KEY_MOODS, JSON.stringify(moods));
    return newEntry;
  },

  getStreak(): number {
    const moods = this.getMoods();
    if (!moods.length) return 0;

    const uniqueDates = Array.from(new Set(moods.map((m) => m.date)))
      .sort()
      .reverse();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (!uniqueDates.includes(today) && !uniqueDates.includes(yesterday)) {
      return 0;
    }

    let streak = 0;
    let checkDate = new Date();
    if (!uniqueDates.includes(today)) {
      checkDate = new Date(Date.now() - 86400000);
    }

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (uniqueDates.includes(dateStr)) {
        streak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else {
        break;
      }
    }

    return streak;
  },

  getInsights(): {
    mostCommonMood: { mood: MoodType; count: number };
    bestDayOfWeek: string;
    correlationNote: string;
    averageIntensity: number;
  } {
    const moods = this.getMoods();
    const counts: Partial<Record<MoodType, number>> = {};
    let totalIntensity = 0;

    const dayScores: Record<number, { sum: number; count: number }> = {};

    for (const m of moods) {
      counts[m.value] = (counts[m.value] || 0) + 1;
      totalIntensity += m.intensity || MOOD_CONFIG[m.value].score;

      const day = new Date(m.date).getDay();
      if (!dayScores[day]) dayScores[day] = { sum: 0, count: 0 };
      dayScores[day].sum += m.intensity || 5;
      dayScores[day].count += 1;
    }

    let maxMood: MoodType = 'calm';
    let maxCount = 0;
    for (const [k, v] of Object.entries(counts)) {
      if ((v as number) > maxCount) {
        maxCount = v as number;
        maxMood = k as MoodType;
      }
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let bestDayIndex = -1;
    let bestAverage = 0;

    for (const [day, data] of Object.entries(dayScores)) {
      const avg = data.sum / data.count;
      if (avg > bestAverage) {
        bestAverage = avg;
        bestDayIndex = Number(day);
      }
    }

    return {
      mostCommonMood: { mood: maxMood, count: maxCount },
      bestDayOfWeek: bestDayIndex === -1 ? 'Not enough data' : dayNames[bestDayIndex],
      correlationNote:
        moods.length >= 3
          ? 'These are patterns in your check-ins, not proof of what caused them.'
          : 'Log a few more check-ins to see a useful summary.',
      averageIntensity: moods.length ? Number((totalIntensity / moods.length).toFixed(1)) : 0,
    };
  },

  getLast7DaysForChart(): {
    day: string;
    score: number | null;
    mood: MoodType | null;
    intensity: number | null;
    date: string;
  }[] {
    const moods = this.getMoods();
    const days: {
      day: string;
      score: number | null;
      mood: MoodType | null;
      intensity: number | null;
      date: string;
    }[] = [];
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(Date.now() - i * 86400000);
      const dateStr = targetDate.toISOString().split('T')[0];
      const match = moods.find((m) => m.date === dateStr);

      days.push({
        day: dayLabels[targetDate.getDay()],
        score: match ? MOOD_CONFIG[match.value].score : null,
        intensity: match?.intensity ?? null,
        mood: match?.value ?? null,
        date: dateStr,
      });
    }

    return days;
  },
};
