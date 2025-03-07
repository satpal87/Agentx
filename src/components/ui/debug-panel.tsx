import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bug, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface DebugPanelProps {
  className?: string;
  title?: string;
  data?: Record<string, any>;
  error?: string | null;
  onRefresh?: () => void;
}

/**
 * Debug Panel Component
 *
 * Displays technical debugging information in a collapsible panel
 */
export function DebugPanel({
  className,
  title = "Debug Information",
  data = {},
  error = null,
  onRefresh,
}: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  if (!isEnabled) return null;

  return (
    <Card className={className}>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center">
            <Bug className="mr-2 h-4 w-4" />
            {title}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={onRefresh}
              >
                <RefreshCw size={14} />
              </Button>
            )}
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
            <div className="flex items-center space-x-1">
              <Switch
                id="debug-enabled"
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
                size="sm"
              />
              <Label htmlFor="debug-enabled" className="text-xs cursor-pointer">
                Show
              </Label>
            </div>
          </div>
        </div>
      </CardHeader>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-3">
            {error && (
              <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded text-xs">
                <strong>Error:</strong> {error}
              </div>
            )}
            <pre className="text-xs overflow-auto p-2 bg-gray-100 dark:bg-gray-800 rounded max-h-[300px]">
              {JSON.stringify(data, null, 2)}
            </pre>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
