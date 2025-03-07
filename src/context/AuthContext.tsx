import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  User,
  LoginCredentials,
  RegisterData,
  PasswordResetRequest,
  PasswordUpdateData,
  ProfileUpdateData,
} from "@/types/auth";
import * as authService from "@/services/auth";
import * as mockAuthService from "@/lib/mockAuthService";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  useMockAuth: boolean;
  toggleMockAuth: (value?: boolean) => void;
  login: (credentials: LoginCredentials) => Promise<User | null>;
  register: (data: RegisterData) => Promise<User | null>;
  logout: () => Promise<void>;
  resetPassword: (data: PasswordResetRequest) => Promise<void>;
  updatePassword: (data: PasswordUpdateData) => Promise<void>;
  updateProfile: (data: ProfileUpdateData) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  clearError: () => void;
  resetAuthState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockAuth, setUseMockAuth] = useState<boolean>(false);

  // Load user on mount
  useEffect(() => {
    async function loadUser() {
      setIsLoading(true);
      try {
        let currentUser = null;

        if (useMockAuth) {
          // Use mock authentication
          currentUser = await mockAuthService.mockGetCurrentUser();
        } else {
          // Use Supabase authentication
          currentUser = await authService.getCurrentUser();
        }

        setUser(currentUser);
      } catch (err) {
        console.error("Error loading user:", err);
        setError("Failed to load user");
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [useMockAuth]); // Reload when auth mode changes

  // Login function
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      let loggedInUser;

      if (useMockAuth) {
        // Use mock authentication
        loggedInUser = await mockAuthService.mockLogin(credentials);
      } else {
        // Use Supabase authentication
        loggedInUser = await authService.login(credentials);
      }

      setUser(loggedInUser);
      return loggedInUser;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to login";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      let newUser;

      if (useMockAuth) {
        // Use mock authentication
        newUser = await mockAuthService.mockRegister(data);
        // For mock auth, we can set the user immediately
        setUser(newUser);
      } else {
        // Use Supabase authentication
        newUser = await authService.register(data);
        // Don't set the user here as they need to verify their email first
      }

      return newUser;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to register";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (useMockAuth) {
        // Use mock authentication
        await mockAuthService.mockLogout();
      } else {
        // Use Supabase authentication
        await authService.logout();
      }
      setUser(null);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to logout";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (data: PasswordResetRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPassword(data);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to reset password";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update password function
  const updatePassword = async (data: PasswordUpdateData) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.updatePassword(data);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update password";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (data: ProfileUpdateData) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.updateProfile(data);
      // Update the local user state with the new profile data
      if (user) {
        setUser({
          ...user,
          name: data.name || user.name,
          avatarUrl: data.avatarUrl || user.avatarUrl,
        });
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update profile";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification email function
  const resendVerificationEmail = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.resendVerificationEmail(email);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to resend verification email";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // Toggle mock auth function
  const toggleMockAuth = (value?: boolean) => {
    const newValue = value !== undefined ? value : !useMockAuth;
    console.log(`Toggling mock auth to: ${newValue}`);
    setUseMockAuth(newValue);
    // If we're switching to mock auth and there's no user, we could auto-create one here
  };

  // Reset auth state function
  const resetAuthState = () => {
    setUser(null);
    setError(null);
    setIsLoading(false);
  };

  const value = {
    user,
    isLoading,
    error,
    useMockAuth,
    toggleMockAuth,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    resendVerificationEmail,
    clearError,
    resetAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
