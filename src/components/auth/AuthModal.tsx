import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { useToast } from "@/components/ui/use-toast";

type AuthTab = "login" | "register" | "forgot-password";

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: AuthTab;
  onSuccess?: () => void;
}

export function AuthModal({
  isOpen,
  onOpenChange,
  defaultTab = "login",
  onSuccess,
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>(defaultTab);
  const { toast } = useToast();

  // Update active tab when defaultTab changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleLoginSuccess = () => {
    toast({
      title: "Login successful",
      description: "Welcome back!",
    });
    onOpenChange(false);
    if (onSuccess) onSuccess();
  };

  const handleRegisterSuccess = () => {
    toast({
      title: "Registration successful",
      description: "Please check your email to verify your account.",
    });
    setActiveTab("login");
  };

  const handleForgotPasswordSuccess = () => {
    toast({
      title: "Password reset email sent",
      description:
        "Please check your email for instructions to reset your password.",
    });
    setActiveTab("login");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as AuthTab)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-full rounded-none h-12">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="login" className="mt-0">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-2xl text-center">
                  Welcome Back
                </DialogTitle>
                <DialogDescription className="text-center">
                  Log in to your ServiceNow AI Assistant account
                </DialogDescription>
              </DialogHeader>
              <LoginForm
                onSuccess={handleLoginSuccess}
                onForgotPassword={() => setActiveTab("forgot-password")}
                onRegister={() => setActiveTab("register")}
              />
            </TabsContent>

            <TabsContent value="register" className="mt-0">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-2xl text-center">
                  Create Account
                </DialogTitle>
                <DialogDescription className="text-center">
                  Sign up for ServiceNow AI Assistant
                </DialogDescription>
              </DialogHeader>
              <RegisterForm
                onSuccess={handleRegisterSuccess}
                onLogin={() => setActiveTab("login")}
              />
            </TabsContent>

            <TabsContent value="forgot-password" className="mt-0">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-2xl text-center">
                  Reset Password
                </DialogTitle>
                <DialogDescription className="text-center">
                  Enter your email to receive a password reset link
                </DialogDescription>
              </DialogHeader>
              <ForgotPasswordForm
                onSuccess={handleForgotPasswordSuccess}
                onCancel={() => setActiveTab("login")}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
