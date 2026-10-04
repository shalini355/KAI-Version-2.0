import React from 'react';

export const BackgroundAura: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none">
      <div className="absolute -top-[18rem] left-[12%] h-[34rem] w-[34rem] rounded-full bg-primary-container/10 blur-[140px] dark:bg-primary/5" />
    </div>
  );
};
