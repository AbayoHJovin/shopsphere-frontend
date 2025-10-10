// API Base URL
export const API_URL =
  process.env.NODE_ENV === "production"
    ? "/api/v1"
    : "http://localhost:8080/api/v1";
// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_URL}/auth/users/login`,
    LOGOUT: `${API_URL}/auth/users/logout`,
    ME: `${API_URL}/auth/users/me`,
  },
  DASHBOARD: {
    BASE: `${API_URL}/dashboard`,
  },
  ANALYTICS: {
    BASE: `${API_URL}/analytics`,
  },
  PRODUCTS: {
    BASE: `${API_URL}/products`,
    BY_ID: (id: string) => `${API_URL}/products/${id}`,
  },
  ORDERS: {
    BASE: `${API_URL}/orders`,
    CREATE: `${API_URL}/orders/create`,
    CANCEL: (id: string) => `${API_URL}/orders/${id}/cancel`,
    TRACKING: (id: string) => `${API_URL}/orders/${id}/tracking`,
  },
  ADMIN_ORDERS: {
    BASE: `${API_URL}/admin/orders`,
    ALL: `${API_URL}/admin/orders`,
    SEARCH: `${API_URL}/admin/orders/search`,
    BY_ID: (id: string) => `${API_URL}/admin/orders/${id}`,
    BY_NUMBER: (orderNumber: string) =>
      `${API_URL}/admin/orders/number/${orderNumber}`,
    BY_STATUS: (status: string) =>
      `${API_URL}/admin/orders/status/${status}`,
    UPDATE_STATUS: (id: string) => `${API_URL}/admin/orders/${id}/status`,
    UPDATE_TRACKING: (id: string) =>
      `${API_URL}/admin/orders/${id}/tracking`,
  },
  INVITATIONS: {
    BASE: `${API_URL}/admin-invitations`,
    BY_ID: (id: string) => `${API_URL}/admin-invitations/${id}`,
  },
  USERS: {
    BASE: `${API_URL}/users`,
    BY_ID: (id: string) => `${API_URL}/users/${id}`,
    DELIVERY_AGENTS: `${API_URL}/auth/users/delivery-agents`,
  },
  CATEGORIES: {
    BASE: `${API_URL}/categories`,
    BY_ID: (id: string) => `${API_URL}/categories/${id}`,
    SUBCATEGORIES: (id: string) =>
      `${API_URL}/categories/${id}/subcategories`,
  },
  BRANDS: {
    BASE: `${API_URL}/brands`,
    BY_ID: (id: string) => `${API_URL}/brands/${id}`,
    ACTIVE: `${API_URL}/brands/active`,
    FEATURED: `${API_URL}/brands/featured`,
    SEARCH: `${API_URL}/brands/search`,
  },
  DELIVERY_AREAS: {
    BASE: `${API_URL}/delivery-areas`,
    BY_ID: (id: number) => `${API_URL}/delivery-areas/${id}`,
    TOP_LEVEL: `${API_URL}/delivery-areas/top-level`,
    SUB_AREAS: (parentId: number) =>
      `${API_URL}/delivery-areas/sub-areas/${parentId}`,
  },
  REWARDS: {
    BASE: `${API_URL}/rewards`,
    SYSTEM: `${API_URL}/rewards/system`,
    SYSTEMS: `${API_URL}/rewards/systems`,
    SYSTEM_BY_ID: (id: number) => `${API_URL}/rewards/system/${id}`,
    USER_POINTS: (userId: string) => `${API_URL}/rewards/users/${userId}`,
    USER_CURRENT_POINTS: (userId: string) =>
      `${API_URL}/rewards/users/${userId}/current-points`,
    USER_SUMMARY: (userId: string) =>
      `${API_URL}/rewards/users/${userId}/summary`,
    USER_HISTORY: (userId: string) =>
      `${API_URL}/rewards/users/${userId}/history`,
    CALCULATE_POINTS: `${API_URL}/rewards/calculate-points`,
    POINTS_VALUE: `${API_URL}/rewards/points-value`,
    HAS_ENOUGH_POINTS: (userId: string) =>
      `${API_URL}/rewards/users/${userId}/has-enough-points`,
    POINTS_REQUIRED: `${API_URL}/rewards/products/points-required`,
  },
  RETURNS: {
    BASE: `${API_URL}/returns`,
    ADMIN_ALL: `${API_URL}/returns/admin/all`,
    ADMIN_BY_STATUS: (status: string) => `${API_URL}/returns/admin/status/${status}`,
    ADMIN_GUEST: `${API_URL}/returns/admin/guest`,
    BY_ID: (id: string) => `${API_URL}/returns/${id}`,
    ADMIN_REVIEW: `${API_URL}/returns/admin/review`,
  },
};

// User roles - must match backend UserRole enum exactly
export enum UserRole {
  CUSTOMER = "CUSTOMER",
  ADMIN = "ADMIN",
  EMPLOYEE = "EMPLOYEE",
  DELIVERY_AGENT = "DELIVERY_AGENT",
}
