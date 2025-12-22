import axios from 'axios';
import { BASE_URL, ENDPOINTS } from './configuration';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for tokens if needed
apiClient.interceptors.request.use(
  (config) => {
    // You can add logic here to get token from storage and attach to headers
    // const token = await getToken();
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export const apiService = {
  signup: async (userData) => {
    try {
      const response = await apiClient.post(ENDPOINTS.SIGNUP, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  login: async (credentials) => {
    try {
      const response = await apiClient.post(ENDPOINTS.LOGIN, credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  requestPasswordReset: async (email) => {
    try {
      const response = await apiClient.post(ENDPOINTS.REQUEST_PASSWORD_RESET, { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  resetPassword: async (resetData) => {
    try {
      const response = await apiClient.post(ENDPOINTS.RESET_PASSWORD, resetData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getProfile: async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.GET_PROFILE);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
