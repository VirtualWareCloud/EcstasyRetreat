// ============================================
// Auth module for Supabase integration
// ============================================

// Import Supabase client instance
import { supabase } from "./supabase.js";

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
export async function signupWithGoogle() {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/login.html#googleReturn",
      },
    });
    if (error) throw error;
  } catch (e) {
    console.error("Google OAuth signup error:", e.message || e);
  }
}

// ============================================
// LOGOUT
// ============================================
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Logout error:", error.message || error);
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
// SESSION CHECK (Optional helper for persistent login)
// ============================================
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Error fetching session:", error.message);
    return null;
  }
  return data?.session || null;
}
