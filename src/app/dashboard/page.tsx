"use client";

import { StatsCardGroup } from "@/components/dashboard/stats-cards";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { OrderStatusChart } from "@/components/dashboard/order-status-chart";
import { TopProducts } from "@/components/dashboard/top-products";
import { ProductCategories } from "@/components/dashboard/product-categories";
import { Alerts } from "@/components/dashboard/alerts";
import { ArrowRightIcon, LineChart } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border/40 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's what's happening with your ecommerce store.
        </p>
      </div>
      
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center text-primary">
          <LineChart className="mr-2 h-5 w-5" />
          <span>Revenue Overview</span>
        </h2>
        <StatsCardGroup />
      </section>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-4 lg:grid-cols-8">
        <RevenueChart />
        <OrderStatusChart />
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-4 lg:grid-cols-8">
        <TopProducts />
        <ProductCategories />
        <Alerts />
      </div>
      
      {/* <div className="grid gap-6 grid-cols-1 md:grid-cols-4 lg:grid-cols-8"> */}
      {/* </div> */}
    </div>
  );
} 