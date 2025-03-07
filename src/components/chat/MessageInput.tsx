import React, { useState } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Send, Code, Database, FileText, Sparkles } from "lucide-react";
import { Badge } from "../ui/badge";

interface MessageInputProps {
  onSendMessage?: (message: string, type: string) => void;
  isLoading?: boolean;
  servicenowInstance?: string | null;
}

const MessageInput = ({
  onSendMessage = () => {},
  isLoading = false,
  servicenowInstance = null,
}: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [queryType, setQueryType] = useState("general");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      console.log(`Submitting message: "${message}" with type: ${queryType}`);
      onSendMessage(message, queryType);
      setMessage("");
    } else {
      console.log(
        `Message submission prevented: empty=${!message.trim()}, loading=${isLoading}`,
      );
    }
  };

  const queryTypes = [
    {
      id: "servicenow",
      icon: <Database size={18} />,
      label: "ServiceNow Records",
    },
    { id: "docs", icon: <FileText size={18} />, label: "Documentation" },
    { id: "generate", icon: <Sparkles size={18} />, label: "Code Generation" },
  ];

  return (
    <div className="p-4 border-t border-gray-200 bg-white w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-wrap items-center space-x-2 mb-2">
          <TooltipProvider>
            {queryTypes.map((type) => (
              <Tooltip key={type.id}>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant={queryType === type.id ? "default" : "outline"}
                    className="flex items-center gap-1 mb-2"
                    onClick={() => setQueryType(type.id)}
                    disabled={type.id === "servicenow" && !servicenowInstance}
                  >
                    {type.icon}
                    <span className="hidden sm:inline">{type.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{type.label}</p>
                  {type.id === "servicenow" && !servicenowInstance && (
                    <p className="text-xs text-red-500">
                      Select a ServiceNow instance first
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>

          {/* Show active ServiceNow instance if selected */}
          {servicenowInstance && queryType === "servicenow" && (
            <Badge variant="outline" className="ml-2 mb-2">
              <Database size={12} className="mr-1" />
              {servicenowInstance}
            </Badge>
          )}
        </div>

        <div className="relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Ask about ${queryTypes.find((t) => t.id === queryType)?.label || "ServiceNow"}...`}
            className="min-h-[100px] pr-12 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button
            className="absolute bottom-3 right-3"
            size="icon"
            disabled={!message.trim() || isLoading}
            type="submit"
          >
            <Send size={18} />
          </Button>
        </div>

        <div className="text-xs text-gray-500">
          <p>
            Press Enter to send, Shift+Enter for new line. Currently in{" "}
            {queryTypes.find((t) => t.id === queryType)?.label || "General"}{" "}
            mode.
          </p>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
