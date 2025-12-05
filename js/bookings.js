// Bookings module for Supabase data layer

import { supabase } from "./supabase.js";

// Create a new booking
export async function createBooking({ user_id, therapist_id, service_id, booking_date, booking_time, duration, notes }) {
  const { data, error } = await supabase
    .from("bookings")
    .insert([{ user_id, therapist_id, service_id, booking_date, booking_time, duration, notes }])
    .select()
    .single();
  if (error) {
    console.error("Booking creation failed:", error.message || error);
    throw error;
  }
  return data;
}

// Get bookings for a user (history)
export async function getUserBookings(user_id) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", user_id)
    .order("booking_date", { ascending: false });
  if (error) {
    console.error("Failed to fetch bookings:", error.message || error);
    return [];
  }
  return data;
}
export async function updateBookingStatus(id, status) {
  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Status update failed:", error);
    return null;
  }

  return data;
}