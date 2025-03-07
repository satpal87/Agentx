import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { ServiceNowAPI, getServiceNowClient } from "@/services/servicenow";
import { getServiceNowCredentials } from "@/lib/servicenow";

interface UseServiceNowOptions {
  credentialId?: string;
  autoConnect?: boolean;
}

interface UseServiceNowReturn {
  client: ServiceNowAPI | null;
  isLoading: boolean;
  error: string | null;
  credentials: any[];
  selectedCredentialId: string | null;
  setSelectedCredentialId: (id: string) => void;
  connect: (credentialId?: string) => Promise<boolean>;
  disconnect: () => void;
}

/**
 * Hook for working with ServiceNow API
 *
 * Provides a ServiceNow API client and methods for connecting, disconnecting,
 * and managing credentials.
 */
export function useServiceNow(
  options: UseServiceNowOptions = {},
): UseServiceNowReturn {
  const { user } = useAuth();
  const [client, setClient] = useState<ServiceNowAPI | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [selectedCredentialId, setSelectedCredentialId] = useState<
    string | null
  >(options.credentialId || null);

  // Load credentials when the user changes
  useEffect(() => {
    if (!user) {
      setCredentials([]);
      return;
    }

    const loadCredentials = async () => {
      try {
        const creds = await getServiceNowCredentials(user.id);
        setCredentials(creds);

        // If no credential is selected but we have credentials, select the first one
        if (!selectedCredentialId && creds.length > 0 && options.autoConnect) {
          setSelectedCredentialId(creds[0].id);
        }
      } catch (err: any) {
        console.error("Error loading ServiceNow credentials:", err);
        setError(`Failed to load ServiceNow credentials: ${err.message}`);
      }
    };

    loadCredentials();
  }, [user, options.autoConnect]);

  // Connect to ServiceNow when the selected credential changes
  useEffect(() => {
    if (!user || !selectedCredentialId) return;

    const connectToServiceNow = async () => {
      await connect(selectedCredentialId);
    };

    if (options.autoConnect) {
      connectToServiceNow();
    }
  }, [selectedCredentialId, user, options.autoConnect]);

  // Connect to ServiceNow
  const connect = useCallback(
    async (credentialId?: string) => {
      if (!user) {
        setError("User not authenticated");
        return false;
      }

      const credId = credentialId || selectedCredentialId;
      if (!credId) {
        setError("No ServiceNow credential selected");
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        const newClient = await getServiceNowClient(credId, user.id);
        if (!newClient) {
          throw new Error("Failed to create ServiceNow client");
        }

        // Test the connection
        const connected = await newClient.testConnection();
        if (!connected) {
          throw new Error("Failed to connect to ServiceNow");
        }

        setClient(newClient);
        setSelectedCredentialId(credId);
        return true;
      } catch (err: any) {
        console.error("Error connecting to ServiceNow:", err);
        setError(`Failed to connect to ServiceNow: ${err.message}`);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user, selectedCredentialId],
  );

  // Disconnect from ServiceNow
  const disconnect = useCallback(() => {
    setClient(null);
    setSelectedCredentialId(null);
  }, []);

  return {
    client,
    isLoading,
    error,
    credentials,
    selectedCredentialId,
    setSelectedCredentialId,
    connect,
    disconnect,
  };
}
