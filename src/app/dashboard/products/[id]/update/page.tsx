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
  Eye,
  Edit,
  Copy,
  AlertCircle,
} from "lucide-react";
import { productService } from "@/lib/services/product-service";
import { categoryService } from "@/lib/services/category-service";
import { brandService } from "@/lib/services/brand-service";
import { ColorPicker } from "@/components/ColorPicker";
import axios from "axios";
import { API_ENDPOINTS } from "@/lib/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProductColor } from "@/lib/types/product";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Comprehensive product schema matching the API response
const productUpdateSchema = z.object({
  // Basic Information
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().optional(),
  model: z.string().optional(),
  slug: z.string().optional(),

  // Pricing
  basePrice: z.coerce.number().min(0.01, "Base price must be greater than 0"),
  salePrice: z.coerce.number().min(0.01).optional(),
  discountedPrice: z.coerce.number().min(0.01).optional(),
  costPrice: z.coerce.number().min(0.01).optional(),

  // Inventory
  stockQuantity: z.coerce
    .number()
    .min(0, "Stock quantity must be 0 or greater"),

  // Categorization
  categoryId: z.coerce.number().min(1, "Category is required"),
  brandId: z.coerce.number().optional(),

  // Status Flags
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isOnSale: z.boolean().default(false),

  // SEO & Meta
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),

  // Physical Properties
  dimensionsCm: z.string().optional(),
  weightKg: z.coerce.number().min(0).optional(),

  // Full Description
  fullDescription: z.string().optional(),

  // Variants
  variants: z
    .array(
      z.object({
        variantId: z.string().optional(),
        variantSku: z.string().min(1, "Variant SKU is required"),
        variantName: z.string().min(1, "Variant name is required"),
        variantBarcode: z.string().optional(),
        price: z.coerce.number().min(0.01, "Price must be greater than 0"),
        salePrice: z.coerce.number().min(0.01).optional(),
        costPrice: z.coerce.number().min(0.01).optional(),
        stockQuantity: z.coerce.number().min(0, "Stock must be 0 or greater"),
        isActive: z.boolean().default(true),
        isInStock: z.boolean().default(true),
        isLowStock: z.boolean().default(false),
        attributes: z
          .array(
            z.object({
              attributeValueId: z.coerce.number().optional(),
              attributeValue: z.string().min(1, "Attribute value is required"),
              attributeTypeId: z.coerce
                .number()
                .min(1, "Attribute type is required"),
              attributeType: z
                .string()
                .min(1, "Attribute type name is required"),
            })
          )
          .optional(),
        images: z
          .array(
            z.object({
              imageId: z.coerce.number().optional(),
              url: z.string().url("Must be a valid URL"),
              altText: z.string().optional(),
              isPrimary: z.boolean().default(false),
              sortOrder: z.coerce.number().default(0),
            })
          )
          .optional(),
      })
    )
    .optional(),

  // Images
  images: z
    .array(
      z.object({
        imageId: z.coerce.number().optional(),
        url: z.string().url("Must be a valid URL"),
        altText: z.string().optional(),
        isPrimary: z.boolean().default(false),
        sortOrder: z.coerce.number().default(0),
      })
    )
    .optional(),

  // Videos
  videos: z
    .array(
      z.object({
        videoId: z.coerce.number().optional(),
        url: z.string().url("Must be a valid URL"),
        altText: z.string().optional(),
        sortOrder: z.coerce.number().default(0),
      })
    )
    .optional(),
});

type ProductUpdateForm = z.infer<typeof productUpdateSchema>;

interface ProductUpdateProps {
  params: { id: string };
}

