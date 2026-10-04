import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { KaiOrb } from '../components/KaiOrb';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [preferredLanguage, setPreferredLanguage] = useState<'english' | 'hinglish'>('hinglish');
  const [focusAreas, setFocusAreas] = useState<string[]>(['stress', 'studies']);
  const [reminderTime, setReminderTime] = useState('21:00');
  const [enableReminder, setEnableReminder] = useState(true);

  const availableAreas = [
    { id: 'stress', label: 'Overthinking & Stress', emoji: '🌀' },
    { id: 'sleep', label: 'Late Night Sleep spirals', emoji: '🌙' },
    { id: 'studies', label: 'Exams & Academics', emoji: '📚' },
    { id: 'relationships', label: 'Friendships & Family', emoji: '🌱' },
    { id: 'loneliness', label: 'Feeling lonely or isolated', emoji: '☁️' },
  ];

  const handleToggleArea = (id: string) => {
    setFocusAreas((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleFinish = () => {
    updateProfile({
      preferredLanguage,
      focusAreas,
      reminderTime: enableReminder ? reminderTime : undefined,
    });
    showToast(`Preferences saved${user?.name ? ` for ${user.name}` : ''}.`, 'success');
    navigate('/dashboard');
  };

  return (
    <div className="w-full max-w-lg mx-auto my-auto py-8 flex flex-col items-center text-left">
      <div className="mb-6 flex flex-col items-center text-center">
        <KaiOrb size="lg" animate={true} />
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-on-surface mt-3">
          Set up Kai
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          Step {step} of 3 • You can change these anytime in Settings
        </p>
      </div>

      <div className="w-full bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-sm border border-outline-variant/20 flex flex-col gap-6">
        {/* Step 1: Language Style */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-headline font-semibold text-lg text-on-surface">
              How would you like Kai to talk with you?
            </h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Switch between English and Hinglish whenever you like.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <button
                type="button"
                onClick={() => setPreferredLanguage('hinglish')}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                  preferredLanguage === 'hinglish'
                    ? 'border-primary bg-primary-fixed/30 ring-1 ring-primary/30 shadow-xs'
                    : 'border-outline-variant/20 bg-surface-container-low hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-on-surface">Hinglish</span>
                  {preferredLanguage === 'hinglish' && (
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      check_circle
                    </span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant mt-1">
                  Relatable, warm and casual. <br />
                  <em className="text-primary/90">"Thoda slow lete hain. Kya chal raha hai?"</em>
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPreferredLanguage('english')}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                  preferredLanguage === 'english'
                    ? 'border-primary bg-primary-fixed/30 ring-1 ring-primary/30 shadow-xs'
                    : 'border-outline-variant/20 bg-surface-container-low hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-on-surface">English</span>
                  {preferredLanguage === 'english' && (
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      check_circle
                    </span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant mt-1">
                  Conversational English. <br />
                  <em className="text-primary/90">"One thing at a time. What's on your mind?"</em>
                </p>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full h-11 rounded-full bg-primary text-on-primary font-semibold text-sm flex items-center justify-center gap-1.5 hover:opacity-95 shadow-xs transition-opacity mt-4"
            >
              <span>Continue</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        )}

        {/* Step 2: Focus Areas */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-headline font-semibold text-lg text-on-surface">
              What has been weighing on your mind recently?
            </h2>
            <p className="text-xs text-on-surface-variant">
              Pick any topics you'd like Kai to keep in mind:
            </p>

            <div className="flex flex-col gap-2 mt-1">
              {availableAreas.map((area) => {
                const isChecked = focusAreas.includes(area.id);
                return (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => handleToggleArea(area.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      isChecked
                        ? 'border-primary bg-primary-fixed/30 text-on-surface font-semibold shadow-xs'
                        : 'border-outline-variant/15 bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{area.emoji}</span>
                      <span className="text-xs sm:text-sm">{area.label}</span>
                    </div>
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      {isChecked ? 'check_box' : 'check_box_outline_blank'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3 mt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-full text-xs font-semibold text-on-surface-variant hover:text-on-surface"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 h-11 rounded-full bg-primary text-on-primary font-semibold text-sm flex items-center justify-center gap-1.5 hover:opacity-95 shadow-xs transition-opacity"
              >
                <span>Next</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Reminder Time */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-headline font-semibold text-lg text-on-surface">
              Optional evening check-in reminder
            </h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Choose a time to save as a preference. This version does not send notifications yet.
            </p>

            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/15 flex items-center justify-between mt-2">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  nightlight
                </span>
                <div>
                  <span className="text-sm font-semibold text-on-surface block">Evening pause</span>
                  <span className="text-xs text-on-surface-variant">
                    Saved as a preference only
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={enableReminder}
                onChange={(e) => setEnableReminder(e.target.checked)}
                className="w-5 h-5 accent-primary cursor-pointer"
              />
            </div>

            {enableReminder && (
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-xs font-semibold text-on-surface">
                  Preferred reminder time:
                </label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-sm text-on-surface border border-outline-variant/15 focus:outline-none"
                />
              </div>
            )}

            <div className="flex items-center justify-between gap-3 mt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-full text-xs font-semibold text-on-surface-variant hover:text-on-surface"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="px-8 h-11 rounded-full bg-primary text-on-primary font-semibold text-sm flex items-center justify-center gap-1.5 hover:opacity-95 shadow-xs transition-opacity"
              >
                <span>Finish setup</span>
                <span className="material-symbols-outlined text-[18px]">done</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
