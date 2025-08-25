"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Info } from "lucide-react";
import { DashboardResponseDTO } from "@/lib/types/dashboard";

interface AlertsProps {
  data: DashboardResponseDTO | undefined;
}

export function Alerts({ data }: AlertsProps) {
  if (!data) return null;

  // Check if we have any alerts to show using the new structure
  const lowStockCount = data.alerts?.lowStockProducts || 0;
  const pendingOrderCount = data.alerts?.pendingOrders || 0;

  const hasAlerts = lowStockCount > 0 || pendingOrderCount > 0;

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
            <p className="mt-1 text-sm">
              Everything appears to be running smoothly!
            </p>
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
          {lowStockCount > 0 && (
            <li className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium">Low Stock Warning</p>
                <p className="text-muted-foreground text-sm">
                  {lowStockCount}{" "}
                  {lowStockCount === 1 ? "product is" : "products are"} running
                  low on inventory. Consider reordering soon.
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
                  {pendingOrderCount}{" "}
                  {pendingOrderCount === 1 ? "order needs" : "orders need"}{" "}
                  processing. Please review and update their status.
                </p>
              </div>
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
