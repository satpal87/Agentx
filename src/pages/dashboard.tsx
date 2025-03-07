import React, { useState, useEffect } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import ChatInterface from "../components/chat/ChatInterface";
import ChatHistory from "../components/chat/ChatHistory";
import ProfileSettings from "../components/settings/ProfileSettings";
import ChatGptIntegration from "../components/settings/ChatGptIntegration";
import { EmailVerificationBanner } from "../components/auth/EmailVerificationBanner";
import { useAuth } from "@/context/AuthContext";
import { updateUserProfile, deleteUserAccount } from "@/lib/profile";
import { saveChatGptSettings } from "@/lib/chatgpt";
import { ServiceNowSettings } from "@/components/servicenow/ServiceNowSettings";
import { ServiceNowDemo } from "@/pages/servicenow/ServiceNowDemo";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";

interface DashboardProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  onLogout?: () => void;
  activePage?: string;
  initialMessages?: Array<{
    id: string;
    content: string;
    sender: "user" | "ai";
    timestamp: Date;
    codeSnippets?: Array<{
      id: string;
      code: string;
      language: string;
    }>;
  }>;
  isLoading?: boolean;
  conversationTitle?: string;
}

const Dashboard = ({
  activePage = "chat",
  initialMessages = [],
  isLoading = false,
  conversationTitle = "New Conversation",
}: DashboardProps) => {
  const { user, logout, useMockAuth } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(activePage);

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const userName = user?.name || "User";
  const userEmail = user?.email || "";
  const userAvatar =
    user?.avatar_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || "user"}`;

  // Handle sending a message from the chat interface
  const handleSendMessage = (message: string, type: string) => {
    console.log(`Sending message: ${message} of type: ${type}`);
    // In a real app, this would send the message to an API
  };

  // Handle saving a conversation
  const handleSaveConversation = () => {
    console.log("Saving conversation");
    // In a real app, this would save the conversation to a database
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Handle copying code snippets
  const handleCopyCode = (code: string) => {
    console.log("Copying code:", code);
    navigator.clipboard.writeText(code).catch((err) => {
      console.error("Failed to copy code:", err);
    });
  };

  // Check if user needs to verify email
  const needsEmailVerification =
    user && !user.email_confirmed_at && !useMockAuth;

  // Define navigation items for ServiceNow
  const servicenowNavItems = [
    { name: "Settings", path: "/chat/settings/servicenow" },
    { name: "Demo", path: "/chat/servicenow/demo" },
  ];

  return (
    <div
      className="flex h-screen w-full bg-gray-50 dark:bg-gray-900 overflow-hidden"
      style={{ height: "100vh", maxHeight: "100vh" }}
    >
      {/* Sidebar */}
      <Sidebar
        userName={userName}
        userEmail={userEmail}
        userAvatar={userAvatar}
        onLogout={handleLogout}
        activePage={currentPage}
      />

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-auto">
        {/* Email verification banner */}
        {needsEmailVerification && (
          <EmailVerificationBanner
            email={userEmail}
            className="sticky top-0 z-10"
          />
        )}

        <Routes>
          {/* Main chat interface */}
          <Route
            path="/"
            element={
              <ChatInterface
                initialMessages={initialMessages}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
                onSaveConversation={handleSaveConversation}
                onCopyCode={handleCopyCode}
                conversationTitle={conversationTitle}
              />
            }
          />

          {/* History page */}
          <Route
            path="/history"
            element={
              <div className="flex-1 bg-white dark:bg-gray-800 overflow-auto">
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-6">
                    Conversation History
                  </h1>
                </div>
                <ChatHistory
                  onSelectConversation={(conversationId) => {
                    navigate(`/chat?conversation=${conversationId}`);
                  }}
                />
              </div>
            }
          />

          {/* Settings page */}
          <Route
            path="/settings"
            element={
              <div className="flex-1 p-6 bg-white dark:bg-gray-800 overflow-auto">
                <h1 className="text-2xl font-bold mb-6">Settings</h1>
                <div className="max-w-2xl space-y-8">
                  {/* Profile Settings */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Account</h2>
                    <ProfileSettings
                      onUpdateProfile={async (name) => {
                        if (user) {
                          try {
                            await updateUserProfile(user.id, { name });
                          } catch (error) {
                            console.error("Error updating profile:", error);
                          }
                        }
                      }}
                      onDeleteAccount={async () => {
                        try {
                          await deleteUserAccount();
                          await logout();
                          navigate("/");
                        } catch (error) {
                          console.error("Error deleting account:", error);
                        }
                      }}
                    />
                  </div>

                  {/* ServiceNow Integration - Link to dedicated page */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      ServiceNow Integration
                    </h2>
                    <div className="flex flex-col space-y-4">
                      <p className="text-gray-600 dark:text-gray-300">
                        Connect to your ServiceNow instances and access records
                        directly from the chat interface.
                      </p>
                      <div className="flex space-x-4">
                        <Button
                          onClick={() => navigate("/chat/settings/servicenow")}
                          className="flex items-center"
                        >
                          <Database className="mr-2 h-4 w-4" />
                          Manage ServiceNow Settings
                        </Button>
                        {/* Demo button removed as per user request */}
                      </div>
                    </div>
                  </div>

                  {/* ChatGPT Integration */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      AI Integration
                    </h2>
                    <ChatGptIntegration
                      onSave={(apiKey, isEnabled) => {
                        if (user) {
                          saveChatGptSettings(user.id, apiKey, isEnabled).catch(
                            (error) => {
                              console.error(
                                "Error saving ChatGPT settings:",
                                error,
                              );
                            },
                          );
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            }
          />

          {/* ServiceNow Settings Page */}
          <Route path="/settings/servicenow" element={<ServiceNowSettings />} />

          {/* ServiceNow Demo Page */}
          <Route path="/servicenow/demo" element={<ServiceNowDemo />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;
