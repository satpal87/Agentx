// Helper functions for session persistence across page reloads and navigation

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Session storage keys
const AUTH_STATE_KEY = "auth-state";
const AUTH_TIMESTAMP_KEY = "auth-timestamp";

// Store authentication state in multiple storage mechanisms for redundancy
export function persistAuthState(
  isAuthenticated: boolean,
  userData: any,
): void {
  if (!isBrowser) return;

  const timestamp = Date.now();
  const authData = { isAuthenticated, userData, timestamp };

  try {
    // Store in localStorage
    localStorage.setItem(AUTH_STATE_KEY, JSON.stringify(authData));
    localStorage.setItem(AUTH_TIMESTAMP_KEY, timestamp.toString());

    // Store in sessionStorage
    sessionStorage.setItem(AUTH_STATE_KEY, JSON.stringify(authData));
    sessionStorage.setItem(AUTH_TIMESTAMP_KEY, timestamp.toString());

    // Set a cookie (expires in 24 hours)
    document.cookie = `${AUTH_STATE_KEY}=${JSON.stringify({ isAuthenticated, timestamp })}; path=/; max-age=${60 * 60 * 24}; SameSite=Strict`;

    console.log("Auth state persisted successfully", {
      isAuthenticated,
      timestamp,
    });
  } catch (error) {
    console.error("Error persisting auth state:", error);
  }
}

// Retrieve authentication state from storage
export function getPersistedAuthState(): {
  isAuthenticated: boolean;
  userData: any;
} | null {
  if (!isBrowser) return null;

  try {
    // Try localStorage first
    const localData = localStorage.getItem(AUTH_STATE_KEY);
    if (localData) {
      const parsed = JSON.parse(localData);
      // Check if data is recent (less than 24 hours old)
      if (
        parsed.timestamp &&
        Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000
      ) {
        return {
          isAuthenticated: parsed.isAuthenticated,
          userData: parsed.userData,
        };
      }
    }

    // Try sessionStorage next
    const sessionData = sessionStorage.getItem(AUTH_STATE_KEY);
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      return {
        isAuthenticated: parsed.isAuthenticated,
        userData: parsed.userData,
      };
    }

    // Finally check cookies
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === AUTH_STATE_KEY && value) {
        try {
          const parsed = JSON.parse(decodeURIComponent(value));
          if (parsed.isAuthenticated) {
            return { isAuthenticated: true, userData: null };
          }
        } catch (e) {
          console.error("Error parsing auth cookie:", e);
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error retrieving persisted auth state:", error);
    return null;
  }
}

// Clear all persisted authentication state
export function clearPersistedAuthState(): void {
  if (!isBrowser) return;

  try {
    localStorage.removeItem(AUTH_STATE_KEY);
    localStorage.removeItem(AUTH_TIMESTAMP_KEY);
    sessionStorage.removeItem(AUTH_STATE_KEY);
    sessionStorage.removeItem(AUTH_TIMESTAMP_KEY);
    document.cookie = `${AUTH_STATE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;

    console.log("Auth state cleared successfully");
  } catch (error) {
    console.error("Error clearing persisted auth state:", error);
  }
}

// Check if the user has an active session
export function hasActiveSession(): boolean {
  const persistedState = getPersistedAuthState();
  return !!persistedState?.isAuthenticated;
}
