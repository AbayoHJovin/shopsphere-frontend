"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AdminDashboardResponse, CategorySummary, CoWorkerDashboardResponse, DashboardResponse } from "@/lib/types/dashboard";
import { dashboardService } from "@/lib/services/dashboard-service";
import { Layers } from "lucide-react";

interface ProductCategoriesProps {
  data: DashboardResponse | undefined;
}

export function ProductCategories({ data }: ProductCategoriesProps) {
  if (!data) return null;
  
  let categories: CategorySummary[] = [];
  
  // Get category data from the API response
  if (dashboardService.isAdminDashboard(data)) {
    categories = (data as AdminDashboardResponse).categoriesDistribution || [];
  } else {
    categories = (data as CoWorkerDashboardResponse).categoryDistribution || [];
  }
  
  // Sort categories by percentage if available, otherwise by product count
  const sortedCategories = [...categories].sort((a, b) => {
    if (a.percentageOfTotalSales !== undefined && b.percentageOfTotalSales !== undefined) {
      return b.percentageOfTotalSales - a.percentageOfTotalSales;
    }
    return b.productCount - a.productCount;
  }).slice(0, 5);

  // Find max product count for percentage calculation
  const maxProductCount = Math.max(...categories.map(c => c.productCount || 0), 1);

  return (
    <Card className="col-span-4 lg:col-span-2">
      <CardHeader className="border-b border-border/50 bg-primary/5">
        <CardTitle className="text-primary">Product Categories</CardTitle>
        {categories.length > 0 && (
          <CardDescription>
            Distribution across {categories.length} categories
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        {sortedCategories.length > 0 ? (
          <div className="space-y-6">
            {sortedCategories.map((category, index) => (
              <div key={category.categoryId || index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium line-clamp-1">{category.name}</span>
                  <span className="text-sm text-primary font-medium">
                    {category.percentageOfTotalSales !== undefined 
                      ? `${category.percentageOfTotalSales.toFixed(1)}%` 
                      : `${category.productCount} products`}
                  </span>
                </div>
                <Progress 
                  value={category.percentageOfTotalSales !== undefined 
                    ? category.percentageOfTotalSales 
                    : (category.productCount / maxProductCount * 100)
                  } 
                  className="h-2 bg-primary/10" 
                />
                {category.hasSubcategories && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>Has subcategories</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Layers className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium">No categories yet</h3>
            <p className="text-muted-foreground mt-1">
              Category distribution will appear here once you have products in categories.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 