import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const MobileTabBar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const currentPath = location.pathname;

  const tabs = [
    { label: 'Home', path: isAuthenticated ? '/dashboard' : '/', icon: 'home' },
    { label: 'Chat', path: '/chat', icon: 'chat_bubble' },
    { label: 'Mood', path: '/mood', icon: 'sentiment_satisfied' },
    { label: 'Wellness', path: '/wellness', icon: 'self_improvement' },
    { label: 'Support', path: '/support', icon: 'support_agent' },
  ];

  const isActive = (itemPath: string) => {
    if (itemPath === '/' || itemPath === '/dashboard') {
      return currentPath === '/' || currentPath === '/dashboard';
    }
    return currentPath.startsWith(itemPath);
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/90 backdrop-blur-xl border-t border-outline-variant/20 shadow-[0_-4px_24px_rgba(9,30,37,0.06)] px-3 py-1.5"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.label}
              to={tab.path}
              className={`flex flex-col items-center justify-center min-w-13.5 min-h-12 py-1 px-2 rounded-xl transition-all ${
                active
                  ? 'text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  active ? 'bg-primary/10 text-primary' : 'text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              </div>
              <span className="text-[11px] leading-tight mt-0.5">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
