"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorPicker } from '@/components/ColorPicker';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Upload,
  X
} from "lucide-react";
import { mockProducts } from "@/data/mockData";

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const genders = ["MALE", "FEMALE", "UNISEX"];
const categories = [
  {id: "1", name: "Clothing"},
  {id: "2", name: "Shoes"},
  {id: "3", name: "Accessories"},
  {id: "4", name: "Electronics"},
  {id: "5", name: "Sports"},
  {id: "6", name: "Books"},
  {id: "7", name: "Home"},
  {id: "8", name: "Beauty"}
];

// Define the form schema
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().min(1, "Price is required"),
  previousPrice: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "UNISEX"]),
  stock: z.string().min(1, "Stock is required"),
  popular: z.boolean(),
  categoryIds: z.array(z.string()).min(1, "At least one category is required"),
  colors: z.array(
    z.object({
      colorName: z.string().min(1, "Color name is required"),
      colorHexCode: z.string().min(1, "Color code is required"),
    })
  ),
  sizes: z.array(
    z.object({
      size: z.string().min(1, "Size is required"),
      stockForSize: z.number().min(0, "Stock cannot be negative"),
    })
  ),
});

type ProductUpdateForm = z.infer<typeof productSchema>;

interface ProductUpdateProps {
  params: { id: string };
}

