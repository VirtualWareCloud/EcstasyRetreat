// =============================================================
// Supabase client initialization for Ecstasy Retreat web app
// =============================================================

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// ✅ Supabase Project Credentials
const SUPABASE_URL = "https://jeregnymrknddwbbbvrm.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplcmVnbnltcmtuZGR3YmJidnJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NjE1NjYsImV4cCI6MjA4MDMzNzU2Nn0.ND3YBaXYoghIrPlfKxe6Yy1NipMYVta__XeEIROA0X8";

// ✅ Create Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("✅ Supabase connected successfully");
