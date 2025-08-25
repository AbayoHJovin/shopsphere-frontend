import axios from 'axios';
import { API_URL } from './constants';

// Create an Axios instance with default configs
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Only add token if we're in the browser
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Also set the default header for this instance
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle different error statuses
    if (error.response?.status === 401) {
      // Unauthorized - token expired or invalid
      const isAuthMeRequest = error.config?.url?.includes('/auth/me');
      
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth') && !isAuthMeRequest) {
        // Clear the invalid token and redirect to login
        localStorage.removeItem('authToken');
        delete apiClient.defaults.headers.common['Authorization'];
        window.location.href = '/auth';
      }
    } else if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission
      console.error('Access forbidden. User may not have required permissions.');
    } else if (error.response?.status === 500) {
      // Server error
      console.error('Server error occurred:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 