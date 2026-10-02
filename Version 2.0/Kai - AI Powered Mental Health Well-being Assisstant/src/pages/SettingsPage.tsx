import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [activeSection, setActiveSection] = useState<
    'profile' | 'preferences' | 'privacy' | 'about' | 'feedback'
  >('profile');

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Preference State
  const [lang, setLang] = useState<'english' | 'hinglish'>(user?.preferredLanguage || 'hinglish');
  const [reminderEnabled, setReminderEnabled] = useState(Boolean(user?.reminderTime));
  const [reminderTime, setReminderTime] = useState(user?.reminderTime || '21:00');

  // Feedback State
  const [feedbackCategory, setFeedbackCategory] = useState('general');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email });
    showToast('Profile saved in this browser.', 'success');
  };

  const handleSavePreferences = () => {
    updateProfile({
      preferredLanguage: lang,
      reminderTime: reminderEnabled ? reminderTime : undefined,
    });
    showToast('Preferences updated.', 'success');
  };

  const handleDownloadData = () => {
    const jsonStr = authService.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kai_data_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('A copy of this browser’s Kai data was downloaded.', 'success');
  };

  const handleConfirmDeleteAll = () => {
    authService.wipeAllData();
    showToast('Kai data stored in this browser was cleared.', 'info');
    setShowDeleteModal(false);
    logout();
    window.location.href = '/';
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMsg.trim()) return;
    const savedFeedback = JSON.parse(localStorage.getItem('kai_feedback') || '[]');
    savedFeedback.push({
      category: feedbackCategory,
      message: feedbackMsg.trim(),
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('kai_feedback', JSON.stringify(savedFeedback));
    showToast('Feedback saved in this browser. It has not been sent to the team.', 'info');
    setFeedbackMsg('');
  };

  return (
    <div className="w-full flex flex-col gap-6 pt-2 text-left max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-xs text-on-surface-variant font-medium mb-3">
          <span className="material-symbols-outlined text-[15px] text-primary">tune</span>
          <span>Local profile and app settings</span>
        </div>
        <h1 className="font-display font-semibold text-3xl sm:text-4xl text-on-surface tracking-tight">
          Settings & Privacy
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          These settings and your notes are stored in this browser.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-full overflow-x-auto no-scrollbar border border-outline-variant/15 text-xs">
        {[
          { id: 'profile', label: 'Profile', icon: 'person' },
          { id: 'preferences', label: 'Preferences', icon: 'settings' },
          { id: 'privacy', label: 'Privacy & Data', icon: 'shield' },
          { id: 'about', label: 'About & Terms', icon: 'info' },
          { id: 'feedback', label: 'Feedback', icon: 'chat' },
        ].map((sec) => (
          <button
            key={sec.id}
            type="button"
            onClick={() => setActiveSection(sec.id as typeof activeSection)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
              activeSection === sec.id
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{sec.icon}</span>
            <span>{sec.label}</span>
          </button>
        ))}
      </div>

      {/* Content Container */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-sm border border-outline-variant/20">
        {/* SECTION 1: PROFILE */}
        {activeSection === 'profile' && (
          <div className="flex flex-col gap-6">
            <h2 className="font-headline font-semibold text-lg text-on-surface">Local profile</h2>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 max-w-md">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Preferred Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-surface-container-low text-sm text-on-surface border border-outline-variant/15 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Email Address</label>
                <input
                  type="email"
                  value={email}
                  disabled={user?.isGuest}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-surface-container-low text-sm text-on-surface border border-outline-variant/15 focus:outline-none disabled:opacity-60"
                />
                {user?.isGuest && (
                  <span className="text-[11px] text-tertiary">
                    Guest mode: Email is not bound to a remote database.
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto self-start px-6 py-2 rounded-full bg-primary text-on-primary text-xs font-semibold hover:opacity-95 shadow-xs"
              >
                Update Name
              </button>
            </form>

            <div className="h-px bg-outline-variant/15 my-2" />

            <div className="max-w-md rounded-xl bg-surface-container-low p-4 text-xs text-on-surface-variant">
              This prototype has no secure account service. Password changes and account recovery
              are not available here.
            </div>

            <div className="h-px bg-outline-variant/15 my-2" />

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-on-surface block">Sign Out</span>
                <span className="text-xs text-on-surface-variant">Log out on this browser</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  window.location.href = '/';
                }}
                className="px-4 py-1.5 rounded-full border border-error/30 text-error text-xs font-semibold hover:bg-error-container/20 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        )}

        {/* SECTION 2: PREFERENCES */}
        {activeSection === 'preferences' && (
          <div className="flex flex-col gap-6">
            <h2 className="font-headline font-semibold text-lg text-on-surface">Preferences</h2>

            {/* Chat Language */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low">
              <div>
                <span className="text-sm font-semibold text-on-surface block">
                  Kai Style Language
                </span>
                <span className="text-xs text-on-surface-variant">
                  Match your conversational vernacular
                </span>
              </div>
              <div className="flex gap-1 bg-surface-container rounded-full p-0.5">
                <button
                  type="button"
                  onClick={() => setLang('english')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    lang === 'english'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLang('hinglish')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    lang === 'hinglish'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant'
                  }`}
                >
                  Hinglish
                </button>
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low">
              <div>
                <span className="text-sm font-semibold text-on-surface block">
                  Color Appearance
                </span>
                <span className="text-xs text-on-surface-variant">
                  Currently set to {theme === 'dark' ? 'Dark' : 'Light'}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="px-4 py-2 rounded-full bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {theme === 'dark' ? 'light_mode' : 'routine'}
                </span>
                <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
              </button>
            </div>

            {/* Evening Reminder */}
            <div className="p-4 rounded-2xl bg-surface-container-low flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-on-surface block">
                    Bedtime Grounding Reminder
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    Saved as a preference only. This version does not send notifications.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </div>

              {reminderEnabled && (
                <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/10">
                  <span className="text-xs font-medium text-on-surface">Time:</span>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="px-3 py-1 rounded-lg bg-surface-container text-xs text-on-surface border border-outline-variant/15"
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSavePreferences}
              className="w-full sm:w-auto self-start px-6 py-2 rounded-full bg-primary text-on-primary text-xs font-semibold hover:opacity-95 shadow-xs"
            >
              Save Preferences
            </button>
          </div>
        )}

        {/* SECTION 3: PRIVACY & DATA */}
        {activeSection === 'privacy' && (
          <div className="flex flex-col gap-6">
            <h2 className="font-headline font-semibold text-lg text-on-surface">
              Privacy and data
            </h2>

            <div className="p-4 rounded-2xl bg-surface-container-low text-xs text-on-surface-variant">
              Profile, mood, journal, and chat history are stored in this browser. Chat messages and
              selected preferences are sent to Google Gemini through the app server to generate
              replies. This build does not encrypt chat end to end or sync accounts.
            </div>

            {/* Export Data */}
            <div className="p-4 rounded-2xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-sm font-semibold text-on-surface block">
                  Download All My Data (.JSON)
                </span>
                <span className="text-xs text-on-surface-variant">
                  Get a complete copy of your mood logs, journal entries, and chat sessions.
                </span>
              </div>
              <button
                type="button"
                onClick={handleDownloadData}
                className="px-5 py-2 rounded-full bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Export JSON</span>
              </button>
            </div>

            {/* Wipe Everything */}
            <div className="p-4 rounded-2xl bg-error-container/20 border border-error/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-sm font-semibold text-error block">
                  Delete All My Data & Reset App
                </span>
                <span className="text-xs text-on-surface-variant">
                  Delete Kai profile, settings, journals, moods, chats, and feedback saved in this
                  browser.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-5 py-2 rounded-full bg-error text-on-error text-xs font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto shadow-xs"
              >
                Delete Everything
              </button>
            </div>
          </div>
        )}

        {/* SECTION 4: ABOUT & TERMS */}
        {activeSection === 'about' && (
          <div className="flex flex-col gap-4 text-xs sm:text-sm text-on-surface leading-relaxed">
            <h2 className="font-headline font-semibold text-lg text-on-surface">About Kai</h2>
            <p>
              Kai was built specifically for students and young adults in India who face
              overwhelming exam stress, sleep spirals, family pressures, and comparison exhaustion.
            </p>
            <p>
              Kai is a student project exploring small wellbeing tools for college life. It is not a
              care provider, and its AI replies are generated by Google Gemini.
            </p>

            <h3 className="font-headline font-semibold text-base text-on-surface mt-4">
              Clinical Disclaimer
            </h3>
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/15 text-xs text-on-surface-variant">
              Kai is an artificial intelligence companion and does not offer medical advice,
              psychiatric diagnosis, or clinical psychotherapy. If you or someone you know is in
              acute danger or distress, please reach out directly to{' '}
              <strong>Tele-MANAS (14416)</strong> or <strong>iCall (9152987821)</strong>.
            </div>

            <h3 className="font-headline font-semibold text-base text-on-surface mt-4">
              Privacy Promise
            </h3>
            <p>
              Chat history is saved in browser storage. Messages are also sent to the app server and
              Google Gemini for replies. Do not use this prototype for information that must remain
              confidential.
            </p>
          </div>
        )}

        {/* SECTION 5: FEEDBACK */}
        {activeSection === 'feedback' && (
          <form onSubmit={handleSubmitFeedback} className="flex flex-col gap-4 max-w-md">
            <div>
              <h2 className="font-headline font-semibold text-lg text-on-surface">
                Share Feedback with Us
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Your note is saved in this browser only. It is not sent to the team yet.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface">Topic</label>
              <select
                value={feedbackCategory}
                onChange={(e) => setFeedbackCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-surface-container-low text-xs text-on-surface border border-outline-variant/15"
              >
                <option value="general">General impression</option>
                <option value="chat">Kai AI chat quality</option>
                <option value="breathing">Guided Breathing tool</option>
                <option value="privacy">Privacy & Security</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface">Your thoughts</label>
              <textarea
                rows={4}
                required
                placeholder="Write whatever is on your mind..."
                value={feedbackMsg}
                onChange={(e) => setFeedbackMsg(e.target.value)}
                className="w-full p-3 rounded-xl bg-surface-container-low text-xs text-on-surface border border-outline-variant/15 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto self-start px-6 py-2 rounded-full bg-primary text-on-primary text-xs font-semibold hover:opacity-95 shadow-xs"
            >
              Submit Feedback
            </button>
          </form>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-outline-variant/30 flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[24px]">delete_forever</span>
            </div>
            <div>
              <h4 className="font-headline font-semibold text-lg text-on-surface">
                Permanently wipe all records?
              </h4>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                This removes Kai data from this browser. It cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-on-surface-variant hover:text-on-surface"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAll}
                className="px-5 py-2 rounded-full bg-error text-on-error text-xs font-semibold hover:opacity-90 shadow-xs"
              >
                Yes, Wipe Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
