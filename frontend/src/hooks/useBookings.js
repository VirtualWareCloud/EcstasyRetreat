import { useState, useEffect } from 'react';
import { bookingsAPI } from '../services/api';

export const useBookings = (params = {}) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [JSON.stringify(params)]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingsAPI.getMyBookings(params);
      setBookings(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData) => {
    try {
      const newBooking = await bookingsAPI.createBooking(bookingData);
      await fetchBookings(); // Refresh list
      return { success: true, data: newBooking };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to create booking';
      return { success: false, error: errorMessage };
    }
  };

  const cancelBooking = async (bookingId, reason) => {
    try {
      await bookingsAPI.cancelBooking(bookingId, reason);
      await fetchBookings(); // Refresh list
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to cancel booking';
      return { success: false, error: errorMessage };
    }
  };

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    createBooking,
    cancelBooking,
  };
};

export const useBooking = (bookingId) => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingsAPI.getBooking(bookingId);
      setBooking(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch booking');
    } finally {
      setLoading(false);
    }
  };

  return {
    booking,
    loading,
    error,
    refetch: fetchBooking,
  };
};