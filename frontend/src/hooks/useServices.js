import { useState, useEffect } from 'react';
import { servicesAPI } from '../services/api';

export const useServices = (params = {}) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchServices();
  }, [JSON.stringify(params)]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await servicesAPI.getServices(params);
      setServices(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  return {
    services,
    loading,
    error,
    refetch: fetchServices,
  };
};

export const useService = (serviceId) => {
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  const fetchService = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await servicesAPI.getService(serviceId);
      setService(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch service');
    } finally {
      setLoading(false);
    }
  };

  return {
    service,
    loading,
    error,
    refetch: fetchService,
  };
};