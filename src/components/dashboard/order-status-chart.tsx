"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "Delivered", value: 75, color: "var(--chart-1)" },
  { name: "Delivering", value: 10, color: "var(--chart-2)" },
  { name: "Pending", value: 10, color: "var(--chart-3)" },
  { name: "Cancelled", value: 5, color: "var(--chart-4)" },
];

export function OrderStatusChart() {
  return (
    <Card className="col-span-4 lg:col-span-2">
      <CardHeader className="border-b border-border/50 bg-primary/5">
        <CardTitle className="text-primary">Order Status Distribution</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                innerRadius={60}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`hsl(${entry.color})`}
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
                formatter={(value: number) => `${value}%`}
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