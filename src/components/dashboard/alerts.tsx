"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Info } from "lucide-react";
import { AdminDashboardResponse, DashboardResponse } from "@/lib/types/dashboard";
import { dashboardService } from "@/lib/services/dashboard-service";

interface AlertsProps {
  data: DashboardResponse | undefined;
}

export function Alerts({ data }: AlertsProps) {
  if (!data) return null;
  
  const isAdmin = dashboardService.isAdminDashboard(data);
  if (!isAdmin) return null;
  
  const adminData = data as AdminDashboardResponse;
  
  // Check if we have any alerts to show
  const outOfStockCount = adminData.outOfStockProducts || 0;
  const lowStockCount = adminData.lowStockProducts || 0;
  const pendingOrderCount = adminData.pendingOrders || 0;
  
  const hasAlerts = outOfStockCount > 0 || lowStockCount > 0 || pendingOrderCount > 0;
  
  if (!hasAlerts) {
    return (
      <Card className="col-span-4">
        <CardHeader className="border-b border-border/50 bg-primary/5">
          <CardTitle className="text-primary">Alerts</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 flex items-center justify-center min-h-[100px]">
          <div className="text-center text-muted-foreground">
            <div className="flex justify-center mb-2">
              <Info className="h-6 w-6" />
            </div>
            <p>No alerts at this time.</p>
            <p className="mt-1 text-sm">Everything appears to be running smoothly!</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="col-span-4">
      <CardHeader className="border-b border-border/50 bg-primary/5">
        <CardTitle className="text-primary">Alerts</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ul className="space-y-4">
          {outOfStockCount > 0 && (
            <li className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium">Out of Stock Products</p>
                <p className="text-muted-foreground text-sm">
                  {outOfStockCount} {outOfStockCount === 1 ? 'product is' : 'products are'} out of stock.
                  Consider reordering or removing from the catalog.
                </p>
              </div>
            </li>
          )}
          
          {lowStockCount > 0 && (
            <li className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium">Low Stock Warning</p>
                <p className="text-muted-foreground text-sm">
                  {lowStockCount} {lowStockCount === 1 ? 'product is' : 'products are'} running low on inventory.
                  Consider reordering soon.
                </p>
              </div>
            </li>
          )}
          
          {pendingOrderCount > 0 && (
            <li className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Pending Orders</p>
                <p className="text-muted-foreground text-sm">
                  {pendingOrderCount} {pendingOrderCount === 1 ? 'order needs' : 'orders need'} processing.
                  Please review and update their status.
                </p>
              </div>
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
} 