import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-12 bg-surface-container-lowest/85 backdrop-blur-xl border-t border-outline-variant/10 shadow-[0_-4px_24px_rgba(9,30,37,0.02)] pb-20 md:pb-6">
      <div className="max-w-[1180px] mx-auto px-4 md:px-8 lg:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Crisis Hotline notice */}
        <div className="flex items-center gap-3 text-center md:text-left">
          <div className="w-9 h-9 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-secondary shrink-0">
            <span className="material-symbols-outlined text-[20px]">support_agent</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="font-semibold text-sm text-on-surface">Need someone right now?</span>
            <a
              href="tel:14416"
              className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
            >
              Tele-MANAS (14416) is free & 24/7.
            </a>
          </div>
        </div>

        {/* Center: Disclaimer & Links */}
        <div className="flex items-center gap-4 text-xs text-on-surface-variant">
          <Link to="/support" className="hover:text-primary transition-colors">
            Support Resources
          </Link>
          <span>•</span>
          <Link to="/settings" className="hover:text-primary transition-colors">
            Privacy & data
          </Link>
        </div>

        {/* Storage note */}
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant text-center md:text-right">
          <span className="material-symbols-outlined text-[15px] text-primary">devices</span>
          <span>Notes stay in this browser</span>
        </div>
      </div>
      <div className="max-w-[1180px] mx-auto px-4 text-center pb-2 text-[11px] text-on-surface-variant/70">
        Kai is a student project, not a therapist or emergency service. Made by students at PSIT
        Kanpur.
      </div>
    </footer>
  );
};
