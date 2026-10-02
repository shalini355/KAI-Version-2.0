import React from 'react';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueChat?: () => void;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({ isOpen, onClose, onContinueChat }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-sm animate-in fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="crisis-title"
        className="w-full max-w-lg rounded-2xl bg-surface-container-lowest p-6 md:p-8 shadow-2xl border border-outline-variant/30 flex flex-col gap-5 text-left"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[26px]">favorite</span>
          </div>
          <div>
            <h3
              id="crisis-title"
              className="font-headline-md text-xl md:text-2xl font-bold text-on-surface"
            >
              Please get someone with you now.
            </h3>
            <p className="text-body-sm text-on-surface-variant mt-1.5 leading-relaxed">
              Kai is not an emergency service and cannot contact help for you. Call one of the
              services below, or ask someone nearby to stay with you.
            </p>
          </div>
        </div>

        {/* Helplines Box */}
        <div className="flex flex-col gap-2.5">
          <a
            href="tel:14416"
            className="p-3.5 rounded-xl bg-surface-container hover:bg-tertiary-fixed transition-colors flex items-center justify-between group"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-on-surface text-sm md:text-base">
                  Tele-MANAS (Govt of India)
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-medium">
                  24/7 Toll-Free
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Call 14416 for mental health support in India.
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-sm">
              <span className="material-symbols-outlined text-[20px]">call</span>
            </div>
          </a>

          <a
            href="tel:9152987821"
            className="p-3.5 rounded-xl bg-surface-container hover:bg-tertiary-fixed transition-colors flex items-center justify-between group"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-on-surface text-sm md:text-base">
                  iCall Psychosocial Helpline (TISS)
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-medium">
                  Check current availability
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Call 9152987821. Check iCall's current service details.
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-sm">
              <span className="material-symbols-outlined text-[20px]">call</span>
            </div>
          </a>

          <a
            href="tel:112"
            className="p-3 rounded-xl bg-error-container/30 hover:bg-error-container/50 transition-colors flex items-center justify-between text-on-surface"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-[18px]">local_police</span>
              <span className="font-medium text-xs md:text-sm">
                National Emergency Helpline (Dial 112)
              </span>
            </div>
            <span className="text-xs font-semibold text-error">Call 112</span>
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {onContinueChat && (
            <button
              onClick={() => {
                onClose();
                onContinueChat();
              }}
              type="button"
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-surface-container-high hover:bg-surface-container text-on-surface text-sm font-medium transition-colors"
            >
              Continue talking to Kai
            </button>
          )}

          <button
            onClick={onClose}
            type="button"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity ml-auto"
          >
            I'm safe right now
          </button>
        </div>
      </div>
    </div>
  );
};
