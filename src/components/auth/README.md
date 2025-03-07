# Authentication System Documentation

## Overview

This application uses Supabase for authentication with a fallback to a mock authentication system for development and testing purposes. The authentication system supports:

- Email/password signup and login
- Email verification
- Password reset
- Session persistence

## Email Verification Flow

1. When a user signs up, they receive a verification email from Supabase
2. The user must click the verification link in the email to verify their account
3. The verification link redirects to `/auth/callback` in our application
4. The `AuthCallback` component handles the verification process
5. After verification, the user can log in

## Components

- `AuthModal`: Handles login, signup, and password reset forms
- `AuthCallback`: Processes email verification and password reset callbacks
- `VerificationStatus`: Displays the user's email verification status
- `EmailVerificationBanner`: Shows a banner when email verification is required
- `AuthToggle`: Allows switching between Supabase and mock authentication

## Authentication Context

The `AuthContext` provides authentication state and functions to the entire application:

- `user`: The currently authenticated user
- `isLoading`: Loading state for authentication operations
- `login`: Function to log in a user
- `signup`: Function to sign up a new user
- `logout`: Function to log out the current user
- `error`: Any authentication error
- `useMockAuth`: Whether mock authentication is enabled
- `toggleMockAuth`: Function to toggle between Supabase and mock authentication
- `resetAuthState`: Function to reset the authentication state

## Mock Authentication

Mock authentication is provided for development and testing purposes. It uses localStorage to store user data and does not require email verification.

## Supabase Configuration

The Supabase client is configured in `src/lib/supabase.ts`. It requires the following environment variables:

- `VITE_SUPABASE_URL`: The URL of your Supabase project
- `VITE_SUPABASE_ANON_KEY`: The anonymous key for your Supabase project

## Database Setup

The SQL scripts in the `src/sql` directory create the necessary tables and functions for the authentication system.

## Troubleshooting

If you encounter authentication issues:

1. Check the browser console for error messages
2. Verify that Supabase environment variables are correctly set
3. Use the `SupabaseDebugPanel` to check the connection status
4. Try toggling to mock authentication to isolate the issue
