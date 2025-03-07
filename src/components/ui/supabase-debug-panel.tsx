import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { testSupabaseConnection } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SupabaseDebugPanelProps {
  className?: string;
}

export function SupabaseDebugPanel({ className }: SupabaseDebugPanelProps) {
  const { useMockAuth } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<
    "checking" | "connected" | "failed"
  >("checking");
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const checkConnection = async () => {
    setConnectionStatus("checking");
    try {
      // If using mock auth, don't actually test the connection
      if (useMockAuth) {
        console.log("Using mock auth, skipping Supabase connection test");
        setConnectionStatus("failed");
      } else {
        const isConnected = await testSupabaseConnection();
        setConnectionStatus(isConnected ? "connected" : "failed");
      }
    } catch (error) {
      console.error("Error testing Supabase connection:", error);
      setConnectionStatus("failed");
    }
    setLastChecked(new Date());
  };

  useEffect(() => {
    checkConnection();
  }, [useMockAuth]); // Re-check when auth mode changes

  const getEnvStatus = (envVar: string | undefined) => {
    if (!envVar) return "missing";
    if (envVar.length < 5) return "invalid";
    return "valid";
  };

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const urlStatus = getEnvStatus(supabaseUrl);
  const keyStatus = getEnvStatus(supabaseAnonKey);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="mr-2 h-5 w-5" />
          Supabase Configuration
        </CardTitle>
        <CardDescription>
          Debug information for Supabase integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert
          variant={connectionStatus === "connected" ? "default" : "destructive"}
          className="mb-4"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {connectionStatus === "checking"
              ? "Checking Connection..."
              : connectionStatus === "connected"
                ? "Connected to Supabase"
                : "Connection to Supabase Failed"}
          </AlertTitle>
          <AlertDescription>
            {connectionStatus === "checking"
              ? "Testing connection to Supabase..."
              : connectionStatus === "connected"
                ? "Your application is properly connected to Supabase."
                : "Unable to connect to Supabase. Check your configuration and network."}
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">Supabase URL:</span>
            <Badge variant={urlStatus === "valid" ? "default" : "destructive"}>
              {urlStatus === "valid" ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              {urlStatus === "valid"
                ? "Valid"
                : urlStatus === "invalid"
                  ? "Invalid"
                  : "Missing"}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-medium">Supabase Anon Key:</span>
            <Badge variant={keyStatus === "valid" ? "default" : "destructive"}>
              {keyStatus === "valid" ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              {keyStatus === "valid"
                ? "Valid"
                : keyStatus === "invalid"
                  ? "Invalid"
                  : "Missing"}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-medium">Connection Status:</span>
            <Badge
              variant={
                connectionStatus === "connected"
                  ? "default"
                  : connectionStatus === "checking"
                    ? "outline"
                    : "destructive"
              }
            >
              {connectionStatus === "connected" ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : connectionStatus === "checking" ? (
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              {connectionStatus === "checking"
                ? "Checking..."
                : connectionStatus === "connected"
                  ? "Connected"
                  : "Failed"}
            </Badge>
          </div>
        </div>

        <div className="text-xs text-muted-foreground mt-2">
          Last checked: {lastChecked.toLocaleTimeString()}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={checkConnection}
          disabled={connectionStatus === "checking"}
        >
          {connectionStatus === "checking" ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Test Connection
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
