import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider } from './components/AuthProvider';
import { Toaster } from './components/ui/toaster';
import { ErrorBoundary } from './components/ErrorBoundary';
import SplashScreen from './pages/SplashScreen';
import AuthScreen from './pages/AuthScreen';
import OnboardingScreen from './pages/OnboardingScreen';
import ChatScreen from './pages/ChatScreen';
import DashboardScreen from './pages/DashboardScreen';
import UserProfileScreen from './pages/UserProfileScreen';
import CustomerSupportScreen from './pages/CustomerSupportScreen';
import ProfileSetupScreen from './pages/ProfileSetupScreen';
import { useAuth } from './hooks/useAuth';
import { isMobileApp, debugInfo } from './lib/config';
import './index.css';

// Create a stable query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

type Screen = 
  | 'splash'
  | 'auth'
  | 'onboarding'
  | 'profile-setup'
  | 'chat'
  | 'dashboard'
  | 'profile'
  | 'support';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    console.log('App starting...', debugInfo);

    // Initialize app
    const initializeApp = async () => {
      try {
        // Simulate initial loading
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsLoading(false);

        // Navigate based on auth state
        if (!user) {
          setCurrentScreen('auth');
        } else {
          setCurrentScreen('chat');
        }
      } catch (error) {
        console.error('App initialization failed:', error);
        setIsLoading(false);
        setCurrentScreen('auth');
      }
    };

    initializeApp();
  }, [user]);

  if (isLoading || authLoading) {
    return <SplashScreen />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'auth':
        return <AuthScreen onNext={() => setCurrentScreen('onboarding')} />;
      case 'onboarding':
        return <OnboardingScreen onNext={() => setCurrentScreen('profile-setup')} />;
      case 'profile-setup':
        return <ProfileSetupScreen onNext={() => setCurrentScreen('chat')} />;
      case 'chat':
        return <ChatScreen onNavigate={setCurrentScreen} />;
      case 'dashboard':
        return <DashboardScreen onNavigate={setCurrentScreen} />;
      case 'profile':
        return <UserProfileScreen onNavigate={setCurrentScreen} />;
      case 'support':
        return <CustomerSupportScreen onNavigate={setCurrentScreen} />;
      default:
        return <ChatScreen onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderScreen()}
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="deite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;