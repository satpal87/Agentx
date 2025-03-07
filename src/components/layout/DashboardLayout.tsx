import React from "react";
import { Sidebar } from "./Sidebar";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import { useAuth } from "@/context/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, useMockAuth } = useAuth();

  // Check if user needs to verify email
  const needsEmailVerification = user && !user.emailVerified && !useMockAuth;

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Email verification banner */}
        {needsEmailVerification && (
          <EmailVerificationBanner
            email={user.email}
            className="sticky top-0 z-10"
          />
        )}

        {/* Page content */}
        {children}
      </main>
    </div>
  );
}
