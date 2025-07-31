"use client";

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/lib/redux/hooks';
import { dashboardService } from '@/lib/services/dashboard-service';
import { UserRole } from '@/lib/constants';
import { 
  RevenueChart,
  OrderStatusChart,
  TopProducts,
  ProductCategories
} from '@/components/dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  UsersIcon,
  PackageIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  BarChart,
  PieChart,
  LineChart,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AdminDashboardResponse, CoWorkerDashboardResponse } from '@/lib/types/dashboard';

// Analytics metric card component
function MetricCard({ title, value, icon, description }: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="p-1 bg-primary/10 rounded-md text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { user } = useAppSelector(state => state.auth);
  const isAdmin = user?.role === UserRole.ADMIN;

  // Fetch dashboard data
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
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
          <h2 className="text-2xl font-semibold">Failed to load analytics data</h2>
          <p className="text-muted-foreground">Please try again later or contact support if the issue persists.</p>
        </div>
      </div>
    );
  }

  const isAdminDashboard = data ? dashboardService.isAdminDashboard(data) : false;
  
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">Detailed store performance metrics and insights</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-3 md:grid-cols-4 lg:w-[600px] mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          {isAdmin && <TabsTrigger value="revenue">Revenue</TabsTrigger>}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard 
              title="Total Orders" 
              value={isAdminDashboard 
                ? (data as AdminDashboardResponse).totalOrders 
                : (data as CoWorkerDashboardResponse).totalOrders}
              icon={<ShoppingCartIcon className="h-4 w-4" />}
              description="All-time orders"
            />
            
            <MetricCard 
              title="Total Products" 
              value={isAdminDashboard 
                ? (data as AdminDashboardResponse).totalProducts 
                : (data as CoWorkerDashboardResponse).totalProducts}
              icon={<PackageIcon className="h-4 w-4" />}
              description="Catalog size"
            />
            
            <MetricCard 
              title="Total Users" 
              value={isAdminDashboard 
                ? (data as AdminDashboardResponse).totalUsers 
                : (data as CoWorkerDashboardResponse).totalCustomers + (data as CoWorkerDashboardResponse).totalCoWorkers}
              icon={<UsersIcon className="h-4 w-4" />}
              description="Registered accounts"
            />
            
            {isAdmin && isAdminDashboard && (
              <MetricCard 
                title="Total Revenue" 
                value={formatCurrency((data as AdminDashboardResponse).totalRevenue)}
                icon={<CreditCardIcon className="h-4 w-4" />}
                description="All-time sales"
              />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-8 gap-4 mt-6">
            {isAdmin && <RevenueChart data={data} isAdmin={isAdmin} />}
            <OrderStatusChart data={data} />
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <UsersIcon className="mr-2 h-5 w-5" />
              User Metrics
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard 
                title="Total Users" 
                value={isAdminDashboard 
                  ? (data as AdminDashboardResponse).totalUsers 
                  : (data as CoWorkerDashboardResponse).totalCustomers + (data as CoWorkerDashboardResponse).totalCoWorkers}
                icon={<UsersIcon className="h-4 w-4" />}
                description="All registered accounts"
              />
              
              <MetricCard 
                title="Customers" 
                value={isAdminDashboard 
                  ? (data as AdminDashboardResponse).totalCustomers 
                  : (data as CoWorkerDashboardResponse).totalCustomers}
                icon={<UsersIcon className="h-4 w-4" />}
                description="Customer accounts"
              />
              
              {isAdmin && isAdminDashboard && (
                <>
                  <MetricCard 
                    title="Administrators" 
                    value={(data as AdminDashboardResponse).totalAdmins}
                    icon={<UsersIcon className="h-4 w-4" />}
                    description="Admin accounts"
                  />
                  
                  <MetricCard 
                    title="Co-Workers" 
                    value={(data as AdminDashboardResponse).totalCoWorkers}
                    icon={<UsersIcon className="h-4 w-4" />}
                    description="Staff accounts"
                  />
                  
                  <MetricCard 
                    title="New Users (Month)" 
                    value={(data as AdminDashboardResponse).newUsersThisMonth}
                    icon={<UsersIcon className="h-4 w-4" />}
                    description="Joined this month"
                  />
                </>
              )}
            </div>
            
            {/* Could add a user growth chart here */}
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                  <CardDescription>Breakdown of user accounts by type</CardDescription>
                </CardHeader>
                <CardContent className="py-4">
                  <div className="h-[300px]">
                    {/* Placeholder for user distribution chart */}
                    <div className="flex items-center justify-center h-full">
                      <PieChart className="h-16 w-16 text-muted-foreground/50" />
                      <p className="text-muted-foreground ml-4">User distribution chart will be implemented here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <PackageIcon className="mr-2 h-5 w-5" />
              Product Metrics
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard 
                title="Total Products" 
                value={isAdminDashboard 
                  ? (data as AdminDashboardResponse).totalProducts 
                  : (data as CoWorkerDashboardResponse).totalProducts}
                icon={<PackageIcon className="h-4 w-4" />}
                description="Catalog size"
              />
              
              <MetricCard 
                title="Out of Stock" 
                value={isAdminDashboard 
                  ? (data as AdminDashboardResponse).outOfStockProducts 
                  : (data as CoWorkerDashboardResponse).outOfStockProducts}
                icon={<PackageIcon className="h-4 w-4" />}
                description="Need reordering"
              />
              
              <MetricCard 
                title="Low Stock" 
                value={isAdminDashboard 
                  ? (data as AdminDashboardResponse).lowStockProducts 
                  : (data as CoWorkerDashboardResponse).lowStockProducts}
                icon={<PackageIcon className="h-4 w-4" />}
                description="Running low"
              />
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopProducts data={data} />
            <ProductCategories data={data} />
          </div>
        </TabsContent>

        {/* Revenue Tab - Admin Only */}
        {isAdmin && (
          <TabsContent value="revenue" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <CreditCardIcon className="mr-2 h-5 w-5" />
                Revenue Metrics
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard 
                  title="Total Revenue" 
                  value={formatCurrency((data as AdminDashboardResponse).totalRevenue)}
                  icon={<CreditCardIcon className="h-4 w-4" />}
                  description="All-time earnings"
                />
                
                <MetricCard 
                  title="Current Month" 
                  value={formatCurrency((data as AdminDashboardResponse).revenueThisMonth)}
                  icon={<CreditCardIcon className="h-4 w-4" />}
                  description="This month's revenue"
                />
                
                <MetricCard 
                  title="Previous Month" 
                  value={formatCurrency((data as AdminDashboardResponse).revenueLastMonth)}
                  icon={<CreditCardIcon className="h-4 w-4" />}
                  description="Last month's revenue"
                />
                
                <MetricCard 
                  title="Avg. Order Value" 
                  value={formatCurrency((data as AdminDashboardResponse).averageOrderValue)}
                  icon={<CreditCardIcon className="h-4 w-4" />}
                  description="Per transaction"
                />
              </div>
            </div>
            
            <RevenueChart data={data} isAdmin={isAdmin} />
            
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <ShoppingCartIcon className="mr-2 h-5 w-5" />
                Cart Analytics
              </h3>
              
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard 
                  title="Active Carts" 
                  value={(data as AdminDashboardResponse).activeCartsCount}
                  icon={<ShoppingCartIcon className="h-4 w-4" />}
                  description="Unpurchased items"
                />
                
                <MetricCard 
                  title="Cart Value" 
                  value={formatCurrency((data as AdminDashboardResponse).totalCartValue)}
                  icon={<ShoppingCartIcon className="h-4 w-4" />}
                  description="Potential revenue"
                />
                
                <MetricCard 
                  title="Abandonment Rate" 
                  value={`${((data as AdminDashboardResponse).cartAbandonmentRate * 100).toFixed(1)}%`}
                  icon={<BarChart className="h-4 w-4" />}
                  description="Carts abandoned"
                />
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Detailed view of revenue sources</CardDescription>
              </CardHeader>
              <CardContent className="py-4">
                <div className="h-[300px]">
                  {/* Placeholder for revenue breakdown chart */}
                  <div className="flex items-center justify-center h-full">
                    <LineChart className="h-16 w-16 text-muted-foreground/50" />
                    <p className="text-muted-foreground ml-4">Revenue breakdown chart will be implemented here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
} 