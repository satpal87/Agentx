import { supabase } from "./supabase";

export interface ServiceNowCredential {
  id: string;
  user_id: string;
  name: string;
  instance_url: string;
  username: string;
  password: string;
  created_at: string;
}

export async function saveServiceNowCredential(
  userId: string,
  name: string,
  instanceUrl: string,
  username: string,
  password: string,
): Promise<ServiceNowCredential> {
  console.log("Saving ServiceNow credential:", {
    userId,
    name,
    instanceUrl,
    username,
  });

  try {
    // First check if the table exists
    const { error: tableCheckError } = await supabase
      .from("servicenow_credentials")
      .select("count")
      .limit(1);

    if (tableCheckError) {
      console.error(
        "Error checking servicenow_credentials table:",
        tableCheckError,
      );
      // If table doesn't exist, create it
      if (tableCheckError.code === "PGRST116") {
        console.log("Creating servicenow_credentials table...");
        await createServiceNowCredentialsTable();
      } else {
        throw tableCheckError;
      }
    }

    // Try to insert using the RPC function first (bypasses RLS)
    try {
      console.log("Trying to insert credential using RPC function...");
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "insert_servicenow_credential",
        {
          p_user_id: userId,
          p_name: name,
          p_instance_url: instanceUrl,
          p_username: username,
          p_password: password,
        },
      );

      if (rpcError) {
        console.error("Error using RPC to insert credential:", rpcError);
        // Fall back to direct insert if RPC fails
      } else {
        console.log("Successfully inserted credential using RPC:", rpcData);
        // Fetch the inserted record
        const { data: fetchedData, error: fetchError } = await supabase
          .from("servicenow_credentials")
          .select("*")
          .eq("id", rpcData)
          .single();

        if (fetchError) {
          console.error("Error fetching inserted credential:", fetchError);
        } else {
          console.log("Fetched inserted credential:", fetchedData);
          return fetchedData;
        }
      }
    } catch (rpcException) {
      console.error("Exception using RPC to insert credential:", rpcException);
      // Continue to try direct insert
    }

    // Fall back to direct insert
    console.log("Falling back to direct insert...");
    const { data, error } = await supabase
      .from("servicenow_credentials")
      .insert({
        user_id: userId,
        name,
        instance_url: instanceUrl,
        username,
        password, // In a production app, this should be encrypted
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting ServiceNow credential:", error);

      // Check if it's an RLS error
      if (
        error.message &&
        error.message.includes("row-level security policy")
      ) {
        console.error(
          "RLS policy violation. Checking if user ID matches auth.uid()",
        );

        // Get current user to check if IDs match
        const { data: authData } = await supabase.auth.getUser();
        if (authData && authData.user) {
          console.log("Current auth.uid():", authData.user.id);
          console.log("Provided user_id:", userId);

          if (authData.user.id !== userId) {
            throw new Error(
              "User ID mismatch: The provided user ID does not match the authenticated user ID",
            );
          }
        }
      }

      throw error;
    }

    console.log("ServiceNow credential saved successfully:", data);
    return data;
  } catch (error) {
    console.error("Exception saving ServiceNow credential:", error);
    throw error;
  }
}

// Helper function to create the servicenow_credentials table if it doesn't exist
async function createServiceNowCredentialsTable() {
  try {
    console.log("Attempting to create servicenow_credentials table...");

    // First try using the RPC function
    const { error } = await supabase.rpc("create_servicenow_credentials_table");

    if (error) {
      console.error("Error creating table via RPC:", error);

      if (!error.message.includes("already exists")) {
        // Try direct SQL execution as a fallback
        console.log("Attempting direct SQL execution to create table...");

        // This requires the service_role key with higher privileges
        const serviceClient = supabase;

        // Execute the SQL directly
        const sql = `
          CREATE TABLE IF NOT EXISTS public.servicenow_credentials (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL,
            name TEXT NOT NULL,
            instance_url TEXT NOT NULL,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
            UNIQUE(user_id, name)
          );
          
          -- Add RLS policies if they don't exist
          DO $ 
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'servicenow_credentials' AND policyname = 'Users can view their own ServiceNow credentials'
            ) THEN
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
            END IF;
          END $;
          
          -- Grant access to authenticated users
          GRANT ALL ON TABLE public.servicenow_credentials TO authenticated;
          GRANT ALL ON TABLE public.servicenow_credentials TO service_role;
        `;

        // This would require the supabase-js client to be initialized with the service_role key
        // which is not recommended for client-side code
        // For now, we'll just log this as a suggestion for the server-side implementation
        console.log(
          "Direct SQL execution would require service_role key. Please run this SQL in the Supabase dashboard:",
          sql,
        );
      }
    } else {
      console.log("ServiceNow credentials table created successfully via RPC");
    }

    return true;
  } catch (error) {
    console.error("Exception creating ServiceNow credentials table:", error);
    throw error;
  }
}

export async function getServiceNowCredentials(
  userId: string,
): Promise<ServiceNowCredential[]> {
  const { data, error } = await supabase
    .from("servicenow_credentials")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return data || [];
}

export async function deleteServiceNowCredential(
  id: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("servicenow_credentials")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export async function updateServiceNowCredential(
  id: string,
  userId: string,
  updates: Partial<Omit<ServiceNowCredential, "id" | "user_id" | "created_at">>,
): Promise<ServiceNowCredential> {
  const { data, error } = await supabase
    .from("servicenow_credentials")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
