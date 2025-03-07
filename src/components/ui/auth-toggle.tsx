import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Bug, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AuthToggleProps {
  className?: string;
}

export function AuthToggle({ className }: AuthToggleProps) {
  const { useMockAuth, toggleMockAuth } = useAuth();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bug className="mr-2 h-5 w-5" />
          Authentication Mode
        </CardTitle>
        <CardDescription>
          Toggle between Supabase and mock authentication
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant={useMockAuth ? "warning" : "default"} className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {useMockAuth
              ? "Using Mock Authentication"
              : "Using Supabase Authentication"}
          </AlertTitle>
          <AlertDescription>
            {useMockAuth
              ? "Mock authentication uses local storage and doesn't require email verification. Use for testing only."
              : "Supabase authentication requires email verification. New users will need to verify their email before logging in."}
          </AlertDescription>
        </Alert>

        <div className="flex items-center space-x-2">
          <Switch
            id="auth-mode"
            checked={useMockAuth}
            onCheckedChange={toggleMockAuth}
          />
          <Label htmlFor="auth-mode" className="cursor-pointer">
            {useMockAuth ? "Mock Auth Enabled" : "Supabase Auth Enabled"}
          </Label>
        </div>

        {useMockAuth && (
          <div className="mt-4 text-sm text-muted-foreground">
            <p className="font-medium">Test credentials:</p>
            <ul className="list-disc list-inside mt-1">
              <li>Email: test@example.com / Password: password</li>
              <li>Email: admin@example.com / Password: admin</li>
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground flex items-center">
          <Info className="h-3 w-3 mr-1" />
          {useMockAuth
            ? "No email verification required"
            : "Email verification required"}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleMockAuth(!useMockAuth)}
        >
          Switch to {useMockAuth ? "Supabase" : "Mock"} Auth
        </Button>
      </CardFooter>
    </Card>
  );
}
