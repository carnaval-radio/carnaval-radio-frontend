import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

// Modern Supabase configuration with updated key naming
// Since this runs on the server-side (API routes), we can use the service role key for full access
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Create client with fallback for missing environment variables
export const supabase = supabaseUrl && supabaseKey 
  ? createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false, // Not needed for server-side
        persistSession: false,  // Not needed for server-side
        detectSessionInUrl: false
      },
      global: {
        headers: {
          'X-Client-Info': 'carnaval-radio-server@1.0.0',
        },
      },
    })
  : null;

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseKey && supabase);
};

// Export types for use throughout the app
export type { Database };
