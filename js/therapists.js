// Therapists module for Supabase data layer

import { supabase } from "./supabase.js";

// Fetch all therapists, ordered by full_name ASC
export async function fetchTherapists() {
  const { data, error } = await supabase
    .from("therapists")
    .select("*")
    .order("full_name", { ascending: true });
  if (error) {
    console.error("Failed to fetch therapists:", error.message || error);
    throw error;
  }
  return data;
}

// Fetch single therapist by ID
export async function getTherapistById(id) {
  const { data, error } = await supabase
    .from("therapists")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    console.error("Failed to fetch therapist:", error.message || error);
    throw error;
  }
  return data;
}
