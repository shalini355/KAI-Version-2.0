import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KaiOrb } from '../components/KaiOrb';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Chat Preview State
  const [previewInput, setPreviewInput] = useState('');
  // Box Breathing Interactive Loop in Bento
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathText, setBreathText] = useState('Breathe');
  const [breathScale, setBreathScale] = useState<'scale-100' | 'scale-125' | 'scale-75'>(
    'scale-100',
  );

  useEffect(() => {
    if (!isBreathing) return;

    let isMounted = true;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const schedule = (callback: () => void, delay: number) => {
      const timer = setTimeout(() => {
        timers.delete(timer);
        if (isMounted) callback();
      }, delay);
      timers.add(timer);
    };

    const runCycle = () => {
      if (!isMounted) return;
      setBreathText('Inhale');
      setBreathScale('scale-125');
      schedule(() => setBreathText('Hold'), 4000);
      schedule(() => {
        setBreathText('Exhale');
        setBreathScale('scale-75');
      }, 8000);
      schedule(() => setBreathText('Hold'), 12000);
    };

    const interval = setInterval(runCycle, 16000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, [isBreathing]);

  // Selected mood in Bento
  const [selectedMood, setSelectedMood] = useState<
    'happy' | 'calm' | 'okay' | 'sad' | 'anxious' | 'angry'
  >('calm');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSendPreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewInput.trim()) {
      navigate('/chat');
      return;
    }
    navigate('/chat', { state: { initialText: previewInput } });
  };

  const handleChipClick = (chipText: string) => {
    setPreviewInput(chipText);
  };

  return (
    <div className="w-full flex flex-col pt-4">
      {/* Hero Section */}
      <section className="relative pt-6 md:pt-12 pb-12">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Social Proof Micro Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-md shadow-[0_8px_24px_rgba(9,30,37,0.04)] mb-6 border border-outline-variant/20">
            <span className="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_8px_rgba(127,184,171,0.8)]" />
            <span className="text-xs text-on-surface-variant font-medium">
              Built with college life in mind
            </span>
            <span className="text-surface-dim">•</span>
            <span className="text-xs text-primary flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[14px]">translate</span>
              English + Hinglish
            </span>
          </div>

          {/* Oversized Friendly Headline */}
          <h1 className="font-display font-semibold text-4xl sm:text-5xl md:text-[54px] md:leading-15.5 text-on-surface tracking-tight max-w-3xl">
            It's okay to <span className="rough-underline">not be okay.</span>
          </h1>

          {/* Subtext */}
          <p className="text-body-lg text-lg text-on-surface-variant mt-4 max-w-xl leading-relaxed">
            A place to put the exam stress, placement panic, or whatever else is taking up space
            today.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link
              to={isAuthenticated ? '/chat' : '/signup'}
              className="h-12 px-8 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-semibold text-sm sm:text-base flex items-center gap-2 shadow-[0_12px_32px_rgba(247,205,184,0.45)] hover:bg-tertiary-container hover:text-on-tertiary-container hover:-translate-y-0.5 active:scale-[0.98] transition-all"
            >
              <span>Start talking</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>

            <a
              href="#how-it-works"
              className="h-12 px-8 rounded-full bg-surface-container-lowest text-on-surface-variant font-semibold text-sm sm:text-base flex items-center hover:text-on-surface hover:bg-surface-container-high transition-all shadow-[0_4px_16px_rgba(9,30,37,0.03)] border border-outline-variant/15"
            >
              See how it works
            </a>
          </div>

          {/* Floating Interactive Chat Preview Bento */}
          <div className="w-full max-w-2xl mt-12 bg-surface-container-lowest/90 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-[0_20px_48px_-8px_rgba(127,184,171,0.18)] border border-outline-variant/20 flex flex-col text-left relative overflow-hidden">
            {/* Chat Header Ribbon */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-outline-variant/10">
              <div className="flex items-center gap-3">
                <KaiOrb size="md" animate={true} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-headline font-semibold text-base text-on-surface">
                      Kai
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-medium">
                      Chat preview
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">Example conversation</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse" />
                <span className="text-xs text-primary font-medium">listening</span>
              </div>
            </div>

            {/* Chat Stream Messages */}
            <div className="flex flex-col gap-3">
              {/* Message 1 */}
              <div className="flex items-end gap-2 max-w-[85%]">
                <div className="bg-secondary-container/40 dark:bg-secondary-container/20 text-on-surface rounded-2xl rounded-bl-sm p-4 text-sm md:text-base shadow-sm">
                  Hey. How has today been, really?
                </div>
              </div>

              {/* Message 2 */}
              <div className="flex items-end justify-end self-end max-w-[85%]">
                <div className="bg-primary text-on-primary rounded-2xl rounded-br-sm p-4 text-sm md:text-base shadow-[0_8px_20px_rgba(47,104,93,0.18)]">
                  two submissions due and i keep opening the same doc without writing anything
                </div>
              </div>

              {/* Message 3 */}
              <div className="flex items-start gap-2 max-w-[88%]">
                <div className="bg-secondary-container/40 dark:bg-secondary-container/20 text-on-surface rounded-2xl rounded-bl-sm p-4 text-sm md:text-base shadow-sm flex flex-col gap-2">
                  <p>
                    That stuck feeling before a deadline is rough. Want to pick one tiny thing to
                    start with, or just get it off your chest?
                  </p>
                  <Link
                    to="/wellness?tab=breathing"
                    className="flex items-center gap-2 pt-1 text-primary font-medium text-xs md:text-sm hover:underline"
                  >
                    <span className="material-symbols-outlined text-[18px]">self_improvement</span>
                    <span>Try a short breathing reset</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Sticker Prompt Chips */}
            <div className="mt-5 pt-3 border-t border-outline-variant/10 flex flex-col gap-2">
              <span className="text-xs text-on-surface-variant font-medium">
                Tap to reply or vent:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  "I'm feeling overwhelmed 🌀",
                  'Exam stress is getting to me 📚',
                  "I can't sleep 🌙",
                  'Just need to vent 💬',
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleChipClick(chip)}
                    className="px-3.5 py-1.5 rounded-full bg-surface-container text-on-surface text-xs md:text-sm hover:bg-primary-container/30 hover:text-on-primary-container transition-all text-left border border-outline-variant/10"
                    type="button"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Minimalist Input Capsule */}
            <form
              onSubmit={handleSendPreview}
              className="mt-4 flex items-center gap-2 p-1.5 pl-4 rounded-full bg-surface-container-high/80 border border-outline-variant/15"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                chat_bubble_outline
              </span>
              <input
                className="bg-transparent text-on-surface text-sm md:text-base w-full focus:outline-none placeholder:text-on-surface-variant/60"
                placeholder="Type whatever comes to mind..."
                type="text"
                value={previewInput}
                onChange={(e) => setPreviewInput(e.target.value)}
              />
              <button
                aria-label="Send message to Kai"
                type="submit"
                className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shrink-0 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">north</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Bento Grid Section: Features */}
      <section className="py-12">
        <div className="flex flex-col mb-8 text-left">
          <span className="text-xs text-primary uppercase tracking-widest font-semibold">
            For the days that get a bit much
          </span>
          <h2 className="font-headline font-semibold text-2xl sm:text-3xl md:text-[36px] md:leading-11 text-on-surface tracking-tight mt-1">
            A few things that might help
          </h2>
          <p className="text-body-md text-on-surface-variant mt-2 max-w-xl">
            Talk, jot something down, or try a breathing timer. No streaks required.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento 1: AI Chat (Spans 2 columns) */}
          <div className="md:col-span-2 bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-[0_12px_32px_rgba(9,30,37,0.03)] border border-outline-variant/20 flex flex-col justify-between relative overflow-hidden group hover:shadow-[0_16px_40px_rgba(127,184,171,0.15)] transition-all">
            <div className="max-w-md z-10">
              <div className="w-10 h-10 rounded-full bg-secondary-container/40 flex items-center justify-center text-secondary mb-4">
                <span className="material-symbols-outlined text-[22px]">smart_toy</span>
              </div>
              <h3 className="font-headline font-semibold text-xl text-on-surface">
                A chat to think out loud
              </h3>
              <p className="text-body-md text-on-surface-variant mt-2 leading-relaxed">
                Tell Kai what is going on. Replies come from Gemini, so check important advice and
                avoid sharing anything you would not send to an online service.
              </p>
            </div>

            <div className="mt-6 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 z-10">
              <div className="p-3.5 rounded-xl bg-surface-container-low flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                  nightlight
                </span>
                <div>
                  <span className="font-semibold text-xs sm:text-sm text-on-surface block">
                    English + Hinglish
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    Use whichever feels easier.
                  </span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-container-low flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                  psychology_alt
                </span>
                <div>
                  <span className="font-semibold text-xs sm:text-sm text-on-surface block">
                    Not a therapist
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    Kai can't diagnose or replace professional care.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bento 2: Box Breathing Bubble */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-[0_12px_32px_rgba(9,30,37,0.03)] border border-outline-variant/20 flex flex-col justify-between items-center text-center relative overflow-hidden group">
            <div className="w-full text-left">
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-4">
                <span className="material-symbols-outlined text-[22px]">air</span>
              </div>
              <h3 className="font-headline font-semibold text-xl text-on-surface">
                A breathing timer
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Follow a simple 4-count rhythm, or pause whenever you like.
              </p>
            </div>

            {/* Pulsing Animated Breathing Orb */}
            <div className="py-6 flex flex-col items-center justify-center relative w-full">
              <div
                className={`w-28 h-28 rounded-full bg-linear-to-tr from-primary-container/60 via-secondary-container/50 to-tertiary-fixed flex items-center justify-center shadow-[0_0_30px_rgba(127,184,171,0.4)] transition-all duration-4000 ease-in-out ${breathScale}`}
              >
                <span className="text-sm text-on-surface font-semibold tracking-wide">
                  {breathText}
                </span>
              </div>
              <span className="text-[11px] text-on-surface-variant mt-4">
                Paced 4s Inhale • 4s Hold • 4s Exhale
              </span>
            </div>

            <button
              onClick={() => {
                if (isBreathing) {
                  setBreathText('Breathe');
                  setBreathScale('scale-100');
                } else {
                  setBreathText('Inhale');
                  setBreathScale('scale-125');
                }
                setIsBreathing(!isBreathing);
              }}
              className="w-full py-2.5 rounded-full bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high transition-colors"
              type="button"
            >
              {isBreathing ? 'Pause Exercise' : 'Start Breath Session'}
            </button>
          </div>

          {/* Bento 3: Tactile Mood Sticker Tracker */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-[0_12px_32px_rgba(9,30,37,0.03)] border border-outline-variant/20 flex flex-col justify-between">
            <div className="text-left">
              <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary mb-4">
                <span className="material-symbols-outlined text-[22px]">sentiment_satisfied</span>
              </div>
              <h3 className="font-headline font-semibold text-xl text-on-surface">Mood check-in</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Pick a mood and add a note if you want to.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 my-4">
              {[
                { key: 'happy', emoji: '✨', label: 'Happy' },
                { key: 'calm', emoji: '🌱', label: 'Calm' },
                { key: 'okay', emoji: '☁️', label: 'Okay' },
                { key: 'sad', emoji: '🌧️', label: 'Sad' },
                { key: 'anxious', emoji: '🌪️', label: 'Anxious' },
                { key: 'angry', emoji: '🔥', label: 'Angry' },
              ].map((m) => {
                const isSelected = selectedMood === m.key;
                return (
                  <button
                    key={m.key}
                    onClick={() => setSelectedMood(m.key as typeof selectedMood)}
                    className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-primary-container/30 ring-1 ring-primary/30 shadow-sm'
                        : 'bg-surface-container-low hover:bg-tertiary-fixed/40 active:scale-95'
                    }`}
                    type="button"
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-xs text-on-surface font-medium">{m.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-on-surface-variant text-xs pt-2">
              <span>Example moods</span>
              <span className="text-primary font-semibold">Preview</span>
            </div>
          </div>

          {/* Bento 4: Low-Pressure Journal */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-[0_12px_32px_rgba(9,30,37,0.03)] border border-outline-variant/20 flex flex-col justify-between">
            <div className="text-left">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary mb-4">
                <span className="material-symbols-outlined text-[22px]">draw</span>
              </div>
              <h3 className="font-headline font-semibold text-xl text-on-surface">
                A place to write
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Notes are stored in this browser. Prompts are optional.
              </p>
            </div>

            <div className="my-4 p-4 rounded-xl bg-surface-container-low flex flex-col gap-2 text-left">
              <span className="text-[11px] text-primary font-semibold uppercase tracking-wider">
                Reflection prompt
              </span>
              <p className="text-xs italic text-on-surface">
                "What is one tiny thing you can forgive yourself for today?"
              </p>
              <div className="mt-1 pt-2 text-on-surface-variant text-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">edit_note</span>
                <span>Nothing written yet. Start anywhere.</span>
              </div>
            </div>

            <Link
              to="/wellness?tab=journal"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Open scratchpad{' '}
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {/* Bento 5: Immediate Human Care */}
          <div className="bg-surface-container-high rounded-2xl p-6 md:p-8 shadow-[0_12px_32px_rgba(9,30,37,0.03)] border border-outline-variant/20 flex flex-col justify-between">
            <div className="text-left">
              <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary mb-4 shadow-sm">
                <span className="material-symbols-outlined text-[22px]">emergency_share</span>
              </div>
              <h3 className="font-headline font-semibold text-xl text-on-surface">
                Talk to a person
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">
                If you need support from someone trained to listen, these public helplines are
                available in India.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 my-4">
              <a
                href="tel:14416"
                className="p-3 rounded-xl bg-surface-container-lowest flex items-center justify-between hover:bg-tertiary-fixed transition-colors text-left"
              >
                <div>
                  <span className="font-semibold text-xs md:text-sm text-on-surface block">
                    Tele-MANAS (Govt of India)
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    Toll-free 24/7 Helpline • Dial 14416
                  </span>
                </div>
                <span className="material-symbols-outlined text-primary text-[20px]">call</span>
              </a>

              <a
                href="tel:9152987821"
                className="p-3 rounded-xl bg-surface-container-lowest flex items-center justify-between hover:bg-tertiary-fixed transition-colors text-left"
              >
                <div>
                  <span className="font-semibold text-xs md:text-sm text-on-surface block">
                    iCall Psychosocial Support
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    Mon-Sat 8AM-10PM • Free counseling
                  </span>
                </div>
                <span className="material-symbols-outlined text-primary text-[20px]">call</span>
              </a>
            </div>

            <span className="text-[11px] text-on-surface-variant text-left">
              Check current hours with the service before calling.
            </span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12" id="how-it-works">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs text-primary uppercase tracking-widest font-semibold">
            Getting started
          </span>
          <h2 className="font-headline font-semibold text-2xl sm:text-3xl md:text-[36px] text-on-surface tracking-tight mt-1">
            How it works
          </h2>
          <p className="text-body-md text-on-surface-variant mt-2">
            No long setup. Pick a tool and see if it helps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Step 1 */}
          <div className="p-6 md:p-8 rounded-2xl bg-surface-container-lowest shadow-[0_8px_24px_rgba(9,30,37,0.02)] border border-outline-variant/20 flex flex-col justify-between">
            <div>
              <span className="font-display text-4xl font-semibold text-primary-container/40">
                01
              </span>
              <h3 className="font-headline font-semibold text-lg text-on-surface mt-2">
                Drop in anytime
              </h3>
              <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                Make a local profile or continue as a guest. Your notes stay in this browser.
              </p>
            </div>
            <div className="mt-6 pt-2 flex items-center gap-2 text-on-surface-variant text-xs">
              <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
              <span>Start with a guest profile</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 md:p-8 rounded-2xl bg-surface-container-lowest shadow-[0_8px_24px_rgba(9,30,37,0.02)] border border-outline-variant/20 flex flex-col justify-between">
            <div>
              <span className="font-display text-4xl font-semibold text-secondary-container/60">
                02
              </span>
              <h3 className="font-headline font-semibold text-lg text-on-surface mt-2">
                Say whatever is on your mind
              </h3>
              <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                Write a message in English or Hinglish. Kai uses Gemini to draft a reply.
              </p>
            </div>
            <div className="mt-6 pt-2 flex items-center gap-2 text-on-surface-variant text-xs">
              <span className="material-symbols-outlined text-secondary text-[18px]">chat</span>
              <span>Keep it in your own words</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 md:p-8 rounded-2xl bg-surface-container-lowest shadow-[0_8px_24px_rgba(9,30,37,0.02)] border border-outline-variant/20 flex flex-col justify-between">
            <div>
              <span className="font-display text-4xl font-semibold text-tertiary-fixed">03</span>
              <h3 className="font-headline font-semibold text-lg text-on-surface mt-2">
                Choose a tool to try
              </h3>
              <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                Try a breathing timer, jot a note, or call a helpline if you need a person.
              </p>
            </div>
            <div className="mt-6 pt-2 flex items-center gap-2 text-on-surface-variant text-xs">
              <span className="material-symbols-outlined text-tertiary text-[18px]">spa</span>
              <span>Tools you can stop at any time</span>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Promise Banner */}
      <section className="py-8">
        <div className="p-6 md:p-8 rounded-2xl bg-surface-container-low shadow-sm border border-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div className="flex items-start gap-4 max-w-xl">
            <div className="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[24px]">verified_user</span>
            </div>
            <div>
              <h3 className="font-headline font-semibold text-xl text-on-surface">
                Know where your notes go.
              </h3>
              <p className="text-sm text-on-surface-variant mt-1.5 leading-relaxed">
                Journal and mood entries stay in this browser. Chat messages and your language/focus
                preferences are sent to Google Gemini through the app server to generate replies.
                This build does not provide end-to-end encryption or account sync. Avoid sharing
                identifying details.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="px-4 py-2 rounded-full bg-surface-container-lowest/80 text-on-surface text-xs font-medium flex items-center gap-1.5 shadow-sm border border-outline-variant/10">
              <span className="material-symbols-outlined text-primary text-[16px]">
                check_circle
              </span>
              <span>Stored in this browser</span>
            </div>
            <div className="px-4 py-2 rounded-full bg-surface-container-lowest/80 text-on-surface text-xs font-medium flex items-center gap-1.5 shadow-sm border border-outline-variant/10">
              <span className="material-symbols-outlined text-primary text-[16px]">
                check_circle
              </span>
              <span>Guest profile available</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-12 max-w-3xl mx-auto w-full">
        <div className="text-center mb-8">
          <span className="text-xs text-primary uppercase tracking-widest font-semibold">
            Before you start
          </span>
          <h2 className="font-headline font-semibold text-2xl sm:text-3xl md:text-[36px] text-on-surface tracking-tight mt-1">
            Frequently asked questions
          </h2>
        </div>

        <div className="flex flex-col gap-3 text-left">
          {[
            {
              id: 0,
              question: 'Is Kai a replacement for professional therapy?',
              answer:
                'No. Kai is a student project, not a therapist or crisis service. For urgent support in India, call Tele-MANAS at 14416 or contact someone you trust.',
            },
            {
              id: 1,
              question: 'What happens to messages I send in chat?',
              answer:
                'Chat history is saved in browser storage on this device. To generate a reply, this app sends the conversation, selected language, and focus areas to its server, which calls Google Gemini. This project does not add end-to-end encryption or account sync. Check Google’s current API terms before using or deploying it with sensitive information.',
            },
            {
              id: 2,
              question: 'Does this app have a subscription?',
              answer:
                'This build has no payments or subscription flow. Hosting and AI usage can still have costs or limits for whoever runs it.',
            },
          ].map((faq) => {
            const isOpen = openFaq === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-surface-container-lowest rounded-2xl p-5 md:p-6 shadow-sm border border-outline-variant/15 transition-all"
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-between text-left font-headline font-semibold text-base sm:text-lg text-on-surface"
                  onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                >
                  <span>{faq.question}</span>
                  <span
                    className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>
                {isOpen && (
                  <div className="mt-3 text-sm text-on-surface-variant leading-relaxed animate-in fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Warm Final CTA */}
      <section className="py-12">
        <div className="rounded-3xl p-8 md:p-16 bg-surface-container-lowest shadow-sm border border-outline-variant/20 text-center flex flex-col items-center relative overflow-hidden">
          <div className="mb-4">
            <KaiOrb size="xl" animate={true} />
          </div>

          <h2 className="font-headline font-semibold text-2xl sm:text-3xl md:text-[38px] text-on-surface tracking-tight max-w-xl">
            Whenever you're ready, we're here.
          </h2>

          <p className="text-body-lg text-lg text-on-surface-variant mt-2 max-w-md">
            Take a deep breath. You don't have to carry the whole world today.
          </p>

          <div className="mt-6">
            <Link
              to={isAuthenticated ? '/chat' : '/signup'}
              className="h-12 px-8 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-semibold text-sm sm:text-base inline-flex items-center gap-2 shadow-[0_12px_32px_rgba(247,205,184,0.45)] hover:bg-tertiary-container hover:text-on-tertiary-container hover:-translate-y-0.5 active:scale-[0.98] transition-all"
            >
              <span>Start talking</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

          <div className="mt-8 pt-4 text-on-surface-variant/80 text-xs sm:text-sm max-w-lg border-t border-outline-variant/10">
            If things feel too heavy, remember you don't have to carry it alone. You can always call{' '}
            <a className="text-primary font-semibold hover:underline" href="tel:14416">
              Tele-MANAS (14416)
            </a>
            , free and 24/7 across India.
          </div>
        </div>
      </section>
    </div>
  );
};
