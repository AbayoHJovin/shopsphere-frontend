export const API_URL =
  process.env.NODE_ENV === "production"
    ? "/api/v1"
    : "http://localhost:8080/api/v1";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `/auth/users/login`,
    LOGOUT: `/auth/users/logout`,
    ME: `/auth/users/me`,
  },
  DASHBOARD: {
    BASE: `/dashboard`,
  },
  ANALYTICS: {
    BASE: `/analytics`,
  },
  PRODUCTS: {
    BASE: `/products`,
    BY_ID: (id: string) => `/products/${id}`,
  },
  ORDERS: {
    BASE: `/orders`,
    CREATE: `/orders/create`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
    TRACKING: (id: string) => `/orders/${id}/tracking`,
  },
  ADMIN_ORDERS: {
    BASE: `/admin/orders`,
    ALL: `/admin/orders`,
    SEARCH: `/admin/orders/search`,
    BY_ID: (id: string) => `/admin/orders/${id}`,
    BY_NUMBER: (orderNumber: string) =>
      `/admin/orders/number/${orderNumber}`,
    BY_STATUS: (status: string) =>
      `/admin/orders/status/${status}`,
    UPDATE_STATUS: (id: string) => `/admin/orders/${id}/status`,
    UPDATE_TRACKING: (id: string) =>
      `/admin/orders/${id}/tracking`,
  },
  INVITATIONS: {
    BASE: `/admin-invitations`,
    BY_ID: (id: string) => `/admin-invitations/${id}`,
  },
  USERS: {
    BASE: `/users`,
    BY_ID: (id: string) => `/users/${id}`,
    DELIVERY_AGENTS: `/auth/users/delivery-agents`,
  },
  CATEGORIES: {
    BASE: `/categories`,
    BY_ID: (id: string) => `/categories/${id}`,
    SUBCATEGORIES: (id: string) =>
      `/categories/${id}/subcategories`,
  },
  BRANDS: {
    BASE: `/brands`,
    BY_ID: (id: string) => `/brands/${id}`,
    ACTIVE: `/brands/active`,
    FEATURED: `/brands/featured`,
    SEARCH: `/brands/search`,
  },
  DELIVERY_AREAS: {
    BASE: `/delivery-areas`,
    BY_ID: (id: number) => `/delivery-areas/${id}`,
    TOP_LEVEL: `/delivery-areas/top-level`,
    SUB_AREAS: (parentId: number) =>
      `/delivery-areas/sub-areas/${parentId}`,
  },
  REWARDS: {
    BASE: `/rewards`,
    SYSTEM: `/rewards/system`,
    SYSTEMS: `/rewards/systems`,
    SYSTEM_BY_ID: (id: number) => `/rewards/system/${id}`,
    USER_POINTS: (userId: string) => `/rewards/users/${userId}`,
    USER_CURRENT_POINTS: (userId: string) =>
      `/rewards/users/${userId}/current-points`,
    USER_SUMMARY: (userId: string) =>
      `/rewards/users/${userId}/summary`,
    USER_HISTORY: (userId: string) =>
      `/rewards/users/${userId}/history`,
    CALCULATE_POINTS: `/rewards/calculate-points`,
    POINTS_VALUE: `/rewards/points-value`,
    HAS_ENOUGH_POINTS: (userId: string) =>
      `/rewards/users/${userId}/has-enough-points`,
    POINTS_REQUIRED: `/rewards/products/points-required`,
  },
  RETURNS: {
    BASE: `/returns`,
    ADMIN_ALL: `/returns/admin/all`,
    ADMIN_BY_STATUS: (status: string) => `/returns/admin/status/${status}`,
    ADMIN_GUEST: `/returns/admin/guest`,
    BY_ID: (id: string) => `/returns/${id}`,
    ADMIN_REVIEW: `/returns/admin/review`,
  },
};

// User roles - must match backend UserRole enum exactly
export enum UserRole {
  CUSTOMER = "CUSTOMER",
  ADMIN = "ADMIN",
  EMPLOYEE = "EMPLOYEE",
  DELIVERY_AGENT = "DELIVERY_AGENT",
}
