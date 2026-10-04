import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { MobileTabBar } from './components/MobileTabBar';
import { Footer } from './components/Footer';
import { BackgroundAura } from './components/BackgroundAura';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineBanner } from './components/OfflineBanner';
import { CrisisModal } from './components/CrisisModal';

const LandingPage = React.lazy(() =>
  import('./pages/LandingPage').then((page) => ({ default: page.LandingPage })),
);
const LoginPage = React.lazy(() =>
  import('./pages/LoginPage').then((page) => ({ default: page.LoginPage })),
);
const SignupPage = React.lazy(() =>
  import('./pages/SignupPage').then((page) => ({ default: page.SignupPage })),
);
const OnboardingPage = React.lazy(() =>
  import('./pages/OnboardingPage').then((page) => ({ default: page.OnboardingPage })),
);
const DashboardPage = React.lazy(() =>
  import('./pages/DashboardPage').then((page) => ({ default: page.DashboardPage })),
);
const ChatPage = React.lazy(() =>
  import('./pages/ChatPage').then((page) => ({ default: page.ChatPage })),
);
const MoodPage = React.lazy(() =>
  import('./pages/MoodPage').then((page) => ({ default: page.MoodPage })),
);
const WellnessPage = React.lazy(() =>
  import('./pages/WellnessPage').then((page) => ({ default: page.WellnessPage })),
);
const SupportPage = React.lazy(() =>
  import('./pages/SupportPage').then((page) => ({ default: page.SupportPage })),
);
const SettingsPage = React.lazy(() =>
  import('./pages/SettingsPage').then((page) => ({ default: page.SettingsPage })),
);
const NotFoundPage = React.lazy(() =>
  import('./pages/NotFoundPage').then((page) => ({ default: page.NotFoundPage })),
);

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Layout with Navbar and Footers
const AppLayout: React.FC = () => {
  const location = useLocation();
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);

  const isChatPage = location.pathname.startsWith('/chat');
  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/onboarding';

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-primary-container selection:text-on-primary-container">
      <BackgroundAura />
      <OfflineBanner />

      <Navbar onOpenCrisis={() => setIsCrisisModalOpen(true)} />

      <main className="w-full flex-1 pt-20 max-w-[1180px] mx-auto px-4 md:px-8 lg:px-12 flex flex-col">
        <React.Suspense
          fallback={
            <div className="py-12 text-center text-sm text-on-surface-variant">Loading page...</div>
          }
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/support" element={<SupportPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat/:sessionId"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mood"
              element={
                <ProtectedRoute>
                  <MoodPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wellness"
              element={
                <ProtectedRoute>
                  <WellnessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </React.Suspense>
      </main>

      {/* Footer (hidden on chat page to allow maximum message viewport) */}
      {!isChatPage && !isAuthPage && <Footer />}

      {/* Mobile Bottom Tab Bar */}
      {!isAuthPage && <MobileTabBar />}

      {/* Global Crisis Helpline Modal */}
      <CrisisModal isOpen={isCrisisModalOpen} onClose={() => setIsCrisisModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <AppLayout />
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
