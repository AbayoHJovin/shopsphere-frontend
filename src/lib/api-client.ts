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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, redirect to login only if not trying to check auth
    if (error.response?.status === 401) {
      // Don't redirect if the request was to the ME endpoint
      const isAuthMeRequest = error.config?.url?.includes('/auth/me');
      
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth') && !isAuthMeRequest) {
        window.location.href = '/auth';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 