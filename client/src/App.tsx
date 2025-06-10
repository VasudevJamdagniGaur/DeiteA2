import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuthContext } from "./components/AuthProvider";
import SplashScreen from "./pages/SplashScreen";
import OnboardingScreen from "./pages/OnboardingScreen";
import AuthScreen from "./pages/AuthScreen";
import ProfileSetupScreen from "./pages/ProfileSetupScreen";
import DashboardScreen from "./pages/DashboardScreen";
import ChatScreen from "./pages/ChatScreen";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";

function AppContent() {
  const { user, profile, loading } = useAuthContext();
  const [currentScreen, setCurrentScreen] = useState("splash");
  const [chatDate, setChatDate] = useState("");

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated - show splash/onboarding/auth flow
        if (currentScreen === "splash" || currentScreen === "onboarding" || currentScreen === "auth") {
          // Keep current screen
        } else {
          setCurrentScreen("splash");
        }
      } else if (user && !profile) {
        // Authenticated but no profile - show profile setup
        setCurrentScreen("profile");
      } else if (user && profile) {
        // Fully set up - show dashboard or chat
        if (currentScreen === "splash" || currentScreen === "onboarding" || currentScreen === "auth" || currentScreen === "profile") {
          setCurrentScreen("dashboard");
        }
      }
    }
  }, [user, profile, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream to-soft-teal/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-coral to-mustard rounded-full flex items-center justify-center mx-auto mb-4 animate-wiggle">
            <div className="text-2xl">🧠</div>
          </div>
          <p className="font-nunito font-semibold text-navy">Loading Deite...</p>
        </div>
      </div>
    );
  }

  const screens = {
    splash: (
      <SplashScreen 
        onGetStarted={() => setCurrentScreen("onboarding")} 
      />
    ),
    onboarding: (
      <OnboardingScreen 
        onContinue={() => setCurrentScreen("auth")} 
      />
    ),
    auth: (
      <AuthScreen 
        onSuccess={() => {
          // Will be handled by useEffect when user/profile state changes
        }} 
      />
    ),
    profile: (
      <ProfileSetupScreen 
        onComplete={() => {
          // Will be handled by useEffect when profile is created
        }} 
      />
    ),
    dashboard: (
      <DashboardScreen 
        onStartReflection={(date) => {
          setChatDate(date);
          setCurrentScreen("chat");
        }} 
      />
    ),
    chat: (
      <ChatScreen 
        date={chatDate}
        onBack={() => setCurrentScreen("dashboard")} 
      />
    ),
  };

  return screens[currentScreen as keyof typeof screens] || <NotFound />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <div className="max-w-md mx-auto bg-white shadow-2xl min-h-screen relative overflow-hidden">
            <AppContent />
          </div>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
