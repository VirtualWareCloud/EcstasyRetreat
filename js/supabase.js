// =======================================================
// Supabase JS client initialization for Ecstasy Retreat
// =======================================================

// ✅ Official Project URL and Public (Anon) Key
const SUPABASE_URL = "https://jeregnymrknddwbbbvrm.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplcmVnbnltcmtuZGR3YmJidnJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NjE1NjYsImV4cCI6MjA4MDMzNzU2Nn0.ND3YBaXYoghIrPlfKxe6Yy1NipMYVta__XeEIROA0X8";

// ✅ Create Supabase client instance
export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ✅ Optional: test connection in console
console.log("✅ Supabase client connected:", SUPABASE_URL);
