import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to build query params (only non-empty values)
const buildParams = (filters = {}) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    // Only add if value exists and is not empty string
    if (value !== null && value !== undefined && value !== '') {
      params.append(key, value);
    }
  });
  
  return params.toString();
};

// Overview & Metrics
export const getOverview = async (filters = {}) => {
  const params = buildParams(filters);
  const url = params ? `/api/overview?${params}` : '/api/overview';
  const response = await api.get(url);
  return response.data;
};

export const getComparison = async (filters = {}) => {
  const params = buildParams(filters);
  const url = params ? `/api/overview/comparison?${params}` : '/api/overview/comparison';
  const response = await api.get(url);
  return response.data;
};

// Sales Analytics
export const getSalesByDate = async (filters = {}, groupBy = 'day') => {
  const params = buildParams({ ...filters, group_by: groupBy });
  const url = params ? `/api/sales/by-date?${params}` : `/api/sales/by-date?group_by=${groupBy}`;
  const response = await api.get(url);
  return response.data;
};

export const getSalesByHour = async (filters = {}) => {
  const params = buildParams(filters);
  const url = params ? `/api/sales/by-hour?${params}` : '/api/sales/by-hour';
  const response = await api.get(url);
  return response.data;
};

export const getSalesByWeekday = async (filters = {}) => {
  const params = buildParams(filters);
  const url = params ? `/api/sales/by-weekday?${params}` : '/api/sales/by-weekday';
  const response = await api.get(url);
  return response.data;
};

export const getSalesByChannel = async (filters = {}) => {
  const params = buildParams(filters);
  const url = params ? `/api/sales/by-channel?${params}` : '/api/sales/by-channel';
  const response = await api.get(url);
  return response.data;
};

// Products Analytics
export const getTopProducts = async (filters = {}, limit = 10) => {
  const params = buildParams({ ...filters, limit });
  const url = params ? `/api/products/top-products?${params}` : `/api/products/top-products?limit=${limit}`;
  const response = await api.get(url);
  return response.data;
};

export const getTopItems = async (filters = {}, limit = 15) => {
  const params = buildParams({ ...filters, limit });
  const url = params ? `/api/products/top-items?${params}` : `/api/products/top-items?limit=${limit}`;
  const response = await api.get(url);
  return response.data;
};

// Stores
export const getStoresPerformance = async (filters = {}, limit = 20) => {
  const params = buildParams({ ...filters, limit });
  const url = params ? `/api/stores/performance?${params}` : `/api/stores/performance?limit=${limit}`;
  const response = await api.get(url);
  return response.data;
};

// Filters
export const getStores = async () => {
  const response = await api.get('/api/filters/stores');
  return response.data;
};

export const getChannels = async () => {
  const response = await api.get('/api/filters/channels');
  return response.data;
};

export default api;