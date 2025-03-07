/**
 * Authentication Types
 *
 * This file contains types related to authentication and user management.
 */

/**
 * User profile information
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt?: string;
}

/**
 * Authentication state
 */
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegisterData extends LoginCredentials {
  name: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password update data
 */
export interface PasswordUpdateData {
  password: string;
}

/**
 * Profile update data
 */
export interface ProfileUpdateData {
  name?: string;
  avatarUrl?: string;
}
