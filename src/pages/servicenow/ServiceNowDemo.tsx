import React from "react";
import { ServiceNowSelector } from "@/components/servicenow/ServiceNowSelector";
import { RecordViewer } from "@/components/servicenow/RecordViewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useServiceNow } from "@/hooks/useServiceNow";
import { useState } from "react";
import {
  AlertCircle,
  Code,
  Database,
  FileText,
  Play,
  Plus,
  Search,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * ServiceNow Demo Page
 *
 * A comprehensive demo page for testing all ServiceNow integration features
 */
export function ServiceNowDemo() {
  const { client, isLoading, error } = useServiceNow();
  const [activeTab, setActiveTab] = useState("records");
  const [scriptResult, setScriptResult] = useState<any>(null);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [scriptCode, setScriptCode] = useState(
    "// Example: Get current user\nvar user = gs.getUser();\ngs.info('Current user: ' + user.getName());\nreturn user.getName();",
  );
  const [isExecuting, setIsExecuting] = useState(false);

  // For create record demo
  const [newRecord, setNewRecord] = useState({
    table: "incident",
    short_description: "Test incident from AI Assistant",
    description:
      "This is a test incident created via the ServiceNow API integration.",
    priority: "3",
  });
  const [createResult, setCreateResult] = useState<any>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleExecuteScript = async () => {
    if (!client || !scriptCode.trim()) return;

    setIsExecuting(true);
    setScriptError(null);
    setScriptResult(null);

    try {
      const result = await client.executeScript(scriptCode);
      setScriptResult(result);
    } catch (err: any) {
      console.error("Error executing script:", err);
      setScriptError(err.message || "Failed to execute script");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCreateRecord = async () => {
    if (!client) return;

    setIsCreating(true);
    setCreateError(null);
    setCreateResult(null);

    try {
      const result = await client.createRecord(newRecord.table, {
        short_description: newRecord.short_description,
        description: newRecord.description,
        priority: newRecord.priority,
      });
      setCreateResult(result);
    } catch (err: any) {
      console.error("Error creating record:", err);
      setCreateError(err.message || "Failed to create record");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 overflow-auto h-full">
      <h1 className="text-2xl font-bold mb-6">ServiceNow Integration Demo</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ServiceNowSelector />

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Integration Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                <li>Query records from any table</li>
                <li>Create new records</li>
                <li>Execute custom scripts</li>
                <li>View detailed record information</li>
                <li>Filter and search records</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!client && !isLoading && !error && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Not Connected</AlertTitle>
              <AlertDescription>
                Please connect to a ServiceNow instance using the selector on
                the left.
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="records" className="flex items-center">
                <Database className="mr-2 h-4 w-4" />
                Query Records
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Create Record
              </TabsTrigger>
              <TabsTrigger value="script" className="flex items-center">
                <Code className="mr-2 h-4 w-4" />
                Execute Script
              </TabsTrigger>
            </TabsList>

            <TabsContent value="records" className="mt-6">
              <RecordViewer />
            </TabsContent>

            <TabsContent value="create" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="mr-2 h-5 w-5" />
                    Create New Record
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="table">Table</Label>
                        <Input
                          id="table"
                          value={newRecord.table}
                          onChange={(e) =>
                            setNewRecord({
                              ...newRecord,
                              table: e.target.value,
                            })
                          }
                          placeholder="incident"
                          disabled={isCreating}
                        />
                      </div>
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Input
                          id="priority"
                          value={newRecord.priority}
                          onChange={(e) =>
                            setNewRecord({
                              ...newRecord,
                              priority: e.target.value,
                            })
                          }
                          placeholder="3"
                          disabled={isCreating}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="short_description">
                        Short Description
                      </Label>
                      <Input
                        id="short_description"
                        value={newRecord.short_description}
                        onChange={(e) =>
                          setNewRecord({
                            ...newRecord,
                            short_description: e.target.value,
                          })
                        }
                        placeholder="Enter short description"
                        disabled={isCreating}
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newRecord.description}
                        onChange={(e) =>
                          setNewRecord({
                            ...newRecord,
                            description: e.target.value,
                          })
                        }
                        placeholder="Enter detailed description"
                        rows={4}
                        disabled={isCreating}
                      />
                    </div>

                    <Button
                      onClick={handleCreateRecord}
                      disabled={!client || isCreating}
                      className="w-full"
                    >
                      {isCreating ? "Creating..." : "Create Record"}
                    </Button>

                    {createError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{createError}</AlertDescription>
                      </Alert>
                    )}

                    {createResult && (
                      <div className="mt-4">
                        <h3 className="font-medium mb-2">Created Record:</h3>
                        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
                          {JSON.stringify(createResult, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="script" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Code className="mr-2 h-5 w-5" />
                    Execute ServiceNow Script
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="script">
                        Script (Server-side JavaScript)
                      </Label>
                      <Textarea
                        id="script"
                        value={scriptCode}
                        onChange={(e) => setScriptCode(e.target.value)}
                        placeholder="Enter ServiceNow server-side script"
                        rows={8}
                        className="font-mono"
                        disabled={isExecuting}
                      />
                    </div>

                    <Button
                      onClick={handleExecuteScript}
                      disabled={!client || isExecuting || !scriptCode.trim()}
                      className="w-full"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {isExecuting ? "Executing..." : "Execute Script"}
                    </Button>

                    {scriptError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{scriptError}</AlertDescription>
                      </Alert>
                    )}

                    {scriptResult !== null && (
                      <div className="mt-4">
                        <h3 className="font-medium mb-2">Result:</h3>
                        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
                          {typeof scriptResult === "object"
                            ? JSON.stringify(scriptResult, null, 2)
                            : String(scriptResult)}
                        </pre>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
