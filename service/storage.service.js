import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  TOKEN_EXPIRY: 'tokenExpiry',
};

// Token validity duration: 7 days in milliseconds
const TOKEN_VALIDITY_DAYS = 7;
const TOKEN_VALIDITY_MS = TOKEN_VALIDITY_DAYS * 24 * 60 * 60 * 1000;

export const storageService = {
  // Save tokens with expiry time
  saveTokens: async (accessToken, refreshToken) => {
    try {
      const expiryTime = Date.now() + TOKEN_VALIDITY_MS;
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw error;
    }
  },

  // Get access token
  getAccessToken: async () => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  // Get refresh token
  getRefreshToken: async () => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  // Get token expiry time
  getTokenExpiry: async () => {
    try {
      const expiry = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
      return expiry ? parseInt(expiry, 10) : null;
    } catch (error) {
      console.error('Error getting token expiry:', error);
      return null;
    }
  },

  // Check if token is valid (exists and not expired)
  isTokenValid: async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const expiry = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);

      if (!token || !expiry) {
        return false;
      }

      const expiryTime = parseInt(expiry, 10);
      const isValid = Date.now() < expiryTime;

      // If token is expired, clear it
      if (!isValid) {
        await storageService.clearTokens();
      }

      return isValid;
    } catch (error) {
      console.error('Error checking token validity:', error);
      return false;
    }
  },

  // Clear tokens (logout)
  clearTokens: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
    } catch (error) {
      console.error('Error clearing tokens:', error);
      throw error;
    }
  },

  // Check if user is authenticated (token exists and is valid)
  isAuthenticated: async () => {
    try {
      return await storageService.isTokenValid();
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },
};
