import { Suspense, useEffect } from "react";
import {
  useRoutes,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Home from "./components/home";
import Dashboard from "./pages/dashboard";
import { AuthCallback } from "./components/auth/AuthCallback";
import routes from "tempo-routes";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { AlertCircle, Bug } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Main App Component
 *
 * Handles routing and authentication state for the application.
 * Includes routes for home, dashboard, and auth callback handling.
 */
function App() {
  const { user, isLoading, useMockAuth, toggleMockAuth, resetAuthState } =
    useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Log authentication state for debugging
  console.log("Auth state in App:", {
    user: user ? `${user.name} (${user.email})` : "null",
    isLoading,
    useMockAuth,
    currentPath: location.pathname,
  });

  // Debug auth state changes
  useEffect(() => {
    console.log("Auth state changed in App:", {
      authenticated: !!user,
      path: location.pathname,
      mockAuth: useMockAuth,
    });
  }, [user, location.pathname, useMockAuth]);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading app...</p>
        </div>
      }
    >
      <div className="flex flex-col min-h-screen">
        <Routes>
          {/* Home route - accessible to all users */}
          <Route path="/" element={<Home />} />

          {/* Dashboard routes - protected, requires authentication */}
          <Route
            path="/chat/*"
            element={
              isLoading ? (
                <Dashboard /> // Show Dashboard even while loading
              ) : user ? (
                <Dashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Auth callback route - handles email verification and password reset */}
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>

        {/* Tempo routes for development environment */}
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}

        {/* Toast notifications */}
        <Toaster />
      </div>
    </Suspense>
  );
}

export default App;
