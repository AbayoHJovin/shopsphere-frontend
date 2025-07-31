"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Edit,
  Package,
  Tag,
  Palette,
  Ruler,
  Star,
  DollarSign,
  Users,
  Calendar,
  Percent,
  ShoppingBag,
} from "lucide-react";

import { ProductResponse } from "@/lib/types/product";

interface ProductClientProps {
  product: ProductResponse;
  id: string;
}

export default function ProductClient({ product, id }: ProductClientProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(product.mainImage || (product.images && product.images.length > 0 ? product.images[0].imageUrl : null));

  if (!product) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-muted-foreground">
              Product not found
            </h2>
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
              <h1 className="text-2xl sm:text-3xl font-bold text-primary">
                {product.name}
              </h1>
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
              {product.images && product.images.length > 0 ? (
                <>
                  <div className="col-span-2 aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={selectedImage || product.mainImage || product.images[0].imageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {product.images.length > 1 && (
                    <div className="col-span-2 grid grid-cols-4 gap-2 mt-2">
                      {product.images.map((image, index) => (
                        <div
                          key={image.imageId}
                          className={`aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer transition-all ${selectedImage === image.imageUrl ? 'ring-2 ring-primary' : 'hover:opacity-80'}`}
                          onClick={() => setSelectedImage(image.imageUrl)}
                        >
                          <img
                            src={image.imageUrl}
                            alt={`${product.name} - Image ${index + 1}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
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
                <label className="text-sm font-medium text-muted-foreground">
                  Price
                </label>
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
                <label className="text-sm font-medium text-muted-foreground">
                  Stock
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Package className="h-4 w-4" />
                  <span className="text-lg font-semibold">
                    {product.stock} units
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Description
              </label>
              <p className="mt-1 text-foreground leading-relaxed">
                {product.description}
              </p>
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
                  <span className="text-lg font-semibold">
                    {product.averageRating !== null ? product.averageRating.toFixed(1) : "0.0"}
                  </span>
                  <span className="text-muted-foreground">
                    ({product.ratingCount || 0} reviews)
                  </span>
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
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 border rounded-lg"
                      >
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

            {/* Categories */}
            {product.categories && product.categories.length > 0 && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Categories
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {product.categories.map((category) => (
                      <Badge key={category.categoryId} variant="outline">
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Discounts */}
            {product.discounts && product.discounts.length > 0 && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Discounts
                  </label>
                  <div className="space-y-2 mt-2">
                    {product.discounts.map((discount) => (
                      <div 
                        key={discount.discountId} 
                        className={`p-2 rounded-lg border ${discount.current ? 'border-primary bg-primary/5' : 'border-muted'}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{discount.name}</span>
                          <Badge variant={discount.active ? "default" : "outline"}>
                            {discount.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Percent className="h-3 w-3" />
                            <span>{discount.percentage}% off</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(discount.startDate).toLocaleDateString()} - {new Date(discount.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Top Ratings */}
            {product.topRatings && product.topRatings.length > 0 && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Top Reviews
                  </label>
                  <div className="space-y-3 mt-2">
                    {product.topRatings.map((rating) => (
                      <div key={rating.ratingId} className="p-3 rounded-lg border border-muted bg-muted/10">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-3 w-3 ${i < rating.stars ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} 
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium">{rating.username}</span>
                          </div>
                          {rating.verifiedPurchase && (
                            <Badge variant="outline" className="text-xs">Verified Purchase</Badge>
                          )}
                        </div>
                        <p className="text-sm mt-2">{rating.comment}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Special Properties */}
            <div className="flex flex-wrap gap-2">
              {product.popular && (
                <Badge className="bg-primary hover:bg-primary/90">
                  <ShoppingBag className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              )}
              {product.onSale && (
                <Badge variant="secondary">
                  <Percent className="h-3 w-3 mr-1" />
                  On Sale
                </Badge>
              )}
              {product.discountedPrice && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Save ${(product.price - product.discountedPrice).toFixed(2)}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
