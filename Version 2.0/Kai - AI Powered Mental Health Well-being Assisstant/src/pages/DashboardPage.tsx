import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { moodService, MOOD_CONFIG } from '../services/moodService';
import { journalService } from '../services/journalService';
import { MoodType } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [selectedMood, setSelectedMood] = useState<MoodType>('calm');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);
  const [isPlayingRain, setIsPlayingRain] = useState(false);
  const [isAffirmationLiked, setIsAffirmationLiked] = useState(false);

  // Micro breathing widget state
  const [isMiniBreathe, setIsMiniBreathe] = useState(false);
  const [miniPhase, setMiniPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  const journalEntries = journalService.getEntries().slice(0, 2);
  const moodEntries = moodService.getMoods();
  const weekData = moodService.getLast7DaysForChart();
  const insights = moodService.getInsights();
  const latestMood = moodEntries[0];

  // Web Audio soft rain / ambient white noise generator
  useEffect(() => {
    if (!isPlayingRain) return;

    let audioCtx: AudioContext | null = null;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
      const bufferSize = audioCtx.sampleRate * 2;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Pink-ish / soft rain noise
      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0,
        b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      const whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Lowpass filter for muffled cozy rain
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;

      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 0.15;

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      whiteNoise.start();

      return () => {
        try {
          whiteNoise.stop();
          audioCtx?.close();
        } catch {}
      };
    } catch {
      return () => {};
    }
  }, [isPlayingRain]);

  // Micro breathing interval
  useEffect(() => {
    if (!isMiniBreathe) return;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const schedule = (callback: () => void, delay: number) => {
      const timer = setTimeout(() => {
        timers.delete(timer);
        callback();
      }, delay);
      timers.add(timer);
    };
    const cycle = () => {
      schedule(() => setMiniPhase('Inhale'), 0);
      schedule(() => setMiniPhase('Hold'), 4000);
      schedule(() => setMiniPhase('Exhale'), 8000);
      schedule(() => setMiniPhase('Hold'), 12000);
    };
    const firstCycle = setTimeout(cycle, 0);
    const intv = setInterval(cycle, 16000);
    return () => {
      clearTimeout(firstCycle);
      clearInterval(intv);
      timers.forEach(clearTimeout);
    };
  }, [isMiniBreathe]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSaveMood = () => {
    moodService.logMood(selectedMood, MOOD_CONFIG[selectedMood].score, selectedTags);
    setIsSavedFeedback(true);
    showToast(`Mood saved: ${MOOD_CONFIG[selectedMood].label}.`, 'success');
    setTimeout(() => setIsSavedFeedback(false), 2500);
  };

  const todayDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="w-full flex flex-col pt-2 text-left">
      {/* Top Ambient Fluid Header */}
      <div className="relative w-full mb-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high/80 backdrop-blur-md mb-4 shadow-sm border border-outline-variant/15">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
              <span className="text-xs text-on-surface-variant font-medium">
                {todayDateFormatted}
              </span>
              <span className="text-on-surface-variant/40">•</span>
              <span className="text-xs text-primary font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-tertiary">
                  local_fire_department
                </span>
                “Today needs one next step, not a five-year plan.”
              </span>
            </div>

            <h1 className="font-display font-semibold text-3xl sm:text-4xl md:text-5xl text-on-surface tracking-tight">
              Hey {user?.name || 'Friend'}, how are you feeling today?
            </h1>
            <p className="text-body-lg text-base sm:text-lg text-on-surface-variant mt-2 max-w-xl">
              Log a mood, write a note, or head straight to chat. Nothing to catch up on.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/20 self-start lg:self-auto">
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-2xl">
                {latestMood ? MOOD_CONFIG[latestMood.value].emoji : '·'}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">
                Latest check-in
              </span>
              <span className="font-headline font-semibold text-base text-on-surface">
                {latestMood ? MOOD_CONFIG[latestMood.value].label : 'Nothing logged yet'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        {/* Bento 1: Hero Mood Check-In (Spans 7 cols on desktop) */}
        <section className="md:col-span-7 bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-outline-variant/20 flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                  Instant Check-in
                </span>
              </div>
              <span className="text-xs text-on-surface-variant">Takes ~10 seconds</span>
            </div>

            <h2 className="font-headline font-semibold text-xl sm:text-2xl text-on-surface mb-6">
              How are you feeling right this second?
            </h2>
            <div className="flex flex-wrap gap-3 mb-6">
              {(['happy', 'calm', 'okay', 'sad', 'anxious', 'angry'] as MoodType[]).map(
                (moodKey) => {
                  const conf = MOOD_CONFIG[moodKey];
                  const isActive = selectedMood === moodKey;
                  return (
                    <button
                      key={moodKey}
                      type="button"
                      onClick={() => setSelectedMood(moodKey)}
                      className={`group relative flex items-center gap-3 px-4 py-3 rounded-full transition-all text-left ${
                        isActive
                          ? 'bg-primary-fixed text-on-primary-fixed shadow-sm ring-1 ring-primary/20'
                          : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                      }`}
                    >
                      <span className="text-xl">{conf.emoji}</span>
                      <div className="flex flex-col min-w-0">
                        <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                          {conf.label}
                        </span>
                        <span className="text-[11px] opacity-80 leading-none">{conf.sub}</span>
                      </div>
                      {isActive && (
                        <span className="absolute top-2 right-3 w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                },
              )}
            </div>

            {/* Dynamic Context Tags */}
            <div className="bg-surface-container-low/70 rounded-2xl p-4 mb-6">
              <p className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold mb-2.5">
                What’s shaping this feeling?
              </p>
              <div className="flex flex-wrap gap-2">
                {['Exam season', 'Sleep debt', 'Friends drama', 'Family', 'Coffee overdose'].map(
                  (tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-secondary-fixed text-on-secondary-fixed font-semibold shadow-xs'
                            : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-primary">lock_clock</span>
              <span>Stored in this browser</span>
            </span>

            <button
              onClick={handleSaveMood}
              type="button"
              className={`px-6 h-11 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm hover:shadow transition-all ${
                isSavedFeedback
                  ? 'bg-primary text-on-primary'
                  : 'bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary'
              }`}
            >
              <span>{isSavedFeedback ? 'Saved' : 'Save mood'}</span>
              <span className="material-symbols-outlined text-[18px]">
                {isSavedFeedback ? 'done_all' : 'check'}
              </span>
            </button>
          </div>
        </section>

        {/* Bento 2: Daily Affirmation Anchor (Spans 5 cols on desktop) */}
        <section className="md:col-span-5 bg-tertiary-fixed/40 rounded-2xl p-6 md:p-8 border border-outline-variant/20 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="px-3 py-1 rounded-full bg-surface-container-lowest text-[11px] text-on-surface tracking-wider uppercase font-semibold shadow-xs">
                Daily Anchor
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsAffirmationLiked(!isAffirmationLiked);
                  showToast(
                    isAffirmationLiked ? 'Removed from favorites' : 'Saved to favorite anchors',
                    'info',
                  );
                }}
                aria-label="Save affirmation"
                className={`w-9 h-9 rounded-full bg-surface-container-lowest flex items-center justify-center transition-colors shadow-sm ${
                  isAffirmationLiked ? 'text-error' : 'text-on-surface-variant hover:text-error'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">favorite</span>
              </button>
            </div>

            <blockquote className="font-display font-semibold text-2xl sm:text-3xl text-on-surface tracking-tight leading-snug">
              “You don’t have to figure out your whole life today. Focus on what needs your
              attention next.”
            </blockquote>
          </div>

          <div className="pt-8">
            <div className="flex items-center justify-between bg-surface-container-lowest/80 backdrop-blur-md p-2 rounded-full shadow-sm border border-outline-variant/10">
              <div className="flex items-center gap-3 pl-2">
                <button
                  type="button"
                  onClick={() => setIsPlayingRain(!isPlayingRain)}
                  aria-label="Play ambient soft rain"
                  className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary hover:opacity-90 transition-opacity shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isPlayingRain ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                <span className="text-xs sm:text-sm font-medium text-on-surface">
                  {isPlayingRain ? 'Playing soft rain audio' : 'Listen with soft rain'}
                </span>
              </div>
              <span className="text-xs text-on-surface-variant pr-4">3 min</span>
            </div>
          </div>
        </section>

        {/* Bento 3: Weekly Mood Rhythm (Spans 5 cols on desktop) */}
        <section className="md:col-span-5 bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-outline-variant/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-headline font-semibold text-lg text-on-surface">
                Your week’s rhythm
              </h3>
              <span className="text-xs text-on-surface-variant">Last 7 days</span>
            </div>
            <p className="text-xs text-on-surface-variant mb-6">
              {weekData.some((day) => day.score !== null)
                ? `${weekData.filter((day) => day.score !== null).length} check-ins this week.`
                : 'Your mood check-ins will show up here.'}
            </p>

            <div
              className="w-full h-32 flex items-end justify-between gap-2"
              aria-label="Mood check-ins over the past seven days"
            >
              {weekData.map((day) => (
                <div
                  key={day.date}
                  className="h-full flex-1 flex flex-col items-center justify-end gap-2"
                  title={
                    day.mood
                      ? `${day.date}: ${MOOD_CONFIG[day.mood].label}`
                      : `${day.date}: no check-in`
                  }
                >
                  <div className="w-full flex-1 flex items-end justify-center">
                    <div
                      className="w-full max-w-8 rounded-t-md"
                      style={{
                        height: day.score ? `${day.score * 10}%` : '3px',
                        backgroundColor: day.mood
                          ? MOOD_CONFIG[day.mood].color
                          : 'var(--color-surface-container-high)',
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-on-surface-variant">{day.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-3 bg-surface-container-low/70 rounded-2xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
              auto_awesome
            </span>
            <p className="text-xs text-on-surface leading-relaxed">
              <span className="font-semibold text-on-surface">A note:</span>{' '}
              {insights.correlationNote}
            </p>
          </div>
        </section>

        {/* Bento 4: Quick Actions (Spans 7 cols on desktop) */}
        <section className="md:col-span-7 bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-outline-variant/20 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-headline font-semibold text-lg text-on-surface">Quick links</h3>
              <p className="text-xs text-on-surface-variant">Go straight to a tool</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-surface-container text-xs text-on-surface-variant font-medium">
              3 available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Action 1: Kai Chat */}
            <Link
              to="/chat"
              className="bg-surface-container-low/80 hover:bg-surface-container transition-all p-4 rounded-2xl flex flex-col justify-between group border border-outline-variant/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                  <img src="/kai-mark.svg" alt="" className="w-6 h-6 rounded-md" />
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                  arrow_outward
                </span>
              </div>
              <div>
                <h4 className="font-headline font-semibold text-sm sm:text-base text-on-surface mb-0.5">
                  Talk to Kai
                </h4>
                <span className="text-xs text-on-surface-variant">Open your chats</span>
              </div>
            </Link>

            {/* Action 2: Box Breathing */}
            <Link
              to="/wellness?tab=breathing"
              className="bg-surface-container-low/80 hover:bg-surface-container transition-all p-4 rounded-2xl flex flex-col justify-between group border border-outline-variant/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-primary text-[20px]">air</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                  play_circle
                </span>
              </div>
              <div>
                <h4 className="font-headline font-semibold text-sm sm:text-base text-on-surface mb-0.5">
                  Box Breathe
                </h4>
                <span className="text-xs text-on-surface-variant">Start a short timer</span>
              </div>
            </Link>

            {/* Action 3: Night Journal */}
            <Link
              to="/wellness?tab=journal"
              className="bg-surface-container-low/80 hover:bg-surface-container transition-all p-4 rounded-2xl flex flex-col justify-between group border border-outline-variant/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    edit_note
                  </span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                  add
                </span>
              </div>
              <div>
                <h4 className="font-headline font-semibold text-sm sm:text-base text-on-surface mb-0.5">
                  Night Journal
                </h4>
                <span className="text-xs text-on-surface-variant">Write a quick note</span>
              </div>
            </Link>
          </div>

          {/* Micro Interactive Breathing Widget (Embedded preview) */}
          <div className="mt-4 p-4 rounded-2xl bg-surface-container-high/60 flex items-center justify-between border border-outline-variant/10">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                {isMiniBreathe && (
                  <div className="w-8 h-8 rounded-full bg-primary-container/40 animate-ping absolute" />
                )}
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary">
                  <span className="material-symbols-outlined text-[15px]">
                    {isMiniBreathe ? 'pause' : 'self_improvement'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-semibold text-on-surface">
                  {isMiniBreathe ? `${miniPhase} (4s)...` : 'Breathe in 4s • Hold 4s • Exhale 4s'}
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  {isMiniBreathe ? 'Follow the count' : 'Tap to start guided visual session'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMiniBreathe(!isMiniBreathe)}
              className="px-4 py-1.5 rounded-full bg-surface-container-lowest text-on-surface text-xs font-semibold shadow-sm hover:bg-surface-bright transition-colors"
            >
              {isMiniBreathe ? 'Stop' : 'Start'}
            </button>
          </div>
        </section>

        {/* Bento 5: Recent Reflections (Full Width 12 cols) */}
        <section className="md:col-span-12 bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-outline-variant/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="font-headline font-semibold text-xl text-on-surface">
                Recent reflections
              </h3>
              <p className="text-xs text-on-surface-variant">Notes saved in this browser</p>
            </div>
            <Link
              to="/wellness?tab=journal"
              className="text-xs sm:text-sm font-semibold text-primary hover:text-on-primary-fixed-variant flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View all journal entries</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Entry 1 */}
            {journalEntries[0] && (
              <article className="p-5 rounded-2xl bg-surface-container-low flex flex-col justify-between hover:shadow-xs transition-shadow border border-outline-variant/10">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-container-lowest text-[11px] text-on-surface-variant font-medium">
                      {new Date(journalEntries[0].createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-xs">
                      {journalEntries[0].moodTag
                        ? MOOD_CONFIG[journalEntries[0].moodTag].emoji
                        : ''}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface line-clamp-3 leading-relaxed">
                    “{journalEntries[0].content}”
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 text-on-surface-variant text-xs border-t border-outline-variant/10">
                  <span className="material-symbols-outlined text-[16px]">chat_bubble_outline</span>
                  <span>Journal entry · {journalEntries[0].wordCount} words</span>
                </div>
              </article>
            )}

            {/* Entry 2 */}
            {journalEntries[1] && (
              <article className="p-5 rounded-2xl bg-surface-container-low flex flex-col justify-between hover:shadow-xs transition-shadow border border-outline-variant/10">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-container-lowest text-[11px] text-on-surface-variant font-medium">
                      {new Date(journalEntries[1].createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-xs">
                      {journalEntries[1].moodTag
                        ? MOOD_CONFIG[journalEntries[1].moodTag].emoji
                        : ''}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface line-clamp-3 leading-relaxed">
                    “{journalEntries[1].content}”
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 text-on-surface-variant text-xs border-t border-outline-variant/10">
                  <span className="material-symbols-outlined text-[16px]">nature</span>
                  <span>Journal entry · {journalEntries[1].wordCount} words</span>
                </div>
              </article>
            )}

            {/* Entry 3 (Empty State Slot) */}
            <div className="p-5 rounded-2xl bg-surface-container-high/40 flex flex-col items-center justify-center text-center border border-dashed border-outline-variant/30">
              <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center mb-2 shadow-sm text-primary">
                <span className="material-symbols-outlined text-[20px]">add</span>
              </div>
              <span className="font-headline font-semibold text-sm text-on-surface mb-1">
                Add another reflection
              </span>
              <p className="text-xs text-on-surface-variant max-w-xs mb-4">
                A sentence is enough. You can keep it rough.
              </p>
              <button
                type="button"
                onClick={() => navigate('/wellness?tab=journal&new=true')}
                className="px-4 py-1.5 rounded-full bg-surface-container-lowest text-primary text-xs font-semibold hover:bg-surface-container shadow-xs transition-colors"
              >
                Quick scratchpad
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Non-intrusive Crisis & Grounding Banner */}
      <aside className="w-full bg-surface-container-high/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 border border-outline-variant/15">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-secondary shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">volunteer_activism</span>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-on-surface">
              Things feeling heavier than usual today?
            </p>
            <p className="text-xs text-on-surface-variant">
              Tele-MANAS is a government helpline. Call 14416 for mental health support in India.
            </p>
          </div>
        </div>

        <a
          className="px-5 py-2 rounded-full bg-surface-container-lowest text-on-surface hover:bg-surface-container text-xs font-semibold shadow-xs shrink-0 flex items-center gap-1.5 transition-colors border border-outline-variant/10"
          href="tel:14416"
        >
          <span>Call 14416</span>
          <span className="material-symbols-outlined text-[16px]">call</span>
        </a>
      </aside>
    </div>
  );
};
