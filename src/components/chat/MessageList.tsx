import React, { useRef, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy, Check, Code, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  codeSnippets?: CodeSnippet[];
}

interface CodeSnippet {
  id: string;
  code: string;
  language: string;
}

interface MessageListProps {
  messages?: Message[];
  onCopyCode?: (code: string) => void;
}

const MessageList = ({
  messages = [
    {
      id: "1",
      content: "How can I query ServiceNow records using JavaScript?",
      sender: "user",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: "2",
      content:
        "You can query ServiceNow records using the GlideRecord API. Here's how you can do it:",
      sender: "ai",
      timestamp: new Date(Date.now() - 1000 * 60 * 4),
      codeSnippets: [
        {
          id: "code-1",
          language: "javascript",
          code: `var gr = new GlideRecord('incident');
gr.addQuery('active', true);
gr.addQuery('priority', 1);
gr.query();

while(gr.next()) {
  gs.info(gr.number + ': ' + gr.short_description);
}`,
        },
      ],
    },
    {
      id: "3",
      content: "Can you explain how to filter by multiple conditions?",
      sender: "user",
      timestamp: new Date(Date.now() - 1000 * 60 * 3),
    },
    {
      id: "4",
      content:
        "Sure! You can add multiple conditions to your query using the addQuery method. You can also use addEncodedQuery for more complex conditions:",
      sender: "ai",
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
      codeSnippets: [
        {
          id: "code-2",
          language: "javascript",
          code: `// Multiple addQuery calls
var gr = new GlideRecord('incident');
gr.addQuery('active', true);
gr.addQuery('priority', 1);
gr.addQuery('assignment_group', 'Service Desk');
gr.query();

// Using encoded query
var gr2 = new GlideRecord('incident');
gr2.addEncodedQuery('active=true^priority=1^assignment_group=Service Desk');
gr2.query();`,
        },
      ],
    },
  ],
  onCopyCode = () => {},
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [copiedCodes, setCopiedCodes] = useState<Record<string, boolean>>({});
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    // Immediate scroll attempt
    scrollToBottom();

    // Additional scroll attempts with increasing delays
    const timeouts = [50, 150, 300, 600].map((delay) =>
      setTimeout(() => scrollToBottom(), delay),
    );

    // Clear all timeouts on cleanup
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [messages]);

  // Check if we should show the scroll button
  useEffect(() => {
    const checkScrollPosition = () => {
      if (!messagesContainerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isScrolledUp);
    };

    const container = messagesContainerRef.current;
    if (container) {
      // Initial check
      checkScrollPosition();

      // Add event listener
      container.addEventListener("scroll", checkScrollPosition);

      // Also check on window resize
      window.addEventListener("resize", checkScrollPosition);

      // Check periodically to catch any missed updates
      const intervalId = setInterval(checkScrollPosition, 1000);

      return () => {
        container.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
        clearInterval(intervalId);
      };
    }
  }, []);

  const scrollToBottom = () => {
    try {
      // Direct scrollTop method - most reliable
      if (messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        container.scrollTop = container.scrollHeight;
      }

      // Backup method using scrollIntoView
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "auto" });
      }
    } catch (error) {
      console.error("Error scrolling to bottom:", error);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    onCopyCode(code);
    setCopiedCodes((prev) => ({ ...prev, [id]: true }));

    // Reset copied status after 2 seconds
    setTimeout(() => {
      setCopiedCodes((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 w-full"
      ref={messagesContainerRef}
      style={{
        WebkitOverflowScrolling: "touch",
        overscrollBehavior: "contain",
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(155, 155, 155, 0.5) transparent",
        minHeight: 0,
        height: "100%",
      }}
    >
      <div className="w-full flex-grow" style={{ paddingBottom: "20px" }}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex mb-4 max-w-3xl",
              message.sender === "user" ? "ml-auto" : "mr-auto",
            )}
          >
            {message.sender === "ai" && (
              <div className="flex-shrink-0 mr-3 mt-1">
                <Avatar>
                  <AvatarImage
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=servicenow"
                    alt="AI Assistant"
                  />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              </div>
            )}

            <div
              className={cn(
                "flex flex-col p-4 rounded-lg",
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold">
                  {message.sender === "user" ? "You" : "AgentX AI"}
                </span>
                <span className="text-xs opacity-70 ml-2">
                  {formatTime(message.timestamp)}
                </span>
              </div>

              <div className="whitespace-pre-wrap">{message.content}</div>

              {message.codeSnippets && message.codeSnippets.length > 0 && (
                <div className="mt-3 space-y-3">
                  {message.codeSnippets.map((snippet) => (
                    <div key={snippet.id} className="relative">
                      <div className="flex items-center justify-between bg-gray-800 text-gray-200 px-4 py-2 rounded-t-md">
                        <div className="flex items-center">
                          <Code size={16} className="mr-2" />
                          <span>{snippet.language}</span>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-200 hover:text-white hover:bg-gray-700"
                                onClick={() =>
                                  handleCopyCode(snippet.code, snippet.id)
                                }
                              >
                                {copiedCodes[snippet.id] ? (
                                  <Check size={16} />
                                ) : (
                                  <Copy size={16} />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {copiedCodes[snippet.id]
                                  ? "Copied!"
                                  : "Copy code"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <pre className="bg-gray-900 text-gray-100 p-4 overflow-x-auto rounded-b-md">
                        <code>{snippet.code}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {message.sender === "user" && (
              <div className="flex-shrink-0 ml-3 mt-1">
                <Avatar>
                  <AvatarImage
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                    alt="User"
                  />
                  <AvatarFallback>You</AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Button
          className="fixed bottom-24 right-6 rounded-full shadow-lg p-2 h-12 w-12 z-50 bg-primary hover:bg-primary/90"
          onClick={scrollToBottom}
          variant="default"
          aria-label="Scroll to bottom"
        >
          <ArrowDown size={24} className="text-white" />
        </Button>
      )}
    </div>
  );
};

export default MessageList;
