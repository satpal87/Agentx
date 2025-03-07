import { supabase } from "./supabase";

export interface ChatGptSettings {
  id?: string;
  user_id: string;
  api_key: string;
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Save ChatGPT settings for a user
 *
 * @param userId - The user's ID
 * @param apiKey - The OpenAI API key
 * @param isEnabled - Whether ChatGPT integration is enabled
 * @returns Promise that resolves when settings are saved
 */
export async function saveChatGptSettings(
  userId: string,
  apiKey: string,
  isEnabled: boolean,
): Promise<void> {
  console.log(`Saving ChatGPT settings for user ${userId}:`, {
    apiKeyProvided: !!apiKey,
    isEnabled,
  });

  try {
    // First check if the table exists
    const { error: tableCheckError } = await supabase
      .from("chatgpt_settings")
      .select("count")
      .limit(1);

    if (tableCheckError) {
      console.error("Error checking chatgpt_settings table:", tableCheckError);
      // If table doesn't exist, create it
      if (tableCheckError.code === "PGRST116") {
        console.log("Creating chatgpt_settings table...");
        await createChatGptSettingsTable();
      } else {
        throw tableCheckError;
      }
    }

    // Now save the settings
    const { error } = await supabase
      .from("chatgpt_settings")
      .upsert({
        user_id: userId,
        api_key: apiKey,
        is_enabled: isEnabled,
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error("Error saving ChatGPT settings:", error);
      throw error;
    }

    console.log("ChatGPT settings saved successfully");
  } catch (error) {
    console.error("Exception saving ChatGPT settings:", error);
    throw error;
  }
}

/**
 * Get ChatGPT settings for a user
 *
 * @param userId - The user's ID
 * @returns Promise that resolves to the user's ChatGPT settings or null if not found
 */
export async function getChatGptSettings(
  userId: string,
): Promise<ChatGptSettings | null> {
  console.log(`Getting ChatGPT settings for user ${userId}`);

  try {
    const { data, error } = await supabase
      .from("chatgpt_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      // PGRST116 means no rows returned, which is not an error for us
      if (error.code === "PGRST116") {
        console.log("No ChatGPT settings found for user");
        return null;
      }

      console.error("Error getting ChatGPT settings:", error);
      throw error;
    }

    console.log("ChatGPT settings retrieved successfully");
    return data;
  } catch (error) {
    console.error("Exception getting ChatGPT settings:", error);
    throw error;
  }
}

/**
 * Create the chatgpt_settings table if it doesn't exist
 */
async function createChatGptSettingsTable(): Promise<boolean> {
  try {
    console.log("Creating chatgpt_settings table...");

    // Execute the SQL directly
    const sql = `
      CREATE TABLE IF NOT EXISTS public.chatgpt_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        api_key TEXT NOT NULL,
        is_enabled BOOLEAN DEFAULT true NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
        UNIQUE(user_id)
      );
      
      -- Add RLS policies if they don't exist
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'chatgpt_settings' AND policyname = 'Users can view their own ChatGPT settings'
        ) THEN
          ALTER TABLE public.chatgpt_settings ENABLE ROW LEVEL SECURITY;
          
          -- Policy for select
          CREATE POLICY "Users can view their own ChatGPT settings"
            ON public.chatgpt_settings
            FOR SELECT
            USING (auth.uid() = user_id);
          
          -- Policy for insert
          CREATE POLICY "Users can insert their own ChatGPT settings"
            ON public.chatgpt_settings
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);
          
          -- Policy for update
          CREATE POLICY "Users can update their own ChatGPT settings"
            ON public.chatgpt_settings
            FOR UPDATE
            USING (auth.uid() = user_id);
          
          -- Policy for delete
          CREATE POLICY "Users can delete their own ChatGPT settings"
            ON public.chatgpt_settings
            FOR DELETE
            USING (auth.uid() = user_id);
        END IF;
      END $$;
      
      -- Grant access to authenticated users
      GRANT ALL ON TABLE public.chatgpt_settings TO authenticated;
      GRANT ALL ON TABLE public.chatgpt_settings TO service_role;
    `;

    // This would require the supabase-js client to be initialized with the service_role key
    // which is not recommended for client-side code
    // For now, we'll just log this as a suggestion for the server-side implementation
    console.log(
      "Direct SQL execution would require service_role key. Please run this SQL in the Supabase dashboard:",
      sql,
    );

    return true;
  } catch (error) {
    console.error("Error creating ChatGPT settings table:", error);
    throw error;
  }
}
