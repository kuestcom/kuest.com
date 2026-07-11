import { createClient } from "@supabase/supabase-js";
import type { PublicRuntimeConfig } from "@/lib/runtime-config";

export function createSupabaseClient(
  config: Pick<PublicRuntimeConfig, "SUPABASE_ANON_KEY" | "SUPABASE_URL">,
) {
  const { SUPABASE_ANON_KEY, SUPABASE_URL } = config;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase environment variables are missing. Set SUPABASE_URL and SUPABASE_ANON_KEY.",
    );
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
    },
  });
}
