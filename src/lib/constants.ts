// API Base URL
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
// process.env.NEXT_PUBLIC_API_URL || "http://44.201.144.244:8081/api";

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_URL}/v1/auth/users/login`,
    LOGOUT: `${API_URL}/v1/auth/users/logout`,
    ME: `${API_URL}/v1/auth/users/me`,
  },
  DASHBOARD: {
    BASE: `${API_URL}/dashboard`,
  },
  ANALYTICS: {
    BASE: `${API_URL}/analytics`,
  },
  PRODUCTS: {
    BASE: `${API_URL}/v1/products`,
    BY_ID: (id: string) => `${API_URL}/v1/products/${id}`,
  },
  ORDERS: {
    BASE: `${API_URL}/v1/orders`,
    BY_ID: (id: string) => `${API_URL}/v1/orders/${id}`,
  },
  INVITATIONS: {
    BASE: `${API_URL}/v1/admin-invitations`,
    BY_ID: (id: string) => `${API_URL}/v1/admin-invitations/${id}`,
  },
  USERS: {
    BASE: `${API_URL}/v1/users`,
    BY_ID: (id: string) => `${API_URL}/v1/users/${id}`,
  },
  CATEGORIES: {
    BASE: `${API_URL}/v1/categories`,
    BY_ID: (id: string) => `${API_URL}/v1/categories/${id}`,
    SUBCATEGORIES: (id: string) =>
      `${API_URL}/v1/categories/${id}/subcategories`,
  },
  DELIVERY_AREAS: {
    BASE: `${API_URL}/delivery-areas`,
    BY_ID: (id: number) => `${API_URL}/delivery-areas/${id}`,
    TOP_LEVEL: `${API_URL}/delivery-areas/top-level`,
    SUB_AREAS: (parentId: number) =>
      `${API_URL}/delivery-areas/sub-areas/${parentId}`,
  },
};

// User roles - must match backend UserRole enum exactly
export enum UserRole {
  CUSTOMER = "CUSTOMER",
  ADMIN = "ADMIN",
  EMPLOYEE = "EMPLOYEE",
  DELIVERY_AGENT = "DELIVERY_AGENT",
}
