import axios from 'axios';
import { BASE_URL, ENDPOINTS } from './configuration';
import { storageService } from './storage.service';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth routes that don't need authorization header
const AUTH_ROUTES = [
  ENDPOINTS.SIGNUP,
  ENDPOINTS.LOGIN,
  ENDPOINTS.REQUEST_PASSWORD_RESET,
  ENDPOINTS.RESET_PASSWORD,
];

// Add request interceptor to attach access token
apiClient.interceptors.request.use(
  async (config) => {
    // Check if this is an auth route
    const isAuthRoute = AUTH_ROUTES.some((route) => config.url.includes(route));

    // Only add token for non-auth routes
    if (!isAuthRoute) {
      const token = await storageService.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

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
      const { accessToken, refreshToken } = response.data;

      // Store tokens in AsyncStorage
      if (accessToken && refreshToken) {
        await storageService.saveTokens(accessToken, refreshToken);
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout function to clear tokens
  logout: async () => {
    try {
      await storageService.clearTokens();
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
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

  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put(ENDPOINTS.EDIT_USER, profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Notifications
  getUnreadNotifications: async (page = 0, size = 10) => {
    try {
      const response = await apiClient.get(ENDPOINTS.GET_UNREAD_NOTIFICATIONS, {
        params: { page, size },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  markNotificationsAsRead: async (notificationIds) => {
    try {
      const response = await apiClient.put(ENDPOINTS.MARK_NOTIFICATIONS_READ, notificationIds);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Complaints
  submitComplaint: async (formData) => {
    try {
      const response = await apiClient.post(ENDPOINTS.SUBMIT_COMPLAINT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getMyComplaints: async (status = null, fromDate = null, page = 0, size = 10) => {
    try {
      const params = { page, size };
      if (status) params.status = status;
      if (fromDate) params.fromDate = fromDate;

      const response = await apiClient.get(ENDPOINTS.GET_MY_COMPLAINTS, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  searchComplaints: async (query, status = null, fromDate = null, page = 0, size = 20) => {
    try {
      const params = { query, page, size };
      if (status) params.status = status;
      if (fromDate) params.fromDate = fromDate;

      const response = await apiClient.get(ENDPOINTS.SEARCH_COMPLAINTS, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAllComplaints: async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.GET_ALL_COMPLAINTS);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getComplaintDetail: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.GET_COMPLAINT_DETAIL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateComplaint: async (id, updateData) => {
    try {
      const response = await apiClient.put(
        `${ENDPOINTS.UPDATE_COMPLAINT}/${id}/update`,
        updateData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  bulkUpdateComplaints: async (updateData) => {
    try {
      const response = await apiClient.post(ENDPOINTS.BULK_UPDATE_COMPLAINTS, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getComplaintsMap: async (
    status = null,
    lat = null,
    lng = null,
    radius = null,
    page = 0,
    size = 20
  ) => {
    try {
      const params = { page, size };
      if (status) params.status = status;
      if (lat) params.lat = lat;
      if (lng) params.lng = lng;
      if (radius) params.radius = radius;

      const response = await apiClient.get(ENDPOINTS.GET_COMPLAINTS_MAP, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
