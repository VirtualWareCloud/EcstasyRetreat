// Main entry for Ecstasy Retreat web app

import { supabase } from "./supabase.js";
import { fetchTherapists, getTherapistById } from "./therapists.js";
import { signupWithEmail, loginWithEmail, loginWithGoogle, logout, getCurrentUser } from "./auth.js";
import { createBooking, getUserBookings } from "./bookings.js";

// On load: fetch therapists and log them
(async () => {
  try {
    const therapists = await fetchTherapists();
    console.log("Therapists list:", therapists);
  } catch (e) {
    console.error("Error loading therapists:", e.message || e);
  }
})();

// Expose helpers for console/browser testing
window.loginWithGoogle = loginWithGoogle;
window.signupWithEmail = signupWithEmail;
window.loginWithEmail = loginWithEmail;
window.logout = logout;
window.getCurrentUser = getCurrentUser;
window.fetchTherapists = fetchTherapists;
window.getTherapistById = getTherapistById;
window.createBooking = createBooking;
window.getUserBookings = getUserBookings;

// Demo: Quickly create a booking from the console
window.createBookingDemo = async function () {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Not authenticated");
    // Example data; adjust fields as needed
    const demoBooking = {
      user_id: user.id,
      therapist_id: 1,
      service_id: 2,
      booking_date: "2025-12-07",
      booking_time: "15:00",
      duration: 60,
      notes: "Sample note"
    };
    const booking = await createBooking(demoBooking);
    console.log("Booking created:", booking);
  } catch (e) {
    console.error("Demo booking failed:", e.message || e);
  }
};