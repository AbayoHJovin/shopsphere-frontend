import apiClient from '../api-client';
import { API_ENDPOINTS } from '../constants';
import { LoginRequest, LoginResponse, User } from '../types';

/**
 * Authentication service for API calls
 */
export const authService = {
  /**
   * Login with email and password
   * @param credentials User credentials
   * @returns User data with auth details
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN, 
      credentials
    );
    return response.data;
  },

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },
  
  /**
   * Get the current logged in user
   * @returns User data
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
    return response.data;
  }
}; 