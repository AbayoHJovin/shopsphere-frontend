"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Upload,
  X,
  Star,
  ChevronRight,
  ChevronDown,
  Minus,
} from "lucide-react";
import { productService } from "@/lib/services/product-service";
import { categoryService } from "@/lib/services/category-service";
import { productColorService } from "@/lib/services/product-color-service";
import { ColorPicker } from "@/components/ColorPicker";
import axios from "axios";
import { API_ENDPOINTS } from "@/lib/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProductColor, Size } from "@/lib/types/product";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const sizes = ["SMALL", "MEDIUM", "LARGE"];
const genders = ["MALE", "FEMALE", "UNISEX"];
// Categories will be fetched from the backend

// Define the form schema
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().min(1, "Price is required"),
  previousPrice: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "UNISEX"]).optional().nullable(),
  stock: z.string().min(1, "Stock is required"),
  popularity: z.boolean().default(false),
  categories: z.array(z.string()).min(1, "At least one category is required"),
  colorIds: z.array(z.string()).optional(),
  sizes: z.array(
    z.object({
      value: z.string().min(1, "Size is required"),
      stockForSize: z
        .number()
        .min(0, "Stock must be a positive number")
        .default(0),
    })
  ),
});

type ProductUpdateForm = z.infer<typeof productSchema>;

interface ProductUpdateProps {
  params: { id: string };
}

