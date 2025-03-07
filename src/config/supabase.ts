import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Supabase client configuration
 *
 * This module initializes the Supabase client with proper configuration
 * and provides utility functions for testing the connection.
 */

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase environment variables. Authentication will not work.",
  );
}

/**
 * Supabase client instance with proper typing
 */
export const supabase = createClient<Database>(
  supabaseUrl || "",
  supabaseAnonKey || "",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storageKey: "servicenow-ai-auth",
      detectSessionInUrl: true,
      flowType: "pkce",
    },
    global: {
      headers: { "x-application-name": "servicenow-ai-assistant" },
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
  },
);

/**
 * Test the Supabase connection
 *
 * @returns Promise<boolean> - True if connection is successful
 */
export async function testConnection(): Promise<boolean> {
  try {
    // Check if environment variables are set
    if (!supabaseUrl || !supabaseAnonKey) {
      return false;
    }

    // Try to get the current session as a simple connection test
    const { error } = await supabase.auth.getSession();

    if (error) {
      console.error("Supabase connection test failed:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Supabase connection test error:", error);
    return false;
  }
}
