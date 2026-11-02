import React, { useEffect, useState } from 'react';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueChat?: () => void;
  initialImmediateDanger?: 'yes' | 'no' | null;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({
  isOpen,
  onClose,
  onContinueChat,
  initialImmediateDanger = null,
}) => {
  const [immediateDanger, setImmediateDanger] = useState<'yes' | 'no' | null>(
    initialImmediateDanger,
  );

  useEffect(() => {
    if (isOpen) setImmediateDanger(initialImmediateDanger);
  }, [isOpen, initialImmediateDanger]);

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
              Are you in immediate danger right now?
            </h3>
            <p className="text-body-sm text-on-surface-variant mt-1.5 leading-relaxed">
              Kai is not an emergency service and cannot contact help for you.
            </p>
          </div>
        </div>

        {immediateDanger === null && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setImmediateDanger('yes')}
              className="min-h-12 rounded-full bg-error text-on-error font-semibold px-5 py-3"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setImmediateDanger('no')}
              className="min-h-12 rounded-full bg-primary text-on-primary font-semibold px-5 py-3"
            >
              No
            </button>
          </div>
        )}

        {immediateDanger === 'yes' && (
          <div className="flex flex-col gap-3">
            <p className="text-body-sm text-on-surface leading-relaxed font-semibold">
              Talk to someone you trust and stay with them now. Move away from anything you could use
              to hurt yourself.
            </p>
            <a
              href="tel:112"
              className="min-h-14 rounded-2xl bg-error text-on-error flex items-center justify-center gap-2 text-lg font-bold"
            >
              <span className="material-symbols-outlined">call</span>
              Call 112 now
            </a>
            <a
              href="tel:14416"
              className="min-h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center gap-2 text-lg font-bold"
            >
              <span className="material-symbols-outlined">call</span>
              Call Tele-MANAS 14416
            </a>
            <button
              type="button"
              onClick={onClose}
              className="mt-1 px-5 py-3 rounded-full border border-outline-variant text-on-surface font-semibold"
            >
              Close
            </button>
          </div>
        )}

        {immediateDanger === 'no' && (
          <>
            <div className="flex flex-col gap-2.5">
              <a
                href="tel:14416"
                className="min-h-14 p-3.5 rounded-xl bg-surface-container flex items-center justify-between"
              >
                <span className="font-semibold text-on-surface">Tele-MANAS · 14416</span>
                <span className="material-symbols-outlined text-primary">call</span>
              </a>
              <a
                href="tel:9152987821"
                className="min-h-14 p-3.5 rounded-xl bg-surface-container flex items-center justify-between"
              >
                <span className="font-semibold text-on-surface">iCall · 9152987821</span>
                <span className="material-symbols-outlined text-primary">call</span>
              </a>
              <a
                href="tel:112"
                className="min-h-14 p-3.5 rounded-xl bg-error-container/30 flex items-center justify-between"
              >
                <span className="font-semibold text-on-surface">National emergency · 112</span>
                <span className="material-symbols-outlined text-error">call</span>
              </a>
              <p className="text-body-sm text-on-surface-variant">
                It can help to contact someone you trust to stay with you while you decide what to do
                next.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              {onContinueChat && (
                <button
                  onClick={onContinueChat}
                  type="button"
                  className="w-full sm:w-auto px-5 py-3 rounded-full bg-surface-container-high text-on-surface text-sm font-medium"
                >
                  Continue talking to Kai
                </button>
              )}
              <button
                onClick={onClose}
                type="button"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-primary text-on-primary text-sm font-semibold sm:ml-auto"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
