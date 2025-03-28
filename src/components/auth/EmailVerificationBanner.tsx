import React, { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle, Mail, Loader2, X } from "lucide-react";

interface EmailVerificationBannerProps {
  email: string;
  className?: string;
  onDismiss?: () => void;
}

export function EmailVerificationBanner({
  email,
  className,
  onDismiss = () => {},
}: EmailVerificationBannerProps) {
  const { resendVerificationEmail } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem("emailBannerDismissed") === "true";
  });

  const handleResendEmail = async () => {
    if (isResending) return;

    setIsResending(true);
    setResendSuccess(false);
    setResendError(null);

    try {
      await resendVerificationEmail(email);
      setResendSuccess(true);
    } catch (error) {
      console.error("Error resending verification email:", error);
      setResendError(
        error.message ||
          "Failed to resend verification email. Please try again.",
      );
    } finally {
      setIsResending(false);
    }
  };

  if (dismissed) {
    return null;
  }

  return (
    <Alert
      variant="warning"
      className={`border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20 relative ${className}`}
    >
      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
      <AlertTitle className="text-yellow-800 dark:text-yellow-400">
        Email verification required
      </AlertTitle>
      <AlertDescription className="text-yellow-700 dark:text-yellow-300">
        Please verify your email address ({email}) to access all features.
        {resendSuccess ? (
          <span className="block mt-1 text-green-600 dark:text-green-400">
            Verification email sent! Please check your inbox.
          </span>
        ) : resendError ? (
          <span className="block mt-1 text-red-600 dark:text-red-400">
            {resendError}
          </span>
        ) : null}
      </AlertDescription>
      <div className="mt-2 flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-white dark:bg-gray-800"
          onClick={handleResendEmail}
          disabled={isResending}
        >
          {isResending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Resend verification email
            </>
          )}
        </Button>
      </div>

      {/* Dismiss button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 p-0 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:text-yellow-200 dark:hover:bg-yellow-900/30"
        onClick={() => {
          setDismissed(true);
          localStorage.setItem("emailBannerDismissed", "true");
          onDismiss();
        }}
      >
        <X size={14} />
        <span className="sr-only">Dismiss</span>
      </Button>
    </Alert>
  );
}
