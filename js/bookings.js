// js/bookings.js
import { supabase } from "./supabase.js";

/**
 * Create a new booking
 */
export async function createBooking(payload) {
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      user_id: payload.user_id,
      therapist_id: payload.therapist_id,
      service_id: payload.service_id || null,
      booking_date: payload.booking_date,
      booking_time: payload.booking_time,
      duration: payload.duration,
      notes: payload.notes || null,
      amount: payload.amount || null,
      status: "pending" // NEW
    })
    .select()
    .single();

  if (error) {
    console.error("createBooking error:", error);
    return null;
  }

  return data;
}

/**
 * Get all bookings for a specific user
 */
export async function getUserBookings(user_id) {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id,
      booking_date,
      booking_time,
      duration,
      notes,
      status,
      amount,
      therapists ( full_name )
    `)
    .eq("user_id", user_id)
    .order("booking_date", { ascending: false });

  if (error) {
    console.error("getUserBookings error:", error);
    return [];
  }

  return data || [];
}

/**
 * NEW: update status (pending → approved / declined)
 */
export async function updateBookingStatus(id, status) {
  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("updateBookingStatus error:", error);
    return null;
  }

  return data;
}