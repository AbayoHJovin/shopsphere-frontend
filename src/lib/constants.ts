// API Base URL
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
// process.env.NEXT_PUBLIC_API_URL || "http://44.201.73.159:8081/api";

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
    BY_ID: (id: string) => `${API_URL}/products/${id}`,
  },
  ORDERS: {
    BASE: `${API_URL}/v1/orders`,
    CREATE: `${API_URL}/v1/orders/create`,
    CANCEL: (id: string) => `${API_URL}/v1/orders/${id}/cancel`,
    TRACKING: (id: string) => `${API_URL}/v1/orders/${id}/tracking`,
  },
  ADMIN_ORDERS: {
    BASE: `${API_URL}/v1/admin/orders`,
    ALL: `${API_URL}/v1/admin/orders`,
    BY_ID: (id: string) => `${API_URL}/v1/admin/orders/${id}`,
    BY_NUMBER: (orderNumber: string) =>
      `${API_URL}/v1/admin/orders/number/${orderNumber}`,
    BY_STATUS: (status: string) =>
      `${API_URL}/v1/admin/orders/status/${status}`,
    UPDATE_STATUS: (id: string) => `${API_URL}/v1/admin/orders/${id}/status`,
    UPDATE_TRACKING: (id: string) =>
      `${API_URL}/v1/admin/orders/${id}/tracking`,
  },
  INVITATIONS: {
    BASE: `${API_URL}/v1/admin-invitations`,
    BY_ID: (id: string) => `${API_URL}/v1/admin-invitations/${id}`,
  },
  USERS: {
    BASE: `${API_URL}/v1/users`,
    BY_ID: (id: string) => `${API_URL}/v1/users/${id}`,
    DELIVERY_AGENTS: `${API_URL}/v1/auth/users/delivery-agents`,
  },
  CATEGORIES: {
    BASE: `${API_URL}/v1/categories`,
    BY_ID: (id: string) => `${API_URL}/v1/categories/${id}`,
    SUBCATEGORIES: (id: string) =>
      `${API_URL}/v1/categories/${id}/subcategories`,
  },
  BRANDS: {
    BASE: `${API_URL}/v1/brands`,
    BY_ID: (id: string) => `${API_URL}/v1/brands/${id}`,
    ACTIVE: `${API_URL}/v1/brands/active`,
    FEATURED: `${API_URL}/v1/brands/featured`,
    SEARCH: `${API_URL}/v1/brands/search`,
  },
  DELIVERY_AREAS: {
    BASE: `${API_URL}/delivery-areas`,
    BY_ID: (id: number) => `${API_URL}/delivery-areas/${id}`,
    TOP_LEVEL: `${API_URL}/delivery-areas/top-level`,
    SUB_AREAS: (parentId: number) =>
      `${API_URL}/delivery-areas/sub-areas/${parentId}`,
  },
  REWARDS: {
    BASE: `${API_URL}/v1/rewards`,
    SYSTEM: `${API_URL}/v1/rewards/system`,
    SYSTEMS: `${API_URL}/v1/rewards/systems`,
    SYSTEM_BY_ID: (id: number) => `${API_URL}/v1/rewards/system/${id}`,
    USER_POINTS: (userId: string) => `${API_URL}/v1/rewards/users/${userId}`,
    USER_CURRENT_POINTS: (userId: string) =>
      `${API_URL}/v1/rewards/users/${userId}/current-points`,
    USER_SUMMARY: (userId: string) =>
      `${API_URL}/v1/rewards/users/${userId}/summary`,
    USER_HISTORY: (userId: string) =>
      `${API_URL}/v1/rewards/users/${userId}/history`,
    CALCULATE_POINTS: `${API_URL}/v1/rewards/calculate-points`,
    POINTS_VALUE: `${API_URL}/v1/rewards/points-value`,
    HAS_ENOUGH_POINTS: (userId: string) =>
      `${API_URL}/v1/rewards/users/${userId}/has-enough-points`,
    POINTS_REQUIRED: `${API_URL}/v1/rewards/products/points-required`,
  },
};

// User roles - must match backend UserRole enum exactly
export enum UserRole {
  CUSTOMER = "CUSTOMER",
  ADMIN = "ADMIN",
  EMPLOYEE = "EMPLOYEE",
  DELIVERY_AGENT = "DELIVERY_AGENT",
}
