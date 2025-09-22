import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

// Modern Supabase configuration with updated key naming
// Since this runs on the server-side (API routes), we can use the service role key for full access
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Server-side secret key

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
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
});

// Export types for use throughout the app
export type { Database };
