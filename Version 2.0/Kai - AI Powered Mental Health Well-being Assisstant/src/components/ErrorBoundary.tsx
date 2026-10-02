import React, { Component, ErrorInfo, ReactNode } from 'react';
import { KaiOrb } from './KaiOrb';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Kai:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-background text-on-surface text-center">
          <KaiOrb size="lg" animate={true} />
          <h2 className="font-headline font-semibold text-2xl text-on-surface mt-4">
            Kai hit a problem.
          </h2>
          <p className="text-sm text-on-surface-variant mt-2 max-w-md">
            Your browser-saved notes should still be there. Reload the page to try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2.5 rounded-full bg-primary text-on-primary font-semibold text-sm hover:opacity-95 shadow-sm"
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
