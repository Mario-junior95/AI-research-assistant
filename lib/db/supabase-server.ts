import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerEnv, hasSupabase } from "@/lib/env";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!hasSupabase()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  if (!client) {
    const env = getServerEnv();
    client = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL!,
      env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  return client;
}
