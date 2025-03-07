import React from "react";
import { useServiceNow } from "@/hooks/useServiceNow";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Database, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";

interface ServiceNowSelectorProps {
  onConnect?: (connected: boolean) => void;
  className?: string;
}

/**
 * ServiceNow Instance Selector Component
 *
 * Allows users to select and connect to a ServiceNow instance from their saved credentials.
 */
export function ServiceNowSelector({
  onConnect,
  className,
}: ServiceNowSelectorProps) {
  const {
    client,
    isLoading,
    error,
    credentials,
    selectedCredentialId,
    setSelectedCredentialId,
    connect,
  } = useServiceNow({ autoConnect: false });

  const handleConnect = async () => {
    if (!selectedCredentialId) return;

    const connected = await connect(selectedCredentialId);
    if (onConnect) {
      onConnect(connected);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="mr-2 h-5 w-5" />
          ServiceNow Connection
        </CardTitle>
        <CardDescription>
          Select a ServiceNow instance to connect to
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {client && (
          <Alert
            variant="default"
            className="bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
          >
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Connected</AlertTitle>
            <AlertDescription>
              Successfully connected to ServiceNow instance
            </AlertDescription>
          </Alert>
        )}

        {credentials.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No credentials found</AlertTitle>
            <AlertDescription>
              You don't have any ServiceNow credentials saved. Please add
              credentials in the settings.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium">ServiceNow Instance</label>
            <Select
              value={selectedCredentialId || ""}
              onValueChange={setSelectedCredentialId}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a ServiceNow instance" />
              </SelectTrigger>
              <SelectContent>
                {credentials.map((cred) => (
                  <SelectItem key={cred.id} value={cred.id}>
                    {cred.name} ({cred.instance_url})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleConnect}
          disabled={!selectedCredentialId || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : client ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reconnect
            </>
          ) : (
            <>Connect to ServiceNow</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
