"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminDashboardResponse, CoWorkerDashboardResponse, DashboardResponse } from "@/lib/types/dashboard";
import { dashboardService } from "@/lib/services/dashboard-service";
import { formatCurrency } from "@/lib/utils";
import { Info } from "lucide-react";

interface RevenueChartProps {
  data: DashboardResponse | undefined;
  isAdmin: boolean;
}

export function RevenueChart({ data, isAdmin }: RevenueChartProps) {
  // If no data or not admin, don't render this component
  if (!data || !isAdmin) return null;
  
  const adminData = data as AdminDashboardResponse;
  
  // Extract revenue data directly from API response
  const chartData = adminData.revenueByMonth || [];
  
  // Check if we have any non-zero data
  const hasData = chartData.some(item => Number(item.revenue) > 0);
  
  // If no data available, show empty state
  if (!hasData || chartData.length === 0) {
    return (
      <Card className="col-span-4 lg:col-span-5">
        <CardHeader className="border-b border-border/50 bg-primary/5">
          <CardTitle className="text-primary">Revenue Trend</CardTitle>
          <CardDescription>No revenue data available</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 flex items-center justify-center min-h-[300px]">
          <div className="text-center text-muted-foreground">
            <div className="flex justify-center mb-2">
              <Info className="h-6 w-6" />
            </div>
            <p>No revenue has been recorded yet.</p>
            <p className="mt-1 text-sm">Revenue chart will appear once orders are completed.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatTooltipCurrency = (value: number) => {
    return formatCurrency(value);
  };

  // Calculate appropriate Y-axis format based on revenue amounts
  const maxRevenue = Math.max(...chartData.map(item => Number(item.revenue || 0)));
  const tickFormatter = (value: number) => {
    if (maxRevenue >= 1000000) {
      return `$${value / 1000000}M`;
    } else if (maxRevenue >= 1000) {
      return `$${value / 1000}k`;
    } else {
      return `$${value}`;
    }
  };

  return (
    <Card className="col-span-4 lg:col-span-5">
      <CardHeader className="border-b border-border/50 bg-primary/5">
        <CardTitle className="text-primary">Revenue Trend</CardTitle>
        <CardDescription>
          {adminData.revenueThisMonth > 0 
            ? `Current month: ${formatCurrency(adminData.revenueThisMonth)}`
            : 'Monthly revenue overview'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 pt-6">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData.map(item => ({
                month: item.month,
                revenue: Number(item.revenue || 0)
              }))}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={tickFormatter}
              />
              <Tooltip
                formatter={(value: number) => formatTooltipCurrency(value)}
                labelFormatter={(label) => `Month: ${label}`}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "white", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 