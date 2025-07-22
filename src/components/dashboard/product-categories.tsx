"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Category {
  name: string;
  percentage: number;
}

const categories: Category[] = [
  { name: "Electronics", percentage: 34.4 },
  { name: "Clothing", percentage: 22.6 },
  { name: "Home & Garden", percentage: 16.6 },
  { name: "Sports & Outdoors", percentage: 14.8 },
  { name: "Books", percentage: 11.6 },
];

export function ProductCategories() {
  return (
    <Card className="col-span-4 lg:col-span-2">
      <CardHeader className="border-b border-border/50 bg-primary/5">
        <CardTitle className="text-primary">Product Categories</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {categories.map((category, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{category.name}</span>
                <span className="text-sm text-primary font-medium">
                  {category.percentage.toFixed(1)}%
                </span>
              </div>
              <Progress value={category.percentage} className="h-2 bg-primary/10" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 