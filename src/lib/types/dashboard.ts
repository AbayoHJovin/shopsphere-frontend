// Backend DTOs - matching exactly with DashboardResponseDTO
export interface RecentOrderDTO {
  orderId: number;
  status: string; // Order.OrderStatus enum
  amount: number;
  owner: string; // user full name or "guest"
}

export interface AlertsDTO {
  lowStockProducts: number;
  pendingOrders: number;
}

export interface DashboardResponseDTO {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number | null; // Only for ADMIN; null for others
  totalCustomers: number;
  recentOrders: RecentOrderDTO[];
  alerts: AlertsDTO;
}

// Analytics DTOs - matching exactly with AnalyticsResponseDTO
export interface TopProductDTO {
  productId: string;
  name: string;
  totalSold: number;
  totalRevenue: number;
}

export interface CategoryPerformanceDTO {
  categoryId: string;
  name: string;
  productCount: number;
  totalSold: number;
  percentageOfTotalSales: number;
}

export interface AnalyticsResponseDTO {
  totalRevenue: number | null; // admin only
  totalRevenueVsPercent: number | null;

  totalOrders: number;
  totalOrdersVsPercent: number | null;

  newCustomers: number;
  newCustomersVsPercent: number | null;

  activeProducts: number;
  activeProductsVsPercent: number | null;

  topProducts: TopProductDTO[];
  categoryPerformance: CategoryPerformanceDTO[];
}

export interface AnalyticsRequestDTO {
  startDate: string;
  endDate: string;
}

// Legacy types for backward compatibility (can be removed later)
export interface ProductSummary {
  productId: string;
  name: string;
  imageUrl: string;
  price: number;
  previousPrice: number | null;
  totalSold: number;
  totalRevenue: number;
  stock: number;
  averageRating: number;
  ratingCount: number;
  colorCount: number;
  sizeCount: number;
}

export interface CategorySummary {
  categoryId: string;
  name: string;
  productCount: number;
  hasSubcategories: boolean;
  totalSold: number;
  percentageOfTotalSales: number;
}

export interface AdminDashboardResponse {
  // User statistics
  totalUsers: number;
  totalCustomers: number;
  totalAdmins: number;
  totalCoWorkers: number;
  newUsersThisMonth: number;

  // Product statistics
  totalProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  topSellingProducts: ProductSummary[];
  categoriesDistribution: CategorySummary[];

  // Order statistics
  totalOrders: number;
  pendingOrders: number;
  deliveringOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  ordersThisMonth: number;

  // Revenue statistics
  totalRevenue: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  averageOrderValue: number;
  revenueByMonth: Array<Record<string, any>>;

  // Cart statistics
  activeCartsCount: number;
  totalCartValue: number;
  cartAbandonmentRate: number;
}

export interface CoWorkerDashboardResponse {
  totalCustomers: number;
  totalCoWorkers: number;
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalOrders: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  orderStatsByStatus: Record<string, number>;
  topSellingProducts: ProductSummary[];
  categoryDistribution: CategorySummary[];
}

export type DashboardResponse =
  | AdminDashboardResponse
  | CoWorkerDashboardResponse;
