// =============================================================
// Supabase client bootstrap (centralized for OAuth + data layer)
// =============================================================
// Repo audit (Step 1):
// - Supabase JS SDK was already loaded via CDN tags in multiple HTML files, but there was no
//   dedicated, shared client for OAuth callbacks.
// - Hardcoded SUPABASE_URL and SUPABASE_ANON_KEY existed in js/supabase.js and join.html
//   without environment guards.
// - auth.js existed with email/password flows, but Google OAuth lacked proper redirect
//   handling and there was no auth-callback.html to complete the flow.
// - Google buttons on login/signup pages were wired to missing functions, so they were inert.
//
// Reminder: enable the Google provider in the Supabase dashboard and register the redirect URL:
//   https://virtualwarecloud.github.io/EcstasyRetreat/auth-callback.html
// The same URL must be present in your Supabase project's allowed redirect URLs list.

// Import Supabase JS v2 from the CDN (ESM build) for GitHub Pages compatibility.
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Gracefully read credentials from optional globals, then fall back to the known project keys.
// Keeping the defaults ensures GitHub Pages works even without injected env variables.
const SUPABASE_URL =
  window.SUPABASE_URL || window.env?.SUPABASE_URL || window.ENV?.SUPABASE_URL ||
  "https://jeregnymrknddwbbbvrm.supabase.co";

const SUPABASE_ANON_KEY =
  window.SUPABASE_ANON_KEY || window.env?.SUPABASE_ANON_KEY || window.ENV?.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplcmVnbnltcmtuZGR3YmJidnJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NjE1NjYsImV4cCI6MjA4MDMzNzU2Nn0.ND3YBaXYoghIrPlfKxe6Yy1NipMYVta__XeEIROA0X8";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Hard fail early so the UI can surface a clear error banner instead of silently breaking.
  throw new Error("Supabase credentials are missing. Set SUPABASE_URL and SUPABASE_ANON_KEY.");
}

// Create and export the shared Supabase client instance.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Log auth state changes globally for easier debugging on static hosting.
const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
  console.info(`[Supabase Auth] Event: ${event}`, session);
});

// Provide a cleanup helper in case a page wants to stop listening (optional use).
export const stopGlobalAuthLogger = () => authListener?.subscription?.unsubscribe?.();
