-- SQL setup script for Supabase project

-- Create a health check table for connection testing
CREATE OR REPLACE FUNCTION public.create_health_check_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create the health_check table if it doesn't exist
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
    
  -- Insert a test record if the table is empty
  INSERT INTO public.health_check (status)
  SELECT 'ok'
  WHERE NOT EXISTS (SELECT 1 FROM public.health_check LIMIT 1);
  
  -- Grant permissions
  GRANT SELECT ON public.health_check TO anon, authenticated;
 END;
$$;

-- Create a function to check if a user's email is verified
CREATE OR REPLACE FUNCTION public.is_email_verified(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_verified BOOLEAN;
BEGIN
  SELECT (email_confirmed_at IS NOT NULL) INTO is_verified
  FROM auth.users
  WHERE id = user_id;
  
  RETURN is_verified;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_email_verified TO authenticated;

-- Create a function to get user profile data
CREATE OR REPLACE FUNCTION public.get_user_profile()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_data JSONB;
BEGIN
  SELECT 
    jsonb_build_object(
      'id', u.id,
      'email', u.email,
      'name', u.raw_user_meta_data->>'name',
      'avatar_url', u.raw_user_meta_data->>'avatar_url',
      'email_confirmed_at', u.email_confirmed_at
    ) INTO user_data
  FROM auth.users u
  WHERE u.id = auth.uid();
  
  RETURN user_data;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_profile TO authenticated;
