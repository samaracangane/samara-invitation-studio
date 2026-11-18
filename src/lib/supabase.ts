import { createClient } from "@supabase/supabase-js";

// Public client configuration. The publishable key is intended for browser use;
// authorization must still be enforced by Supabase RLS and server-side functions.
const supabaseUrl =
  (import.meta.env['VITE_SUPABASE_URL'] as string | undefined) ??
  "https://plgwbxdjynljffowkxqi.supabase.co";
const supabasePublishableKey =
  (import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] as string | undefined) ??
  "sb_publishable_phoycDCoQ2zsz4uiccdHRw_XQlTLTNR";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;
