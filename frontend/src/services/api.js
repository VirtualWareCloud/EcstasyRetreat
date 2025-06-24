import axios from 'axios';
import Cookies from 'js-cookie';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.access_token) {
      Cookies.set('access_token', response.data.access_token, { expires: 7 });
    }
    return response.data;
  },

  logout: () => {
    Cookies.remove('access_token');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/me', userData);
    return response.data;
  },
};

// Therapists API
export const therapistsAPI = {
  getTherapists: async (params = {}) => {
    const response = await api.get('/therapists', { params });
    return response.data;
  },

  getTherapist: async (therapistId) => {
    const response = await api.get(`/therapists/${therapistId}`);
    return response.data;
  },

  getTherapistReviews: async (therapistId, params = {}) => {
    const response = await api.get(`/therapists/${therapistId}/reviews`, { params });
    return response.data;
  },

  getTherapistAvailability: async (therapistId, date) => {
    const response = await api.get(`/therapists/${therapistId}/availability`, {
      params: { date }
    });
    return response.data;
  },

  applyAsTherapist: async (applicationData) => {
    const response = await api.post('/therapists/apply', applicationData);
    return response.data;
  },
};

// Services API
export const servicesAPI = {
  getServices: async (params = {}) => {
    const response = await api.get('/services', { params });
    return response.data;
  },

  getService: async (serviceId) => {
    const response = await api.get(`/services/${serviceId}`);
    return response.data;
  },
};

// Bookings API
export const bookingsAPI = {
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  getMyBookings: async (params = {}) => {
    const response = await api.get('/bookings/my-bookings', { params });
    return response.data;
  },

  getBooking: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  },

  confirmBooking: async (bookingId) => {
    const response = await api.put(`/bookings/${bookingId}/confirm`);
    return response.data;
  },

  cancelBooking: async (bookingId, reason) => {
    const response = await api.put(`/bookings/${bookingId}/cancel`, { reason });
    return response.data;
  },

  completeBooking: async (bookingId, notes) => {
    const response = await api.put(`/bookings/${bookingId}/complete`, { notes });
    return response.data;
  },

  createReview: async (bookingId, reviewData) => {
    const response = await api.post(`/bookings/${bookingId}/review`, reviewData);
    return response.data;
  },
};

// Payments API
export const paymentsAPI = {
  createPaymentIntent: async (paymentData) => {
    const response = await api.post('/payments/create-payment-intent', paymentData);
    return response.data;
  },

  getPaymentStatus: async (bookingId) => {
    const response = await api.get(`/payments/booking/${bookingId}/status`);
    return response.data;
  },

  processRefund: async (bookingId, reason) => {
    const response = await api.post(`/payments/refund/${bookingId}`, { reason });
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getAllUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getAllBookings: async (params = {}) => {
    const response = await api.get('/admin/bookings', { params });
    return response.data;
  },

  getAllTherapists: async (params = {}) => {
    const response = await api.get('/admin/therapists', { params });
    return response.data;
  },

  getTherapistApplications: async (params = {}) => {
    const response = await api.get('/therapists/admin/applications', { params });
    return response.data;
  },

  approveApplication: async (applicationId) => {
    const response = await api.put(`/therapists/admin/applications/${applicationId}/approve`);
    return response.data;
  },

  rejectApplication: async (applicationId, reason) => {
    const response = await api.put(`/therapists/admin/applications/${applicationId}/reject`, { reason });
    return response.data;
  },

  activateUser: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/activate`);
    return response.data;
  },

  deactivateUser: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/deactivate`);
    return response.data;
  },

  updateTherapistStatus: async (therapistId, status, notes) => {
    const response = await api.put(`/admin/therapists/${therapistId}/status`, { 
      new_status: status, 
      notes 
    });
    return response.data;
  },

  getRevenueAnalytics: async (period = 'month') => {
    const response = await api.get('/admin/analytics/revenue', {
      params: { period }
    });
    return response.data;
  },

  getPopularServices: async (limit = 10) => {
    const response = await api.get('/admin/analytics/popular-services', {
      params: { limit }
    });
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;