export default function ProductUpdate({ params }: ProductUpdateProps) {
  const { id } = params;
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductUpdateForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      previousPrice: "",
      gender: "UNISEX",
      stock: "0",
      popular: false,
      categoryIds: [],
      colors: [],
      sizes: [],
    },
  });

  const { fields: colorFields, append: appendColor, remove: removeColor } = useFieldArray({
    control: form.control,
    name: "colors",
  });

  const { fields: sizeFields, append: appendSize, remove: removeSize } = useFieldArray({
    control: form.control,
    name: "sizes",
  });

  useEffect(() => {
    // In real app, fetch product by ID from API
    const foundProduct = mockProducts.find(p => p.productId === id);
    if (foundProduct) {
      setProduct(foundProduct);
      
      // Add sample existing images if needed
      if (foundProduct.imageUrl) {
        setExistingImages([foundProduct.imageUrl]);
      }
      
      // Pre-populate the form
      form.reset({
        name: foundProduct.name,
        description: foundProduct.description,
        price: foundProduct.price.toString(),
        previousPrice: foundProduct.previousPrice ? foundProduct.previousPrice.toString() : "",
        gender: foundProduct.gender,
        stock: foundProduct.stock.toString(),
        popular: foundProduct.popular || false,
        categoryIds: [], // Assume no categories in mock data
        colors: foundProduct.colors || [],
        sizes: foundProduct.sizes || [],
      });
    }
    setIsLoading(false);
  }, [id, form]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.slice(0, 5 - selectedImages.length - existingImages.length);
    
    if (existingImages.length + selectedImages.length + newImages.length > 5) {
      console.warn("Maximum 5 images allowed per product");
      return;
    }
    
    const newImageUrls = newImages.map(file => URL.createObjectURL(file));
    setSelectedImages(prev => [...prev, ...newImages]);
    setImageUrls(prev => [...prev, ...newImageUrls]);
  };

  const removeSelectedImage = (index: number) => {
    URL.revokeObjectURL(imageUrls[index]);
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductUpdateForm) => {
    try {
      setIsSubmitting(true);
      
      // In a real app, you would upload images and update the product data
      const updateData = {
        ...data,
        price: parseFloat(data.price),
        previousPrice: data.previousPrice ? parseFloat(data.previousPrice) : undefined,
        stock: parseInt(data.stock),
        existingImages,
        // Normally you would upload new images to server
        newImages: selectedImages.map(img => img.name), 
      };

      console.log("Update product data:", updateData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to product detail
      router.push(`/dashboard/products/${id}`);
    } catch (error) {
      console.error("Error updating product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push(`/dashboard/products/${id}`)}
              className="border-primary/20 hover:bg-primary/5 hover:text-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary">Update Product</h1>
              <p className="text-muted-foreground">Modify product details</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-5xl mx-auto">
        {/* Basic Information */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="bg-primary/5">
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-full">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  {...form.register("name")}
                  className="border-primary/20 focus-visible:ring-primary mt-2"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="col-span-full">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter product description"
                  {...form.register("description")}
                  className="min-h-[120px] border-primary/20 focus-visible:ring-primary mt-2"
                  rows={4}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register("price")}
                  className="border-primary/20 focus-visible:ring-primary mt-2"
                />
                {form.formState.errors.price && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.price.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="previousPrice">Previous Price ($) - Optional</Label>
                <Input
                  id="previousPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register("previousPrice")}
                  className="border-primary/20 focus-visible:ring-primary mt-2"
                />
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  onValueChange={(value) => form.setValue("gender", value as "MALE" | "FEMALE" | "UNISEX")}
                  defaultValue={form.getValues("gender")}
                >
                  <SelectTrigger className="border-primary/20 focus-visible:ring-primary mt-2">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.gender && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.gender.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="0"
                  {...form.register("stock")}
                  className="border-primary/20 focus-visible:ring-primary mt-2"
                />
                {form.formState.errors.stock && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.stock.message}</p>
                )}
              </div>

              <div className="col-span-full flex items-center space-x-2">
                <Checkbox
                  id="popular"
                  checked={form.watch("popular")}
                  onCheckedChange={(checked) => form.setValue("popular", !!checked)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor="popular" className="text-sm cursor-pointer">Mark as Popular Product</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="bg-primary/5">
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-4">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={form.watch("categoryIds").includes(category.id)}
                    onCheckedChange={(checked) => {
                      const current = form.watch("categoryIds");
                      if (checked) {
                        form.setValue("categoryIds", [...current, category.id]);
                      } else {
                        form.setValue("categoryIds", current.filter((id) => id !== category.id));
                      }
                    }}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label 
                    htmlFor={`category-${category.id}`} 
                    className="text-sm cursor-pointer"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
            {form.formState.errors.categoryIds && (
              <p className="text-sm text-destructive mt-4">{form.formState.errors.categoryIds.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Product Images */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="bg-primary/5">
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Current Images</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-2">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square w-full h-24 overflow-hidden bg-muted rounded-md border border-border/40">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-90 hover:opacity-100 shadow-sm"
                        onClick={() => removeExistingImage(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {imageUrls.length > 0 && (
              <div>
                <Label className="text-sm font-medium">New Images</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-2">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square w-full h-24 overflow-hidden bg-muted rounded-md border border-border/40">
                        <img
                          src={url}
                          alt={`New ${index + 1}`}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-90 hover:opacity-100 shadow-sm"
                        onClick={() => removeSelectedImage(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Images */}
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition">
                <div className="flex flex-col items-center justify-center pt-4 pb-4">
                  <Upload className="w-7 h-7 mb-2 text-primary" />
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, JPEG (MAX. 5 files)</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={existingImages.length + imageUrls.length >= 5}
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Colors */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="bg-primary/5 flex flex-row justify-between items-center">
            <CardTitle>Product Colors</CardTitle>
            <Button
              type="button"
              variant="outline"
              onClick={() => appendColor({ colorName: "", colorHexCode: "#000000" })}
              className="border-primary/20 hover:bg-primary/5 hover:text-primary"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Color
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {colorFields.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">No colors added yet</p>
            ) : (
              <div className="space-y-4">
                {colorFields.map((field, index) => (
                  <div key={field.id} className="flex flex-col sm:flex-row sm:items-end gap-4 p-4 border border-border/30 rounded-md">
                    <div className="flex-1">
                      <Label>Color Name</Label>
                      <Input
                        {...form.register(`colors.${index}.colorName`)}
                        placeholder="e.g., Ocean Blue"
                        className="border-primary/20 focus-visible:ring-primary mt-2"
                      />
                      {form.formState.errors.colors?.[index]?.colorName && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.colors[index]?.colorName?.message}
                        </p>
                      )}
                    </div>
                    <div className="flex-1">
                      <Label>Color</Label>
                      <div className="flex mt-2 items-center space-x-2">
                        <Input
                          type="color"
                          {...form.register(`colors.${index}.colorHexCode`)}
                          className="w-12 h-9 p-1 cursor-pointer border-primary/20"
                        />
                        <Input
                          {...form.register(`colors.${index}.colorHexCode`)}
                          className="flex-1 border-primary/20 focus-visible:ring-primary"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeColor(index)}
                      className="h-9 w-9 sm:mb-0 sm:mt-0 border-destructive/30 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sizes */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="bg-primary/5 flex flex-row justify-between items-center">
            <CardTitle>Product Sizes</CardTitle>
            <Button
              type="button"
              variant="outline"
              onClick={() => appendSize({ size: "M", stockForSize: 0 })}
              className="border-primary/20 hover:bg-primary/5 hover:text-primary"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Size
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {sizeFields.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">No sizes added yet</p>
            ) : (
              <div className="space-y-4">
                {sizeFields.map((field, index) => (
                  <div key={field.id} className="flex flex-col sm:flex-row sm:items-end gap-4 p-4 border border-border/30 rounded-md">
                    <div className="w-full sm:w-1/3 max-w-[200px]">
                      <Label>Size</Label>
                      <Select
                        value={form.watch(`sizes.${index}.size`)}
                        onValueChange={(value) => form.setValue(`sizes.${index}.size`, value)}
                      >
                        <SelectTrigger className="border-primary/20 focus-visible:ring-primary mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sizes.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Label>Stock Quantity</Label>
                      <Input
                        type="number"
                        defaultValue={field.stockForSize}
                        onChange={(e) => form.setValue(`sizes.${index}.stockForSize`, parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="border-primary/20 focus-visible:ring-primary mt-2"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeSize(index)}
                      className="h-10 w-10 sm:mb-0 border-destructive/30 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 sticky bottom-6 bg-background py-4 border-t border-border/30 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/products/${id}`)}
            className="border-primary/20 hover:bg-primary/5 hover:text-primary"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Updating..." : "Update Product"}
          </Button>
        </div>
      </form>
    </div>
  );
} 