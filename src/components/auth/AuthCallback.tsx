import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { processAuthCallback } from "@/services/auth";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

type CallbackStatus = "loading" | "success" | "error";

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const type = searchParams.get("type");

        if (!code) {
          setStatus("error");
          setError("Invalid verification link. Missing code parameter.");
          return;
        }

        await processAuthCallback(code);

        setStatus("success");
        if (type === "recovery") {
          setMessage(
            "Your password reset link is valid. You can now reset your password.",
          );
          // Could navigate to password reset page here
          // navigate('/reset-password', { state: { code } });
        } else {
          setMessage("Your email has been verified successfully!");
        }
      } catch (err: any) {
        console.error("Error processing auth callback:", err);
        setStatus("error");
        setError(
          err.message || "An error occurred while processing your request.",
        );
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {status === "loading"
              ? "Processing..."
              : status === "success"
                ? "Verification Successful"
                : "Verification Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-4">
            {status === "loading" && (
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            )}

            {status === "success" && (
              <>
                <CheckCircle className="h-16 w-16 text-green-500" />
                <Alert
                  variant="default"
                  className="bg-green-50 border-green-200 text-green-800"
                >
                  <AlertTitle>Success!</AlertTitle>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle className="h-16 w-16 text-red-500" />
                <Alert variant="destructive">
                  <AlertTitle>Verification Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            onClick={() => navigate("/")}
            className="w-full max-w-xs"
            variant={status === "error" ? "outline" : "default"}
          >
            {status === "success" ? "Continue to Login" : "Return to Home"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
