"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/redux/hooks";
import { dashboardService } from "@/lib/services/dashboard-service";
import { UserRole } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  BarChart3,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  AnalyticsResponseDTO,
  AnalyticsRequestDTO,
} from "@/lib/types/dashboard";
import { format } from "date-fns";

// Analytics metric card component
function MetricCard({
  title,
  value,
  icon,
  description,
  trend,
  trendValue,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: number;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="p-1 bg-primary/10 rounded-md text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && trendValue && (
          <div
            className={`flex items-center mt-2 text-xs ${
              trend === "up"
                ? "text-green-600"
                : trend === "down"
                ? "text-red-600"
                : "text-muted-foreground"
            }`}
          >
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : trend === "down" ? (
              <TrendingDown className="h-3 w-3 mr-1" />
            ) : null}
            {trendValue > 0 ? "+" : ""}
            {trendValue}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === UserRole.ADMIN;

  // Date range state
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Start of current month
    to: new Date(), // Today
  });

  // Analytics request
  const analyticsRequest: AnalyticsRequestDTO = {
    startDate: dateRange.from
      ? format(dateRange.from, "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd"),
    endDate: dateRange.to
      ? format(dateRange.to, "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd"),
  };

  // Fetch analytics data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["analytics", analyticsRequest],
    queryFn: () => dashboardService.getAnalyticsData(analyticsRequest),
    enabled: !!dateRange.from && !!dateRange.to,
  });

  const handleDateChange = (from: Date | undefined, to: Date | undefined) => {
    setDateRange({ from, to });
  };

  const handleRefresh = () => {
    refetch();
  };

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
            Failed to load analytics data
          </h2>
          <p className="text-muted-foreground">
            Please try again later or contact support if the issue persists.
          </p>
          <Button onClick={handleRefresh} variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Detailed store performance metrics and insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={(range) => handleDateChange(range?.from, range?.to)}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Button onClick={handleRefresh} variant="outline" size="icon">
            <BarChart3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {data && (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {isAdmin && data.totalRevenue !== null && (
              <MetricCard
                title="Total Revenue"
                value={formatCurrency(data.totalRevenue)}
                icon={<CreditCard className="h-4 w-4" />}
                description="Period revenue"
                trend={
                  data.totalRevenueVsPercent && data.totalRevenueVsPercent > 0
                    ? "up"
                    : "down"
                }
                trendValue={
                  data.totalRevenueVsPercent
                    ? Math.abs(data.totalRevenueVsPercent)
                    : undefined
                }
              />
            )}

            <MetricCard
              title="Total Orders"
              value={data.totalOrders}
              icon={<ShoppingCart className="h-4 w-4" />}
              description="Period orders"
              trend={
                data.totalOrdersVsPercent && data.totalOrdersVsPercent > 0
                  ? "up"
                  : "down"
              }
              trendValue={
                data.totalOrdersVsPercent
                  ? Math.abs(data.totalOrdersVsPercent)
                  : undefined
              }
            />

            <MetricCard
              title="New Customers"
              value={data.newCustomers}
              icon={<Users className="h-4 w-4" />}
              description="Period signups"
              trend={
                data.newCustomersVsPercent && data.newCustomersVsPercent > 0
                  ? "up"
                  : "down"
              }
              trendValue={
                data.newCustomersVsPercent
                  ? Math.abs(data.newCustomersVsPercent)
                  : undefined
              }
            />

            <MetricCard
              title="Active Products"
              value={data.activeProducts}
              icon={<Package className="h-4 w-4" />}
              description="Available products"
              trend={
                data.activeProductsVsPercent && data.activeProductsVsPercent > 0
                  ? "up"
                  : "down"
              }
              trendValue={
                data.activeProductsVsPercent
                  ? Math.abs(data.activeProductsVsPercent)
                  : undefined
              }
            />
          </div>

          {/* Top Products */}
          {data.topProducts && data.topProducts.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
                <CardDescription>
                  Best selling products in the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topProducts.map((product, index) => (
                    <div
                      key={product.productId}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.totalSold} units sold
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary">
                          {formatCurrency(product.totalRevenue)}
                        </p>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category Performance */}
          {data.categoryPerformance && data.categoryPerformance.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>
                  Product categories ranked by performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.categoryPerformance.map((category, index) => (
                    <div
                      key={category.categoryId}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {category.productCount} products
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary">
                          {category.totalSold}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {category.percentageOfTotalSales.toFixed(1)}% of sales
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Data State */}
          {(!data.topProducts || data.topProducts.length === 0) &&
            (!data.categoryPerformance ||
              data.categoryPerformance.length === 0) && (
              <Card className="text-center py-12">
                <CardContent>
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Analytics Data Available
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Analytics data will appear here once you have sufficient
                    activity in the selected period.
                  </p>
                  <Button onClick={handleRefresh} variant="outline">
                    Refresh Data
                  </Button>
                </CardContent>
              </Card>
            )}
        </>
      )}
    </div>
  );
}
