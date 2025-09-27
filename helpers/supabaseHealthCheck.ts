// helpers/supabaseHealthCheck.ts
let supabaseHealthCache: { healthy: boolean; checkedAt: number } = { healthy: false, checkedAt: 0 };

export async function checkSupabaseHealth(): Promise<boolean> {
  const TEN_MINUTES = 10 * 60 * 1000;
  const now = Date.now();
  if (supabaseHealthCache.checkedAt && now - supabaseHealthCache.checkedAt < TEN_MINUTES) {
    return supabaseHealthCache.healthy;
  }
  try {
    // Try a very lightweight select from artists (limit 1)
    const { supabase } = await import("@/GlobalState/Songs/supabase_client");
    if (!supabase) throw new Error("Supabase not configured");
    const { error } = await supabase.from("artists").select("id").limit(1);
    supabaseHealthCache = {
      healthy: !error,
      checkedAt: now,
    };
    return !error;
  } catch {
    supabaseHealthCache = { healthy: false, checkedAt: now };
    return false;
  }
}
