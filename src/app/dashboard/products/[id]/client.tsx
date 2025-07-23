"use client";

import { useRouter } from "next/navigation";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Package, 
  Tag, 
  Palette, 
  Ruler, 
  Star,
  DollarSign,
  Users
} from "lucide-react";

interface ProductClientProps {
  product: any;
  id: string;
}

export default function ProductClient({ product, id }: ProductClientProps) {
  const router = useRouter();

  if (!product) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-muted-foreground">Product not found</h2>
            <Button 
              variant="outline" 
              onClick={() => router.push("/dashboard/products")}
              className="mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push("/dashboard/products")}
              className="border-primary/20 hover:bg-primary/5 hover:text-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary">{product.name}</h1>
              <p className="text-muted-foreground">Product Details</p>
            </div>
          </div>
          <Button 
            onClick={() => router.push(`/dashboard/products/${id}/update`)}
            className="bg-primary hover:bg-primary/90 mt-2 sm:mt-0"
          >
            <Edit className="mr-2 h-4 w-4" />
            Update Product
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Product Images */}
        <Card className="lg:col-span-1 border-border/40 shadow-sm">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Images
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-2">
              {product.imageUrl ? (
                <div className="col-span-2 aspect-square rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="col-span-2 aspect-square rounded-lg bg-muted flex items-center justify-center">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Details */}
        <Card className="lg:col-span-2 border-border/40 shadow-sm">
          <CardHeader className="bg-primary/5">
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Price</label>
                <div className="flex items-center gap-2 mt-1">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold text-primary">
                    ${product.price}
                  </span>
                  {product.previousPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      ${product.previousPrice}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Stock</label>
                <div className="flex items-center gap-2 mt-1">
                  <Package className="h-4 w-4" />
                  <span className="text-lg font-semibold">{product.stock} units</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="mt-1 text-foreground leading-relaxed">{product.description}</p>
            </div>

            <Separator />

            {/* Properties */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Gender
                </label>
                <Badge variant="secondary" className="mt-1">
                  {product.gender}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Rating
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-semibold">{product.averageRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({product.ratingCount} reviews)</span>
                </div>
              </div>
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Available Colors
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {product.colors.map((color: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded-lg">
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: color.colorHexCode }}
                        />
                        <span className="text-sm">{color.colorName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Ruler className="h-4 w-4" />
                    Available Sizes
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {product.sizes.map((size: any, index: number) => (
                      <Badge key={index} variant="outline" className="px-3">
                        {size.size} ({size.stockForSize} in stock)
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Special Properties */}
            <div className="flex gap-4">
              {product.popular && (
                <Badge className="bg-primary hover:bg-primary/90">
                  Popular
                </Badge>
              )}
              {product.previousPrice && product.previousPrice > product.price && (
                <Badge variant="secondary">
                  On Sale
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 