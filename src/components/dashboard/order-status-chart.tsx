"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { AdminDashboardResponse, CoWorkerDashboardResponse, DashboardResponse } from "@/lib/types/dashboard";
import { dashboardService } from "@/lib/services/dashboard-service";

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

// Updated colors to be more distinct
const COLORS = {
  DELIVERED: "hsl(143, 85%, 40%)",  // Green
  DELIVERING: "hsl(43, 100%, 50%)", // Yellow
  PENDING: "hsl(210, 100%, 56%)",   // Blue
  CANCELLED: "hsl(0, 84%, 60%)",    // Red
  SHIPPED: "hsl(280, 85%, 60%)"     // Purple
};

interface OrderStatusChartProps {
  data: DashboardResponse | undefined;
}

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  if (!data) return null;

  const isAdmin = dashboardService.isAdminDashboard(data);
  
  let chartData: ChartDataItem[] = [];
  let totalOrders = 0;
  
  if (isAdmin) {
    const adminData = data as AdminDashboardResponse;
    totalOrders = adminData.totalOrders || 0;
    
    if (totalOrders > 0) {
      chartData = [
        { 
          name: "Delivered", 
          value: adminData.deliveredOrders, // Use actual counts, not percentages
          color: COLORS.DELIVERED 
        },
        { 
          name: "Delivering", 
          value: adminData.deliveringOrders,
          color: COLORS.DELIVERING 
        },
        { 
          name: "Pending", 
          value: adminData.pendingOrders,
          color: COLORS.PENDING 
        },
        { 
          name: "Cancelled", 
          value: adminData.cancelledOrders,
          color: COLORS.CANCELLED 
        }
      ].filter(item => item.value > 0); // Only show statuses with values
    }
  } else {
    const coworkerData = data as CoWorkerDashboardResponse;
    
    // If co-worker data has orderStatsByStatus, use it
    if (coworkerData.orderStatsByStatus) {
      // Use actual count values from the orderStatsByStatus object
      const statuses = Object.entries(coworkerData.orderStatsByStatus);
      chartData = statuses
        .filter(([_, count]) => count > 0)
        .map(([status, count]) => {
          const statusName = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
          const statusColor = COLORS[status.toUpperCase() as keyof typeof COLORS] || `hsl(${status.length * 60}, 70%, 50%)`;
          
          return {
            name: statusName,
            value: count, // Use actual count, not percentage
            color: statusColor
          };
        });
      
      totalOrders = coworkerData.totalOrders || 0;
    } else {
      // Use delivered, pending, shipped counts if available
      totalOrders = coworkerData.totalOrders || 0;
      
      if (totalOrders > 0) {
        chartData = [
          { 
            name: "Delivered", 
            value: coworkerData.deliveredOrders,
            color: COLORS.DELIVERED 
          },
          { 
            name: "Shipped", 
            value: coworkerData.shippedOrders,
            color: COLORS.SHIPPED 
          },
          { 
            name: "Pending", 
            value: coworkerData.pendingOrders,
            color: COLORS.PENDING 
          }
        ].filter(item => item.value > 0);
      }
    }
  }
  
  // If no data, show empty state
  if (chartData.length === 0) {
    return (
      <Card className="col-span-4 lg:col-span-3">
        <CardHeader className="border-b border-border/50 bg-primary/5">
          <CardTitle className="text-primary">Order Status Distribution</CardTitle>
          <CardDescription>No order data available</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 flex items-center justify-center min-h-[300px]">
          <div className="text-center text-muted-foreground">
            <p>No orders have been placed yet.</p>
            <p className="mt-1 text-sm">Order status distribution will appear here once orders are placed.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate sum of all values for percentage in tooltip
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="col-span-4 lg:col-span-3">
      <CardHeader className="border-b border-border/50 bg-primary/5">
        <CardTitle className="text-primary">Order Status Distribution</CardTitle>
        <CardDescription>
          {totalOrders > 0 ? `${totalOrders} total orders` : 'No orders yet'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                innerRadius={60}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                height={40}
                formatter={(value) => (
                  <span className="text-xs font-medium">{value}</span>
                )}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  const percentage = Math.round((value / total) * 100);
                  return [`${value} orders (${percentage}%)`, name];
                }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  fontSize: "12px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 