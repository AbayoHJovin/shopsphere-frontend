"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ColorPicker } from "@/components/ColorPicker";
import { ArrowLeft, Upload, X, Plus, Minus, AlertTriangle } from "lucide-react";
import { categoryService } from "@/lib/services/category-service";
import { productColorService } from "@/lib/services/product-color-service";
import { productSizeService } from "@/lib/services/product-size-service";
import { productService } from "@/lib/services/product-service";
import { Size, Gender, CategoryResponse } from "@/lib/types/product";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

// Product schema with validation
const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  stock: z.coerce.number().int().min(1, "Stock must be at least 1"),
  gender: z.nativeEnum(Gender).optional().nullable(), // Make gender truly optional
  popular: z.boolean().default(false),
  categoryIds: z.array(z.string()).min(1, "At least one category is required"),
  images: z.array(z.instanceof(File)).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

// Define the product color and size types for the form
interface ProductColor {
  colorId?: string;
  colorName: string;
  colorHexCode: string;
  productId?: string;
}

interface ProductSize {
  sizeId?: string;
  size: Size;
  stockForSize: number;
  productId?: string;
}

export default function CreateProductPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Initialize the form
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      gender: undefined,
      popular: false,
      categoryIds: [],
    },
  });

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for stock warning
  const [stockWarning, setStockWarning] = useState<string | null>(null);

  // State for success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);

  // State for image uploads
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // State for colors
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [sizes, setSizes] = useState<ProductSize[]>([]);

  // Fetch categories from backend
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: categoryService.getAllAdminCategories,
  });

  // Fetch available colors for reuse
  const { data: availableColors, isLoading: colorsLoading } = useQuery({
    queryKey: ["product-colors"],
    queryFn: () => productColorService.getAllColors(0, 100),
  });

  // Get available sizes from enum
  const availableSizes = productSizeService.getAvailableSizes();

  // Form is already initialized above, this is a duplicate declaration
  // Removing this duplicate form initialization

  // Watch the stock field to validate against size quantities
  const stockValue = form.watch("stock");
  const categoryIds = form.watch("categoryIds");

  // Validate total stock against size quantities
  useEffect(() => {
    const totalStock =
      typeof stockValue === "number" ? stockValue : parseInt(stockValue) || 0;
    const totalSizeStock = sizes.reduce(
      (sum, size) => sum + size.stockForSize,
      0
    );

    if (sizes.length > 0 && totalSizeStock > totalStock) {
      setStockWarning(
        `Size quantities (${totalSizeStock}) exceed total stock (${totalStock})`
      );
    } else {
      setStockWarning(null);
    }
  }, [sizes, stockValue]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const files = Array.from(event.target.files);
    const newImages = files.slice(0, 5 - images.length);

    // Create URLs for preview
    const newUrls = newImages.map((file) => URL.createObjectURL(file));

    setImages((prev) => [...prev, ...newImages]);
    setImageUrls((prev) => [...prev, ...newUrls]);
  };

  const removeImage = (index: number) => {
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(imageUrls[index]);

    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const addSize = () => {
    setSizes((prev) => [...prev, { size: Size.MEDIUM, stockForSize: 0 }]);
  };

  const removeSize = (index: number) => {
    setSizes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSize = (index: number, field: keyof ProductSize, value: any) => {
    setSizes((prev) =>
      prev.map((size, i) => (i === index ? { ...size, [field]: value } : size))
    );
  };

  const calculateTotalSizeStock = (): number => {
    return sizes.reduce((sum, size) => sum + size.stockForSize, 0);
  };

  useEffect(() => {
    const totalStock = form.getValues("stock");
    const parsedTotalStock =
      typeof totalStock === "number" ? totalStock : parseInt(totalStock) || 0;
    const totalSizeStock = calculateTotalSizeStock();

    if (sizes.length > 0) {
      if (parsedTotalStock !== totalSizeStock) {
        setStockWarning(
          `The sum of stock for all sizes (${totalSizeStock}) must equal the total stock (${parsedTotalStock}).`
        );
      } else {
        setStockWarning(null);
      }
    } else {
      setStockWarning(null);
    }
  }, [sizes, form]);

  // Check localStorage for user preference on showing success modal
  useEffect(() => {
    const preference = localStorage.getItem("productCreationPreference");
    if (preference) {
      try {
        const { skipSuccessModal } = JSON.parse(preference);
        if (skipSuccessModal) {
          setDontShowAgain(true);
        }
      } catch (error) {
        console.error("Error parsing product creation preference:", error);
      }
    }
  }, []);

  const onSubmit = async (data: ProductFormData) => {
    try {
      console.log("Form submission started", data);
      setIsSubmitting(true);

      // Validate that we have at least one category
      if (!data.categoryIds || data.categoryIds.length === 0) {
        toast({
          title: "Error",
          description: "Please select at least one category",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Validate that size stock matches total stock if sizes are provided
      const totalStock =
        typeof data.stock === "number" ? data.stock : parseInt(data.stock) || 0;
      const totalSizeStock = calculateTotalSizeStock();

      if (sizes.length > 0 && totalStock !== totalSizeStock) {
        toast({
          title: "Error",
          description: `The sum of stock for all sizes (${totalSizeStock}) must equal the total stock (${totalStock}).`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Create FormData for product
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", data.price.toString());
      formData.append("stock", data.stock.toString());
      if (data.gender) formData.append("gender", data.gender);
      formData.append("popular", String(data.popular));

      // Append category IDs
      data.categoryIds.forEach((categoryId) => {
        formData.append("categoryIds", categoryId);
      });

      // Append images
      if (images.length > 0) {
        images.forEach((image) => {
          formData.append("images", image);
        });
      }

      // Create the product
      console.log("Sending product data to API", { formData });
      try {
        const product = await productService.createProduct(formData);
        console.log("Product created successfully", product);

        // Create colors for the product
        // for (const color of colors) {
        //   await productColorService.createColor({
        //     colorName: color.colorName,
        //     colorHexCode: color.colorHexCode,
        //     productId: product.id,
        //   });
        // }

        // Create sizes for the product
        for (const size of sizes) {
          await productSizeService.addSizeToProduct(product.id, {
            size: size.size,
            stockForSize: size.stockForSize,
          });
        }

        // Store the created product ID
        setCreatedProductId(product.id);

        // Show success toast
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      } catch (apiError) {
        console.error("Error in product creation API call:", apiError);
        throw apiError; // Re-throw to be caught by the outer try-catch
      }

      // Check if we should show the success modal based on user preference
      if (!dontShowAgain) {
        setShowSuccessModal(true);
      } else {
        // If user chose not to show modal, redirect based on stored preference
        const preference = localStorage.getItem("productCreationPreference");
        if (preference) {
          try {
            const { defaultAction } = JSON.parse(preference);
            if (defaultAction === "createAnother") {
              // Reset form and stay on page
              form.reset();
              setImages([]);
              setImageUrls([]);
              setColors([]);
              setSizes([]);
              window.scrollTo(0, 0);
            } else {
              // Navigate to products list
              router.push("/dashboard/products");
            }
          } catch (error) {
            console.error("Error parsing product creation preference:", error);
            router.push("/dashboard/products");
          }
        } else {
          // Default behavior if no preference is stored
          router.push("/dashboard/products");
        }
      }
    } catch (error) {
      console.error("Error creating product:", error);

      // Log more details about the error
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }

      // If it's an AxiosError, log the response data
      if (error && typeof error === "object" && "response" in error) {
        console.error("API response data:", (error.response as any)?.data);
        console.error("API response status:", (error.response as any)?.status);
      }

      toast({
        title: "Error",
        description: "Failed to create product. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle saving user preference for success modal
  const savePreference = (action: "createAnother" | "goToProducts") => {
    if (dontShowAgain) {
      localStorage.setItem(
        "productCreationPreference",
        JSON.stringify({
          skipSuccessModal: true,
          defaultAction: action,
        })
      );
    }
  };

  // Handle creating another product
  const handleCreateAnother = () => {
    savePreference("createAnother");
    setShowSuccessModal(false);

    // Reset form
    form.reset();
    setImages([]);
    setImageUrls([]);
    setColors([]);
    setSizes([]);
    window.scrollTo(0, 0);
  };

  // Handle going to products page
  const handleGoToProducts = () => {
    savePreference("goToProducts");
    router.push("/dashboard/products");
  };

  return (
    <div className="pb-20">
      {" "}
      {/* Add bottom padding to ensure content doesn't get cut off */}
      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Product Created Successfully!</DialogTitle>
            <DialogDescription>
              Your product has been created successfully. What would you like to
              do next?
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center space-x-2 py-4">
            <Checkbox
              id="dont-show-again"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked === true)}
            />
            <label
              htmlFor="dont-show-again"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Don't show this again
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCreateAnother}>
              Create Another Product
            </Button>
            <Button onClick={handleGoToProducts}>Go to Products Page</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Header */}
      <div className="border-b border-border/40 pb-4 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Create Product
          </h1>
          <p className="text-muted-foreground mt-1">
            Add a new product to your inventory
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/products")}
          className="border-primary/20 hover:bg-primary/5 hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
      <div className="max-w-4xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
            {" "}
            {/* Increased spacing between sections */}
            {/* Basic Information */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the core details about your product
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter product name"
                            className="border-primary/20 focus-visible:ring-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender (Optional)</FormLabel>
                        <Select
                          value={field.value || ""}
                          onValueChange={(value) => {
                            // Allow clearing the selection
                            if (value === "clear") {
                              field.onChange(undefined);
                            } else {
                              field.onChange(value);
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="border-primary/20 focus-visible:ring-primary">
                              <SelectValue placeholder="Select gender (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                            <SelectItem value="UNISEX">Unisex</SelectItem>
                            <SelectItem value="clear">
                              No gender (clear selection)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Target gender for this product (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter product description"
                          className="min-h-[120px] border-primary/20 focus-visible:ring-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="border-primary/20 focus-visible:ring-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            className="border-primary/20 focus-visible:ring-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        {stockWarning && (
                          <Alert variant="destructive" className="mt-2">
                            <AlertDescription>{stockWarning}</AlertDescription>
                          </Alert>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="popular"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0 pt-8">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel>Mark as Popular</FormLabel>
                          <FormDescription>
                            Featured in trending sections
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            {/* Images */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle>Product Images</CardTitle>
                <CardDescription>Upload up to 5 product images</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition">
                      <div className="flex flex-col items-center justify-center pt-4 pb-4">
                        <Upload className="w-7 h-7 mb-2 text-primary" />
                        <p className="text-sm text-foreground">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, JPEG (MAX. 5 files)
                        </p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={images.length >= 5}
                      />
                    </label>
                  </div>

                  {imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square w-full h-24 overflow-hidden bg-muted rounded-md border border-border/40">
                            <img
                              src={url}
                              alt={`Product ${index + 1}`}
                              className="w-full h-full object-contain p-1"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-90 hover:opacity-100 shadow-sm"
                            onClick={() => removeImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Colors */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle>Colors</CardTitle>
                <CardDescription>
                  Add color variants for your product
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ColorPicker colors={colors} onChange={setColors} />
              </CardContent>
            </Card>
            {/* Sizes */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle>Sizes & Stock</CardTitle>
                <CardDescription>
                  Add size variants and their specific stock levels
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {sizes.map((size, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-end gap-4 p-4 border border-border/30 rounded-md"
                    >
                      <div className="w-full sm:w-1/3 max-w-[200px]">
                        <Label className="mb-2 block">Size</Label>
                        <Select
                          value={size.size}
                          onValueChange={(value) =>
                            updateSize(index, "size", value as Size)
                          }
                        >
                          <SelectTrigger className="border-primary/20 focus-visible:ring-primary">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(Size).map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-full sm:w-1/3 max-w-[200px]">
                        <Label
                          htmlFor={`size-stock-${index}`}
                          className="mb-2 block"
                        >
                          Stock Quantity
                        </Label>
                        <Input
                          id={`size-stock-${index}`}
                          type="number"
                          placeholder="0"
                          value={size.stockForSize}
                          onChange={(e) =>
                            updateSize(
                              index,
                              "stockForSize",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="border-primary/20 focus-visible:ring-primary"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeSize(index)}
                        className="h-10 w-10 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSize}
                    className="w-full mt-2 border-primary/20 hover:bg-primary/5 hover:text-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Size Variant
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Categories */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle>Categories</CardTitle>
                <CardDescription>
                  Select categories for this product (at least one required)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {categoriesLoading ? (
                    <div className="flex justify-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
                      {categories?.map((category) => (
                        <div
                          key={category.categoryId}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`category-${category.categoryId}`}
                            checked={categoryIds?.includes(category.categoryId)}
                            onCheckedChange={(checked) => {
                              const currentCategories =
                                form.getValues("categoryIds") || [];
                              if (checked) {
                                form.setValue(
                                  "categoryIds",
                                  [...currentCategories, category.categoryId],
                                  { shouldValidate: true }
                                );
                              } else {
                                form.setValue(
                                  "categoryIds",
                                  currentCategories.filter(
                                    (id) => id !== category.categoryId
                                  ),
                                  { shouldValidate: true }
                                );
                              }
                            }}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <Label
                            htmlFor={`category-${category.categoryId}`}
                            className="text-sm cursor-pointer"
                          >
                            {category.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Selected categories badges */}
                  {categoryIds?.length > 0 && categories && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {categoryIds.map((id) => {
                        const category = categories.find(
                          (c) => c.categoryId === id
                        );
                        return category ? (
                          <Badge
                            key={id}
                            variant="secondary"
                            className="pl-2 pr-1 py-1 flex items-center gap-1"
                          >
                            {category.name}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 rounded-full"
                              onClick={() => {
                                const currentCategories =
                                  form.getValues("categoryIds");
                                form.setValue(
                                  "categoryIds",
                                  currentCategories.filter((cid) => cid !== id),
                                  { shouldValidate: true }
                                );
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}

                  {categoryIds?.length === 0 && (
                    <p className="text-sm text-destructive">
                      At least one category must be selected
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 bottom-6 bg-background py-4 border-t border-border/30 mt-8">
              {" "}
              {/* Made sticky to always be accessible */}
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/products")}
                className="border-primary/20 hover:bg-primary/5 hover:text-primary"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={categoryIds?.length === 0 || isSubmitting}
                className="bg-primary hover:bg-primary/90"
                onClick={() => {
                  console.log("Submit button clicked");
                  if (!isSubmitting && categoryIds?.length > 0) {
                    form.handleSubmit(onSubmit)();
                  }
                }}
              >
                {isSubmitting ? "Creating..." : "Create Product"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
