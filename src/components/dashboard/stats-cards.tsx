"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  Package2,
  ShoppingBag,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
}: StatCardProps) {
  return (
    <Card className="overflow-hidden border-border/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-primary/5">
        <CardTitle className="text-sm font-medium text-primary">{title}</CardTitle>
        <div className="h-5 w-5 text-primary">{icon}</div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            {trend.isPositive ? (
              <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3 text-rose-500" />
            )}
            <span
              className={
                trend.isPositive ? "text-emerald-500" : "text-rose-500"
              }
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
            {description && <span className="ml-1">{description}</span>}
          </p>
        )}
        {!trend && description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function StatsCardGroup() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Revenue"
        value="$2,847,650"
        icon={<TrendingUp className="h-4 w-4" />}
        trend={{ value: 11.3, isPositive: true }}
        description="vs last month"
      />
      <StatCard
        title="Total Orders"
        value="8,765"
        icon={<ShoppingBag className="h-4 w-4" />}
        description="1245 this month"
      />
      <StatCard
        title="Total Users"
        value="12,450"
        icon={<Users className="h-4 w-4" />}
        description="+847 this month"
      />
      <StatCard
        title="Total Products"
        value="1,875"
        icon={<Package2 className="h-4 w-4" />}
        description="23 out of stock"
      />
    </div>
  );
} 