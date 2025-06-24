import { useState, useEffect } from 'react';
import { therapistsAPI } from '../services/api';

export const useTherapists = (params = {}) => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTherapists();
  }, [JSON.stringify(params)]);

  const fetchTherapists = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await therapistsAPI.getTherapists(params);
      setTherapists(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch therapists');
    } finally {
      setLoading(false);
    }
  };

  return {
    therapists,
    loading,
    error,
    refetch: fetchTherapists,
  };
};

export const useTherapist = (therapistId) => {
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (therapistId) {
      fetchTherapist();
    }
  }, [therapistId]);

  const fetchTherapist = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await therapistsAPI.getTherapist(therapistId);
      setTherapist(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch therapist');
    } finally {
      setLoading(false);
    }
  };

  return {
    therapist,
    loading,
    error,
    refetch: fetchTherapist,
  };
};

export const useTherapistReviews = (therapistId, params = {}) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (therapistId) {
      fetchReviews();
    }
  }, [therapistId, JSON.stringify(params)]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await therapistsAPI.getTherapistReviews(therapistId, params);
      setReviews(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  return {
    reviews,
    loading,
    error,
    refetch: fetchReviews,
  };
};

export const useTherapistAvailability = (therapistId, date) => {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (therapistId && date) {
      fetchAvailability();
    }
  }, [therapistId, date]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await therapistsAPI.getTherapistAvailability(therapistId, date);
      setAvailability(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch availability');
    } finally {
      setLoading(false);
    }
  };

  return {
    availability,
    loading,
    error,
    refetch: fetchAvailability,
  };
};