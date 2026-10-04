import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { moodService, MOOD_CONFIG } from '../services/moodService';
import { MoodEntry, MoodType } from '../types';
import { useToast } from '../context/ToastContext';

export const MoodPage: React.FC = () => {
  const { showToast } = useToast();

  const [moods, setMoods] = useState<MoodEntry[]>(() => moodService.getMoods());
  const [selectedTab, setSelectedTab] = useState<'week' | 'month' | 'year'>('week');
  const [selectedDayDetail, setSelectedDayDetail] = useState<MoodEntry | null>(null);

  // New check-in form states
  const [activeMood, setActiveMood] = useState<MoodType>('calm');
  const [intensity, setIntensity] = useState<number>(7);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState<string>('');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>(
    'morning',
  );

  const streak = moodService.getStreak();
  const insights = moodService.getInsights();
  const weekData = moodService.getLast7DaysForChart();

  const availableTags = [
    'Sleep debt',
    'Exam season',
    'Friends drama',
    'Family',
    'Coffee overdose',
    'Health',
    'Work',
  ];

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSaveCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    moodService.logMood(activeMood, intensity, selectedTags, note, timeOfDay);
    const updated = moodService.getMoods();
    setMoods(updated);
    setNote('');
    showToast(
      `Logged ${MOOD_CONFIG[activeMood].label.toLowerCase()} at ${intensity}/10.`,
      'success',
    );
  };

  // Compute distribution for Donut Chart
  const distributionData = React.useMemo(() => {
    const counts: Record<MoodType, number> = {
      happy: 0,
      calm: 0,
      okay: 0,
      sad: 0,
      anxious: 0,
      angry: 0,
    };
    for (const m of moods) {
      if (counts[m.value] !== undefined) {
        counts[m.value]++;
      }
    }
    return Object.entries(counts).map(([moodKey, count]) => ({
      name: MOOD_CONFIG[moodKey as MoodType].label,
      value: count,
      color: MOOD_CONFIG[moodKey as MoodType].color,
      emoji: MOOD_CONFIG[moodKey as MoodType].emoji,
    }));
  }, [moods]);

  // Calendar Heatmap Days (Past 28 days)
  const heatmapDays = React.useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const match = moods.find((m) => m.date === dateStr);
      days.push({
        date: dateStr,
        dayNum: d.getDate(),
        entry: match,
        color: match ? MOOD_CONFIG[match.value].color : 'transparent',
      });
    }
    return days;
  }, [moods]);

  return (
    <div className="w-full flex flex-col gap-8 pt-2 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-xs text-on-surface-variant font-medium mb-3">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>Your check-ins</span>
            <span>•</span>
            <span className="text-primary font-semibold">
              {streak ? `${streak}-day streak` : 'No check-ins yet'}
            </span>
          </div>
          <h1 className="font-display font-semibold text-3xl sm:text-4xl text-on-surface tracking-tight">
            Mood log
          </h1>
          <p className="text-sm sm:text-base text-on-surface-variant mt-1 max-w-xl">
            A quick way to notice how the week has been going. Only entries you add show up here.
          </p>
        </div>

        {/* Time Tabs */}
        <div className="flex items-center p-1 bg-surface-container rounded-full self-start sm:self-auto border border-outline-variant/15">
          {(['week', 'month', 'year'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                selectedTab === tab
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Check-in Form + Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Check-In Form (Spans 7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-outline-variant/20 flex flex-col justify-between">
          <form onSubmit={handleSaveCheckIn} className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="font-headline font-semibold text-xl text-on-surface">
                Log a moment right now
              </h2>
              <span className="text-xs text-on-surface-variant">Saved in this browser</span>
            </div>

            {/* 6 Moods Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(['happy', 'calm', 'okay', 'sad', 'anxious', 'angry'] as MoodType[]).map((m) => {
                const conf = MOOD_CONFIG[m];
                const isSelected = activeMood === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setActiveMood(m)}
                    className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-primary-fixed text-on-primary-fixed ring-1 ring-primary/20 shadow-xs'
                        : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                    }`}
                  >
                    <span className="text-2xl">{conf.emoji}</span>
                    <span className="text-xs font-semibold">{conf.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Intensity Slider */}
            <div className="flex flex-col gap-2 bg-surface-container-low/60 p-4 rounded-xl">
              <div className="flex items-center justify-between text-xs font-medium text-on-surface">
                <span>Intensity level</span>
                <span className="text-primary font-bold">{intensity} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-on-surface-variant">
                <span>Low</span>
                <span>Moderate</span>
                <span>High</span>
              </div>
            </div>

            {/* Context Tags */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-on-surface-variant">Influencing tags:</span>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const isChecked = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        isChecked
                          ? 'bg-secondary-fixed text-on-secondary-fixed font-semibold shadow-xs'
                          : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Note & Time of Day */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-on-surface-variant">Optional note:</span>
                <div className="flex gap-1 text-[11px]">
                  {(['morning', 'afternoon', 'evening', 'night'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTimeOfDay(t)}
                      className={`px-2 py-0.5 rounded capitalize ${
                        timeOfDay === t
                          ? 'bg-primary-container text-on-primary-container font-semibold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                rows={2}
                placeholder="What happened or what is running through your mind?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-3 rounded-xl bg-surface-container-low text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/15 placeholder:text-on-surface-variant/60"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-full bg-primary text-on-primary font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-95 shadow-sm transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              <span>Save this moment</span>
            </button>
          </form>
        </div>

        {/* Plain Language Insights Card (Spans 5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-low rounded-2xl p-6 md:p-8 border border-outline-variant/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-[22px]">insights</span>
              <h3 className="font-headline font-semibold text-lg text-on-surface">
                Your check-ins
              </h3>
            </div>

            {moods.length ? (
              <div className="flex flex-col gap-4 text-xs md:text-sm text-on-surface">
                <div className="p-4 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/10 flex items-start gap-3">
                  <span className="text-2xl mt-0.5">
                    {MOOD_CONFIG[insights.mostCommonMood.mood].emoji}
                  </span>
                  <div>
                    <span className="font-semibold block text-on-surface">
                      Most Frequent Vibe: {MOOD_CONFIG[insights.mostCommonMood.mood].label}
                    </span>
                    <span className="text-on-surface-variant text-xs">
                      You logged {MOOD_CONFIG[insights.mostCommonMood.mood].label}{' '}
                      {insights.mostCommonMood.count} times in the last 14 days.
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/10 flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-[22px]">
                    calendar_today
                  </span>
                  <div>
                    <span className="font-semibold block text-on-surface">
                      {insights.bestDayOfWeek === 'Not enough data'
                        ? insights.bestDayOfWeek
                        : `Most steady: ${insights.bestDayOfWeek}`}
                    </span>
                    <span className="text-on-surface-variant text-xs">
                      This is a summary of your logged moods, not a prediction.
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/10 flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-[22px]">info</span>
                  <div>
                    <span className="font-semibold block text-on-surface">
                      A note about patterns
                    </span>
                    <span className="text-on-surface-variant text-xs leading-relaxed">
                      {insights.correlationNote}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">
                Log a few check-ins and your recent moods will show up here.
              </p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-outline-variant/15 flex items-center justify-between text-xs text-on-surface-variant">
            <span>
              Average intensity:{' '}
              <strong>
                {moods.length ? `${insights.averageIntensity}/10` : 'Not available yet'}
              </strong>
            </span>
            <span>Based on {moods.length} check-ins</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics: Rhythm Curve + Mood Distribution Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Line Chart (Spans 7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-outline-variant/20 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-headline font-semibold text-lg text-on-surface">
                Emotional Flow (Last 7 Days)
              </h3>
              <p className="text-xs text-on-surface-variant">
                Scaled from heavy (1) to radiant (10)
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-surface-container font-medium text-on-surface">
              {weekData.filter((day) => day.score !== null).length} logged days
            </span>
          </div>

          <div className="w-full h-64 mt-2">
            {!weekData.some((day) => day.score !== null) && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-on-surface-variant pointer-events-none">
                Your check-ins will appear here.
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#707976" fontSize={12} tickLine={false} />
                <YAxis domain={[1, 10]} stroke="#707976" fontSize={12} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const conf = data.mood ? MOOD_CONFIG[data.mood as MoodType] : null;
                      if (!conf) {
                        return (
                          <div className="bg-surface-container-lowest p-2.5 rounded-xl shadow-lg border border-outline-variant/20 text-xs">
                            No check-in for {data.date}
                          </div>
                        );
                      }
                      return (
                        <div className="bg-surface-container-lowest p-2.5 rounded-xl shadow-lg border border-outline-variant/20 text-xs">
                          <p className="font-semibold text-on-surface flex items-center gap-1">
                            <span>{conf.emoji}</span>
                            <span>{conf.label}</span>
                          </p>
                          <p className="text-on-surface-variant mt-0.5">
                            Intensity: {data.intensity}/10
                          </p>
                          <p className="text-[10px] text-on-surface-variant/70">{data.date}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#2F685D"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#2F685D' }}
                  activeDot={{ r: 7, fill: '#7FB8AB' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mood Distribution Donut Chart (Spans 5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-outline-variant/20 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-headline font-semibold text-lg text-on-surface">
                Mood Proportions
              </h3>
              <p className="text-xs text-on-surface-variant">Breakdown across recorded days</p>
            </div>
          </div>

          <div className="w-full h-52 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-outline-variant/15">
            {distributionData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-on-surface font-medium truncate">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Calendar Heatmap */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-outline-variant/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-headline font-semibold text-xl text-on-surface">
              28-Day Mood Heatmap
            </h3>
            <p className="text-xs text-on-surface-variant">
              Select a day to see its check-in details
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#9ED3C4]" /> Calm
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#F6DD95]" /> Happy
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#C6AEE3]" /> Anxious
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#93AEDA]" /> Sad
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {heatmapDays.map((day) => {
            const hasEntry = Boolean(day.entry);
            const conf = day.entry ? MOOD_CONFIG[day.entry.value] : null;

            return (
              <button
                key={day.date}
                type="button"
                onClick={() => day.entry && setSelectedDayDetail(day.entry)}
                className={`aspect-square rounded-xl p-2 flex flex-col justify-between transition-all border ${
                  hasEntry
                    ? 'border-transparent shadow-xs hover:scale-105'
                    : 'bg-surface-container-low/40 border-dashed border-outline-variant/20 opacity-50'
                }`}
                style={{
                  backgroundColor: hasEntry ? conf?.color : undefined,
                }}
              >
                <span className="text-[11px] font-bold text-on-surface/80">{day.dayNum}</span>
                {conf && <span className="text-sm self-end">{conf.emoji}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Detail Modal Drawer */}
      {selectedDayDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/30 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-md w-full shadow-2xl border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/15">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{MOOD_CONFIG[selectedDayDetail.value].emoji}</span>
                <div>
                  <h4 className="font-headline font-semibold text-lg text-on-surface">
                    {MOOD_CONFIG[selectedDayDetail.value].label} ({selectedDayDetail.intensity}/10)
                  </h4>
                  <span className="text-xs text-on-surface-variant">
                    {selectedDayDetail.date} • {selectedDayDetail.timeOfDay}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {selectedDayDetail.note && (
              <div className="bg-surface-container-low p-3.5 rounded-xl text-sm text-on-surface italic">
                “{selectedDayDetail.note}”
              </div>
            )}

            {selectedDayDetail.tags && selectedDayDetail.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedDayDetail.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-0.5 rounded-full bg-surface-container text-xs text-on-surface-variant font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={() => setSelectedDayDetail(null)}
              className="mt-2 w-full py-2 rounded-full bg-primary text-on-primary text-xs font-semibold hover:opacity-90"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
