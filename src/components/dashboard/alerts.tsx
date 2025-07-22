"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface Alert {
  title: string;
  message: string;
  type: "warning" | "error" | "success";
}

const alerts: Alert[] = [
  {
    title: "Low Stock Alert",
    message: "156 products are running low on stock",
    type: "warning",
  },
  {
    title: "Out of Stock",
    message: "23 products are currently out of stock",
    type: "error",
  },
  {
    title: "High Cart Value",
    message: "$456,789 in active carts",
    type: "success",
  },
];

export function Alerts() {
  return (
    <Card className="col-span-4 lg:col-span-2">
      <CardHeader className="flex flex-row items-center border-b border-border/50 bg-primary/5">
        <CardTitle className="flex items-center text-primary">
          <AlertCircle className="mr-2 h-4 w-4" />
          Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`rounded-md p-4 ${
                alert.type === "warning"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : alert.type === "error"
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-primary/10 text-primary border border-primary/20"
              }`}
            >
              <p className="font-medium">{alert.title}</p>
              <p className="text-sm mt-1">{alert.message}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 