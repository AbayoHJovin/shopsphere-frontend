"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminDashboardResponse, CoWorkerDashboardResponse, DashboardResponse, ProductSummary } from "@/lib/types/dashboard";
import { dashboardService } from "@/lib/services/dashboard-service";
import { formatCurrency } from "@/lib/utils";
import { PackageOpen } from "lucide-react";

interface TopProductsProps {
  data: DashboardResponse | undefined;
}

export function TopProducts({ data }: TopProductsProps) {
  if (!data) return null;

  // Get top selling products from data
  let topProducts: ProductSummary[] = [];
  
  if (dashboardService.isAdminDashboard(data)) {
    topProducts = (data as AdminDashboardResponse).topSellingProducts || [];
  } else {
    topProducts = (data as CoWorkerDashboardResponse).topSellingProducts || [];
  }
  
  // Sort by total sold if not already sorted
  const sortedProducts = [...topProducts].sort((a, b) => b.totalSold - a.totalSold).slice(0, 5);

  return (
    <Card className="col-span-4 lg:col-span-4">
      <CardHeader className="border-b border-border/50 bg-primary/5">
        <CardTitle className="text-primary">Top Selling Products</CardTitle>
        {data.totalProducts > 0 && (
          <CardDescription>
            {topProducts.length > 0 
              ? `Out of ${data.totalProducts} total products` 
              : 'No sales recorded yet'
            }
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        {sortedProducts.length > 0 ? (
          <div className="space-y-4">
            {sortedProducts.map((product, index) => (
              <div
                key={product.productId || index}
                className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  {product.imageUrl ? (
                    <div className="h-10 w-10 overflow-hidden rounded bg-muted flex-shrink-0">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                      <PackageOpen className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="font-medium line-clamp-1">{product.name}</p>
                    <div className="flex items-center text-xs text-muted-foreground gap-2">
                      <span>{product.totalSold.toLocaleString()} sales</span>
                      {product.averageRating > 0 && (
                        <span className="flex items-center">
                          <span className="text-amber-500">★</span> 
                          {product.averageRating.toFixed(1)}
                        </span>
                      )}
                      {product.stock <= 10 && (
                        <span className="text-rose-500">{product.stock} left</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-primary">{formatCurrency(product.totalRevenue)}</p>
                  {product.previousPrice && product.previousPrice > product.price && (
                    <p className="text-xs text-muted-foreground">
                      <span className="line-through">{formatCurrency(product.previousPrice)}</span>
                      {" → "}
                      <span>{formatCurrency(product.price)}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <PackageOpen className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium">No product sales yet</h3>
            <p className="text-muted-foreground mt-1">
              Product rankings will appear here once you have sales.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 