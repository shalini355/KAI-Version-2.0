import React, { useState, useEffect, useRef, useEffectEvent } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { chatService, ExtendedChatSession } from '../services/chatService';
import { ChatMessage } from '../types';
import { CrisisModal } from '../components/CrisisModal';
import { KaiOrb } from '../components/KaiOrb';

const BREATH_STEPS = [
  { label: 'Inhale', count: '4s', scale: 'scale-125' },
  { label: 'Hold', count: '4s', scale: 'scale-125' },
  { label: 'Exhale', count: '4s', scale: 'scale-75' },
  { label: 'Pause', count: '4s', scale: 'scale-100' },
] as const;

export const ChatPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [sessions, setSessions] = useState<ExtendedChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ExtendedChatSession | null>(null);
  const [inputText, setInputText] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'vents' | 'reflections' | 'sleep'>(
    'all',
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'english' | 'hinglish'>('hinglish');

  // Crisis Modal state
  const [isCrisisOpen, setIsCrisisOpen] = useState(false);
  const [pendingCrisisMessage, setPendingCrisisMessage] = useState<string | null>(null);

  // Micro-Reset Box Breath State
  const [showMicroReset, setShowMicroReset] = useState(true);
  const [isMicroBreathing, setIsMicroBreathing] = useState(false);
  const [breathPhaseIndex, setBreathPhaseIndex] = useState(0);

  // Speech Recognition (Voice Memo)
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<KaiSpeechRecognition | null>(null);

  // Mood Picker Popover
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [currentVibe, setCurrentVibe] = useState('Mood');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isSendingRef = useRef(false);

  // Soft audio chime for breathing transitions
  const playBreathChime = (freq = 432) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.4);
    } catch {}
  };

  const createSessionForCurrentLanguage = useEffectEvent(() =>
    chatService.createSession(language, 'vents'),
  );

  // This effect synchronizes browser storage with the route's selected conversation.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const list = chatService.getSessions();
    setSessions(list);

    const routeState = location.state as { initialText?: unknown } | null;
    const initialTextFromState = routeState?.initialText;

    if (sessionId) {
      const found = list.find((s) => s.id === sessionId);
      if (found) {
        setActiveSession(found);
        setLanguage(found.language);
      } else if (list.length > 0) {
        setActiveSession(list[0]);
      }
    } else if (list.length > 0) {
      setActiveSession(list[0]);
    } else {
      const created = createSessionForCurrentLanguage();
      setSessions([created]);
      setActiveSession(created);
    }

    if (typeof initialTextFromState === 'string' && initialTextFromState) {
      setInputText(initialTextFromState);
    }
  }, [sessionId, location.state]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, streamingText, isStreaming]);

  // Micro-Reset Breathing Interval
  useEffect(() => {
    if (!isMicroBreathing) return;

    playBreathChime(432);
    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % BREATH_STEPS.length;
      setBreathPhaseIndex(step);
      if (step === 0)
        playBreathChime(432); // Inhale
      else if (step === 1)
        playBreathChime(528); // Hold
      else if (step === 2)
        playBreathChime(396); // Exhale
      else playBreathChime(432); // Pause
    }, 4000);

    return () => clearInterval(interval);
  }, [isMicroBreathing]);

  // Speech Recognition Initializer
  const toggleVoiceRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('Voice dictation is not supported in this browser.', 'info');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'hinglish' ? 'hi-IN' : 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        showToast('Listening... Speak freely 🎙️', 'info');
      };

      recognition.onresult = (event: KaiSpeechRecognitionEvent) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const handleCreateNewSession = () => {
    const newSession = chatService.createSession(
      language,
      activeCategory === 'all' ? 'vents' : activeCategory,
    );
    const updated = chatService.getSessions();
    setSessions(updated);
    setActiveSession(newSession);
    navigate(`/chat/${newSession.id}`);
    showToast('New conversation started.', 'success');
  };

  const handleSelectSession = (s: ExtendedChatSession) => {
    setActiveSession(s);
    setLanguage(s.language);
    navigate(`/chat/${s.id}`);
  };

  const handlePurgeHistory = () => {
    if (window.confirm('Wipe all conversation history on this browser?')) {
      chatService.purgeAll();
      const fresh = chatService.createSession(language, 'vents');
      setSessions([fresh]);
      setActiveSession(fresh);
      navigate(`/chat/${fresh.id}`);
      showToast('Chat history deleted from this browser.', 'info');
    }
  };

  const executeSendMessage = async (textToSend: string) => {
    const messageText = textToSend.trim();
    if (!activeSession || !messageText || isLoading || isStreaming || isSendingRef.current) return;

    if (chatService.checkCrisis(messageText)) {
      setPendingCrisisMessage(messageText);
      setIsCrisisOpen(true);
      return;
    }

    isSendingRef.current = true;
    setIsLoading(true);
    setSendError(null);

    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 30_000);

    try {
      const userMessage: ChatMessage = {
        id: 'usr-' + Date.now(),
        sender: 'user',
        text: messageText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const nextMessages = [...activeSession.messages, userMessage];
      const sessionToUpdate: ExtendedChatSession = {
        ...activeSession,
        title:
          activeSession.messages.length <= 1
            ? messageText.slice(0, 32) + (messageText.length > 32 ? '...' : '')
            : activeSession.title,
        snippet: messageText.slice(0, 36) + (messageText.length > 36 ? '...' : ''),
        language,
        messages: nextMessages,
        updatedAt: new Date().toISOString(),
      };

      setActiveSession(sessionToUpdate);
      chatService.updateSession(sessionToUpdate);
      setSessions(chatService.getSessions());
      setInputText('');
      setIsStreaming(true);
      setStreamingText('');

      await chatService.streamResponse(
        activeSession.id,
        activeSession.messages,
        userMessage.text,
        language,
        user?.name || 'there',
        user?.focusAreas || ['stress', 'sleep'],
        (chunk) => {
          setStreamingText(chunk);
        },
        (fullText) => {
          if (typeof fullText !== 'string' || !fullText.trim()) {
            throw new Error("Kai couldn't reply just now. Please try again.");
          }

          setIsStreaming(false);
          setStreamingText('');

          const kaiMsg: ChatMessage = {
            id: 'kai-' + Date.now(),
            sender: 'kai',
            text: fullText.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          const finalSession: ExtendedChatSession = {
            ...sessionToUpdate,
            messages: [...nextMessages, kaiMsg],
            updatedAt: new Date().toISOString(),
          };

          setActiveSession(finalSession);
          chatService.updateSession(finalSession);
          setSessions(chatService.getSessions());
        },
        (error) => {
          setIsStreaming(false);
          setStreamingText('');
          const message = timedOut
            ? 'Kai took too long to respond. Please try again.'
            : error instanceof Error
              ? error.message
              : "That didn't go through. Try again?";
          setSendError(message);
          showToast(message, 'error');
        },
        controller.signal,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "That didn't go through. Try again?";
      setIsStreaming(false);
      setStreamingText('');
      setSendError(message);
      showToast(message, 'error');
    } finally {
      window.clearTimeout(timeoutId);
      setIsStreaming(false);
      setStreamingText('');
      isSendingRef.current = false;
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Message copied to clipboard', 'info');
  };

  const handleRateMessage = (msgId: string, rating: 'like' | 'dislike') => {
    if (!activeSession) return;
    const updatedMsgs = activeSession.messages.map((m) =>
      m.id === msgId ? { ...m, rating: m.rating === rating ? undefined : rating } : m,
    );
    const updatedSession = { ...activeSession, messages: updatedMsgs };
    setActiveSession(updatedSession);
    chatService.updateSession(updatedSession);
    showToast(rating === 'like' ? 'Thanks, noted.' : 'Thanks for the feedback.', 'info');
  };

  // Filtered Sessions
  const filteredSessions = sessions.filter((s) => {
    if (activeCategory === 'all') return true;
    return s.category === activeCategory;
  });

  const quickReplies = [
    { text: "Let's do the breathing exercise", emoji: '🫁' },
    { text: 'I just want to vent more', emoji: '💭' },
    { text: 'Can we reframe catastrophic thoughts?', emoji: '🌿' },
    { text: "I can't sleep at all", emoji: '🌙' },
  ];

  return (
    <div className="w-full flex flex-col pb-8 text-left relative selection:bg-primary-container selection:text-on-primary-container">
      {/* Crisis Detection Modal */}
      <CrisisModal
        isOpen={isCrisisOpen}
        onClose={() => {
          setIsCrisisOpen(false);
          setPendingCrisisMessage(null);
        }}
        onContinueChat={() => {
          if (pendingCrisisMessage) {
            const m = pendingCrisisMessage;
            setPendingCrisisMessage(null);
            executeSendMessage(m);
          }
        }}
      />

      {/* Main Chat Studio Grid */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT SIDEBAR: Safe History & Sanctuaries (4 Cols on lg) */}
        <aside className="lg:col-span-4 w-full bg-surface-container-lowest/90 backdrop-blur-xl rounded-2xl p-5 md:p-6 shadow-[0_12px_36px_rgba(9,30,37,0.04)] border border-outline-variant/15 flex flex-col gap-6">
          {/* Top Action & Search */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-headline font-semibold text-lg text-on-surface">
                  Conversations
                </span>
                <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
              </div>
              <span className="text-[11px] text-primary bg-primary-fixed/40 px-2.5 py-0.5 rounded-full font-semibold">
                Chat history
              </span>
            </div>

            <button
              onClick={handleCreateNewSession}
              className="w-full h-11 px-4 rounded-full bg-primary-fixed text-on-primary-fixed font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(127,184,171,0.25)] hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98]"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>New chat</span>
            </button>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: 'all', label: 'All' },
                { id: 'vents', label: 'Vents' },
                { id: 'reflections', label: 'Reflections' },
                { id: 'sleep', label: 'Sleep' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as typeof activeCategory)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-on-surface text-surface-container-lowest shadow-xs'
                      : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Session List */}
          <div className="flex flex-col gap-2.5 max-h-115 overflow-y-auto no-scrollbar">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant/70 px-1">
              Recent spaces
            </span>

            {filteredSessions.map((session) => {
              const isActive = activeSession?.id === session.id;
              const msgCount = session.messages.length;

              return (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session)}
                  className={`p-3.5 rounded-2xl flex flex-col gap-1.5 cursor-pointer transition-all border ${
                    isActive
                      ? 'bg-surface-container-low border-primary/20 shadow-[0_4px_18px_rgba(47,104,93,0.06)] -translate-y-0.5'
                      : 'bg-surface-container-lowest border-outline-variant/10 hover:bg-surface-container-high/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-on-surface line-clamp-1">
                      {session.title}
                    </span>
                    <span
                      className={`text-[11px] shrink-0 font-medium ${
                        isActive ? 'text-primary font-semibold' : 'text-on-surface-variant'
                      }`}
                    >
                      {new Date(session.updatedAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-on-surface-variant line-clamp-1 leading-normal">
                    {session.snippet ||
                      session.messages[session.messages.length - 1]?.text ||
                      'New conversation'}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-surface-container-highest text-on-surface font-medium">
                        {session.category || 'general'}
                      </span>
                    </div>
                    <span className="text-[11px] text-on-surface-variant/70">{msgCount} msgs</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat controls */}
          <div className="mt-auto pt-4 flex flex-col gap-2 bg-surface-container-high/50 p-4 rounded-2xl border border-outline-variant/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">tune</span>
                <span className="text-xs font-semibold text-on-surface">Chat history</span>
              </div>
              <span className="text-xs text-secondary font-medium">This browser</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">devices</span>
                <span className="text-xs text-on-surface-variant">Stored in browser storage</span>
              </div>
              <button
                onClick={handlePurgeHistory}
                className="text-xs text-on-surface-variant hover:text-error transition-colors underline decoration-dotted font-medium"
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT/MAIN CHAT AREA (8 Cols on lg) */}
        <main className="lg:col-span-8 w-full bg-surface-container-lowest/90 backdrop-blur-xl rounded-2xl shadow-[0_16px_40px_rgba(9,30,37,0.05)] border border-outline-variant/15 flex flex-col overflow-hidden min-h-190">
          {/* Top Chat Header Bar */}
          <div className="px-5 py-3.5 bg-surface-container-lowest/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/15 shadow-[0_2px_12px_rgba(9,30,37,0.02)]">
            {/* Left: Kai Persona Identity */}
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
                <KaiOrb size="md" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-headline font-semibold text-base text-on-surface">Kai</span>
                </div>
                <span className="text-xs text-on-surface-variant">
                  A place to talk things through
                </span>
              </div>
            </div>

            {/* Right Quick Actions */}
            <div className="flex items-center gap-2">
              {/* Language Chip */}
              <div className="flex items-center bg-surface-container-high rounded-full p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('english');
                    showToast('Kai language style: English', 'info');
                  }}
                  className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                    language === 'english'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('hinglish');
                    showToast('Kai language style: Hinglish 🌸', 'info');
                  }}
                  className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                    language === 'hinglish'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Hinglish
                </button>
              </div>

              {/* Mood Indicator Pill */}
              <button
                type="button"
                onClick={() => setShowMoodPicker(!showMoodPicker)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-semibold shadow-xs hover:bg-tertiary-container transition-colors"
              >
                <span>{currentVibe}</span>
              </button>

              {/* Quick Box Breath Toggle Tool */}
              <button
                type="button"
                onClick={() => setShowMicroReset(!showMicroReset)}
                className="h-9 px-3.5 rounded-full bg-surface-container-high hover:bg-surface-container text-on-surface text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">air</span>
                <span className="hidden md:inline">Box breathe (4s)</span>
              </button>

              {/* Crisis Helplink */}
              <a
                className="h-9 px-3 rounded-full bg-error-container text-on-error-container hover:bg-error/20 text-xs font-semibold flex items-center gap-1 transition-all"
                href="tel:14416"
                title="Free 24/7 mental wellness support"
              >
                <span className="material-symbols-outlined text-[16px]">favorite</span>
                <span className="font-semibold">14416</span>
              </a>
            </div>
          </div>

          {/* Mood Picker Dropdown */}
          {showMoodPicker && (
            <div className="mx-6 mt-2 p-3 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/20 flex items-center justify-between gap-2 z-20">
              <span className="text-xs text-on-surface-variant font-medium">
                Set current feeling:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['Happy ✨', 'Calm 🌿', 'Okay ☁️', 'Sad 🌧️', 'Anxious ⚡', 'Angry 🔥'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setCurrentVibe(m);
                      setShowMoodPicker(false);
                      showToast(`Kai noted your vibe: ${m}`, 'info');
                    }}
                    className="px-2.5 py-1 rounded-full bg-surface-container text-xs text-on-surface hover:bg-primary-container/30 font-medium"
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Stream */}
          <div
            className="flex-1 p-5 md:p-6 flex flex-col gap-6 overflow-y-auto max-h-145"
            id="chat-messages"
          >
            {/* Timestamp Divider */}
            <div className="flex items-center justify-center my-1">
              <span className="text-xs text-on-surface-variant/80 bg-surface-container-high/60 backdrop-blur-sm px-4 py-1 rounded-full shadow-xs">
                Chat history is saved in this browser
              </span>
            </div>

            {/* Conversation Messages */}
            {activeSession?.messages.map((message) => {
              const isUser = message.sender === 'user';
              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 max-w-[85%] ${
                    isUser ? 'self-end flex-row-reverse max-w-[82%]' : ''
                  }`}
                >
                  {isUser ? (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-semibold text-xs shrink-0 mt-1 shadow-sm">
                      {user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  ) : (
                    <KaiOrb size="sm" />
                  )}

                  <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-4 rounded-2xl text-sm md:text-base leading-relaxed relative group ${
                        isUser
                          ? 'rounded-br-xs bg-primary-fixed/70 text-on-surface shadow-[0_4px_16px_rgba(47,104,93,0.06)]'
                          : 'rounded-bl-xs bg-secondary-fixed/40 text-on-surface shadow-[0_4px_16px_rgba(93,89,134,0.04)] border border-outline-variant/10'
                      }`}
                    >
                      <p className="whitespace-pre-line">{message.text}</p>
                    </div>

                    <div className="flex items-center gap-2 px-1 text-[11px] text-on-surface-variant/70">
                      <span>{message.timestamp}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(message.text)}
                        title="Copy message"
                        className="hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-[13px]">content_copy</span>
                      </button>
                      {!isUser && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleRateMessage(message.id, 'like')}
                            className={`hover:text-primary ${message.rating === 'like' ? 'text-primary font-bold' : ''}`}
                          >
                            <span className="material-symbols-outlined text-[13px]">thumb_up</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRateMessage(message.id, 'dislike')}
                            className={`hover:text-error ${message.rating === 'dislike' ? 'text-error font-bold' : ''}`}
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              thumb_down
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Embedded Interactive Micro-Reset Bento Card matching screenshot */}
            {showMicroReset && (
              <div className="self-center w-full max-w-lg my-2 p-4 rounded-2xl bg-surface-container-low shadow-[0_10px_28px_rgba(47,104,93,0.08)] flex flex-col sm:flex-row items-center gap-4 border border-outline-variant/15">
                {/* Animated Pulsing Breathing Sphere */}
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <div
                    className={`absolute w-20 h-20 rounded-full bg-primary-container/50 transition-transform duration-4000 ease-in-out ${
                      isMicroBreathing ? BREATH_STEPS[breathPhaseIndex].scale : 'scale-100'
                    }`}
                  />
                  <div className="relative w-14 h-14 rounded-full bg-surface-container-lowest shadow-[0_4px_16px_rgba(127,184,171,0.4)] flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold text-primary">
                      {isMicroBreathing ? BREATH_STEPS[breathPhaseIndex].label : 'Inhale'}
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-medium">
                      {isMicroBreathing ? BREATH_STEPS[breathPhaseIndex].count : '4s'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 text-center sm:text-left flex-1">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <span className="font-headline font-semibold text-sm sm:text-base text-on-surface">
                      Micro-reset: Box Breath
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-lowest text-primary font-semibold">
                      30 sec
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Keep the count comfortable. Stop if you feel dizzy or uncomfortable.
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      onClick={() => {
                        setBreathPhaseIndex(0);
                        setIsMicroBreathing(!isMicroBreathing);
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all ${
                        isMicroBreathing
                          ? 'bg-secondary text-on-secondary'
                          : 'bg-primary text-on-primary hover:bg-on-primary-container'
                      }`}
                      type="button"
                    >
                      {isMicroBreathing ? 'Pause' : 'Start'}
                    </button>
                    <button
                      onClick={() => {
                        setIsMicroBreathing(false);
                        setBreathPhaseIndex(0);
                        setShowMicroReset(false);
                      }}
                      className="px-3 py-1.5 rounded-full bg-surface-container-lowest text-on-surface-variant hover:text-on-surface text-xs font-semibold transition-colors"
                      type="button"
                    >
                      Skip, let's talk
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* In-Flight Streaming & Kai Live Reflection / Typing Indicator */}
            {isStreaming && (
              <div className="flex items-start gap-3 max-w-[85%]">
                <KaiOrb size="sm" />
                <div className="flex flex-col gap-1">
                  <div className="p-4 rounded-2xl rounded-bl-xs bg-secondary-fixed/40 text-on-surface shadow-[0_4px_16px_rgba(93,89,134,0.04)] text-sm md:text-base border border-outline-variant/10">
                    {streamingText ? (
                      <p className="whitespace-pre-line">{streamingText}</p>
                    ) : (
                      <div className="flex items-center gap-1.5 py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce" />
                        <span className="text-xs text-on-secondary-container pl-1 font-medium">
                          Kai is replying...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Interactive Controls & Text Input Area */}
          <div className="p-4 md:p-6 bg-surface-container-lowest flex flex-col gap-3 shadow-[0_-8px_24px_rgba(9,30,37,0.03)] border-t border-outline-variant/15">
            {/* Suggested replies */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {quickReplies.map((qr) => (
                <button
                  key={qr.text}
                  type="button"
                  onClick={() => executeSendMessage(`${qr.text} ${qr.emoji}`)}
                  disabled={isLoading || isStreaming}
                  className="shrink-0 px-3.5 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-container text-on-surface text-xs font-semibold transition-all active:scale-95 shadow-xs flex items-center gap-1.5"
                >
                  <span>{qr.text}</span>
                  <span>{qr.emoji}</span>
                </button>
              ))}
            </div>

            {sendError && (
              <p role="alert" className="px-2 text-sm text-error">
                {sendError}
              </p>
            )}

            {/* Pill Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeSendMessage(inputText);
              }}
              className="relative flex items-center gap-2 p-1.5 pl-3 rounded-full bg-surface-container-low shadow-[0_4px_16px_rgba(9,30,37,0.03)] focus-within:shadow-[0_4px_24px_rgba(47,104,93,0.14)] focus-within:bg-surface-container-lowest border border-outline-variant/15 transition-all"
            >
              {/* Mood Tag Selector Button */}
              <button
                type="button"
                onClick={() => setShowMoodPicker(!showMoodPicker)}
                aria-label="Select mood sticker"
                className="w-9 h-9 rounded-full bg-surface-container-lowest hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors shrink-0 shadow-xs"
              >
                <span className="material-symbols-outlined text-[20px] text-tertiary">
                  sentiment_calm
                </span>
              </button>

              {/* Input Field */}
              <input
                ref={inputRef}
                autoComplete="off"
                type="text"
                placeholder={
                  language === 'hinglish' ? 'Kya chal raha hai?' : "What's on your mind?"
                }
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setSendError(null);
                }}
                disabled={isLoading || isStreaming}
                className="flex-1 bg-transparent border-0 outline-none text-sm md:text-base text-on-surface placeholder:text-on-surface-variant/60 min-w-0"
              />

              {/* Mic Voice Memo Button */}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                aria-label="Record voice note"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                  isRecording
                    ? 'bg-error text-on-error animate-pulse'
                    : 'hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                }`}
                title={isRecording ? 'Listening... click to stop' : 'Speak voice note'}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isRecording ? 'mic_off' : 'mic'}
                </span>
              </button>

              {/* Send Action Button matching HTML reference */}
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading || isStreaming}
                aria-label="Send message"
                className="h-10 px-4 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs sm:text-sm font-semibold flex items-center justify-center gap-1 shadow-[0_4px_16px_rgba(247,205,184,0.4)] hover:bg-tertiary-container hover:text-on-tertiary-container active:scale-95 disabled:opacity-40 transition-all shrink-0"
              >
                <span className="hidden sm:inline">Send</span>
                <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
              </button>
            </form>

            {/* Privacy & Helpline Disclaimer */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-center gap-1 px-2 pt-0.5 text-xs text-on-surface-variant/70">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-primary">
                  verified_user
                </span>
                <span>
                  Your chat is sent to Google Gemini to generate replies. Avoid sharing identifying
                  details.
                </span>
              </span>
              <span>
                Free helpline:{' '}
                <a
                  className="underline text-on-surface font-semibold hover:text-primary"
                  href="tel:14416"
                >
                  Tele-MANAS (14416)
                </a>
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
