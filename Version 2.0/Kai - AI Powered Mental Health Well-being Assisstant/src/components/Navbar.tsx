import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { KaiOrb } from './KaiOrb';

interface NavbarProps {
  onOpenCrisis?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCrisis }) => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const currentPath = location.pathname;

  const navItems = [
    { label: 'Home', path: isAuthenticated ? '/dashboard' : '/' },
    { label: 'Chat', path: '/chat' },
    { label: 'Mood', path: '/mood' },
    { label: 'Wellness', path: '/wellness' },
    { label: 'Support', path: '/support' },
  ];

  const isActive = (itemPath: string) => {
    if (itemPath === '/' || itemPath === '/dashboard') {
      return currentPath === '/' || currentPath === '/dashboard';
    }
    return currentPath.startsWith(itemPath);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-200">
      <div className="h-20 max-w-295 mx-auto px-4 md:px-8 lg:px-12 flex items-center justify-between">
        {/* Brand Zone */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2 group">
          <KaiOrb size="sm" animate={true} />
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-headline font-semibold text-lg text-on-surface lowercase tracking-tight group-hover:text-primary transition-colors">
                kai
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-primary-container shadow-[0_0_8px_rgba(127,184,171,0.8)]" />
            </div>
            <span className="text-[11px] font-medium text-on-surface-variant hidden sm:inline-block leading-none">
              here for you
            </span>
          </div>
        </Link>

        {/* Floating Pill Nav (Desktop) */}
        <nav
          aria-label="Main Navigation"
          className="hidden lg:flex items-center p-1.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_8px_24px_rgba(9,30,37,0.04)] border border-outline-variant/20 gap-1"
        >
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.label}
                to={item.path}
                aria-current={active ? 'page' : undefined}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-surface-container-lowest text-primary shadow-[0_4px_16px_rgba(47,104,93,0.08)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions Zone */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Crisis support shortcut */}
          <button
            onClick={onOpenCrisis}
            title="Helpline 14416"
            className="hidden lg:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-error hover:bg-error-container/30 transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">emergency</span>
            <span>14416</span>
          </button>

          {/* Talk to Kai CTA */}
          <Link
            to="/chat"
            className="h-10 px-4 sm:px-5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-semibold text-xs sm:text-sm flex items-center justify-center shadow-[0_8px_24px_rgba(247,205,184,0.35)] hover:bg-tertiary-container hover:text-on-tertiary-container active:scale-[0.98] transition-all whitespace-nowrap"
          >
            Talk to Kai
          </Link>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="w-9 h-9 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors border border-outline-variant/20 shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[19px]">
              {theme === 'light' ? 'routine' : 'light_mode'}
            </span>
          </button>

          {/* User profile / Settings link */}
          <Link
            to="/settings"
            aria-label="Profile and Settings"
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary hover:opacity-90 transition-opacity shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">
              {user?.isGuest ? 'face' : 'person'}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};
