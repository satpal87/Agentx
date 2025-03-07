-- Create ServiceNow credentials table
CREATE OR REPLACE FUNCTION public.create_servicenow_credentials_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'servicenow_credentials') THEN
    -- Create the table
    CREATE TABLE public.servicenow_credentials (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL,
      name TEXT NOT NULL,
      instance_url TEXT NOT NULL,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      UNIQUE(user_id, name)
    );

    -- Add RLS policies
    ALTER TABLE public.servicenow_credentials ENABLE ROW LEVEL SECURITY;

    -- Policy for select
    CREATE POLICY "Users can view their own ServiceNow credentials"
      ON public.servicenow_credentials
      FOR SELECT
      USING (auth.uid() = user_id);

    -- Policy for insert
    CREATE POLICY "Users can insert their own ServiceNow credentials"
      ON public.servicenow_credentials
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    -- Policy for update
    CREATE POLICY "Users can update their own ServiceNow credentials"
      ON public.servicenow_credentials
      FOR UPDATE
      USING (auth.uid() = user_id);

    -- Policy for delete
    CREATE POLICY "Users can delete their own ServiceNow credentials"
      ON public.servicenow_credentials
      FOR DELETE
      USING (auth.uid() = user_id);

    -- Enable realtime
    ALTER PUBLICATION supabase_realtime ADD TABLE public.servicenow_credentials;
  END IF;
END;
$$;

-- Execute the function to create the table
SELECT public.create_servicenow_credentials_table();

-- Grant access to authenticated users
GRANT ALL ON TABLE public.servicenow_credentials TO authenticated;
GRANT ALL ON TABLE public.servicenow_credentials TO service_role;

-- Create a direct SQL function to insert credentials (bypassing RLS)
CREATE OR REPLACE FUNCTION public.insert_servicenow_credential(
  p_user_id UUID,
  p_name TEXT,
  p_instance_url TEXT,
  p_username TEXT,
  p_password TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.servicenow_credentials (user_id, name, instance_url, username, password)
  VALUES (p_user_id, p_name, p_instance_url, p_username, p_password)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.insert_servicenow_credential TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_servicenow_credential TO service_role;
