import { supabase } from "./supabase";

export async function updateUserProfile(
  userId: string,
  updates: { name?: string; avatar_url?: string },
): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    data: updates,
  });

  if (error) {
    throw error;
  }
}

export async function deleteUserAccount(): Promise<void> {
  // Note: In a real application, you would need admin privileges or a server-side function
  // to delete a user account. This is a simplified example.
  const { error } = await supabase.rpc("delete_user");

  if (error) {
    throw error;
  }

  // Sign out after deletion
  await supabase.auth.signOut();
}
