import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import {
  getConversations,
  deleteConversation,
  ChatConversation,
} from "@/services/chat";
import { MessageSquare, Trash2, Calendar, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ChatHistoryProps {
  onSelectConversation: (conversationId: string) => void;
}

export function ChatHistory({ onSelectConversation }: ChatHistoryProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getConversations(user.id);
        setConversations(data);
      } catch (err) {
        console.error("Error loading conversations:", err);
        setError("Failed to load chat history");
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [user]);

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click

    if (window.confirm("Are you sure you want to delete this conversation?")) {
      try {
        const success = await deleteConversation(id);
        if (success) {
          setConversations((prev) => prev.filter((conv) => conv.id !== id));
        } else {
          setError("Failed to delete conversation");
        }
      } catch (err) {
        console.error("Error deleting conversation:", err);
        setError("Failed to delete conversation");
      }
    }
  };

  const handleSelectConversation = (id: string) => {
    onSelectConversation(id);
  };

  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="cursor-pointer hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{error}</p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => navigate("/chat")}
        >
          Start New Chat
        </Button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center">
        <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-500 mb-4">No chat history found</p>
        <Button onClick={() => navigate("/chat")}>Start New Chat</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 overflow-auto">
      {conversations.map((conversation) => (
        <Card
          key={conversation.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleSelectConversation(conversation.id)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium truncate">{conversation.title}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span className="mr-3">
                    {conversation.createdAt.toLocaleDateString()}
                  </span>
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{formatDate(conversation.updatedAt)}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                onClick={(e) => handleDeleteConversation(conversation.id, e)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default ChatHistory;
