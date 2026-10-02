import React from 'react';

interface KaiOrbProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

export const KaiOrb: React.FC<KaiOrbProps> = ({ size = 'md', className = '', animate = false }) => {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 select-none ${sizeClasses} ${className}`}
    >
      <img
        src="/kai-mark.svg"
        alt="Kai"
        className={`w-full h-full object-contain rounded-[28%] transition-transform duration-300 ${animate ? 'animate-[kai-breathe_5s_ease-in-out_infinite]' : ''}`}
        loading="eager"
      />
    </div>
  );
};
