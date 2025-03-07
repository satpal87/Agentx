import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Mail, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { resendVerificationEmail } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

interface VerificationStatusProps {
  email: string;
  isVerified: boolean;
  className?: string;
}

/**
 * VerificationStatus Component
 *
 * Displays the current verification status of a user's email and provides
 * functionality to resend verification emails.
 */
export function VerificationStatus({
  email,
  isVerified,
  className,
}: VerificationStatusProps) {
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();

  const handleResendVerification = async () => {
    if (!email) return;

    setIsResending(true);
    try {
      await resendVerificationEmail(email);
      toast({
        title: "Verification email sent",
        description: `We've sent a new verification email to ${email}. Please check your inbox and spam folder.`,
        variant: "default",
      });
    } catch (error: any) {
      console.error("Error resending verification email:", error);
      toast({
        title: "Failed to send verification email",
        description:
          error.message ||
          "There was a problem sending the verification email. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="mr-2 h-5 w-5" />
          Email Verification Status
        </CardTitle>
        <CardDescription>
          Your email verification status and options
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium">Email:</span>
          <span className="text-gray-600 dark:text-gray-300">{email}</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="font-medium">Status:</span>
          <Badge
            variant={isVerified ? "default" : "outline"}
            className={
              isVerified
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }
          >
            {isVerified ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 mr-1" />
                Pending Verification
              </>
            )}
          </Badge>
        </div>

        {!isVerified && (
          <Alert
            variant="warning"
            className="bg-yellow-50 border-yellow-200 text-yellow-800"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Verification Required</AlertTitle>
            <AlertDescription>
              Please check your email and click the verification link to
              activate your account. If you didn't receive the email, you can
              request a new one below.
            </AlertDescription>
          </Alert>
        )}

        {isVerified && (
          <Alert
            variant="default"
            className="bg-green-50 border-green-200 text-green-800"
          >
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Email Verified</AlertTitle>
            <AlertDescription>
              Your email has been successfully verified. You have full access to
              all features.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        {!isVerified && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResendVerification}
            disabled={isResending}
          >
            {isResending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>Resend Verification Email</>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
