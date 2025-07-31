// API Base URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_URL}/auth/login`,
    LOGOUT: `${API_URL}/auth/logout`,
    ME: `${API_URL}/auth/me`,
  },
  DASHBOARD: {
    BASE: `${API_URL}/dashboard`,
  },
  PRODUCTS: {
    BASE: `${API_URL}/products`,
    BY_ID: (id: string) => `${API_URL}/products/${id}`,
  },
  ORDERS: {
    BASE: `${API_URL}/orders`,
    BY_ID: (id: string) => `${API_URL}/orders/${id}`,
  },
  INVITATIONS: {
    BASE: `${API_URL}/invitations`,
    BY_ID: (id: string) => `${API_URL}/invitations/${id}`,
  },
  USERS: {
    BASE: `${API_URL}/users`,
    BY_ID: (id: string) => `${API_URL}/users/${id}`,
  },
  CATEGORIES: {
    BASE: `${API_URL}/categories`,
    BY_ID: (id: string) => `${API_URL}/categories/${id}`,
    SUBCATEGORIES: (id: string) => `${API_URL}/categories/${id}/subcategories`,
  },
};

// User roles
export enum UserRole {
  ADMIN = 'ADMIN',
  CO_WORKER = 'CO_WORKER',
  CUSTOMER = 'CUSTOMER',
} 