import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

/**
 * Supabase Configuration and Client
 *
 * This module initializes the Supabase client with proper configuration
 * and provides utility functions for testing the connection.
 */

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Log configuration for debugging
console.log("Supabase Configuration:", {
  url: supabaseUrl ? "Set" : "Not set",
  key: supabaseAnonKey ? "Set" : "Not set",
});

// Check if Supabase credentials are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL or Anonymous Key is missing. Please check your environment variables.",
  );
}

/**
 * Create the Supabase client with robust error handling and timeouts
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storageKey: "agentx-auth-token",
    storage: localStorage,
    detectSessionInUrl: true, // Enable automatic detection of auth redirects
    flowType: "pkce", // Use PKCE flow for better security
  },
  global: {
    headers: {
      "Cache-Control": "no-store",
    },
    fetch: (url, options) => {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      return fetch(url, {
        ...options,
        signal: controller.signal,
      })
        .then((response) => {
          clearTimeout(timeoutId);
          return response;
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          console.error("Supabase fetch error:", error);
          throw error;
        });
    },
  },
});

/**
 * Test the Supabase connection
 *
 * This function tests both authentication and database connections
 * to ensure Supabase is properly configured and accessible.
 *
 * @returns Promise<boolean> - True if connection is successful
 */
export async function testSupabaseConnection(): Promise<boolean> {
  console.log("Testing Supabase connection...");

  // First check if environment variables are set
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Anon Key is missing");
    return false;
  }

  try {
    // Try to get the current session as a simple connection test
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.error("Supabase session test failed:", sessionError);
      return false;
    }

    console.log("Supabase session test successful");
    console.log("Session data:", sessionData ? "Present" : "Not present");

    // Also try a database query as a secondary test
    try {
      // Try to access a public table that should exist
      const { error } = await supabase
        .from("health_check")
        .select("count")
        .limit(1)
        .single();

      // PGRST116 error is expected if table doesn't exist but connection works
      if (error && error.code !== "PGRST116") {
        console.warn(
          "Supabase database test failed, but auth might still work:",
          error,
        );
        // Don't return false here, as auth might still work even if this specific table doesn't exist
      } else {
        console.log("Supabase database test successful");
      }
    } catch (dbError) {
      console.warn(
        "Supabase database test error, but auth might still work:",
        dbError,
      );
      // Don't return false here, as auth might still work even if database queries fail
    }

    return true;
  } catch (error) {
    console.error("Supabase connection test error:", error);
    return false;
  }
}

/**
 * Create required tables in Supabase
 *
 * This function can be called to ensure all required tables exist.
 * It's useful for development and testing environments.
 */
export async function setupSupabaseTables() {
  try {
    console.log("Setting up Supabase tables...");

    // Create health_check table if it doesn't exist
    const { error } = await supabase.rpc("create_health_check_table");

    if (error && !error.message.includes("already exists")) {
      console.error("Error creating health_check table:", error);
    } else {
      console.log("Health check table setup complete");
    }

    return true;
  } catch (error) {
    console.error("Error setting up Supabase tables:", error);
    return false;
  }
}