export default function ProductUpdate({ params }: ProductUpdateProps) {
  const productId = params.id;
  const router = useRouter();
  const { toast } = useToast();

  // State management
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isImageDeleting, setIsImageDeleting] = useState(false);
  const [isSettingMainImage, setIsSettingMainImage] = useState(false);

  // Data for dropdowns
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [attributeTypes, setAttributeTypes] = useState<any[]>([]);

  // Form state
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [existingVideos, setExistingVideos] = useState<any[]>([]);
  const [productColors, setProductColors] = useState<ProductColor[]>([]);
  const [categoryExpanded, setCategoryExpanded] = useState<
    Record<string, boolean>
  >({});

  // Form setup
  const form = useForm<ProductUpdateForm>({
    resolver: zodResolver(productUpdateSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      shortDescription: "",
      sku: "",
      barcode: "",
      model: "",
      slug: "",
      basePrice: 0,
      salePrice: undefined,
      discountedPrice: undefined,
      costPrice: undefined,
      stockQuantity: 0,
      categoryId: 0,
      brandId: undefined,
      isActive: true,
      isFeatured: false,
      isBestseller: false,
      isNewArrival: false,
      isOnSale: false,
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      dimensionsCm: "",
      weightKg: 0,
      fullDescription: "",
      variants: [],
      images: [],
      videos: [],
    },
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control: form.control,
    name: "images",
  });

  const {
    fields: videoFields,
    append: appendVideo,
    remove: removeVideo,
  } = useFieldArray({
    control: form.control,
    name: "videos",
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch categories
        try {
          const categoriesData =
            await categoryService.getAllCategoriesForDropdown();
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        } catch (error) {
          console.error("Error fetching categories:", error);
          setCategories([]);
        }

        // Fetch brands
        try {
          // Try multiple methods to get brands
          let brandsData;
          try {
            brandsData = await brandService.getAllBrandsForDropdown();
          } catch (dropdownError) {
            console.warn(
              "Dropdown endpoint failed, trying active brands:",
              dropdownError
            );
            try {
              brandsData = await brandService.getActiveBrands();
            } catch (activeError) {
              console.warn(
                "Active brands failed, using paginated:",
                activeError
              );
              const paginatedResponse = await brandService.getAllBrands(
                0,
                1000
              );
              brandsData = paginatedResponse.content || [];
            }
          }
          console.log("Brands data received:", brandsData);
          console.log("Is array:", Array.isArray(brandsData));
          setBrands(Array.isArray(brandsData) ? brandsData : []);
        } catch (error) {
          console.error("Error fetching brands:", error);
          setBrands([]);
        }

        // Fetch product data
        const productData = await productService.getProductById(productId);
        setProduct(productData);

        // Set existing media
        if (productData.images && productData.images.length > 0) {
          setExistingImages(productData.images);
        }
        if (productData.videos && productData.videos.length > 0) {
          setExistingVideos(productData.videos);
        }

        // Pre-populate the form with product data
        form.reset({
          name: productData.name || "",
          description: productData.description || "",
          shortDescription: productData.shortDescription || "",
          sku: productData.sku || "",
          barcode: productData.barcode || "",
          model: productData.model || "",
          slug: productData.slug || "",
          basePrice: productData.basePrice || 0,
          salePrice: productData.salePrice || undefined,
          discountedPrice: productData.discountedPrice || undefined,
          costPrice: productData.costPrice || undefined,
          stockQuantity: productData.stockQuantity || 0,
          categoryId: productData.categoryId || 0,
          brandId: productData.brandId || undefined,
          isActive: productData.isActive ?? true,
          isFeatured: productData.isFeatured ?? false,
          isBestseller: productData.isBestseller ?? false,
          isNewArrival: productData.isNewArrival ?? false,
          isOnSale: productData.isOnSale ?? false,
          metaTitle: productData.metaTitle || "",
          metaDescription: productData.metaDescription || "",
          metaKeywords: productData.metaKeywords || "",
          dimensionsCm: productData.dimensionsCm || "",
          weightKg: productData.weightKg || 0,
          fullDescription: productData.fullDescription || "",
          variants: (productData.variants || []).map((variant: any) => ({
            ...variant,
            variantId: variant.variantId || undefined,
            variantSku: variant.variantSku || "",
            variantName: variant.variantName || "",
            variantBarcode: variant.variantBarcode || "",
            price: variant.price || 0,
            salePrice: variant.salePrice || undefined,
            costPrice: variant.costPrice || undefined,
            stockQuantity: variant.stockQuantity || 0,
            isActive: variant.isActive ?? true,
            isInStock: variant.isInStock ?? true,
            isLowStock: variant.isLowStock ?? false,
            attributes: variant.attributes || [],
            images: variant.images || [],
          })),
          images: productData.images || [],
          videos: productData.videos || [],
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

  // Image handling functions
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(e.target.files || []);
      const newImages = files.slice(
        0,
        10 - selectedImages.length - existingImages.length
      );

      if (
        existingImages.length + selectedImages.length + newImages.length >
        10
      ) {
        toast({
          title: "Maximum 10 images allowed",
          description: "You can upload a maximum of 10 images per product",
          variant: "destructive",
        });
        return;
      }

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

      setProduct(response.data);
      setExistingImages(response.data.images);

      toast({
        title: "Images uploaded",
        description: "Images have been uploaded successfully",
      });

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

  const removeExistingImage = async (imageId: string) => {
    try {
      setIsImageDeleting(true);

      await axios.delete(
        `${API_ENDPOINTS.PRODUCTS.BY_ID(productId)}/images/${imageId}`,
        { withCredentials: true }
      );

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

  // Form submission
  const onSubmit = async (data: ProductUpdateForm) => {
    try {
      setIsSubmitting(true);

      // Prepare the update data
      const updateData = {
        name: data.name,
        description: data.description,
        shortDescription: data.shortDescription,
        sku: data.sku,
        barcode: data.barcode,
        model: data.model,
        slug: data.slug,
        basePrice: data.basePrice,
        salePrice: data.salePrice,
        discountedPrice: data.discountedPrice,
        costPrice: data.costPrice,
        stockQuantity: data.stockQuantity,
        categoryId: data.categoryId,
        brandId: data.brandId,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        isBestseller: data.isBestseller,
        isNewArrival: data.isNewArrival,
        isOnSale: data.isOnSale,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
        dimensionsCm: data.dimensionsCm,
        weightKg: data.weightKg,
        fullDescription: data.fullDescription,
        variants: data.variants,
      };

      await productService.updateProduct(productId, updateData);

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
              <p className="text-muted-foreground">
                Modify product details for: <strong>{product.name}</strong>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/products/${productId}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Product
            </Button>
          </div>
        </div>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit as any)}
        className="space-y-8 max-w-6xl mx-auto"
      >
        {/* Basic Information */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Essential product details and identification
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-full">
                <Label htmlFor="name">Product Name *</Label>
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

              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  placeholder="Enter SKU"
                  {...form.register("sku")}
                  className="border-primary/20 focus-visible:ring-primary mt-2"
                />
                {form.formState.errors.sku && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.sku.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  placeholder="Enter barcode"
                  {...form.register("barcode")}
                  className="border-primary/20 focus-visible:ring-primary mt-2"
                />
              </div>

              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  placeholder="Enter model"
                  {...form.register("model")}
                  className="border-primary/20 focus-visible:ring-primary mt-2"
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="Enter URL slug"
                  {...form.register("slug")}
                  className="border-primary/20 focus-visible:ring-primary mt-2"
                />
              </div>

              <div className="col-span-full">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea
                  id="shortDescription"
                  placeholder="Brief product description"
                  {...form.register("shortDescription")}
                  className="min-h-[80px] border-primary/20 focus-visible:ring-primary mt-2"
                  rows={3}
                />
              </div>

              <div className="col-span-full">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed product description"
                  {...form.register("description")}
                  className="min-h-[120px] border-primary/20 focus-visible:ring-primary mt-2"
                  rows={4}
                />
              </div>

              <div className="col-span-full">
                <Label htmlFor="fullDescription">Full Description</Label>
                <Textarea
                  id="fullDescription"
                  placeholder="Comprehensive product description"
                  {...form.register("fullDescription")}
                  className="min-h-[150px] border-primary/20 focus-visible:ring-primary mt-2"
                  rows={6}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Inventory */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              Pricing & Inventory
            </CardTitle>
            <CardDescription>
              Set product pricing and stock levels
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <Label htmlFor="basePrice">Base Price *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register("basePrice")}
                  className="border-primary/20 focus-visible:ring-primary mt-2"
                />
                {form.formState.errors.basePrice && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.basePrice.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="salePrice">Sale Price</Label>
                <Input
                  id="salePrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register("salePrice")}
                  className="border-primary/20 focus-visible:ring-primary mt-2"
                />
              </div>

              <div>
                <Label htmlFor="discountedPrice">Discounted Price</Label>
                <Input
                  id="discountedPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register("discountedPrice")}
                  className="border-primary/20 focus-visible:ring-primary mt-2"
                />
              </div>

              <div>
                <Label htmlFor="costPrice">Cost Price</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register("costPrice")}
                  className="border-primary/20 focus-visible:ring-primary mt-2"
                />
              </div>

              <div>
                <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  placeholder="0"
                  {...form.register("stockQuantity")}
                  className="border-primary/20 focus-visible:ring-primary mt-2"
                />
                {form.formState.errors.stockQuantity && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.stockQuantity.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="weightKg">Weight (kg)</Label>
                <Input
                  id="weightKg"
                  type="number"
                  step="0.001"
                  placeholder="0.000"
                  {...form.register("weightKg")}
                  className="border-primary/20 focus-visible:ring-primary mt-2"
                />
              </div>

              <div>
                <Label htmlFor="dimensionsCm">Dimensions (cm)</Label>
                <Input
                  id="dimensionsCm"
                  placeholder="LxWxH"
                  {...form.register("dimensionsCm")}
                  className="border-primary/20 focus-visible:ring-primary mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categorization */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="bg-primary/5">
            <CardTitle>Categorization</CardTitle>
            <CardDescription>
              Organize your product with categories and brands
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="categoryId">Category *</Label>
                <Select
                  onValueChange={(value) =>
                    form.setValue("categoryId", parseInt(value))
                  }
                  value={form.watch("categoryId")?.toString() || ""}
                >
                  <SelectTrigger className="border-primary/20 focus-visible:ring-primary mt-2">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter(
                        (category) =>
                          category &&
                          category.id !== undefined &&
                          category.id !== null
                      )
                      .map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.categoryId && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.categoryId.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="brandId">Brand</Label>
                <Select
                  onValueChange={(value) =>
                    form.setValue("brandId", parseInt(value))
                  }
                  value={form.watch("brandId")?.toString() || ""}
                >
                  <SelectTrigger className="border-primary/20 focus-visible:ring-primary mt-2">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(brands) && brands.length > 0 ? (
                      brands
                        .filter(
                          (brand) =>
                            brand && brand.id !== undefined && brand.id !== null
                        )
                        .map((brand) => (
                          <SelectItem
                            key={brand.id}
                            value={brand.id.toString()}
                          >
                            {brand.name}
                          </SelectItem>
                        ))
                    ) : (
                      <SelectItem value="" disabled>
                        No brands available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Status */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="bg-primary/5">
            <CardTitle>Product Status</CardTitle>
            <CardDescription>
              Control product visibility and special flags
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={form.watch("isActive")}
                  onCheckedChange={(checked) =>
                    form.setValue("isActive", !!checked)
                  }
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor="isActive" className="text-sm cursor-pointer">
                  Active Product
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFeatured"
                  checked={form.watch("isFeatured")}
                  onCheckedChange={(checked) =>
                    form.setValue("isFeatured", !!checked)
                  }
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor="isFeatured" className="text-sm cursor-pointer">
                  Featured Product
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isBestseller"
                  checked={form.watch("isBestseller")}
                  onCheckedChange={(checked) =>
                    form.setValue("isBestseller", !!checked)
                  }
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label
                  htmlFor="isBestseller"
                  className="text-sm cursor-pointer"
                >
                  Bestseller
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isNewArrival"
                  checked={form.watch("isNewArrival")}
                  onCheckedChange={(checked) =>
                    form.setValue("isNewArrival", !!checked)
                  }
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label
                  htmlFor="isNewArrival"
                  className="text-sm cursor-pointer"
                >
                  New Arrival
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isOnSale"
                  checked={form.watch("isOnSale")}
                  onCheckedChange={(checked) =>
                    form.setValue("isOnSale", !!checked)
                  }
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor="isOnSale" className="text-sm cursor-pointer">
                  On Sale
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEO & Meta Information */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="bg-primary/5">
            <CardTitle>SEO & Meta Information</CardTitle>
            <CardDescription>
              Optimize your product for search engines
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-full">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  placeholder="SEO title for search engines"
                  {...form.register("metaTitle")}
                  className="border-primary/20 focus-visible:ring-primary mt-2"
                />
              </div>

              <div className="col-span-full">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  placeholder="SEO description for search engines"
                  {...form.register("metaDescription")}
                  className="min-h-[80px] border-primary/20 focus-visible:ring-primary mt-2"
                  rows={3}
                />
              </div>

              <div className="col-span-full">
                <Label htmlFor="metaKeywords">Meta Keywords</Label>
                <Input
                  id="metaKeywords"
                  placeholder="Keywords separated by commas"
                  {...form.register("metaKeywords")}
                  className="border-primary/20 focus-visible:ring-primary mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Images */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Product Images
            </CardTitle>
            <CardDescription>
              Manage product images and set the main image
            </CardDescription>
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
                          image.isPrimary
                            ? "border-primary border-2"
                            : "border-border/40"
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={image.altText || "Product image"}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 flex space-x-1">
                        {!image.isPrimary && (
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
                        {image.isPrimary && (
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
                      {image.isPrimary && (
                        <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-xs text-center py-0.5">
                          Main Image
                        </div>
                      )}
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
                    PNG, JPG, JPEG (MAX. 10 files)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isImageUploading
                      ? "Uploading..."
                      : `${existingImages.length}/10 images used`}
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isImageUploading || existingImages.length >= 10}
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Product Variants */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5" />
              Product Variants
            </CardTitle>
            <CardDescription>
              Manage product variants with different attributes and pricing
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {variantFields.map((field, index) => {
                if (!field || !field.id) {
                  console.warn(
                    `Variant field at index ${index} is invalid:`,
                    field
                  );
                  return null;
                }
                return (
                  <div
                    key={field.id}
                    className="p-4 border border-border/30 rounded-md space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Variant {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeVariant(index)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`variants.${index}.variantSku`}>
                          Variant SKU *
                        </Label>
                        <Input
                          id={`variants.${index}.variantSku`}
                          placeholder="Enter variant SKU"
                          {...form.register(`variants.${index}.variantSku`)}
                          className="border-primary/20 focus-visible:ring-primary mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`variants.${index}.variantName`}>
                          Variant Name *
                        </Label>
                        <Input
                          id={`variants.${index}.variantName`}
                          placeholder="Enter variant name"
                          {...form.register(`variants.${index}.variantName`)}
                          className="border-primary/20 focus-visible:ring-primary mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`variants.${index}.variantBarcode`}>
                          Variant Barcode
                        </Label>
                        <Input
                          id={`variants.${index}.variantBarcode`}
                          placeholder="Enter variant barcode"
                          {...form.register(`variants.${index}.variantBarcode`)}
                          className="border-primary/20 focus-visible:ring-primary mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`variants.${index}.price`}>
                          Price *
                        </Label>
                        <Input
                          id={`variants.${index}.price`}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...form.register(`variants.${index}.price`)}
                          className="border-primary/20 focus-visible:ring-primary mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`variants.${index}.salePrice`}>
                          Sale Price
                        </Label>
                        <Input
                          id={`variants.${index}.salePrice`}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...form.register(`variants.${index}.salePrice`)}
                          className="border-primary/20 focus-visible:ring-primary mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`variants.${index}.costPrice`}>
                          Cost Price
                        </Label>
                        <Input
                          id={`variants.${index}.costPrice`}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...form.register(`variants.${index}.costPrice`)}
                          className="border-primary/20 focus-visible:ring-primary mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`variants.${index}.stockQuantity`}>
                          Stock Quantity *
                        </Label>
                        <Input
                          id={`variants.${index}.stockQuantity`}
                          type="number"
                          placeholder="0"
                          {...form.register(`variants.${index}.stockQuantity`)}
                          className="border-primary/20 focus-visible:ring-primary mt-2"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`variants.${index}.isActive`}
                          checked={form.watch(`variants.${index}.isActive`)}
                          onCheckedChange={(checked) =>
                            form.setValue(
                              `variants.${index}.isActive`,
                              !!checked
                            )
                          }
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label
                          htmlFor={`variants.${index}.isActive`}
                          className="text-sm cursor-pointer"
                        >
                          Active
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`variants.${index}.isInStock`}
                          checked={form.watch(`variants.${index}.isInStock`)}
                          onCheckedChange={(checked) =>
                            form.setValue(
                              `variants.${index}.isInStock`,
                              !!checked
                            )
                          }
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label
                          htmlFor={`variants.${index}.isInStock`}
                          className="text-sm cursor-pointer"
                        >
                          In Stock
                        </Label>
                      </div>
                    </div>
                  </div>
                );
              })}

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  appendVariant({
                    variantSku: "",
                    variantName: "",
                    variantBarcode: "",
                    price: 0,
                    salePrice: undefined,
                    costPrice: undefined,
                    stockQuantity: 0,
                    isActive: true,
                    isInStock: true,
                    isLowStock: false,
                    attributes: [],
                    images: [],
                  })
                }
                className="w-full mt-2 border-primary/20 hover:bg-primary/5 hover:text-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product Variant
              </Button>
            </div>
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
