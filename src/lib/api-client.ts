import axios from "axios";
import { API_URL } from "./constants";

// Create an Axios instance with default configs
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Only add token if we're in the browser
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("admin_auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Also set the default header for this instance
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthMeRequest = error.config?.url?.includes("/auth/me");

      if (typeof window !== "undefined" && !isAuthMeRequest) {
        // Clear the invalid token
        localStorage.removeItem("admin_auth_token");
        delete apiClient.defaults.headers.common["Authorization"];
        delete apiClient.defaults.headers.Authorization;

        console.log("Token expired or invalid, cleared from storage");
      }
    } else if (error.response?.status === 403) {
      console.error(
        "Access forbidden. User may not have required permissions."
      );
    } else if (error.response?.status === 500) {
      console.error("Server error occurred:", error.response.data);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
