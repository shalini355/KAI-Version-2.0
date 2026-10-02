import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { KaiOrb } from '../components/KaiOrb';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, guestLogin } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Compute password strength
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score += 25;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9!@#$%^&*]/.test(pass)) score += 25;
    return score;
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await signup(name, email, password);
      showToast('Local profile created.', 'success');
      navigate('/onboarding');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Couldn't create that profile. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = () => {
    guestLogin();
    showToast('Guest profile opened in this browser.', 'info');
    navigate('/onboarding');
  };

  return (
    <div className="w-full max-w-md mx-auto my-auto py-10 flex flex-col items-center text-left">
      <div className="mb-6 flex flex-col items-center text-center">
        <KaiOrb size="lg" animate={true} />
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-on-surface mt-3">
          Create a local profile
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          This demo saves profile and journal data in this browser. Chat requests go to the app
          server and Google Gemini.
        </p>
      </div>

      <div className="w-full bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-sm border border-outline-variant/20 flex flex-col gap-5">
        {error && (
          <div className="p-3 rounded-xl bg-error-container/40 text-on-error-container text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface">
              What should Kai call you?
            </label>
            <input
              type="text"
              required
              placeholder="What should we call you?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-sm text-on-surface focus:outline-none border border-outline-variant/15 placeholder:text-on-surface-variant/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface">Email address</label>
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-sm text-on-surface focus:outline-none border border-outline-variant/15 placeholder:text-on-surface-variant/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface">Password</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-sm text-on-surface focus:outline-none border border-outline-variant/15 placeholder:text-on-surface-variant/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>

            {/* Password strength bar */}
            {password.length > 0 && (
              <div className="flex flex-col gap-1 mt-1">
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      strength <= 25
                        ? 'bg-error w-1/4'
                        : strength <= 50
                          ? 'bg-tertiary w-1/2'
                          : strength <= 75
                            ? 'bg-secondary w-3/4'
                            : 'bg-primary w-full'
                    }`}
                  />
                </div>
                <span className="text-[10px] text-on-surface-variant">
                  {strength <= 25
                    ? 'Weak password'
                    : strength <= 50
                      ? 'Fairly secure'
                      : strength <= 75
                        ? 'Strong password'
                        : 'Very strong password'}
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-full bg-primary text-on-primary font-semibold text-sm hover:opacity-95 shadow-xs transition-opacity mt-2 flex items-center justify-center gap-2"
          >
            {isLoading ? 'Creating profile...' : 'Create profile'}
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
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};
