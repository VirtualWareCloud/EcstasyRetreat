// Kept for backward compatibility: re-export the centralized Supabase client.
// Prefer importing from ./supabaseClient.js in new code.
export { supabase, stopGlobalAuthLogger } from "./supabaseClient.js";
