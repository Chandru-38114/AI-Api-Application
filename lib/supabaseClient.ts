import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Validate that the required Supabase environment variables are present.
 * Logs a clear console warning (never throws) so the app can still render
 * in development or when the variables are intentionally absent.
 */
function validateEnv(): { url: string; anonKey: string } | null {
  const missing: string[] = [];

  if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (missing.length > 0) {
    console.warn(
      "[supabaseClient] Missing environment variable(s):",
      missing.join(", "),
      "\nSupabase features will be unavailable until these are set in .env.local."
    );
    return null;
  }

  return { url: supabaseUrl as string, anonKey: supabaseAnonKey as string };
}

/**
 * A browser-safe Supabase client singleton.
 *
 * Will be `null` when the required environment variables are not configured,
 * allowing call-sites to gracefully handle the absence of Supabase rather than
 * crashing at runtime.
 *
 * @example
 * import { supabase } from "@/lib/supabaseClient";
 *
 * if (!supabase) {
 *   // handle missing configuration
 * }
 */
const env = validateEnv();

export const supabase: SupabaseClient | null = env
  ? createClient(env.url, env.anonKey)
  : null;
