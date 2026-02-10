import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

let supabaseInstance: ReturnType<typeof createClient<Database>> | null | undefined;
let initialized = false;

function initializeSupabase() {
  if (initialized) return;
  initialized = true;

  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !supabaseKey) {
    supabaseInstance = null;
    return;
  }

  try {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          'X-Client-Info': 'carnaval-radio-server@1.0.0',
        },
      },
    });
  } catch (error) {
    console.error("Failed to initialize Supabase:", error);
    supabaseInstance = null;
  }
}

// Lazy getter for supabase - only initializes on first access
export const getSupabase = () => {
  initializeSupabase();
  return supabaseInstance;
};

// Deprecated: use getSupabase() instead (kept for backward compatibility)
export const supabase = null as any;

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  const client = getSupabase();
  return !!client;
};

// Export types for use throughout the app
export type { Database };
