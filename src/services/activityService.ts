import { WellnessActivity } from '../types';

const STORAGE_KEY_ACTIVITIES = 'kai_wellness_activities';

export const activityService = {
  getActivities(): WellnessActivity[] {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
    if (!raw) return [];
    try {
      const activities: WellnessActivity[] = JSON.parse(raw);
      const realActivities = activities.filter((activity) => !/^act-[1-5]$/.test(activity.id));
      if (realActivities.length !== activities.length) {
        localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(realActivities));
      }
      return realActivities;
    } catch {
      return [];
    }
  },

  logActivity(
    type: 'breathing' | 'journal' | 'affirmation' | 'chat',
    durationMinutes: number,
    details?: string,
  ): WellnessActivity {
    const list = this.getActivities();
    const newAct: WellnessActivity = {
      id: 'act-' + Date.now(),
      type,
      duration: durationMinutes,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      details,
    };
    list.unshift(newAct);
    localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(list));
    return newAct;
  },

  getWeeklyStats(): {
    totalMinutes: number;
    totalSessions: number;
    breathingMinutes: number;
    journalMinutes: number;
  } {
    const list = this.getActivities();
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 86400000;

    const thisWeek = list.filter((a) => new Date(a.timestamp).getTime() >= sevenDaysAgo);

    let totalMinutes = 0;
    let breathingMinutes = 0;
    let journalMinutes = 0;

    for (const a of thisWeek) {
      totalMinutes += a.duration;
      if (a.type === 'breathing') breathingMinutes += a.duration;
      if (a.type === 'journal') journalMinutes += a.duration;
    }

    return {
      totalMinutes,
      totalSessions: thisWeek.length,
      breathingMinutes,
      journalMinutes,
    };
  },
};
