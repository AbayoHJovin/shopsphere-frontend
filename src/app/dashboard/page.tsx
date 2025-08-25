"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/redux/hooks";
import { dashboardService } from "@/lib/services/dashboard-service";
import { UserRole } from "@/lib/constants";
import {
  RevenueChart,
  OrderStatusChart,
  Alerts,
  TopProducts,
} from "@/components/dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardResponseDTO } from "@/lib/types/dashboard";
import Link from "next/link";
import {
  ArrowUpRight,
  Package,
  ShoppingCart,
  Users,
  CreditCard,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Simplified stat card for dashboard overview
function StatCard({
  title,
  value,
  icon,
  description,
  className = "",
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="p-1 bg-primary/10 rounded-md text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === UserRole.ADMIN;

  // Fetch dashboard data using TanStack Query
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardService.getDashboardData,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-2">
          <h2 className="text-2xl font-semibold">
            Failed to load dashboard data
          </h2>
          <p className="text-muted-foreground">
            Please try again later or contact support if the issue persists.
          </p>
        </div>
      </div>
    );
  }

  // Check if user has access to revenue data (ADMIN only)
  const hasRevenueAccess = data
    ? dashboardService.hasRevenueAccess(data)
    : false;

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {user?.username}! Here's a quick overview.
          </p>
        </div>

        <Link href="/dashboard/analytics">
          <Button variant="outline" className="gap-2">
            <span>View Detailed Analytics</span>
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Key stats - using backend DashboardResponseDTO structure */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Orders"
          value={data?.totalOrders || 0}
          icon={<ShoppingCart className="h-4 w-4" />}
          description="All orders placed"
        />

        <StatCard
          title="Total Products"
          value={data?.totalProducts || 0}
          icon={<Package className="h-4 w-4" />}
          description="Product catalog size"
        />

        <StatCard
          title="Total Customers"
          value={data?.totalCustomers || 0}
          icon={<Users className="h-4 w-4" />}
          description="Registered accounts"
        />

        {isAdmin && hasRevenueAccess && (
          <StatCard
            title="Total Revenue"
            value={formatCurrency(data?.totalRevenue || 0)}
            icon={<CreditCard className="h-4 w-4" />}
            description="All time revenue"
          />
        )}
      </div>

      {/* Alerts - Important for quick action */}
      <div className="mb-6">
        <Alerts data={data} />
      </div>

      {/* Primary charts and data */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="lg:col-span-3">
          {isAdmin && hasRevenueAccess && (
            <RevenueChart data={data} isAdmin={isAdmin} />
          )}
        </div>

        <div className="lg:col-span-1">
          <OrderStatusChart data={data} />
        </div>
      </div>

      {/* Top products - most useful quick data */}
      <div className="mb-6">
        <TopProducts data={data} />
      </div>

      <div className="text-center text-muted-foreground text-sm mt-12">
        <p>
          For more detailed metrics and reports, visit the{" "}
          <Link
            href="/dashboard/analytics"
            className="text-primary hover:underline"
          >
            Analytics
          </Link>{" "}
          page.
        </p>
      </div>
    </div>
  );
}
