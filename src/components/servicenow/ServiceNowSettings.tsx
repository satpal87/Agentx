import React from "react";
import { ServiceNowSelector } from "./ServiceNowSelector";
import ServiceNowCredentials from "@/components/settings/ServiceNowCredentials";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Database, Info } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  saveServiceNowCredential,
  deleteServiceNowCredential,
  updateServiceNowCredential,
} from "@/lib/servicenow";

interface ServiceNowSettingsProps {
  className?: string;
}

/**
 * ServiceNow Settings Component
 *
 * Combines credential management and connection selection in one component
 */
export function ServiceNowSettings({ className }: ServiceNowSettingsProps) {
  const { user } = useAuth();

  const handleSaveCredential = async (credential: any) => {
    if (!user) return;

    try {
      console.log("Saving credential in ServiceNowSettings:", credential);
      const savedCredential = await saveServiceNowCredential(
        user.id,
        credential.name,
        credential.instanceUrl,
        credential.username,
        credential.password,
      );
      console.log("Credential saved successfully:", savedCredential);

      // Force refresh the page to reload credentials
      window.location.reload();
    } catch (error) {
      console.error("Error saving credential:", error);
      alert(`Failed to save credential: ${error.message || "Unknown error"}`);
    }
  };

  const handleDeleteCredential = async (id: string) => {
    if (!user) return;

    try {
      await deleteServiceNowCredential(id, user.id);
      // Force refresh the page to reload credentials
      window.location.reload();
    } catch (error) {
      console.error("Error deleting credential:", error);
      alert(`Failed to delete credential: ${error.message || "Unknown error"}`);
    }
  };

  const handleUpdateCredential = async (id: string, credential: any) => {
    if (!user) return;

    try {
      // Only include password if it's not empty
      const updates: any = {
        name: credential.name,
        instance_url: credential.instanceUrl,
        username: credential.username,
      };

      if (credential.password) {
        updates.password = credential.password;
      }

      await updateServiceNowCredential(id, user.id, updates);
      // Force refresh the page to reload credentials
      window.location.reload();
    } catch (error) {
      console.error("Error updating credential:", error);
      alert(`Failed to update credential: ${error.message || "Unknown error"}`);
    }
  };

  return (
    <div className={`p-6 bg-white dark:bg-gray-800 overflow-auto ${className}`}>
      <h2 className="text-xl font-semibold mb-4">ServiceNow Integration</h2>

      <div className="space-y-6 pb-12">
        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="mr-2 h-5 w-5" />
              Getting Started with ServiceNow Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertTitle>How to use ServiceNow Integration</AlertTitle>
              <AlertDescription>
                <ol className="list-decimal list-inside space-y-2 mt-2">
                  <li>Add your ServiceNow credentials below</li>
                  <li>Select a credential and connect to your instance</li>
                  <li>
                    Go to the Chat interface and select your ServiceNow instance
                    from the dropdown
                  </li>
                  <li>Use the ServiceNow API in your chat conversations</li>
                </ol>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Credentials Management */}
        <ServiceNowCredentials
          onSave={handleSaveCredential}
          onDelete={handleDeleteCredential}
          onUpdate={handleUpdateCredential}
        />

        {/* Connection Selector */}
        <ServiceNowSelector />
      </div>
    </div>
  );
}
