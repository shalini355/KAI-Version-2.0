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
    console.error(
      'Uncaught error in Kai:',
      JSON.stringify({
        name: error.name,
        message: error.message,
        componentStack: errorInfo.componentStack,
      }),
    );
  }

  public render() {
    if (this.state.hasError) {
      return (
        <main
          role="alert"
          className="min-h-screen w-full flex items-center justify-center bg-background px-6 py-12 text-on-surface"
        >
          <section className="flex w-full max-w-lg flex-col items-center rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-8 text-center shadow-lg sm:p-10">
            <KaiOrb size="lg" animate={true} />
            <h1 className="mt-6 font-headline text-2xl font-semibold text-on-surface sm:text-3xl">
              Dashboard is optimizing...
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-on-surface-variant">
              Something unexpected happened. Your browser-saved notes should still be there. Reload
              the application to try again.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-7 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-on-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Reload Application
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
