import { supabase } from "@/integrations/supabase/client";

/**
 * Get authentication headers for external API calls.
 * Includes the Supabase JWT token for user authentication.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error("Not authenticated");
  }
  
  return {
    "Authorization": `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };
}

/**
 * Get authentication headers for file uploads (without Content-Type).
 */
export async function getAuthHeadersForUpload(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error("Not authenticated");
  }
  
  return {
    "Authorization": `Bearer ${session.access_token}`,
  };
}
