// ============================================
// Auth module for Supabase integration
// ============================================

// Import Supabase client instance (centralized)
import { supabase } from "./supabaseClient.js";

const OAUTH_REDIRECT = `${window.location.origin}/auth-callback.html`;

// ============================================
// EMAIL/PASSWORD SIGNUP (Generic for Users & Therapists)
// ============================================
export async function signupWithEmail({ full_name, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name }, // store full name in user metadata
    },
  });

  if (error) throw new Error(error.message || "Signup failed");
  return data;
}

// ============================================
// EMAIL/PASSWORD LOGIN
// ============================================
export async function loginWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message || "Login failed");
  return data;
}

// ============================================
// GOOGLE SIGNUP / LOGIN
// ============================================
async function startGoogleOAuth(actionLabel) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      // Must match Supabase dashboard redirect URL configuration (Step 7 reminder)
      redirectTo: OAUTH_REDIRECT,
    },
  });

  if (error) {
    console.error(`Google OAuth ${actionLabel} error:`, error);
    throw new Error(error.message || `Google OAuth ${actionLabel} failed`);
  }
}

export async function signupWithGoogle() {
  return startGoogleOAuth("signup");
}

export async function loginWithGoogle() {
  return startGoogleOAuth("login");
}

// ============================================
// LOGOUT
// ============================================
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Logout error:", error);
    throw new Error(error.message || "Logout failed");
  }
}

// ============================================
// GET CURRENT USER
// ============================================
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data?.user || null;
}

// ============================================
// SESSION CHECK (Persistent login)
// ============================================
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Error fetching session:", error.message);
    return null;
  }
  return data?.session || null;
}

// Guarded session fetch that redirects when unauthenticated
export async function requireSession({ redirectTo = "login.html", onRedirect } = {}) {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message || "Session check failed");

  if (!data?.session) {
    onRedirect?.();
    window.location.href = redirectTo;
    return null;
  }

  return data.session;
}

// ============================================
// AUTH STATE LOGGER / WATCHER
// ============================================
export function watchAuthState({ onChange, redirectOnSignOut } = {}) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    console.info(`[Supabase Auth] ${event}`, session);
    onChange?.(event, session);

    if (!session && redirectOnSignOut) {
      window.location.href = redirectOnSignOut;
    }
  });

  return () => data?.subscription?.unsubscribe?.();
}
