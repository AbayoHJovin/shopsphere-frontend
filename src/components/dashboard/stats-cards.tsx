"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminDashboardResponse, CoWorkerDashboardResponse, DashboardResponse } from "@/lib/types/dashboard";
import { dashboardService } from "@/lib/services/dashboard-service";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon, UsersIcon, PackageIcon, ShoppingCartIcon, CreditCardIcon, PercentIcon, AlertTriangleIcon, BoxIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

function StatCard({ title, value, description, icon, trend, className = "" }: StatCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="p-1 bg-primary/10 rounded-md text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <span className={`text-xs ${trend.isPositive ? "text-emerald-500" : "text-rose-500"} flex items-center`}>
              {trend.isPositive ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
              {trend.value}
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatsCardsProps {
  data: DashboardResponse | undefined;
  isAdmin: boolean;
}

export function StatsCards({ data, isAdmin }: StatsCardsProps) {
  if (!data) return null;

  const isAdminDashboard = dashboardService.isAdminDashboard(data);
  
  // Shared cards that both admin and co-worker dashboards will show
  const sharedCards = [
    // User stats section
    <StatCard
      key="total-users"
      title="Total Users"
      value={isAdminDashboard ? (data as AdminDashboardResponse).totalUsers : (data as CoWorkerDashboardResponse).totalCustomers + (data as CoWorkerDashboardResponse).totalCoWorkers}
      description="All registered users"
      icon={<UsersIcon className="h-4 w-4" />}
    />,
    <StatCard
      key="total-customers"
      title="Customers"
      value={isAdminDashboard ? (data as AdminDashboardResponse).totalCustomers : (data as CoWorkerDashboardResponse).totalCustomers}
      description="Registered customers"
      icon={<UsersIcon className="h-4 w-4" />}
    />,
    // Product stats section
    <StatCard
      key="total-products"
      title="Products"
      value={isAdminDashboard ? (data as AdminDashboardResponse).totalProducts : (data as CoWorkerDashboardResponse).totalProducts}
      description="Total inventory"
      icon={<PackageIcon className="h-4 w-4" />}
    />,
    <StatCard
      key="out-of-stock"
      title="Out of Stock"
      value={isAdminDashboard ? (data as AdminDashboardResponse).outOfStockProducts : (data as CoWorkerDashboardResponse).outOfStockProducts}
      description="Products with zero stock"
      icon={<AlertTriangleIcon className="h-4 w-4" />}
      className={((isAdminDashboard ? (data as AdminDashboardResponse).outOfStockProducts : (data as CoWorkerDashboardResponse).outOfStockProducts) > 0) ? "border-red-200" : ""}
    />,
    <StatCard
      key="low-stock"
      title="Low Stock"
      value={isAdminDashboard ? (data as AdminDashboardResponse).lowStockProducts : (data as CoWorkerDashboardResponse).lowStockProducts}
      description="Products with low inventory"
      icon={<BoxIcon className="h-4 w-4" />}
      className={((isAdminDashboard ? (data as AdminDashboardResponse).lowStockProducts : (data as CoWorkerDashboardResponse).lowStockProducts) > 0) ? "border-amber-200" : ""}
    />,
    // Order stats
    <StatCard
      key="total-orders"
      title="Total Orders"
      value={isAdminDashboard ? (data as AdminDashboardResponse).totalOrders : (data as CoWorkerDashboardResponse).totalOrders}
      description="All orders placed"
      icon={<ShoppingCartIcon className="h-4 w-4" />}
    />,
    <StatCard
      key="pending-orders"
      title="Pending Orders"
      value={isAdminDashboard ? (data as AdminDashboardResponse).pendingOrders : (data as CoWorkerDashboardResponse).pendingOrders}
      description="Orders awaiting processing"
      icon={<ShoppingCartIcon className="h-4 w-4" />}
    />
  ];

  // Admin-only cards
  const adminCards = isAdmin && isAdminDashboard ? [
    // Admin user stats
    <StatCard
      key="admin-users"
      title="Admin Users"
      value={(data as AdminDashboardResponse).totalAdmins}
      description="Admin accounts"
      icon={<UsersIcon className="h-4 w-4" />}
    />,
    <StatCard
      key="co-workers"
      title="Co-Workers"
      value={(data as AdminDashboardResponse).totalCoWorkers}
      description="Staff accounts"
      icon={<UsersIcon className="h-4 w-4" />}
    />,
    <StatCard
      key="new-users"
      title="New Users"
      value={(data as AdminDashboardResponse).newUsersThisMonth}
      description="Joined this month"
      icon={<UsersIcon className="h-4 w-4" />}
    />,
    // Admin revenue stats
    <StatCard
      key="total-revenue"
      title="Total Revenue"
      value={formatCurrency((data as AdminDashboardResponse).totalRevenue)}
      description="All-time earnings"
      icon={<CreditCardIcon className="h-4 w-4" />}
    />,
    <StatCard
      key="month-revenue"
      title="Monthly Revenue"
      value={formatCurrency((data as AdminDashboardResponse).revenueThisMonth)}
      description="Current month"
      icon={<CreditCardIcon className="h-4 w-4" />}
      trend={{
        value: `${Math.abs((data as AdminDashboardResponse).revenueLastMonth > 0 
          ? (((data as AdminDashboardResponse).revenueThisMonth - (data as AdminDashboardResponse).revenueLastMonth) / (data as AdminDashboardResponse).revenueLastMonth) * 100 
          : 0).toFixed(1)}%`,
        isPositive: (data as AdminDashboardResponse).revenueThisMonth >= (data as AdminDashboardResponse).revenueLastMonth
      }}
    />,
    <StatCard
      key="avg-order"
      title="Avg. Order Value"
      value={formatCurrency((data as AdminDashboardResponse).averageOrderValue)}
      description="Per transaction"
      icon={<CreditCardIcon className="h-4 w-4" />}
    />,
    // Cart stats
    <StatCard
      key="active-carts"
      title="Active Carts"
      value={(data as AdminDashboardResponse).activeCartsCount}
      description="Unpurchased items"
      icon={<ShoppingCartIcon className="h-4 w-4" />}
    />,
    <StatCard
      key="cart-value"
      title="Cart Value"
      value={formatCurrency((data as AdminDashboardResponse).totalCartValue)}
      description="Potential revenue"
      icon={<ShoppingCartIcon className="h-4 w-4" />}
    />,
    <StatCard
      key="abandonment"
      title="Abandonment Rate"
      value={`${((data as AdminDashboardResponse).cartAbandonmentRate * 100).toFixed(1)}%`}
      description="Carts abandoned"
      icon={<PercentIcon className="h-4 w-4" />}
    />
  ] : [];

  // Co-worker specific cards
  const coWorkerCards = !isAdmin && !isAdminDashboard ? [
    <StatCard
      key="delivered-orders"
      title="Delivered Orders"
      value={(data as CoWorkerDashboardResponse).deliveredOrders}
      description="Completed deliveries"
      icon={<ShoppingCartIcon className="h-4 w-4" />}
    />,
    <StatCard
      key="shipped-orders"
      title="Shipped Orders"
      value={(data as CoWorkerDashboardResponse).shippedOrders}
      description="In transit"
      icon={<ShoppingCartIcon className="h-4 w-4" />}
    />
  ] : [];

  // Combine all applicable cards
  const allCards = [...sharedCards, ...(adminCards || []), ...(coWorkerCards || [])];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
      {allCards}
    </div>
  );
} 