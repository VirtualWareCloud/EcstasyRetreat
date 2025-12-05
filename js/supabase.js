// Supabase JS client initialization for Ecstasy Retreat

// Load Supabase client from CDN (index.html): <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

const SUPABASE_URL = "https://jeregnymyknddwbbbvrm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplcmVnbnltcmtuZGR3YmJidnJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NjE1NjYsImV4cCI6MjA4MDMzNzU2Nn0.ND3YBaXYoghIrPlfKxe6Yy1NipMYVta__XeEIROA0X8";

// createClient is exposed globally via CDN
export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("Supabase connected");
