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
    const response = await apiClient.post<any>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    // Handle the new response structure from backend
    let loginData: LoginResponse;
    if (response.data.success && response.data.data) {
      // New structure: { success: true, data: { token, userName, ... }, message: "..." }
      loginData = response.data.data;
    } else {
      // Old structure: { token, userName, ... }
      loginData = response.data;
    }

    // Store the token in localStorage and set headers
    if (loginData.token) {
      localStorage.setItem("authToken", loginData.token);
      // Set the token in axios headers for future requests
      apiClient.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${loginData.token}`;
      // Also set it in the current request headers
      apiClient.defaults.headers.Authorization = `Bearer ${loginData.token}`;
    }

    return loginData;
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
      if (typeof window !== "undefined") {
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
    const response = await apiClient.get<any>(API_ENDPOINTS.AUTH.ME);

    // Handle the new response structure from backend
    let userData: User;
    if (response.data.success && response.data.data) {
      // New structure: { success: true, data: { ... }, message: "..." }
      userData = response.data.data;
    } else {
      // Old structure: { ... }
      userData = response.data;
    }

    return userData;
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
