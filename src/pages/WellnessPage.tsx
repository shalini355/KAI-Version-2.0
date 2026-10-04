import React, { useState, useEffect, useRef, useEffectEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { journalService, ROTATING_PROMPTS } from '../services/journalService';
import { activityService } from '../services/activityService';
import { JournalEntry, MoodType, Affirmation } from '../types';
import { useToast } from '../context/ToastContext';

const AFFIRMATION_COLLECTION: Affirmation[] = [
  {
    id: 'aff-1',
    category: 'exam stress',
    quote: 'One mark sheet cannot sum up a whole person.',
  },
  {
    id: 'aff-2',
    category: 'confidence',
    quote: 'A placement post is not a scoreboard for your life.',
  },
  {
    id: 'aff-3',
    category: 'calm',
    quote: 'Today needs one next step, not a five-year plan.',
  },
  {
    id: 'aff-4',
    category: 'self-worth',
    quote: 'Rest is allowed before everything is finished.',
  },
  {
    id: 'aff-5',
    category: 'exam stress',
    quote: 'I can pause before I decide what this means.',
  },
  {
    id: 'aff-6',
    category: 'confidence',
    quote: 'Starting messy still counts as starting.',
  },
  { id: 'aff-7', category: 'confidence', quote: 'A slow reply is still progress.' },
  {
    id: 'aff-8',
    category: 'exam stress',
    quote: 'The syllabus is long. So is the list of things I have already learned.',
  },
  {
    id: 'aff-9',
    category: 'self-worth',
    quote: 'I do not have to earn a meal, a break, or a bit of kindness.',
  },
  { id: 'aff-10', category: 'calm', quote: 'For this minute, the next thing can wait.' },
  {
    id: 'aff-11',
    category: 'confidence',
    quote: 'Asking someone to explain it again is a study skill.',
  },
  { id: 'aff-12', category: 'exam stress', quote: 'One page. One problem. Then I can reassess.' },
  {
    id: 'aff-13',
    category: 'self-worth',
    quote: 'I am still a person on the days I get nothing done.',
  },
  {
    id: 'aff-14',
    category: 'calm',
    quote: 'A little quiet is useful. I do not need to turn it into a routine.',
  },
  {
    id: 'aff-15',
    category: 'confidence',
    quote: 'I can be new at this and still belong in the room.',
  },
  {
    id: 'aff-16',
    category: 'exam stress',
    quote: 'A rough mock test is information, not a prophecy.',
  },
  {
    id: 'aff-17',
    category: 'self-worth',
    quote: 'My value is not waiting at the end of a to-do list.',
  },
  {
    id: 'aff-18',
    category: 'calm',
    quote: 'The group chat can survive without my reply for ten minutes.',
  },
  {
    id: 'aff-19',
    category: 'confidence',
    quote: 'I have figured out hard things before, sometimes after a chai break.',
  },
  { id: 'aff-20', category: 'exam stress', quote: 'A timetable is a draft, not a contract.' },
  {
    id: 'aff-21',
    category: 'self-worth',
    quote: 'I can say no without writing a whole apology essay.',
  },
  { id: 'aff-22', category: 'calm', quote: 'Nothing important needs solving at 2 a.m.' },
  {
    id: 'aff-23',
    category: 'confidence',
    quote: 'I can ask for help before I have the perfect words.',
  },
  {
    id: 'aff-24',
    category: 'exam stress',
    quote: 'The first attempt can be bad. That is what attempts are for.',
  },
  { id: 'aff-25', category: 'self-worth', quote: 'I deserve the same patience I give my friends.' },
  { id: 'aff-26', category: 'calm', quote: 'Bas ek kaam abhi. Baaki baad mein.' },
  {
    id: 'aff-27',
    category: 'confidence',
    quote: 'I can change my mind when I learn something new.',
  },
  {
    id: 'aff-28',
    category: 'exam stress',
    quote: 'A degree matters. It is still not the whole story of me.',
  },
  { id: 'aff-29', category: 'self-worth', quote: 'Being useful is not the price of being loved.' },
  {
    id: 'aff-30',
    category: 'calm',
    quote: 'Some days the win is getting through the day without making it worse.',
  },
  {
    id: 'aff-31',
    category: 'confidence',
    quote: 'I can take up space even when I am still learning.',
  },
  {
    id: 'aff-32',
    category: 'exam stress',
    quote: 'If the plan fell apart, I can make a smaller one.',
  },
];

export const WellnessPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const requestedTab = searchParams.get('tab');
  const activeTab =
    requestedTab === 'breathing' || requestedTab === 'affirmations' ? requestedTab : 'journal';
  const setActiveTab = (tab: typeof activeTab) => setSearchParams({ tab });

  // Weekly Activity Stats
  const [weeklyStats, setWeeklyStats] = useState(() => activityService.getWeeklyStats());

  /* ---------------- JOURNAL STATE ---------------- */
  const [entries, setEntries] = useState<JournalEntry[]>(() => journalService.getEntries());
  const [searchJournal, setSearchJournal] = useState('');
  const [filterMood, setFilterMood] = useState<string>('all');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  // Journal Editor Drawer / Modal
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorMoodTag, setEditorMoodTag] = useState<MoodType | undefined>('calm');

  /* ---------------- GUIDED BREATHING STATE ---------------- */
  const [breathingTechnique, setBreathingTechnique] = useState<'box' | '478' | 'calm55'>('box');
  const [breathingDurationMinutes, setBreathingDurationMinutes] = useState<number>(3);
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathSecondsRemaining, setBreathSecondsRemaining] = useState<number>(180);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  /* ---------------- AFFIRMATIONS STATE ---------------- */
  const [affirmationCategory, setAffirmationCategory] = useState<string>('all');
  const [activeAffirmationIndex, setActiveAffirmationIndex] = useState<number>(0);
  const [likedAffirmationIds, setLikedAffirmationIds] = useState<string[]>([]);

  // Play gentle singing bowl / soft chime tone using Web Audio API
  const playChimeTone = useEffectEvent((freq = 432) => {
    if (!isSoundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.8);
    } catch {}
  });

  // Breathing Loop Controller
  useEffect(() => {
    if (!isBreathingActive) return;

    // Pattern definitions in seconds: [inhale, hold1, exhale, hold2]
    const techniquePatterns = {
      box: [4, 4, 4, 4],
      '478': [4, 7, 8, 0],
      calm55: [5, 0, 5, 0],
    };
    const pattern = techniquePatterns[breathingTechnique];

    const timer = setInterval(() => {
      setBreathSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsBreathingActive(false);
          setShowCompletionModal(true);
          activityService.logActivity(
            'breathing',
            breathingDurationMinutes,
            `${breathingTechnique.toUpperCase()} technique`,
          );
          setWeeklyStats(activityService.getWeeklyStats());
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Phase runner
    let phaseTimeout: ReturnType<typeof setTimeout>;
    let isRunning = true;

    const runTechniqueCycle = () => {
      if (!isRunning) return;

      // Inhale
      setBreathPhase('Inhale');
      playChimeTone(432);

      phaseTimeout = setTimeout(() => {
        if (!isRunning) return;
        if (pattern[1] > 0) {
          setBreathPhase('Hold');
          playChimeTone(528);
          phaseTimeout = setTimeout(() => {
            if (!isRunning) return;
            setBreathPhase('Exhale');
            playChimeTone(396);
            phaseTimeout = setTimeout(() => {
              if (!isRunning) return;
              if (pattern[3] > 0) {
                setBreathPhase('Hold');
                playChimeTone(432);
                phaseTimeout = setTimeout(runTechniqueCycle, pattern[3] * 1000);
              } else {
                runTechniqueCycle();
              }
            }, pattern[2] * 1000);
          }, pattern[1] * 1000);
        } else {
          setBreathPhase('Exhale');
          playChimeTone(396);
          phaseTimeout = setTimeout(runTechniqueCycle, pattern[2] * 1000);
        }
      }, pattern[0] * 1000);
    };

    runTechniqueCycle();

    return () => {
      isRunning = false;
      clearInterval(timer);
      clearTimeout(phaseTimeout);
    };
  }, [isBreathingActive, breathingTechnique, breathingDurationMinutes]);

  const handleStartBreathing = () => {
    setBreathSecondsRemaining(breathingDurationMinutes * 60);
    setIsBreathingActive(true);
  };

  const handleStopBreathing = () => {
    setIsBreathingActive(false);
    setBreathPhase('Inhale');
    setBreathSecondsRemaining(breathingDurationMinutes * 60);
  };

  // Journal creation & auto-save
  const handleOpenNewEntry = (withPrompt = true) => {
    setIsCreatingNew(true);
    setEditingEntry(null);
    setEditorTitle('');
    setEditorContent('');
    setEditorMoodTag('calm');
    if (withPrompt) {
      setEditorContent(`Reflecting on: "${ROTATING_PROMPTS[currentPromptIndex]}"\n\n`);
    }
  };

  const handleSaveEntry = () => {
    if (!editorContent.trim()) {
      showToast('Please type a few words before saving.', 'error');
      return;
    }
    if (editingEntry) {
      journalService.updateEntry(editingEntry.id, {
        title: editorTitle || 'Reflection',
        content: editorContent,
        moodTag: editorMoodTag,
      });
      showToast('Reflection updated.', 'success');
    } else {
      journalService.createEntry(
        editorTitle || 'Reflection',
        editorContent,
        editorMoodTag,
        ROTATING_PROMPTS[currentPromptIndex],
      );
      activityService.logActivity('journal', 5, editorTitle);
      setWeeklyStats(activityService.getWeeklyStats());
      showToast('Saved in this browser.', 'success');
    }
    setEntries(journalService.getEntries());
    setIsCreatingNew(false);
    setEditingEntry(null);
  };

  const handleDeleteEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    journalService.deleteEntry(id);
    setEntries(journalService.getEntries());
    showToast('Entry removed.', 'info');
  };

  // Filtered Journal entries
  const filteredEntries = entries.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchJournal.toLowerCase()) ||
      e.content.toLowerCase().includes(searchJournal.toLowerCase());
    const matchesMood = filterMood === 'all' || e.moodTag === filterMood;
    return matchesSearch && matchesMood;
  });

  // Filtered Affirmations
  const filteredAffirmations = AFFIRMATION_COLLECTION.filter(
    (a) => affirmationCategory === 'all' || a.category === affirmationCategory,
  );
  const currentAffirmation =
    filteredAffirmations[activeAffirmationIndex % filteredAffirmations.length];

  const handleCopyAffirmation = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Affirmation copied to share or keep.', 'info');
  };

  const handleToggleLikeAffirmation = (id: string) => {
    setLikedAffirmationIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
    showToast('Updated your favorite anchors.', 'info');
  };

  return (
    <div className="w-full flex flex-col gap-6 pt-2 text-left">
      {/* Page Header with Weekly Activity Summary */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-xs text-on-surface-variant font-medium mb-3">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>Grounding and reflection tools</span>
          </div>
          <h1 className="font-display font-semibold text-3xl sm:text-4xl text-on-surface tracking-tight">
            Wellness Hub
          </h1>
          <p className="text-sm sm:text-base text-on-surface-variant mt-1 max-w-xl">
            Try a breathing timer, journal prompt, or affirmation. Choose what feels useful right
            now.
          </p>
        </div>

        {/* Weekly Stats Mini Ribbon */}
        <div className="flex items-center gap-3 bg-surface-container-lowest p-3 rounded-2xl shadow-sm border border-outline-variant/20 self-start md:self-auto text-xs">
          <div className="flex flex-col">
            <span className="text-on-surface-variant">This Week</span>
            <span className="font-semibold text-primary text-sm">
              {weeklyStats.totalMinutes} min calm
            </span>
          </div>
          <div className="h-6 w-px bg-outline-variant/30" />
          <div className="flex flex-col">
            <span className="text-on-surface-variant">Sessions</span>
            <span className="font-semibold text-on-surface text-sm">
              {weeklyStats.totalSessions} resets
            </span>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-surface-container rounded-full max-w-md border border-outline-variant/15">
        {[
          { key: 'journal', label: 'Journal', icon: 'edit_note' },
          { key: 'breathing', label: 'Box Breathing', icon: 'air' },
          { key: 'affirmations', label: 'Daily Anchors', icon: 'favorite' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex-1 py-2 px-3 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === tab.key
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: LOW-PRESSURE JOURNAL */}
      {activeTab === 'journal' && (
        <div className="flex flex-col gap-6">
          {/* Daily reflection prompt */}
          <div className="p-5 md:p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[20px]">psychology</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block">
                  Reflection prompt
                </span>
                <p className="text-sm sm:text-base font-medium text-on-surface italic mt-0.5">
                  "{ROTATING_PROMPTS[currentPromptIndex]}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() =>
                  setCurrentPromptIndex((prev) => (prev + 1) % ROTATING_PROMPTS.length)
                }
                title="Shuffle prompt"
                className="w-9 h-9 rounded-full bg-surface-container-lowest flex items-center justify-center text-on-surface-variant hover:text-on-surface shadow-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">cached</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenNewEntry(true)}
                className="px-4 py-2 rounded-full bg-primary text-on-primary text-xs font-semibold hover:opacity-95 shadow-xs transition-opacity flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                <span>Write with prompt</span>
              </button>
            </div>
          </div>

          {/* Search, Filter & New Entry Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search reflections..."
                  value={searchJournal}
                  onChange={(e) => setSearchJournal(e.target.value)}
                  className="w-full bg-surface-container-lowest pl-9 pr-3 py-2 rounded-full text-xs text-on-surface border border-outline-variant/15 focus:outline-none placeholder:text-on-surface-variant/60"
                />
              </div>

              <select
                value={filterMood}
                onChange={(e) => setFilterMood(e.target.value)}
                className="bg-surface-container-lowest text-xs text-on-surface px-3 py-2 rounded-full border border-outline-variant/15 focus:outline-none"
              >
                <option value="all">All Moods</option>
                <option value="happy">✨ Happy</option>
                <option value="calm">🌿 Calm</option>
                <option value="okay">☁️ Okay</option>
                <option value="sad">🌧️ Sad</option>
                <option value="anxious">🌪️ Anxious</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => handleOpenNewEntry(false)}
              className="px-5 py-2.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm hover:bg-tertiary-container hover:text-on-tertiary-container transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Blank Scratchpad</span>
            </button>
          </div>

          {/* Journal Entries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => {
                  setEditingEntry(entry);
                  setEditorTitle(entry.title);
                  setEditorContent(entry.content);
                  setEditorMoodTag(entry.moodTag);
                  setIsCreatingNew(false);
                }}
                className="p-5 rounded-2xl bg-surface-container-lowest hover:bg-surface-container-low transition-all border border-outline-variant/15 flex flex-col justify-between cursor-pointer group shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-on-surface-variant">
                      {new Date(entry.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="text-xs">
                      {entry.moodTag === 'happy'
                        ? '✨'
                        : entry.moodTag === 'calm'
                          ? '🌿'
                          : entry.moodTag === 'sad'
                            ? '🌧️'
                            : '☁️'}
                    </span>
                  </div>
                  <h4 className="font-headline font-semibold text-base text-on-surface line-clamp-1 mb-1">
                    {entry.title}
                  </h4>
                  <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                    {entry.content}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-outline-variant/10 flex items-center justify-between text-[11px] text-on-surface-variant">
                  <span>{entry.wordCount} words</span>
                  <button
                    onClick={(e) => handleDeleteEntry(entry.id, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-error transition-all p-1"
                    title="Delete entry"
                  >
                    <span className="material-symbols-outlined text-[15px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Editor Modal Drawer */}
          {(isCreatingNew || editingEntry) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/30 backdrop-blur-xs">
              <div className="w-full max-w-xl rounded-2xl bg-surface-container-lowest p-6 shadow-2xl border border-outline-variant/30 flex flex-col gap-4">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/15">
                  <span className="font-headline font-semibold text-lg text-on-surface">
                    {editingEntry ? 'Edit Reflection' : 'New Scratchpad Entry'}
                  </span>
                  <button
                    onClick={() => {
                      setIsCreatingNew(false);
                      setEditingEntry(null);
                    }}
                    className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Reflection title..."
                  value={editorTitle}
                  onChange={(e) => setEditorTitle(e.target.value)}
                  className="w-full bg-surface-container-low px-4 py-2.5 rounded-xl text-sm font-semibold text-on-surface focus:outline-none border border-outline-variant/15"
                />

                <textarea
                  rows={8}
                  placeholder="Write freely. No grammar rules, no judgment..."
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  className="w-full bg-surface-container-low p-4 rounded-xl text-sm text-on-surface focus:outline-none border border-outline-variant/15 leading-relaxed"
                />

                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <span>
                    Word count: {editorContent.trim().split(/\s+/).filter(Boolean).length}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px]">Mood tag:</span>
                    <select
                      value={editorMoodTag}
                      onChange={(e) => setEditorMoodTag(e.target.value as MoodType)}
                      className="bg-surface-container px-2 py-1 rounded text-xs text-on-surface"
                    >
                      <option value="calm">🌿 Calm</option>
                      <option value="happy">✨ Happy</option>
                      <option value="okay">☁️ Okay</option>
                      <option value="sad">🌧️ Sad</option>
                      <option value="anxious">🌪️ Anxious</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setIsCreatingNew(false);
                      setEditingEntry(null);
                    }}
                    className="px-4 py-2 rounded-full text-xs font-medium text-on-surface-variant hover:text-on-surface"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEntry}
                    className="px-6 py-2 rounded-full bg-primary text-on-primary text-xs font-semibold hover:opacity-95 shadow-sm"
                  >
                    Save Reflection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GUIDED BREATHING */}
      {activeTab === 'breathing' && (
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-6">
          {/* Technique & Duration Selectors */}
          <div className="w-full flex flex-wrap items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/20 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs text-on-surface-variant font-medium">Technique:</span>
              <div className="flex gap-1">
                {[
                  { id: 'box', label: 'Box 4-4-4-4' },
                  { id: '478', label: '4-7-8 Deep' },
                  { id: 'calm55', label: 'Calm 5-5' },
                ].map((tech) => (
                  <button
                    key={tech.id}
                    disabled={isBreathingActive}
                    onClick={() => setBreathingTechnique(tech.id as typeof breathingTechnique)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      breathingTechnique === tech.id
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    {tech.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <span>Duration:</span>
                {[1, 3, 5].map((m) => (
                  <button
                    key={m}
                    disabled={isBreathingActive}
                    onClick={() => {
                      setBreathingDurationMinutes(m);
                      setBreathSecondsRemaining(m * 60);
                    }}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                      breathingDurationMinutes === m
                        ? 'bg-secondary text-on-secondary shadow-xs'
                        : 'bg-surface-container text-on-surface'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>

              {/* Sound Toggle */}
              <button
                type="button"
                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isSoundEnabled
                    ? 'bg-primary-container/40 text-primary'
                    : 'bg-surface-container text-on-surface-variant'
                }`}
                title={isSoundEnabled ? 'Sound cues ON' : 'Sound cues OFF'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isSoundEnabled ? 'volume_up' : 'volume_off'}
                </span>
              </button>
            </div>
          </div>

          {/* Central Breathing Orb Animation Canvas */}
          <div className="w-full bg-surface-container-lowest rounded-3xl p-8 sm:p-14 border border-outline-variant/20 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
            <div className="text-center mb-6">
              <span className="text-xs uppercase tracking-widest text-primary font-semibold block">
                {breathingTechnique === 'box'
                  ? 'Guided 4-4-4 Box Breathing'
                  : breathingTechnique === '478'
                    ? '4-7-8 Sleep & Anxiety Reset'
                    : 'Calm 5-5 Coherence'}
              </span>
              <p className="text-xs text-on-surface-variant mt-1">
                Slow down your vagus nerve. Drop your tongue from the roof of your mouth.
              </p>
            </div>

            {/* Glowing animated circle */}
            <div className="py-8 flex flex-col items-center justify-center relative w-full h-64">
              <div
                className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-primary-container/60 flex flex-col items-center justify-center transition-all duration-4000 ease-in-out ${
                  !isBreathingActive
                    ? 'scale-100'
                    : breathPhase === 'Inhale'
                      ? 'scale-125'
                      : breathPhase === 'Hold'
                        ? 'scale-125 shadow-[0_0_60px_rgba(210,204,255,0.7)]'
                        : 'scale-75 opacity-90'
                }`}
              >
                <span className="font-display font-semibold text-xl sm:text-2xl text-on-surface tracking-wide">
                  {isBreathingActive ? breathPhase : 'Breathe'}
                </span>
                {isBreathingActive && (
                  <span className="text-[11px] font-medium text-on-surface/80 mt-1">
                    {Math.floor(breathSecondsRemaining / 60)}:
                    {(breathSecondsRemaining % 60).toString().padStart(2, '0')}
                  </span>
                )}
              </div>
            </div>

            {/* Play / Stop Action Button */}
            <div className="mt-4 flex items-center gap-3">
              {!isBreathingActive ? (
                <button
                  type="button"
                  onClick={handleStartBreathing}
                  className="px-8 h-12 rounded-full bg-primary text-on-primary font-semibold text-sm sm:text-base flex items-center gap-2 hover:opacity-95 shadow-md active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                  <span>Start {breathingDurationMinutes}-Minute Session</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopBreathing}
                  className="px-8 h-12 rounded-full bg-surface-container text-on-surface font-semibold text-sm flex items-center gap-2 hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">stop</span>
                  <span>Stop Session</span>
                </button>
              )}
            </div>
          </div>

          {/* Completion Modal */}
          {showCompletionModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/30 backdrop-blur-xs">
              <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-outline-variant/30 text-center flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[24px]">check</span>
                </div>
                <div>
                  <h4 className="font-headline font-semibold text-lg text-on-surface">
                    Well done taking this pause.
                  </h4>
                  <p className="text-xs text-on-surface-variant mt-1">
                    How is your heart and chest feeling right now?
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 w-full">
                  {['Lighter 🕊️', 'Calmer 🌿', 'Same ☁️'].map((feeling) => (
                    <button
                      key={feeling}
                      type="button"
                      onClick={() => {
                        setShowCompletionModal(false);
                        showToast(`Logged session: feeling ${feeling}.`, 'success');
                      }}
                      className="py-2 px-1 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-primary-container/40 transition-colors"
                    >
                      {feeling}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DAILY ANCHORS (AFFIRMATIONS) */}
      {activeTab === 'affirmations' && (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-surface-container rounded-full border border-outline-variant/15 text-xs">
            {['all', 'confidence', 'exam stress', 'self-worth', 'calm'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setAffirmationCategory(cat);
                  setActiveAffirmationIndex(0);
                }}
                className={`px-3 py-1.5 rounded-full capitalize font-medium transition-all ${
                  affirmationCategory === cat
                    ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Swipeable / Flippable Affirmation Card */}
          {currentAffirmation && (
            <div className="w-full rounded-3xl p-8 sm:p-12 bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between min-h-75 text-center relative overflow-hidden transition-all">
              <div className="flex items-center justify-between w-full">
                <span className="px-3 py-1 rounded-full bg-surface-container-lowest text-[11px] font-semibold text-on-surface uppercase tracking-wider shadow-xs">
                  {currentAffirmation.category}
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleLikeAffirmation(currentAffirmation.id)}
                  className={`w-9 h-9 rounded-full bg-surface-container-lowest flex items-center justify-center transition-colors shadow-xs ${
                    likedAffirmationIds.includes(currentAffirmation.id)
                      ? 'text-error'
                      : 'text-on-surface-variant hover:text-error'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">favorite</span>
                </button>
              </div>

              <blockquote className="font-display font-semibold text-xl sm:text-2xl md:text-3xl text-on-surface tracking-tight leading-relaxed my-6">
                “{currentAffirmation.quote}”
              </blockquote>

              <div className="flex items-center justify-between w-full pt-4 border-t border-outline-variant/10">
                <button
                  type="button"
                  onClick={() =>
                    setActiveAffirmationIndex(
                      (prev) =>
                        (prev - 1 + filteredAffirmations.length) % filteredAffirmations.length,
                    )
                  }
                  className="px-4 py-1.5 rounded-full bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyAffirmation(currentAffirmation.quote)}
                  className="w-9 h-9 rounded-full bg-surface-container-lowest flex items-center justify-center text-on-surface hover:text-primary transition-colors shadow-xs"
                  title="Copy quote"
                >
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveAffirmationIndex((prev) => (prev + 1) % filteredAffirmations.length)
                  }
                  className="px-4 py-1.5 rounded-full bg-primary text-on-primary text-xs font-semibold hover:opacity-95 transition-opacity flex items-center gap-1"
                >
                  <span>Next</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
