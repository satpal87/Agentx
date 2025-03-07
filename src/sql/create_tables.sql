-- Create the necessary tables for the ServiceNow AI Assistant application

-- Enable RLS on all tables
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create health_check table for connection testing
CREATE TABLE IF NOT EXISTS public.health_check (
  id SERIAL PRIMARY KEY,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Set up RLS policies
ALTER TABLE public.health_check ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous reads
DROP POLICY IF EXISTS "Allow anonymous read access" ON public.health_check;
CREATE POLICY "Allow anonymous read access" ON public.health_check
  FOR SELECT USING (true);
  
-- Insert a test record
INSERT INTO public.health_check (status)
VALUES ('ok');

-- Grant permissions
GRANT SELECT ON public.health_check TO anon, authenticated;

-- Create chatgpt_settings table
CREATE TABLE IF NOT EXISTS public.chatgpt_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Set up RLS policies
ALTER TABLE public.chatgpt_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own settings
DROP POLICY IF EXISTS "Users can read their own settings" ON public.chatgpt_settings;
CREATE POLICY "Users can read their own settings" ON public.chatgpt_settings
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own settings
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.chatgpt_settings;
CREATE POLICY "Users can insert their own settings" ON public.chatgpt_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own settings
DROP POLICY IF EXISTS "Users can update their own settings" ON public.chatgpt_settings;
CREATE POLICY "Users can update their own settings" ON public.chatgpt_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own settings
DROP POLICY IF EXISTS "Users can delete their own settings" ON public.chatgpt_settings;
CREATE POLICY "Users can delete their own settings" ON public.chatgpt_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chatgpt_settings TO authenticated;

-- Create servicenow_credentials table
CREATE TABLE IF NOT EXISTS public.servicenow_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  instance_url TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Set up RLS policies
ALTER TABLE public.servicenow_credentials ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own credentials
DROP POLICY IF EXISTS "Users can read their own credentials" ON public.servicenow_credentials;
CREATE POLICY "Users can read their own credentials" ON public.servicenow_credentials
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own credentials
DROP POLICY IF EXISTS "Users can insert their own credentials" ON public.servicenow_credentials;
CREATE POLICY "Users can insert their own credentials" ON public.servicenow_credentials
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own credentials
DROP POLICY IF EXISTS "Users can update their own credentials" ON public.servicenow_credentials;
CREATE POLICY "Users can update their own credentials" ON public.servicenow_credentials
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own credentials
DROP POLICY IF EXISTS "Users can delete their own credentials" ON public.servicenow_credentials;
CREATE POLICY "Users can delete their own credentials" ON public.servicenow_credentials
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.servicenow_credentials TO authenticated;

-- Create a function to delete a user account
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete user data from public schema tables
  DELETE FROM public.chatgpt_settings WHERE user_id = auth.uid();
  DELETE FROM public.servicenow_credentials WHERE user_id = auth.uid();
  
  -- Delete the user from auth.users
  DELETE FROM auth.users WHERE id = auth.uid();
 END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user TO authenticated;
