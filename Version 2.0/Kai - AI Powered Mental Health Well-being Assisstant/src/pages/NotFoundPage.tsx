import React from 'react';
import { Link } from 'react-router-dom';
import { KaiOrb } from '../components/KaiOrb';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="w-full max-w-md mx-auto my-auto py-16 flex flex-col items-center text-center">
      <KaiOrb size="lg" animate={true} />
      <span className="font-display font-bold text-6xl text-primary mt-4">404</span>
      <h1 className="font-headline font-semibold text-2xl text-on-surface mt-2">
        We couldn't find that page.
      </h1>
      <p className="text-sm text-on-surface-variant mt-2 max-w-sm">
        The link may be old or mistyped. Head back to the dashboard or home page.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <Link
          to="/"
          className="px-6 py-2.5 rounded-full bg-primary text-on-primary text-sm font-semibold hover:opacity-95 shadow-xs"
        >
          Go home
        </Link>
        <Link
          to="/chat"
          className="px-6 py-2.5 rounded-full bg-surface-container text-on-surface text-sm font-semibold hover:bg-surface-container-high"
        >
          Open chat
        </Link>
      </div>
    </div>
  );
};
