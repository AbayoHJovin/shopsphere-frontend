"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Product {
  name: string;
  sales: number;
  revenue: string;
}

const products: Product[] = [
  { name: "Wireless Headphones", sales: 1234, revenue: "$147,580" },
  { name: "Smart Watch", sales: 987, revenue: "$246,750" },
  { name: "Laptop Stand", sales: 765, revenue: "$76,500" },
  { name: "Bluetooth Speaker", sales: 543, revenue: "$54,300" },
  { name: "Phone Case", sales: 432, revenue: "$12,960" },
];

export function TopProducts() {
  return (
    <Card className="col-span-4 lg:col-span-2">
      <CardHeader className="border-b border-border/50 bg-primary/5">
        <CardTitle className="text-primary">Top Selling Products</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {products.map((product, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
            >
              <div className="space-y-1">
                <p className="font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {product.sales} sales
                </p>
              </div>
              <div className="text-right font-medium text-primary">
                {product.revenue}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 