import { supabase } from "./supabase";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  email_confirmed_at?: string | null;
};

/**
 * Sign up a new user with Supabase authentication
 *
 * This function creates a new user account and sends a verification email.
 * The user will need to verify their email before they can log in.
 *
 * @param email - User's email address
 * @param password - User's password
 * @param name - User's display name
 * @returns Supabase auth data object
 */
export async function signUp(email: string, password: string, name: string) {
  console.log("Starting Supabase signUp process for:", email);

  // Validate inputs
  if (!email || !password || !name) {
    throw new Error("Email, password, and name are required");
  }

  // Check if Supabase environment variables are set
  if (
    !import.meta.env.VITE_SUPABASE_URL ||
    !import.meta.env.VITE_SUPABASE_ANON_KEY
  ) {
    console.error("Supabase environment variables are not properly set");
    throw new Error(
      "Authentication service is not properly configured. Please contact support.",
    );
  }

  try {
    console.log("Calling supabase.auth.signUp with:", { email, name });

    // Create the redirect URL for email verification
    const redirectTo = `${window.location.origin}/auth/callback`;
    console.log("Email verification redirect URL:", redirectTo);

    // Sign up the user with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
        emailRedirectTo: redirectTo,
      },
    });

    // Log the response for debugging
    console.log("Supabase signUp response:", data);

    if (error) {
      console.error("Supabase signUp error:", error);
      throw error;
    }

    // Check if user was created successfully
    if (!data.user) {
      console.error("No user data returned from signup");
      throw new Error("Failed to create user account. Please try again.");
    }

    // Check if the user already exists (identities array will be empty)
    const userExists =
      data.user.identities && data.user.identities.length === 0;
    console.log("User already exists:", userExists);

    if (userExists) {
      throw new Error(
        "This email is already registered. Please use a different email or try logging in.",
      );
    }

    console.log("User created successfully with ID:", data.user.id);
    console.log(
      "Email verification status:",
      data.user.email_confirmed_at ? "Verified" : "Pending verification",
    );

    return data;
  } catch (error: any) {
    console.error("Supabase signUp exception:", error);

    // Provide more user-friendly error messages
    if (error.message?.includes("Failed to fetch")) {
      throw new Error(
        "Unable to connect to the authentication service. Please check your internet connection and try again.",
      );
    } else if (
      error.message?.includes("already registered") ||
      error.message?.includes("already exists")
    ) {
      throw new Error(
        "This email is already registered. Please use a different email or try logging in.",
      );
    } else if (error.message?.includes("password")) {
      throw new Error("Password must be at least 6 characters long.");
    }

    throw error;
  }
}

/**
 * Sign in a user with email and password
 *
 * @param email - User's email address
 * @param password - User's password
 * @returns Supabase auth data object
 */
export async function signIn(email: string, password: string) {
  try {
    console.log("Signing in user with email:", email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase signIn error:", error);

      // Handle specific error cases
      if (error.message?.includes("Email not confirmed")) {
        throw new Error(
          "Please verify your email before logging in. Check your inbox for a verification link.",
        );
      }

      throw error;
    }

    console.log("Sign in successful for user:", data.user?.id);
    return data;
  } catch (error: any) {
    console.error("Sign in exception:", error);

    if (error.message?.includes("Failed to fetch")) {
      throw new Error(
        "Unable to connect to the authentication service. Please check your internet connection and try again.",
      );
    } else if (error.message?.includes("Invalid login")) {
      throw new Error("Invalid email or password. Please try again.");
    }

    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  console.log("Signing out user");
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error signing out:", error);
    throw error;
  }
  console.log("User signed out successfully");
}

/**
 * Send a password reset email
 *
 * @param email - User's email address
 */
export async function resetPassword(email: string) {
  console.log("Sending password reset email to:", email);
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
  console.log("Password reset email sent successfully");
}

/**
 * Resend verification email to a user
 *
 * @param email - User's email address
 */
export async function resendVerificationEmail(email: string) {
  console.log("Resending verification email to:", email);
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("Error resending verification email:", error);
    throw error;
  }
  console.log("Verification email resent successfully");
}

/**
 * Check if a user's email is verified
 *
 * @param userId - User's ID
 * @returns Boolean indicating if the email is verified
 */
export async function isEmailVerified(userId: string): Promise<boolean> {
  try {
    console.log("Checking email verification status for user:", userId);
    const { data, error } = await supabase.auth.admin.getUserById(userId);

    if (error) {
      console.error("Error checking email verification status:", error);
      return false;
    }

    const isVerified = !!data.user?.email_confirmed_at;
    console.log(
      "Email verification status:",
      isVerified ? "Verified" : "Not verified",
    );
    return isVerified;
  } catch (error) {
    console.error("Exception checking email verification status:", error);
    return false;
  }
}

/**
 * Get the current authenticated user
 *
 * @returns AuthUser object or null if not authenticated
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    console.log("Getting current user");
    // Increase timeout for Supabase requests to give it more time to respond
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const { data, error } = await supabase.auth.getUser();
    clearTimeout(timeoutId);

    if (error) {
      console.error("Error getting current user:", error);
      return null;
    }

    if (!data.user) {
      console.log("No current user found");
      return null;
    }

    console.log("Current user found:", data.user.id);
    console.log(
      "Email verification status:",
      data.user.email_confirmed_at ? "Verified" : "Not verified",
    );

    return {
      id: data.user.id,
      email: data.user.email || "",
      name: data.user.user_metadata?.name || "",
      avatar_url: data.user.user_metadata?.avatar_url || "",
      email_confirmed_at: data.user.email_confirmed_at,
    };
  } catch (error) {
    console.error("Unexpected error in getCurrentUser:", error);
    return null;
  }
}
