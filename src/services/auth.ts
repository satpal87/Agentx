import { supabase } from "@/config/supabase";
import type {
  User,
  LoginCredentials,
  RegisterData,
  PasswordResetRequest,
  PasswordUpdateData,
  ProfileUpdateData,
} from "@/types/auth";

/**
 * Authentication Service
 *
 * Handles all authentication-related operations including login, registration,
 * password reset, and user profile management.
 */

/**
 * Register a new user
 *
 * @param data - Registration data including email, password, and name
 * @returns The newly created user or null if registration failed
 */
export async function register({
  email,
  password,
  name,
}: RegisterData): Promise<User | null> {
  console.log("Registration attempt for:", email);
  try {
    // Create the redirect URL for email verification
    const redirectTo = `${window.location.origin}/auth/callback`;

    // Sign up the user with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: redirectTo,
      },
    });

    if (error) throw error;
    if (!data.user) return null;

    // Return user data
    return {
      id: data.user.id,
      email: data.user.email || email,
      name: data.user.user_metadata?.name || name,
      emailVerified: !!data.user.email_confirmed_at,
      createdAt: data.user.created_at,
    };
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

/**
 * Log in a user
 *
 * @param credentials - Login credentials including email and password
 * @returns The logged-in user or null if login failed
 */
export async function login({
  email,
  password,
}: LoginCredentials): Promise<User | null> {
  console.log("Login attempt for:", email);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) return null;

    // Return user data
    return {
      id: data.user.id,
      email: data.user.email || "",
      name: data.user.user_metadata?.name || "",
      avatarUrl: data.user.user_metadata?.avatar_url,
      emailVerified: !!data.user.email_confirmed_at,
      createdAt: data.user.created_at,
    };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

/**
 * Log out the current user
 */
export async function logout(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

/**
 * Get the current authenticated user
 *
 * @returns The current user or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  console.log("Getting current user from Supabase");
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!data.user) return null;

    // Return user data
    return {
      id: data.user.id,
      email: data.user.email || "",
      name: data.user.user_metadata?.name || "",
      avatarUrl: data.user.user_metadata?.avatar_url,
      emailVerified: !!data.user.email_confirmed_at,
      createdAt: data.user.created_at,
    };
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

/**
 * Send a password reset email
 *
 * @param data - Password reset request data including email
 */
export async function resetPassword({
  email,
}: PasswordResetRequest): Promise<void> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
}

/**
 * Update a user's password
 *
 * @param data - Password update data including the new password
 */
export async function updatePassword({
  password,
}: PasswordUpdateData): Promise<void> {
  try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  } catch (error) {
    console.error("Password update error:", error);
    throw error;
  }
}

/**
 * Update a user's profile
 *
 * @param data - Profile update data including name and/or avatar URL
 */
export async function updateProfile({
  name,
  avatarUrl,
}: ProfileUpdateData): Promise<void> {
  try {
    const { error } = await supabase.auth.updateUser({
      data: {
        name,
        avatar_url: avatarUrl,
      },
    });
    if (error) throw error;
  } catch (error) {
    console.error("Profile update error:", error);
    throw error;
  }
}

/**
 * Resend verification email
 *
 * @param email - The email address to send the verification email to
 */
export async function resendVerificationEmail(email: string): Promise<void> {
  try {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  } catch (error) {
    console.error("Resend verification email error:", error);
    throw error;
  }
}

/**
 * Process an auth callback (email verification or password reset)
 *
 * @param code - The callback code from the URL
 */
export async function processAuthCallback(code: string): Promise<void> {
  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
  } catch (error) {
    console.error("Process auth callback error:", error);
    throw error;
  }
}
