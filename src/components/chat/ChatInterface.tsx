import React, { useState, useEffect } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Bookmark,
  Download,
  Share2,
  Star,
  ThumbsUp,
  Database,
  AlertCircle,
} from "lucide-react";
import { useServiceNow } from "@/hooks/useServiceNow";
import { useAuth } from "@/context/AuthContext";
import { createOpenAIService } from "@/services/openai";
import { saveConversation, getConversationWithMessages } from "@/services/chat";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  codeSnippets?: {
    id: string;
    code: string;
    language: string;
  }[];
}

interface ChatInterfaceProps {
  initialMessages?: Message[];
  isLoading?: boolean;
  onSendMessage?: (message: string, type: string) => void;
  onSaveConversation?: () => void;
  onCopyCode?: (code: string) => void;
  conversationTitle?: string;
}

const ChatInterface = ({
  initialMessages = [],
  isLoading: propIsLoading = false,
  onSendMessage = () => {},
  onSaveConversation = () => {},
  onCopyCode = () => {},
  conversationTitle: propConversationTitle = "New Conversation",
}: ChatInterfaceProps) => {
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);
  const [conversationTitle, setConversationTitle] = useState(
    propConversationTitle,
  );
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.length > 0
      ? initialMessages
      : [
          {
            id: "welcome-1",
            content: "Welcome to AgentX AI! How can I help you today?",
            sender: "ai",
            timestamp: new Date(),
          },
        ],
  );
  const [activeTab, setActiveTab] = useState("chat");
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(propIsLoading);
  const [openAIService, setOpenAIService] = useState<any>(null);
  const [openAIError, setOpenAIError] = useState<string | null>(null);
  const { user } = useAuth();

  // ServiceNow integration
  const {
    credentials,
    selectedCredentialId,
    setSelectedCredentialId,
    client,
    connect,
    isLoading: isServiceNowLoading,
  } = useServiceNow({ autoConnect: true });

  // Load conversation from URL if present
  useEffect(() => {
    const loadConversationFromUrl = async () => {
      if (!user) return;

      const urlParams = new URLSearchParams(window.location.search);
      const conversationId = urlParams.get("conversation");

      if (conversationId) {
        try {
          const conversation =
            await getConversationWithMessages(conversationId);
          if (conversation) {
            setMessages(conversation.messages || []);
            setIsSaved(true);
            // Update conversation title
            if (conversation.title) {
              // Update the title in the component state
              setConversationTitle(conversation.title);
            }
          }
        } catch (error) {
          console.error("Error loading conversation:", error);
        }
      }
    };

    loadConversationFromUrl();
  }, [user]);

  // Connect to ServiceNow when credential is selected
  useEffect(() => {
    if (selectedCredentialId) {
      connect(selectedCredentialId);
    }
  }, [selectedCredentialId, connect]);

  // Initialize OpenAI service
  useEffect(() => {
    if (!user) {
      console.log("No user found, cannot initialize OpenAI service");
      return;
    }

    const initOpenAI = async () => {
      try {
        console.log("Initializing OpenAI service for user:", user.id);
        setIsLoading(true);

        // Create a test API key for development if needed
        // This is just for testing - remove in production
        const testApiKey = "sk-test123456789";

        // Try to get the real API key from settings
        const service = await createOpenAIService(user.id);

        if (!service) {
          console.warn(
            "OpenAI service not available - API key may not be configured",
          );
          setOpenAIError(
            "OpenAI API key not configured. Please add your API key in Settings → AI Integration.",
          );

          // For development/testing only - remove in production
          // This creates a test service with a dummy API key
          // setOpenAIService(new OpenAIService(testApiKey));
          // setOpenAIError(null);
          // console.log("Created test OpenAI service for development");
        } else {
          console.log("OpenAI service initialized successfully");
          setOpenAIService(service);
          setOpenAIError(null);
        }
      } catch (error) {
        console.error("Error initializing OpenAI service:", error);
        setOpenAIError(
          `Failed to initialize OpenAI service: ${error.message || "Unknown error"}. Please check your API key in settings.`,
        );
      } finally {
        setIsLoading(false);
      }
    };

    initOpenAI();

    // Cleanup function
    return () => {
      console.log("Cleaning up OpenAI service");
      setOpenAIService(null);
    };
  }, [user]);

  // Get the name of the currently selected ServiceNow instance
  const getSelectedServiceNowName = () => {
    if (!selectedCredentialId || credentials.length === 0) return null;
    const selected = credentials.find(
      (cred) => cred.id === selectedCredentialId,
    );
    return selected ? selected.name : null;
  };

  // Handle sending a new message
  const handleSendMessage = async (message: string, type: string) => {
    if (!message.trim()) {
      console.log("Empty message, not sending");
      return;
    }

    console.log(`Sending message: "${message}" with type: ${type}`);

    // Add user message to the chat
    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      content: message,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);

    // Call the parent handler
    onSendMessage(message, type);

    // Process with OpenAI if available
    if (openAIService) {
      setIsLoading(true);
      setOpenAIError(null);

      try {
        console.log("Processing message with OpenAI");

        // Convert existing messages to OpenAI format
        const conversationHistory = messages.map((msg) => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.content,
        }));

        // Add context based on the query type
        let contextPrompt = "";
        if (type === "servicenow" && client) {
          contextPrompt = `The user is asking about ServiceNow. They are connected to a ServiceNow instance named "${getSelectedServiceNowName()}". `;
        } else if (type === "docs") {
          contextPrompt =
            "The user is asking about documentation. Provide detailed information with references where possible. ";
        } else if (type === "generate") {
          contextPrompt =
            "The user is asking for code generation. Provide well-commented, production-ready code examples. ";
        }

        // Add the context to the message
        const messageWithContext = contextPrompt + message;
        console.log("Message with context:", messageWithContext);

        // Show a temporary "thinking" message
        const thinkingId = `ai-thinking-${Date.now()}`;
        const thinkingMessage: Message = {
          id: thinkingId,
          content: "Thinking...",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, thinkingMessage]);

        // Get response from OpenAI
        console.log("Sending request to OpenAI");
        const response = await openAIService.sendMessage(
          messageWithContext,
          conversationHistory,
        );
        console.log("Received response from OpenAI");

        // Extract code snippets if any
        const codeSnippets = extractCodeSnippets(response);
        console.log(`Extracted ${codeSnippets.length} code snippets`);

        // Remove the thinking message and add the real response
        setMessages((prev) => {
          const filtered = prev.filter((msg) => msg.id !== thinkingId);
          return [
            ...filtered,
            {
              id: `ai-${Date.now()}`,
              content:
                codeSnippets.length > 0
                  ? cleanResponseText(response)
                  : response,
              sender: "ai",
              timestamp: new Date(),
              codeSnippets: codeSnippets.length > 0 ? codeSnippets : undefined,
            },
          ];
        });
      } catch (error) {
        console.error("Error getting response from OpenAI:", error);
        setOpenAIError(
          `Failed to get response: ${error.message || "Unknown error"}`,
        );

        // Add error message to chat
        const errorResponse: Message = {
          id: `ai-error-${Date.now()}`,
          content: `I'm sorry, I encountered an error processing your request. ${error.message || "Please try again later."}`,
          sender: "ai",
          timestamp: new Date(),
        };

        setMessages((prev) => {
          // Remove any thinking message
          const filtered = prev.filter(
            (msg) => !msg.id.includes("ai-thinking"),
          );
          return [...filtered, errorResponse];
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // If OpenAI service is not available, show a message
      console.warn("OpenAI service not available");
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        content:
          "OpenAI integration is not configured. Please add your API key in the Settings → AI Integration to enable AI responses.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }
  };

  // Extract code snippets from response text
  const extractCodeSnippets = (
    text: string,
  ): { id: string; code: string; language: string }[] => {
    const codeBlockRegex = /```([\w-]*)[\n\r]([\s\S]*?)```/g;
    const snippets = [];
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const language = match[1].trim() || "javascript";
      const code = match[2].trim();

      if (code) {
        snippets.push({
          id: `code-${Date.now()}-${snippets.length}`,
          language,
          code,
        });
      }
    }

    return snippets;
  };

  // Clean response text by removing code blocks
  const cleanResponseText = (text: string): string => {
    return text.replace(/```[\w-]*[\n\r][\s\S]*?```/g, "");
  };

  // Handle saving a conversation
  const handleSaveConversation = async () => {
    if (!user) return;

    try {
      const conversationId = await saveConversation(
        user.id,
        conversationTitle || "New Conversation",
        messages,
      );

      if (conversationId) {
        setIsSaved(true);
        // Update URL with conversation ID
        window.history.replaceState(
          null,
          "",
          `/chat?conversation=${conversationId}`,
        );
        onSaveConversation();
      }
    } catch (error) {
      console.error("Error saving conversation:", error);
    }
  };

  return (
    <div
      className="flex flex-col w-full bg-white dark:bg-gray-950"
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Card
        className="flex flex-col h-full border-0 rounded-none shadow-none"
        style={{
          flex: "1 1 auto",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        <CardHeader className="px-4 py-3 border-b flex-shrink-0 flex flex-row items-center justify-between">
          <div className="flex items-center">
            <CardTitle className="text-lg font-medium">
              {conversationTitle}
            </CardTitle>
            {isSaved && (
              <Badge
                variant="secondary"
                className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
              >
                Saved
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* ServiceNow Instance Selector */}
            {credentials.length > 0 && (
              <div className="flex items-center mr-2">
                <Database size={16} className="mr-2 text-gray-500" />
                <Select
                  value={selectedCredentialId || ""}
                  onValueChange={setSelectedCredentialId}
                  disabled={isServiceNowLoading}
                >
                  <SelectTrigger className="h-8 text-xs w-[180px]">
                    <SelectValue placeholder="Select ServiceNow" />
                  </SelectTrigger>
                  <SelectContent>
                    {credentials.map((cred) => (
                      <SelectItem key={cred.id} value={cred.id}>
                        {cred.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveConversation}
              className={isSaved ? "text-primary" : ""}
            >
              <Bookmark size={18} className="mr-1" />
              {isSaved ? "Saved" : "Save"}
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 size={18} className="mr-1" />
              Share
            </Button>
            <Button variant="ghost" size="sm">
              <Download size={18} className="mr-1" />
              Export
            </Button>
          </div>
        </CardHeader>

        <Tabs
          defaultValue="chat"
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid grid-cols-2 max-w-[400px] mx-auto my-2">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent
            value="chat"
            className="flex-1 flex flex-col p-0 m-0 data-[state=active]:flex-1"
          >
            <CardContent
              className="flex-1 flex flex-col p-0"
              style={{
                flex: "1 1 auto",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                minHeight: 0,
              }}
            >
              <div
                className="flex-1 overflow-hidden"
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <MessageList messages={messages} onCopyCode={onCopyCode} />
              </div>
              {openAIError && (
                <Alert variant="destructive" className="mx-4 my-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{openAIError}</AlertDescription>
                </Alert>
              )}
              <div className="flex-shrink-0 bg-white border-t border-gray-200 pb-[160px]">
                <MessageInput
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  servicenowInstance={getSelectedServiceNowName()}
                />
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent
            value="feedback"
            className="flex-1 flex flex-col p-6 data-[state=active]:flex-1"
          >
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              <h3 className="text-xl font-semibold">
                How was your experience?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                Your feedback helps us improve AgentX AI. Let us know what you
                think about this conversation.
              </p>

              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  className="flex flex-col items-center p-6"
                >
                  <ThumbsUp size={24} className="mb-2" />
                  <span>Helpful</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center p-6"
                >
                  <Star size={24} className="mb-2" />
                  <span>Excellent</span>
                </Button>
              </div>

              <div className="w-full max-w-md">
                <label className="block text-sm font-medium mb-2">
                  Additional comments
                </label>
                <textarea
                  className="w-full p-3 border rounded-md h-32 resize-none focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="Tell us more about your experience..."
                />

                <Button className="mt-4 w-full">Submit Feedback</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ChatInterface;
