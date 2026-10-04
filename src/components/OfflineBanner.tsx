import React, { useState, useEffect } from 'react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-secondary text-on-secondary px-4 py-1.5 text-xs font-medium text-center shadow-md flex items-center justify-center gap-2">
      <span className="material-symbols-outlined text-[16px]">cloud_off</span>
      <span>You're offline. Notes stay in this browser, but Kai needs a connection to reply.</span>
    </div>
  );
};
