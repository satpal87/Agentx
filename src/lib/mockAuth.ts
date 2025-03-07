// Mock authentication system that uses localStorage instead of Supabase
// This is used as a fallback when Supabase authentication is not working

import { AuthUser } from "./auth";

const MOCK_AUTH_KEY = "mock-auth-user";
const MOCK_AUTH_ENABLED = "mock-auth-enabled";
const MOCK_AUTH_SESSION = "mock-auth-session";

// Mock user credentials for testing
const MOCK_USERS = [
  {
    email: "test@example.com",
    password: "password",
    name: "Test User",
    id: "mock-user-1",
  },
  {
    email: "admin@example.com",
    password: "admin",
    name: "Admin User",
    id: "mock-user-2",
  },
];

// Check if mock auth is enabled
export function isMockAuthEnabled(): boolean {
  return localStorage.getItem(MOCK_AUTH_ENABLED) === "true";
}

// Enable or disable mock auth
export function setMockAuthEnabled(enabled: boolean): void {
  localStorage.setItem(MOCK_AUTH_ENABLED, enabled ? "true" : "false");
}

// Mock sign up function
export async function mockSignUp(
  email: string,
  password: string,
  name: string,
): Promise<any> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Check if user already exists
  const existingUser = MOCK_USERS.find((user) => user.email === email);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Create new mock user
  const newUser = {
    email,
    password,
    name,
    id: `mock-user-${Date.now()}`,
  };

  // Store in mock users (this is just for the session, not persistent)
  MOCK_USERS.push(newUser);

  // Auto sign in after sign up
  return mockSignIn(email, password);
}

// Mock sign in function
export async function mockSignIn(
  email: string,
  password: string,
): Promise<any> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Find user with matching credentials
  const user = MOCK_USERS.find(
    (user) => user.email === email && user.password === password,
  );

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Create auth user object
  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
  };

  // Create a session object with expiration
  const session = {
    user: authUser,
    expires_at: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
    created_at: Date.now(),
  };

  // Store in both localStorage and sessionStorage for redundancy
  localStorage.setItem(MOCK_AUTH_KEY, JSON.stringify(authUser));
  localStorage.setItem(MOCK_AUTH_SESSION, JSON.stringify(session));
  sessionStorage.setItem(MOCK_AUTH_KEY, JSON.stringify(authUser));
  sessionStorage.setItem(MOCK_AUTH_SESSION, JSON.stringify(session));

  // Also set a cookie for additional persistence
  document.cookie = `mock_auth_active=true; path=/; max-age=${60 * 60 * 24}; SameSite=Strict`;

  return { user: authUser, session };
}

// Mock sign out function
export async function mockSignOut(): Promise<void> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Remove from localStorage and sessionStorage
  localStorage.removeItem(MOCK_AUTH_KEY);
  localStorage.removeItem(MOCK_AUTH_SESSION);
  sessionStorage.removeItem(MOCK_AUTH_KEY);
  sessionStorage.removeItem(MOCK_AUTH_SESSION);

  // Clear the cookie
  document.cookie =
    "mock_auth_active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
}

// Mock get current user function
export async function mockGetCurrentUser(): Promise<AuthUser | null> {
  // No network delay for better UX

  // First check for session
  const sessionJson =
    localStorage.getItem(MOCK_AUTH_SESSION) ||
    sessionStorage.getItem(MOCK_AUTH_SESSION);
  if (sessionJson) {
    try {
      const session = JSON.parse(sessionJson);
      // Check if session is expired
      if (session.expires_at && session.expires_at > Date.now()) {
        console.log("Valid session found");
        return session.user;
      } else {
        console.log("Session expired, clearing");
        // Session expired, clear it
        resetMockAuth();
        return null;
      }
    } catch (error) {
      console.error("Error parsing mock session:", error);
    }
  }

  // Fallback to checking user directly
  const userJson =
    localStorage.getItem(MOCK_AUTH_KEY) ||
    sessionStorage.getItem(MOCK_AUTH_KEY);
  if (!userJson) {
    // Also check cookie as last resort
    if (document.cookie.includes("mock_auth_active=true")) {
      console.log("Cookie found but no user data, clearing cookie");
      document.cookie =
        "mock_auth_active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
    }
    return null;
  }

  try {
    const user = JSON.parse(userJson) as AuthUser;
    // Recreate session since we found a user but no valid session
    const session = {
      user,
      expires_at: Date.now() + 24 * 60 * 60 * 1000,
      created_at: Date.now(),
    };
    localStorage.setItem(MOCK_AUTH_SESSION, JSON.stringify(session));
    sessionStorage.setItem(MOCK_AUTH_SESSION, JSON.stringify(session));
    return user;
  } catch (error) {
    console.error("Error parsing mock user:", error);
    return null;
  }
}

// Reset mock auth state
export function resetMockAuth(): void {
  localStorage.removeItem(MOCK_AUTH_KEY);
  localStorage.removeItem(MOCK_AUTH_SESSION);
  sessionStorage.removeItem(MOCK_AUTH_KEY);
  sessionStorage.removeItem(MOCK_AUTH_SESSION);
  document.cookie =
    "mock_auth_active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
}
