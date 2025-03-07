-- Create ChatGPT settings table
CREATE OR REPLACE FUNCTION public.create_chatgpt_settings_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chatgpt_settings') THEN
    -- Create the table
    CREATE TABLE public.chatgpt_settings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      api_key TEXT NOT NULL,
      is_enabled BOOLEAN DEFAULT true NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      UNIQUE(user_id)
    );

    -- Add RLS policies
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

    -- Enable realtime
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chatgpt_settings;
  END IF;
END;
$$;

-- Execute the function to create the table
SELECT public.create_chatgpt_settings_table();

-- Grant access to authenticated users
GRANT ALL ON TABLE public.chatgpt_settings TO authenticated;
GRANT ALL ON TABLE public.chatgpt_settings TO service_role;
