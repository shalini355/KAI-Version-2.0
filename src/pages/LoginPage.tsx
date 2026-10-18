import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { KaiOrb } from '../components/KaiOrb';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, guestLogin } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email);
      showToast('Profile opened in this browser.', 'success');
      navigate('/dashboard');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Couldn't open that profile. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = () => {
    guestLogin();
    showToast('Guest profile opened. Mood and journal notes stay in this browser.', 'info');
    navigate('/onboarding');
  };

  return (
    <div className="w-full max-w-md mx-auto my-auto py-10 flex flex-col items-center text-left">
      <div className="mb-6 flex flex-col items-center text-center">
        <KaiOrb size="lg" animate={true} />
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-on-surface mt-3">
          Open a local profile
        </h1>
        <p className="mt-1 text-xs text-on-surface-variant sm:text-sm">
          Enter the email used when creating the profile. Profiles are local to this browser and
          have no password protection.
        </p>
      </div>

      <div className="w-full bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-sm border border-outline-variant/20 flex flex-col gap-5">
        {error && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-error-container/40 text-on-error-container text-xs flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="profile-email" className="text-xs font-semibold text-on-surface">
              Profile email
            </label>
            <input
              id="profile-email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-sm text-on-surface focus:outline-none border border-outline-variant/15 placeholder:text-on-surface-variant/50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-full bg-primary text-on-primary font-semibold text-sm hover:opacity-95 shadow-xs transition-opacity mt-2 flex items-center justify-center gap-2"
          >
            {isLoading ? 'Opening profile...' : 'Open profile'}
          </button>
        </form>

        <div className="flex items-center gap-2 my-1">
          <div className="flex-1 h-px bg-outline-variant/20" />
          <span className="text-[11px] text-on-surface-variant uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-outline-variant/20" />
        </div>

        <button
          type="button"
          onClick={handleGuest}
          className="w-full h-11 rounded-full bg-surface-container text-on-surface font-semibold text-xs sm:text-sm hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2 border border-outline-variant/15"
        >
          <span className="material-symbols-outlined text-[18px]">shield_person</span>
          <span>Continue as guest</span>
        </button>

        <div className="text-center pt-2 border-t border-outline-variant/10 text-xs text-on-surface-variant">
          Need a profile on this browser?{' '}
          <Link to="/signup" className="text-primary font-semibold hover:underline">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
};