export default function ProductUpdate({ params }: ProductUpdateProps) {
  const productId = params.id;
  const router = useRouter();
  const { toast } = useToast();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isImageDeleting, setIsImageDeleting] = useState(false);
  const [isSettingMainImage, setIsSettingMainImage] = useState(false);
  const [categories, setCategories] = useState<
    { id: string; name: string; parentId?: string; subcategories?: any[] }[]
  >([]);
  const [stockWarning, setStockWarning] = useState<string | null>(null);
  const [productColors, setProductColors] = useState<ProductColor[]>([]);
  const [categoryExpanded, setCategoryExpanded] = useState<
    Record<string, boolean>
  >({});

  const form = useForm<ProductUpdateForm>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      price: "",
      previousPrice: "",
      gender: "UNISEX",
      stock: "0",
      popularity: false,
      categories: [],
      colorIds: [],
      sizes: [],
    },
  });

  const {
    fields: sizeFields,
    append: appendSize,
    remove: removeSize,
  } = useFieldArray({
    control: form.control,
    name: "sizes",
  });

  // Function to calculate total stock from sizes
  const calculateTotalSizeStock = (): number => {
    return form
      .watch("sizes")
      .reduce((total, size) => total + (size.stockForSize || 0), 0);
  };

  // Validate total stock against size quantities
  useEffect(() => {
    const stockValue = form.watch("stock");
    const totalStock =
      typeof stockValue === "string" ? parseInt(stockValue) || 0 : stockValue;
    const totalSizeStock = calculateTotalSizeStock();

    if (form.watch("sizes").length > 0) {
      if (totalStock !== totalSizeStock) {
        setStockWarning(
          `The number of sizes (${totalSizeStock}) must equal the total stock (${totalStock}).`
        );
      } else {
        setStockWarning(null);
      }
    } else {
      setStockWarning(null);
    }
  }, [form.watch("sizes"), form.watch("stock")]);

  useEffect(() => {
    // Fetch product by ID and categories from API
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch categories
        const categoriesData =
          await categoryService.getAllCategoriesForDropdown();

        // Organize categories into a tree structure
        const topLevelCategories = categoriesData.filter(
          (cat: any) => !cat.parentId
        );
        const categoriesMap = new Map();

        // Create a map of all categories
        categoriesData.forEach((cat: any) => {
          categoriesMap.set(cat.id, {
            id: cat.id,
            name: cat.name,
            parentId: cat.parentId,
            subcategories: [],
          });
        });

        // Populate subcategories
        categoriesData.forEach((cat: any) => {
          if (cat.parentId && categoriesMap.has(cat.parentId)) {
            const parentCategory = categoriesMap.get(cat.parentId);
            parentCategory.subcategories.push(categoriesMap.get(cat.id));
          }
        });

        // Set categories state with top-level categories that have their subcategories populated
        setCategories(
          topLevelCategories.map((cat: any) => categoriesMap.get(cat.id))
        );

        // Fetch product
        const productData = await productService.getProductById(productId);
        setProduct(productData);

        // Set existing images
        if (productData.images && productData.images.length > 0) {
          setExistingImages(productData.images);
        }

        // Set product colors from the product response
        setProductColors(productData.colors || []);

        // Pre-populate the form
        form.reset({
          name: productData.name,
          description: productData.description,
          price: productData.price.toString(),
          previousPrice: productData.previousPrice
            ? productData.previousPrice.toString()
            : "",
          gender: productData.gender,
          stock: productData.stock.toString(),
          popularity: productData.popularity || false,
          categories:
            productData.categories?.map(
              (cat: { categoryId: string }) => cat.categoryId
            ) || [],
          colorIds: (productData.colors || []).map(
            (color: { colorId: string }) => color.colorId
          ),
          sizes: (productData.sizes || []).map(
            (size: { size: string; stockForSize: number }) => ({
              value: size.size,
              stockForSize: size.stockForSize || 0,
            })
          ),
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error loading data",
          description:
            "There was an error loading the product data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [productId, form, toast]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(e.target.files || []);
      const newImages = files.slice(
        0,
        5 - selectedImages.length - existingImages.length
      );

      if (
        existingImages.length + selectedImages.length + newImages.length >
        5
      ) {
        toast({
          title: "Maximum 5 images allowed",
          description: "You can upload a maximum of 5 images per product",
          variant: "destructive",
        });
        return;
      }

      // Upload images to server immediately
      setIsImageUploading(true);

      const formData = new FormData();
      newImages.forEach((image) => {
        formData.append("images", image);
      });

      const response = await axios.post(
        `${API_ENDPOINTS.PRODUCTS.BY_ID(productId)}/images`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update product with new images
      setProduct(response.data);
      setExistingImages(response.data.images);

      toast({
        title: "Images uploaded",
        description: "Images have been uploaded successfully",
      });

      // Clear selected images
      setSelectedImages([]);
      setImageUrls([]);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast({
        title: "Error uploading images",
        description:
          "There was an error uploading the images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImageUploading(false);
    }
  };

  const removeSelectedImage = (index: number) => {
    URL.revokeObjectURL(imageUrls[index]);
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId: string) => {
    try {
      setIsImageDeleting(true);

      await axios.delete(
        `${API_ENDPOINTS.PRODUCTS.BY_ID(productId)}/images/${imageId}`,
        { withCredentials: true }
      );

      // Update existing images list
      setExistingImages((prev) =>
        prev.filter((img) => img.imageId !== imageId)
      );

      toast({
        title: "Image removed",
        description: "Image has been removed successfully",
      });
    } catch (error) {
      console.error("Error removing image:", error);
      toast({
        title: "Error removing image",
        description: "There was an error removing the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImageDeleting(false);
    }
  };

  const setMainImage = async (imageId: string) => {
    try {
      setIsSettingMainImage(true);

      const response = await axios.put(
        `${API_ENDPOINTS.PRODUCTS.BY_ID(productId)}/images/${imageId}/main`,
        {},
        { withCredentials: true }
      );

      // Update product with new main image
      setProduct(response.data);
      setExistingImages(response.data.images);

      toast({
        title: "Main image set",
        description: "Main image has been set successfully",
      });
    } catch (error) {
      console.error("Error setting main image:", error);
      toast({
        title: "Error setting main image",
        description:
          "There was an error setting the main image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSettingMainImage(false);
    }
  };

  const onSubmit = async (data: ProductUpdateForm) => {
    try {
      setIsSubmitting(true);

      // Validate that the number of sizes matches the total stock
      const totalStock = parseInt(data.stock) || 0;
      const totalSizeCount = data.sizes.length;

      if (data.sizes.length > 0 && totalStock !== totalSizeCount) {
        toast({
          title: "Validation Error",
          description: `The number of sizes (${totalSizeCount}) must equal the total stock (${totalStock}).`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Prepare JSON data for API call according to ProductUpdateRequest
      const jsonData = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        gender: data.gender,
        stock: parseInt(data.stock),
        popular: data.popularity,
        colorIds: data.colorIds,
        sizes: data.sizes.map((size) => ({
          size: size.value,
          stockForSize: size.stockForSize || 0,
        })),
        categoryIds: data.categories,
      };

      // If previousPrice exists, add it to the request
      if (data.previousPrice) {
        Object.assign(jsonData, {
          previousPrice: parseFloat(data.previousPrice),
        });
      }

      await productService.updateProduct(productId, jsonData);

      toast({
        title: "Product updated",
        description: "Product has been updated successfully",
      });

      router.push(`/dashboard/products/${productId}`);
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error updating product",
        description:
          "There was an error updating the product. Please try again.",
        variant: "destructive",
      });
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
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/products/${productId}`)}
              className="border-primary/20 hover:bg-primary/5 hover:text-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary">
                Update Product
              </h1>
              <p className="text-muted-foreground">Modify product details</p>
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit as any)}
        className="space-y-8 max-w-5xl mx-auto"
      >
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
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.name.message}
                  </p>
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
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.description.message}
                  </p>
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
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.price.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="previousPrice">
                  Previous Price ($) - Optional
                </Label>
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
                <Label htmlFor="gender">Gender (Optional)</Label>
                <Select
                  onValueChange={(value) => {
                    // Allow clearing the selection
                    if (value === "clear") {
                      form.setValue("gender", undefined);
                    } else {
                      form.setValue(
                        "gender",
                        value as "MALE" | "FEMALE" | "UNISEX"
                      );
                    }
                  }}
                  value={form.watch("gender") || ""}
                >
                  <SelectTrigger className="border-primary/20 focus-visible:ring-primary mt-2">
                    <SelectValue placeholder="Select gender (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                    <SelectItem value="clear">
                      No gender (clear selection)
                    </SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.gender && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.gender.message}
                  </p>
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
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.stock.message}
                  </p>
                )}
                {stockWarning && (
                  <p className="text-sm text-destructive mt-1">
                    {stockWarning}
                  </p>
                )}
              </div>

              <div className="col-span-full flex items-center space-x-2">
                <Checkbox
                  id="popularity"
                  checked={form.watch("popularity")}
                  onCheckedChange={(checked) =>
                    form.setValue("popularity", !!checked)
                  }
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor="popularity" className="text-sm cursor-pointer">
                  Mark as Popular Product
                </Label>
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
            <div className="space-y-4">
              {categories.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Loading categories...
                </div>
              ) : (
                categories.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={form.watch("categories").includes(category.id)}
                        onCheckedChange={(checked) => {
                          const current = form.watch("categories");
                          if (checked) {
                            form.setValue("categories", [
                              ...current,
                              category.id,
                            ]);
                          } else {
                            form.setValue(
                              "categories",
                              current.filter((id) => id !== category.id)
                            );
                          }
                        }}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-0.5"
                      />
                      <div className="flex-1">
                        <Collapsible
                          open={categoryExpanded[category.id] || false}
                          onOpenChange={(open: boolean) => {
                            setCategoryExpanded((prev) => ({
                              ...prev,
                              [category.id]: open,
                            }));
                          }}
                        >
                          <div className="flex items-center">
                            <Label
                              htmlFor={`category-${category.id}`}
                              className="text-sm font-medium cursor-pointer flex-1"
                            >
                              {category.name}
                            </Label>
                            {category.subcategories &&
                              category.subcategories.length > 0 && (
                                <CollapsibleTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-0 h-7 w-7"
                                  >
                                    {categoryExpanded[category.id] ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </Button>
                                </CollapsibleTrigger>
                              )}
                          </div>
                          {category.subcategories &&
                            category.subcategories.length > 0 && (
                              <CollapsibleContent className="pl-6 mt-1 space-y-1 border-l-2 border-muted ml-1">
                                {category.subcategories.map((subCategory) => (
                                  <div
                                    key={subCategory.id}
                                    className="flex items-start space-x-2 py-1"
                                  >
                                    <Checkbox
                                      id={`category-${subCategory.id}`}
                                      checked={form
                                        .watch("categories")
                                        .includes(subCategory.id)}
                                      onCheckedChange={(checked) => {
                                        const current =
                                          form.watch("categories");
                                        if (checked) {
                                          form.setValue("categories", [
                                            ...current,
                                            subCategory.id,
                                          ]);
                                        } else {
                                          form.setValue(
                                            "categories",
                                            current.filter(
                                              (id) => id !== subCategory.id
                                            )
                                          );
                                        }
                                      }}
                                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-0.5"
                                    />
                                    <Label
                                      htmlFor={`category-${subCategory.id}`}
                                      className="text-sm font-normal cursor-pointer"
                                    >
                                      {subCategory.name}
                                    </Label>
                                  </div>
                                ))}
                              </CollapsibleContent>
                            )}
                        </Collapsible>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {form.formState.errors.categories && (
              <p className="text-sm text-destructive mt-4">
                {form.formState.errors.categories.message}
              </p>
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
                  {existingImages.map((image) => (
                    <div key={image.imageId} className="relative group">
                      <div
                        className={`aspect-square w-full h-24 overflow-hidden bg-muted rounded-md border ${
                          image.mainImage
                            ? "border-primary border-2"
                            : "border-border/40"
                        }`}
                      >
                        <img
                          src={image.imageUrl}
                          alt={`Product image`}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 flex space-x-1">
                        {!image.mainImage && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="icon"
                                  className="h-6 w-6 rounded-full opacity-90 hover:opacity-100 shadow-sm bg-gray-200"
                                  onClick={() => setMainImage(image.imageId)}
                                  disabled={isSettingMainImage}
                                >
                                  <Star className="w-3 h-3 text-gray-500" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Set as main image</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {image.mainImage && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="h-6 w-6 rounded-full flex items-center justify-center bg-yellow-500 text-white shadow-sm">
                                  <Star className="w-3 h-3 fill-current text-yellow-100" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Main image</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-6 w-6 rounded-full opacity-90 hover:opacity-100 shadow-sm"
                          onClick={() => removeExistingImage(image.imageId)}
                          disabled={isImageDeleting}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      {image.mainImage && (
                        <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-xs text-center py-0.5">
                          Main Image
                        </div>
                      )}
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
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, JPEG (MAX. 5 files)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isImageUploading
                      ? "Uploading..."
                      : `${existingImages.length}/5 images used`}
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isImageUploading || existingImages.length >= 5}
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Colors */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="bg-primary/5">
            <CardTitle>Product Colors</CardTitle>
            <CardDescription>Manage colors for this product</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ColorPicker
              colors={productColors}
              onChange={(colors) => {
                setProductColors(colors);
                form.setValue(
                  "colorIds",
                  colors.map((c) => c.colorId || "")
                );
              }}
            />
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
              {sizeFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-col sm:flex-row sm:items-end gap-4 p-4 border border-border/30 rounded-md"
                >
                  <div className="w-full sm:w-1/3 max-w-[200px]">
                    <Label className="mb-2 block">Size</Label>
                    <Select
                      value={form.watch(`sizes.${index}.value`)}
                      onValueChange={(value) =>
                        form.setValue(`sizes.${index}.value`, value)
                      }
                    >
                      <SelectTrigger className="border-primary/20 focus-visible:ring-primary">
                        <SelectValue placeholder="Select a size" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.sizes?.[index]?.value && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.sizes[index]?.value?.message}
                      </p>
                    )}
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
                      value={form.watch(`sizes.${index}.stockForSize`) || ""}
                      onChange={(e) =>
                        form.setValue(
                          `sizes.${index}.stockForSize`,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="border-primary/20 focus-visible:ring-primary"
                    />
                    {form.formState.errors.sizes?.[index]?.stockForSize && (
                      <p className="text-sm text-destructive mt-1">
                        {
                          form.formState.errors.sizes[index]?.stockForSize
                            ?.message
                        }
                      </p>
                    )}
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
                onClick={() => appendSize({ value: "", stockForSize: 0 })}
                className="w-full mt-2 border-primary/20 hover:bg-primary/5 hover:text-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Size Variant
              </Button>
            </div>
            {stockWarning && (
              <p className="text-sm text-amber-600 mt-4">{stockWarning}</p>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 bottom-6 bg-background py-4 border-t border-border/30 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/products/${productId}`)}
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
