import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./landing/Navbar";
import { Hero } from "./landing/Hero";
import { Features } from "./landing/Features";
import { Pricing } from "./landing/Pricing";
import Footer from "./landing/Footer";
import { AuthModal } from "./auth/AuthModal";
import { VerificationStatus } from "./auth/VerificationStatus";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { AuthToggle } from "@/components/ui/auth-toggle";
import { SupabaseDebugPanel } from "@/components/ui/supabase-debug-panel";

/**
 * Home Component
 *
 * Main landing page component that handles authentication flows and displays
 * marketing content for the application.
 */
const Home = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login");
  const { user, login, signup, isLoading, useMockAuth } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we should open auth modal from navigation state
  useEffect(() => {
    if (location.state?.openAuth && !user) {
      setAuthModalTab("login");
      setIsAuthModalOpen(true);
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location, user]);

  // Check if user needs to verify email
  const needsEmailVerification =
    user && !user.email_confirmed_at && !useMockAuth;

  const handleOpenLogin = () => {
    setAuthModalTab("login");
    setIsAuthModalOpen(true);
  };

  const handleOpenSignUp = () => {
    setAuthModalTab("signup");
    setIsAuthModalOpen(true);
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      // First close the modal to prevent UI issues
      setIsAuthModalOpen(false);

      await login(email, password);

      toast({
        title: "Login successful",
        description: "Welcome back to AgentX AI!",
        variant: "default",
      });

      console.log("Login successful in home component, navigating to /chat");

      // Add a longer delay before navigation to ensure state updates
      setTimeout(() => {
        navigate("/chat", { replace: true });
      }, 800);

      return true;
    } catch (error: any) {
      console.error("Login error in home component:", error);

      toast({
        title: "Login failed",
        description:
          error.message || "Please check your credentials and try again",
        variant: "destructive",
      });

      // Reopen the modal on error
      setIsAuthModalOpen(true);
      throw error;
    }
  };

  const handleSignUp = async (
    name: string,
    email: string,
    password: string,
  ) => {
    try {
      // Use the useMockAuth value from the top-level hook
      await signup(name, email, password);

      // Different messages based on auth type
      if (useMockAuth) {
        toast({
          title: "Sign up successful",
          description:
            "Welcome to AgentX AI! You can now log in with your credentials.",
          variant: "default",
        });
        // For mock auth, we should show login screen after signup
        setAuthModalTab("login");
      } else {
        toast({
          title: "Email verification required",
          description:
            "Please check your email for a verification link to activate your account. Don't forget to check your spam folder.",
          variant: "default",
        });
        setIsAuthModalOpen(false);
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Sign up failed",
        description:
          error.message || "There was a problem creating your account",
        variant: "destructive",
      });
    }
  };

  const handleSelectPlan = (planId: string) => {
    console.log("Selected plan:", planId);
    handleOpenSignUp();
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <Navbar onLogin={handleOpenLogin} onSignUp={handleOpenSignUp} />

      {/* Main content */}
      <main className="flex-grow mt-20">
        {/* Hero section */}
        <Hero />

        {/* Email verification notice for users who need to verify */}
        {needsEmailVerification && (
          <div className="py-8 bg-yellow-50 dark:bg-yellow-900/20 border-y border-yellow-100 dark:border-yellow-800">
            <div className="container mx-auto px-4 max-w-3xl">
              <VerificationStatus email={user.email} isVerified={false} />
            </div>
          </div>
        )}

        {/* Chat button for logged-in users who are verified */}
        {user && !needsEmailVerification && (
          <div className="flex justify-center py-8 bg-gray-50 dark:bg-gray-900">
            <div className="container px-4 text-center">
              <h2 className="text-2xl font-bold mb-4">
                Welcome back, {user.name || "User"}!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Continue your conversation with AgentX AI
              </p>
              <Button
                size="lg"
                className="px-8"
                onClick={() => navigate("/chat")}
              >
                Go to Chat Dashboard
              </Button>
            </div>
          </div>
        )}

        {/* Features section */}
        <div id="features">
          <Features />
        </div>

        {/* Pricing section */}
        <div id="pricing">
          <Pricing onSelectPlan={handleSelectPlan} />
        </div>

        {/* Auth Toggle section */}
        <div className="py-12 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 max-w-md space-y-6">
            <AuthToggle />

            {/* Supabase Debug Panel */}
            <SupabaseDebugPanel />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Auth Modal - Only show when user is not logged in */}
      {!user && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onOpenChange={setIsAuthModalOpen}
          onLogin={handleLogin}
          onSignUp={handleSignUp}
          isLoading={isLoading}
          defaultTab={authModalTab}
        />
      )}
    </div>
  );
};

export default Home;
