import React, { useState, useEffect } from "react";
import { useServiceNow } from "@/hooks/useServiceNow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, AlertCircle, Database } from "lucide-react";

interface RecordViewerProps {
  table?: string;
  className?: string;
}

/**
 * ServiceNow Record Viewer Component
 *
 * Displays records from a ServiceNow table with search and filtering capabilities.
 */
export function RecordViewer({
  table = "incident",
  className,
}: RecordViewerProps) {
  const {
    client,
    isLoading: clientLoading,
    error: clientError,
  } = useServiceNow({ autoConnect: true });
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState(table);
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(10);

  // Common ServiceNow tables
  const commonTables = [
    { id: "incident", name: "Incidents" },
    { id: "problem", name: "Problems" },
    { id: "change_request", name: "Change Requests" },
    { id: "task", name: "Tasks" },
    { id: "sys_user", name: "Users" },
    { id: "cmdb_ci", name: "Configuration Items" },
  ];

  // Load records when the client or selected table changes
  useEffect(() => {
    if (!client) return;
    fetchRecords();
  }, [client, selectedTable]);

  const fetchRecords = async () => {
    if (!client) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await client.queryRecords({
        table: selectedTable,
        query: query,
        limit: limit,
      });

      setRecords(result);
    } catch (err: any) {
      console.error("Error fetching records:", err);
      setError(`Failed to fetch records: ${err.message}`);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords();
  };

  // Get column headers from the first record
  const getColumns = () => {
    if (records.length === 0) return [];
    return Object.keys(records[0]).filter(
      (key) =>
        // Filter out some common system fields to keep the display cleaner
        ![
          "sys_created_by",
          "sys_created_on",
          "sys_mod_count",
          "sys_updated_by",
          "sys_updated_on",
          "sys_tags",
        ].includes(key),
    );
  };

  const columns = getColumns();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="mr-2 h-5 w-5" />
          ServiceNow Records
        </CardTitle>
      </CardHeader>
      <CardContent>
        {clientError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>{clientError}</AlertDescription>
          </Alert>
        )}

        {!clientLoading && !client && !clientError && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Connected</AlertTitle>
            <AlertDescription>
              Please connect to a ServiceNow instance first.
            </AlertDescription>
          </Alert>
        )}

        {client && (
          <>
            <div className="space-y-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="table-select">Table</Label>
                  <Select
                    value={selectedTable}
                    onValueChange={setSelectedTable}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="table-select">
                      <SelectValue placeholder="Select a table" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonTables.map((table) => (
                        <SelectItem key={table.id} value={table.id}>
                          {table.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="limit-select">Limit</Label>
                  <Select
                    value={limit.toString()}
                    onValueChange={(value) => setLimit(parseInt(value))}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="limit-select">
                      <SelectValue placeholder="Select limit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 records</SelectItem>
                      <SelectItem value="10">10 records</SelectItem>
                      <SelectItem value="25">25 records</SelectItem>
                      <SelectItem value="50">50 records</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="query" className="sr-only">
                    Query
                  </Label>
                  <Input
                    id="query"
                    placeholder="Enter query (e.g. active=true^priority=1)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </form>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No records found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((column) => (
                        <TableHead key={column}>
                          {column.replace("_", " ")}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record, index) => (
                      <TableRow key={record.sys_id || index}>
                        {columns.map((column) => (
                          <TableCell key={column}>
                            {record[column]?.toString() || "-"}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
