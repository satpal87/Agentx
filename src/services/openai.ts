/**
 * OpenAI Service
 *
 * This service handles interactions with the OpenAI API for ChatGPT integration.
 */

import { supabase } from "@/lib/supabase";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIService {
  private apiKey: string;
  private model: string;
  private baseUrl: string = "https://api.openai.com/v1";

  constructor(apiKey: string, model: string = "gpt-3.5-turbo") {
    this.apiKey = apiKey;
    this.model = model;
  }

  /**
   * Send a chat completion request to the OpenAI API
   */
  async createChatCompletion(
    messages: ChatMessage[],
    options: {
      temperature?: number;
      max_tokens?: number;
      stream?: boolean;
    } = {},
  ): Promise<ChatCompletionResponse> {
    const { temperature = 0.7, max_tokens = 1000, stream = false } = options;

    const requestBody: ChatCompletionRequest = {
      model: this.model,
      messages,
      temperature,
      max_tokens,
      stream,
    };

    try {
      console.log("Sending request to OpenAI:", {
        model: this.model,
        messageCount: messages.length,
      });

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData);
        throw new Error(
          errorData.error?.message ||
            `Error ${response.status}: ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data as ChatCompletionResponse;
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      throw error;
    }
  }

  /**
   * Simple method to send a message and get a response
   */
  async sendMessage(
    message: string,
    conversationHistory: ChatMessage[] = [],
  ): Promise<string> {
    console.log("OpenAI.sendMessage called with:", {
      messageLength: message.length,
      historyLength: conversationHistory.length,
    });

    // Add system message if not present
    if (
      conversationHistory.length === 0 ||
      conversationHistory[0].role !== "system"
    ) {
      conversationHistory.unshift({
        role: "system",
        content:
          "You are a helpful AI assistant for ServiceNow. Provide concise, accurate information about ServiceNow platform, best practices, and code examples when requested.",
      });
    }

    // Add the new user message
    const messages = [
      ...conversationHistory,
      { role: "user", content: message },
    ];

    try {
      console.log(`Sending ${messages.length} messages to OpenAI API`);
      const response = await this.createChatCompletion(messages);
      console.log("Received response from OpenAI API");

      const reply =
        response.choices[0]?.message?.content ||
        "I'm sorry, I couldn't generate a response.";

      console.log(`Got reply of length ${reply.length}`);
      return reply;
    } catch (error) {
      console.error("Error sending message to OpenAI:", error);
      throw error;
    }
  }
}

/**
 * Get the OpenAI API key for a user
 */
export async function getOpenAIApiKey(userId: string): Promise<string | null> {
  try {
    console.log(`Fetching OpenAI API key for user ${userId}`);

    // First check if the table exists
    const { error: tableCheckError } = await supabase
      .from("chatgpt_settings")
      .select("count")
      .limit(1);

    if (tableCheckError) {
      console.error("Error checking chatgpt_settings table:", tableCheckError);
      // If table doesn't exist, we can't get the API key
      if (tableCheckError.code === "PGRST116") {
        console.error("chatgpt_settings table doesn't exist");
        return null;
      }
      throw tableCheckError;
    }

    const { data, error } = await supabase
      .from("chatgpt_settings")
      .select("api_key, is_enabled")
      .eq("user_id", userId)
      .single();

    if (error) {
      // PGRST116 means no rows returned, which is not an error for us
      if (error.code === "PGRST116") {
        console.log("No ChatGPT settings found for user");
        return null;
      }
      console.error("Error getting OpenAI API key:", error);
      throw error;
    }

    if (!data || !data.is_enabled || !data.api_key) {
      console.log("OpenAI API key is not enabled or not set");
      return null;
    }

    console.log("Successfully retrieved OpenAI API key");
    return data.api_key;
  } catch (error) {
    console.error("Error getting OpenAI API key:", error);
    return null;
  }
}

/**
 * Create an OpenAI service instance for a user
 */
export async function createOpenAIService(
  userId: string,
): Promise<OpenAIService | null> {
  const apiKey = await getOpenAIApiKey(userId);
  if (!apiKey) {
    return null;
  }

  return new OpenAIService(apiKey);
}
