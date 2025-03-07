import { User, LoginCredentials, RegisterData } from "@/types/auth";

// Mock user storage key
const MOCK_USERS_KEY = "mock-users";
const MOCK_CURRENT_USER_KEY = "mock-current-user";

// Default mock users
const DEFAULT_MOCK_USERS = [
  {
    id: "mock-user-1",
    email: "test@example.com",
    password: "password",
    name: "Test User",
    emailVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-user-2",
    email: "admin@example.com",
    password: "admin",
    name: "Admin User",
    emailVerified: true,
    createdAt: new Date().toISOString(),
  },
];

// Initialize mock users in localStorage if not present
function initMockUsers(): void {
  if (!localStorage.getItem(MOCK_USERS_KEY)) {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(DEFAULT_MOCK_USERS));
  }
}

// Get all mock users
function getMockUsers(): any[] {
  initMockUsers();
  try {
    return JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || "[]");
  } catch (error) {
    console.error("Error parsing mock users:", error);
    return [];
  }
}

// Save mock users
function saveMockUsers(users: any[]): void {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

// Mock login
export async function mockLogin({
  email,
  password,
}: LoginCredentials): Promise<User | null> {
  console.log("Mock login attempt for:", email);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const users = getMockUsers();
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Create user object without password
  const { password: _, ...userWithoutPassword } = user;

  // Store current user
  localStorage.setItem(
    MOCK_CURRENT_USER_KEY,
    JSON.stringify(userWithoutPassword),
  );

  return userWithoutPassword;
}

// Mock register
export async function mockRegister({
  email,
  password,
  name,
}: RegisterData): Promise<User | null> {
  console.log("Mock registration for:", email);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const users = getMockUsers();

  // Check if user already exists
  if (users.some((u) => u.email === email)) {
    throw new Error("User with this email already exists");
  }

  // Create new user
  const newUser = {
    id: `mock-user-${Date.now()}`,
    email,
    password,
    name,
    emailVerified: true, // Mock users are automatically verified
    createdAt: new Date().toISOString(),
  };

  // Add to users and save
  users.push(newUser);
  saveMockUsers(users);

  // Create user object without password
  const { password: _, ...userWithoutPassword } = newUser;

  // Store current user
  localStorage.setItem(
    MOCK_CURRENT_USER_KEY,
    JSON.stringify(userWithoutPassword),
  );

  return userWithoutPassword;
}

// Mock logout
export async function mockLogout(): Promise<void> {
  console.log("Mock logout");

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Remove current user
  localStorage.removeItem(MOCK_CURRENT_USER_KEY);
}

// Mock get current user
export async function mockGetCurrentUser(): Promise<User | null> {
  console.log("Getting current user from mock auth");

  try {
    const userJson = localStorage.getItem(MOCK_CURRENT_USER_KEY);
    if (!userJson) return null;

    return JSON.parse(userJson);
  } catch (error) {
    console.error("Error getting mock current user:", error);
    return null;
  }
}
