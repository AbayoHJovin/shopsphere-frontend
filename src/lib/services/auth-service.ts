import apiClient from "../api-client";
import { API_ENDPOINTS } from "../constants";
import { LoginRequest, LoginResponse, User } from "../types";

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

    // Store the token in localStorage and set headers
    if (response.data.token) {
      localStorage.setItem("authToken", response.data.token);
      // Set the token in axios headers for future requests
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
      // Also set it in the current request headers
      apiClient.defaults.headers.Authorization = `Bearer ${response.data.token}`;
    }

    return response.data;
  },

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear token and headers regardless of API call success
      localStorage.removeItem("authToken");
      delete apiClient.defaults.headers.common["Authorization"];
      delete apiClient.defaults.headers.Authorization;
      // Clear any stored tokens in memory
      if (typeof window !== 'undefined') {
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
      }
    }
  },

  /**
   * Get the current logged in user
   * @returns User data
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    return localStorage.getItem("authToken");
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (token) {
      // Set the token in axios headers for future requests
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      apiClient.defaults.headers.Authorization = `Bearer ${token}`;
      return true;
    }
    return false;
  },

  /**
   * Refresh token headers - useful when token is restored from storage
   */
  refreshTokenHeaders(): void {
    const token = this.getToken();
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      apiClient.defaults.headers.Authorization = `Bearer ${token}`;
    }
  },
};
