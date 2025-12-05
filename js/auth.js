// ============================================
// Auth module for Supabase integration
// ============================================

// Import the Supabase client
import { supabase } from "./supabase.js";

// ============================================
// EMAIL/PASSWORD SIGNUP
// ============================================
export async function signupWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message || "Signup failed");
  }

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

  if (error) {
    throw new Error(error.message || "Login failed");
  }

  return data;
}

// ============================================
// GOOGLE OAUTH LOGIN
// ============================================
export async function loginWithGoogle() {
  try {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/login.html",
      },
    });
  } catch (e) {
    console.error("Google OAuth login error:", e.message || e);
  }
}

// ============================================
// LOGOUT
// ============================================
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Logout error:", error.message || error);
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
