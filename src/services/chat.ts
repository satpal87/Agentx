/**
 * Chat Service
 *
 * This service handles chat history and message persistence
 */

import { supabase } from "@/lib/supabase";

export interface ChatMessage {
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

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages?: ChatMessage[];
}

/**
 * Save a conversation to the database
 */
export async function saveConversation(
  userId: string,
  title: string,
  messages: ChatMessage[],
): Promise<string | null> {
  try {
    console.log(`Saving conversation for user ${userId}`);

    // First, create or update the conversation record
    const { data: conversationData, error: conversationError } = await supabase
      .from("conversations")
      .insert({
        user_id: userId,
        title: title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (conversationError) {
      console.error("Error saving conversation:", conversationError);
      return null;
    }

    const conversationId = conversationData.id;

    // Then save all messages
    const messagesToInsert = messages.map((message) => ({
      conversation_id: conversationId,
      content: message.content,
      sender: message.sender,
      created_at: message.timestamp.toISOString(),
      metadata: message.codeSnippets
        ? { codeSnippets: message.codeSnippets }
        : null,
    }));

    const { error: messagesError } = await supabase
      .from("messages")
      .insert(messagesToInsert);

    if (messagesError) {
      console.error("Error saving messages:", messagesError);
      return null;
    }

    console.log(`Conversation saved with ID: ${conversationId}`);
    return conversationId;
  } catch (error) {
    console.error("Exception saving conversation:", error);
    return null;
  }
}

/**
 * Get all conversations for a user
 */
export async function getConversations(
  userId: string,
): Promise<ChatConversation[]> {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error getting conversations:", error);
      return [];
    }

    return data.map((conv) => ({
      id: conv.id,
      title: conv.title,
      createdAt: new Date(conv.created_at),
      updatedAt: new Date(conv.updated_at),
    }));
  } catch (error) {
    console.error("Exception getting conversations:", error);
    return [];
  }
}

/**
 * Get a conversation with all its messages
 */
export async function getConversationWithMessages(
  conversationId: string,
): Promise<ChatConversation | null> {
  try {
    // Get the conversation
    const { data: conversationData, error: conversationError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single();

    if (conversationError) {
      console.error("Error getting conversation:", conversationError);
      return null;
    }

    // Get all messages for this conversation
    const { data: messagesData, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Error getting messages:", messagesError);
      return null;
    }

    // Format the messages
    const messages = messagesData.map((msg) => ({
      id: msg.id,
      content: msg.content,
      sender: msg.sender,
      timestamp: new Date(msg.created_at),
      codeSnippets: msg.metadata?.codeSnippets || undefined,
    }));

    return {
      id: conversationData.id,
      title: conversationData.title,
      createdAt: new Date(conversationData.created_at),
      updatedAt: new Date(conversationData.updated_at),
      messages,
    };
  } catch (error) {
    console.error("Exception getting conversation with messages:", error);
    return null;
  }
}

/**
 * Update a conversation's title
 */
export async function updateConversationTitle(
  conversationId: string,
  title: string,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("conversations")
      .update({
        title: title,
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    if (error) {
      console.error("Error updating conversation title:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception updating conversation title:", error);
    return false;
  }
}

/**
 * Delete a conversation and all its messages
 */
export async function deleteConversation(
  conversationId: string,
): Promise<boolean> {
  try {
    // Delete all messages first (cascade delete should handle this, but just to be safe)
    const { error: messagesError } = await supabase
      .from("messages")
      .delete()
      .eq("conversation_id", conversationId);

    if (messagesError) {
      console.error("Error deleting messages:", messagesError);
      return false;
    }

    // Then delete the conversation
    const { error: conversationError } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId);

    if (conversationError) {
      console.error("Error deleting conversation:", conversationError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception deleting conversation:", error);
    return false;
  }
}
