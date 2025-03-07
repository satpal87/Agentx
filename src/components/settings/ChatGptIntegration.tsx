import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, Key, Save, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getChatGptSettings, saveChatGptSettings } from "@/lib/chatgpt";

interface ChatGptIntegrationProps {
  apiKey?: string;
  isEnabled?: boolean;
  onSave?: (apiKey: string, isEnabled: boolean) => void;
}

const ChatGptIntegration = ({
  apiKey = "",
  isEnabled = false,
  onSave = () => {},
}: ChatGptIntegrationProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [key, setKey] = useState(apiKey);
  const [enabled, setEnabled] = useState(isEnabled);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  // Load existing settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);
      try {
        console.log("Loading ChatGPT settings for user:", user.id);
        const settings = await getChatGptSettings(user.id);
        console.log(
          "ChatGPT settings loaded:",
          settings ? "Found" : "Not found",
        );

        if (settings) {
          setKey(settings.api_key || "");
          setEnabled(settings.is_enabled || false);
        }
      } catch (error) {
        console.error("Error loading ChatGPT settings:", error);
        setError(
          `Failed to load settings: ${error.message || "Unknown error"}`,
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user) return;

    setIsSaving(true);
    setError(null);
    try {
      console.log("Saving ChatGPT settings:", {
        apiKey: key ? "[REDACTED]" : "empty",
        isEnabled: enabled,
      });

      // Save directly to database
      await saveChatGptSettings(user.id, key, enabled);

      // Also call the onSave prop for compatibility
      onSave(key, enabled);

      toast({
        title: "Settings Saved",
        description: enabled
          ? "ChatGPT integration has been enabled."
          : "ChatGPT integration has been disabled.",
      });
    } catch (error) {
      console.error("Error saving ChatGPT settings:", error);
      setError(`Failed to save settings: ${error.message || "Unknown error"}`);

      toast({
        title: "Error saving settings",
        description: "There was a problem saving your settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="mr-2" size={20} />
          ChatGPT Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="chatgpt-enabled">Enable ChatGPT</Label>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Use ChatGPT to enhance AI responses
                </div>
              </div>
              <Switch
                id="chatgpt-enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key">OpenAI API Key</Label>
              <div className="flex items-center">
                <Key size={16} className="mr-2 text-gray-400" />
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-..."
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                />
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Your API key is stored securely and never shared
              </div>
            </div>

            <Button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Settings
                </>
              )}
            </Button>

            {/* Debug mode toggle */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="debug-mode">Debug Mode</Label>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Show technical errors and debug information
                  </div>
                </div>
                <Switch
                  id="debug-mode"
                  checked={debugMode}
                  onCheckedChange={setDebugMode}
                />
              </div>

              {debugMode && (
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <h4 className="text-sm font-medium mb-2">
                    Debug Information
                  </h4>
                  <pre className="text-xs overflow-auto p-2 bg-gray-200 dark:bg-gray-900 rounded">
                    {JSON.stringify(
                      {
                        userId: user?.id || "Not logged in",
                        apiKeySet: !!key,
                        apiKeyLength: key?.length || 0,
                        isEnabled: enabled,
                        isLoading,
                        isSaving,
                        error,
                      },
                      null,
                      2,
                    )}
                  </pre>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatGptIntegration;
