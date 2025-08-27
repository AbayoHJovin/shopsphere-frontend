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
import { productColorService } from "@/lib/services/product-color-service";
import { productSizeService } from "@/lib/services/product-size-service";
import { productService } from "@/lib/services/product-service";
import { Size, Gender } from "@/lib/types/product";
import { CategoryDropdown } from "@/components/products/CategoryDropdown";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import FetchAttributesDialog from "@/components/products/FetchAttributesDialog";

// Product schema with validation
const productSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must not exceed 255 characters"),
  shortDescription: z
    .string()
    .max(255, "Short description must not exceed 255 characters")
    .optional(),
  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .optional(),
  sku: z
    .string()
    .min(3, "SKU must be at least 3 characters")
    .max(50, "SKU must not exceed 50 characters"),
  barcode: z
    .string()
    .max(50, "Barcode must not exceed 50 characters")
    .optional(),
  basePrice: z.coerce.number().min(0.01, "Base price must be greater than 0"),
  compareAtPrice: z.coerce
    .number()
    .min(0.01, "Compare at price must be greater than 0")
    .optional(),
  costPrice: z.coerce
    .number()
    .min(0.01, "Cost price must be greater than 0")
    .optional(),
  stockQuantity: z.coerce
    .number()
    .int()
    .min(0, "Stock quantity must be at least 0"),
  lowStockThreshold: z.coerce
    .number()
    .int()
    .min(0, "Low stock threshold must be at least 0")
    .optional(),
  categoryId: z.coerce.number().min(1, "Category is required"),
  brandId: z.string().uuid().optional(),
  model: z.string().max(100, "Model must not exceed 100 characters").optional(),
  slug: z.string().max(255, "Slug must not exceed 255 characters").optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
  dimensions: z.string().optional(),
  weight: z.coerce.number().min(0, "Weight must be at least 0").optional(),
  material: z.string().optional(),
  warranty: z.string().optional(),
  careInstructions: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  searchKeywords: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

// Define the product variant type for the form
interface ProductVariant {
  variantSku: string;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
  sortOrder: number;
  isActive: boolean;
  attributes: Record<string, string>;
  images: File[];
}

// Define the product attribute type for the form
interface ProductAttribute {
  name: string;
  required: boolean;
  values: string[];
}

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
      shortDescription: "",
      description: "",
      sku: "",
      barcode: "",
      basePrice: 0,
      compareAtPrice: 0,
      costPrice: 0,
      stockQuantity: 0,
      lowStockThreshold: 5,
      categoryId: 0,
      brandId: "",
      model: "",
      slug: "",
      isActive: true,
      isFeatured: false,
      isBestseller: false,
      isNewArrival: false,
      isOnSale: false,
      dimensions: "",
      weight: 0,
      material: "",
      warranty: "",
      careInstructions: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      searchKeywords: "",
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
  const [mainImages, setMainImages] = useState<File[]>([]);
  const [mainImageUrls, setMainImageUrls] = useState<string[]>([]);
  const [productVideos, setProductVideos] = useState<File[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);

  // State for attributes and variants
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // State for colors
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [sizes, setSizes] = useState<ProductSize[]>([]);

  // Fetch available colors for reuse
  const { data: availableColors, isLoading: colorsLoading } = useQuery({
    queryKey: ["product-colors"],
    queryFn: () => productColorService.getAllColors(0, 100),
  });

  // Get available sizes from enum
  const availableSizes = productSizeService.getAvailableSizes();

  // Initialize the page
  useEffect(() => {
    // Add default attributes for demonstration
    if (attributes.length === 0) {
      const defaultAttributes: ProductAttribute[] = [
        {
          name: "Color",
          required: true,
          values: ["Red", "Blue", "Black", "White"],
        },
        {
          name: "Size",
          required: true,
          values: ["Small", "Medium", "Large"],
        },
      ];
      setAttributes(defaultAttributes);
    }
  }, []);

  // Auto-generate SKU if empty
  useEffect(() => {
    const name = form.watch("name");
    const sku = form.watch("sku");

    if (name && !sku) {
      const generatedSku = name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      form.setValue("sku", generatedSku + "-001");
    }
  }, [form.watch("name")]);

  // Auto-generate slug if empty
  useEffect(() => {
    const name = form.watch("name");
    const slug = form.watch("slug");

    if (name && !slug) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      form.setValue("slug", generatedSlug);
    }
  }, [form.watch("name")]);

  // Watch the stock field to validate against size quantities
  const stockValue = form.watch("stockQuantity");
  const categoryId = form.watch("categoryId");

  // Validate total stock against size quantities
  useEffect(() => {
    const totalStock =
      typeof stockValue === "number" ? stockValue : parseInt(stockValue) || 0;
    const totalSizeStock = sizes.reduce(
      (sum: number, size: ProductSize) => sum + size.stockForSize,
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

  const handleMainImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const files = Array.from(event.target.files);

    // Validate each image file
    const validImages: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        errors.push(`${file.name}: File size exceeds 50MB limit`);
        continue;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        errors.push(
          `${file.name}: Invalid file type. Only image files are allowed.`
        );
        continue;
      }

      validImages.push(file);
    }

    // Show errors if any
    if (errors.length > 0) {
      toast({
        title: "Image Upload Errors",
        description: errors.join("\n"),
        variant: "destructive",
      });
    }

    // Only add valid images
    const newImages = validImages.slice(0, 10 - mainImages.length);

    if (newImages.length === 0) return;

    // Create URLs for preview
    const newUrls = newImages.map((file) => URL.createObjectURL(file));

    setMainImages((prev) => [...prev, ...newImages]);
    setMainImageUrls((prev) => [...prev, ...newUrls]);

    if (newImages.length > 0) {
      toast({
        title: "Images Added",
        description: `Successfully added ${newImages.length} image(s)`,
        variant: "default",
      });
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const files = Array.from(event.target.files);

    // Validate each video file
    const validVideos: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        errors.push(`${file.name}: File size exceeds 100MB limit`);
        continue;
      }

      // Check file type
      if (!file.type.startsWith("video/")) {
        errors.push(
          `${file.name}: Invalid file type. Only video files are allowed.`
        );
        continue;
      }

      validVideos.push(file);
    }

    // Show errors if any
    if (errors.length > 0) {
      toast({
        title: "Video Upload Errors",
        description: errors.join("\n"),
        variant: "destructive",
      });
    }

    // Only add valid videos
    const newVideos = validVideos.slice(0, 5 - productVideos.length);

    if (newVideos.length === 0) return;

    // Create URLs for preview
    const newUrls = newVideos.map((file) => URL.createObjectURL(file));

    setProductVideos((prev) => [...prev, ...newVideos]);
    setVideoUrls((prev) => [...prev, ...newUrls]);

    if (newVideos.length > 0) {
      toast({
        title: "Videos Added",
        description: `Successfully added ${newVideos.length} video(s)`,
        variant: "default",
      });
    }
  };

  const removeMainImage = (index: number) => {
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(mainImageUrls[index]);

    setMainImages((prev) => prev.filter((_, i) => i !== index));
    setMainImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(videoUrls[index]);

    setProductVideos((prev) => prev.filter((_, i) => i !== index));
    setVideoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Attribute management functions
  const addAttribute = () => {
    const newAttribute: ProductAttribute = {
      name: "",
      required: false,
      values: [],
    };
    setAttributes([...attributes, newAttribute]);
  };

  const updateAttribute = (
    index: number,
    field: keyof ProductAttribute,
    value: any
  ) => {
    setAttributes((prev) =>
      prev.map((attr, i) => (i === index ? { ...attr, [field]: value } : attr))
    );
  };

  const removeAttribute = (index: number) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  const addAttributeValue = (attributeIndex: number, value: string) => {
    if (!value.trim()) return;

    setAttributes((prev) =>
      prev.map((attr, i) =>
        i === attributeIndex
          ? { ...attr, values: [...attr.values, value.trim()] }
          : attr
      )
    );
  };

  const removeAttributeValue = (attributeIndex: number, valueIndex: number) => {
    setAttributes((prev) =>
      prev.map((attr, i) =>
        i === attributeIndex
          ? {
              ...attr,
              values: attr.values.filter((_, vi) => vi !== valueIndex),
            }
          : attr
      )
    );
  };

  // Handle attributes fetched from backend
  const handleAttributesFromBackend = (
    backendAttributes: Array<{ name: string; values: string[] }>
  ) => {
    // Convert backend attributes to frontend format
    const newAttributes: ProductAttribute[] = backendAttributes.map((attr) => ({
      name: attr.name,
      required: false,
      values: attr.values,
    }));

    // Add to existing attributes, avoiding duplicates
    setAttributes((prev) => {
      const existingNames = new Set(prev.map((a) => a.name.toLowerCase()));
      const newOnes = newAttributes.filter(
        (attr) => !existingNames.has(attr.name.toLowerCase())
      );
      return [...prev, ...newOnes];
    });

    toast({
      title: "Attributes Added",
      description: `Added ${newAttributes.length} attributes from backend`,
      variant: "default",
    });
  };

  // Variant management functions
  const generateVariants = () => {
    if (attributes.length === 0) {
      toast({
        title: "No attributes",
        description: "Please add at least one attribute type first",
        variant: "destructive",
      });
      return;
    }

    // Generate all possible combinations
    const combinations = generateCombinations();

    if (combinations.length === 0) {
      toast({
        title: "No attribute values",
        description: "Please add values to your attribute types first",
        variant: "destructive",
      });
      return;
    }

    const newVariants: ProductVariant[] = combinations.map(
      (combination, index) => ({
        variantSku: "",
        price: form.getValues("basePrice"),
        stockQuantity: 0,
        lowStockThreshold: form.getValues("lowStockThreshold") || 5,
        sortOrder: index,
        isActive: true,
        attributes: combination,
        images: [],
      })
    );

    setVariants(newVariants);
  };

  const generateCombinations = (): Record<string, string>[] => {
    const validAttributes = attributes.filter((attr) => attr.values.length > 0);

    if (validAttributes.length === 0) return [];

    const combinations: Record<string, string>[] = [];
    const stack: Record<string, string>[] = [{}];

    while (stack.length > 0) {
      const current = stack.pop()!;

      if (Object.keys(current).length === validAttributes.length) {
        combinations.push(current);
      } else {
        const nextType = validAttributes[Object.keys(current).length];
        const values = nextType.values;

        values.forEach((value) => {
          const newCombination = { ...current };
          newCombination[nextType.name] = value;
          stack.push(newCombination);
        });
      }
    }

    return combinations;
  };

  const updateVariant = (
    index: number,
    field: keyof ProductVariant,
    value: any
  ) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      )
    );
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const clearVariants = () => {
    setVariants([]);
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
    const totalStock = form.getValues("stockQuantity");
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
      setIsSubmitting(true);

      // Validate that we have at least one category
      if (!data.categoryId) {
        toast({
          title: "Error",
          description: "Please select a category",
          variant: "destructive",
        });
        return;
      }

      // Validate that we have at least one variant if attributes are defined
      if (attributes.length > 0 && variants.length === 0) {
        toast({
          title: "Error",
          description: "Please generate variants from attributes first",
          variant: "destructive",
        });
        return;
      }

      // Validate that size stock matches total stock if sizes are provided
      const totalStock =
        typeof data.stockQuantity === "number"
          ? data.stockQuantity
          : parseInt(data.stockQuantity) || 0;
      const totalSizeStock = calculateTotalSizeStock();

      if (sizes.length > 0 && totalSizeStock !== totalStock) {
        toast({
          title: "Stock Mismatch",
          description: `Total stock (${totalStock}) must match the sum of size quantities (${totalSizeStock})`,
          variant: "destructive",
        });
        return;
      }

      // Create FormData for multipart submission
      const formData = new FormData();

      // Basic product information
      formData.append("name", data.name);
      formData.append("shortDescription", data.shortDescription || "");
      formData.append("description", data.description || "");
      formData.append("sku", data.sku);
      if (data.barcode) formData.append("barcode", data.barcode);
      formData.append("basePrice", data.basePrice.toString());
      if (data.compareAtPrice)
        formData.append("compareAtPrice", data.compareAtPrice.toString());
      if (data.costPrice)
        formData.append("costPrice", data.costPrice.toString());
      formData.append("stockQuantity", data.stockQuantity.toString());
      if (data.lowStockThreshold)
        formData.append("lowStockThreshold", data.lowStockThreshold.toString());
      formData.append("categoryId", data.categoryId.toString());
      if (data.brandId) formData.append("brandId", data.brandId);
      if (data.model) formData.append("model", data.model);
      if (data.slug) formData.append("slug", data.slug);
      formData.append("isActive", String(data.isActive));
      formData.append("isFeatured", String(data.isFeatured));
      formData.append("isBestseller", String(data.isBestseller));
      formData.append("isNewArrival", String(data.isNewArrival));
      formData.append("isOnSale", String(data.isOnSale));

      // Product details
      if (data.dimensions) formData.append("dimensions", data.dimensions);
      if (data.weight) formData.append("weight", data.weight.toString());
      if (data.material) formData.append("material", data.material);
      if (data.warranty) formData.append("warranty", data.warranty);
      if (data.careInstructions)
        formData.append("careInstructions", data.careInstructions);

      // SEO & Meta
      if (data.metaTitle) formData.append("metaTitle", data.metaTitle);
      if (data.metaDescription)
        formData.append("metaDescription", data.metaDescription);
      if (data.metaKeywords) formData.append("metaKeywords", data.metaKeywords);
      if (data.searchKeywords)
        formData.append("searchKeywords", data.searchKeywords);

      // Main product images
      if (mainImages.length > 0) {
        mainImages.forEach((image) => {
          formData.append("productImages", image);
        });
      }

      // Product videos
      if (productVideos.length > 0) {
        productVideos.forEach((video) => {
          formData.append("productVideos", video);
        });
      }

      // Variants - send as JSON string to avoid Spring parsing issues
      if (variants.length > 0) {
        const variantsData = variants.map((variant) => ({
          variantSku: variant.variantSku,
          price: variant.price,
          stockQuantity: variant.stockQuantity,
          lowStockThreshold: variant.lowStockThreshold,
          sortOrder: variant.sortOrder,
          isActive: variant.isActive,
          attributes: variant.attributes,
        }));

        formData.append("variants", JSON.stringify(variantsData));

        const variantImageMapping: { [key: string]: number[] } = {};
        let imageIndex = 0;

        variants.forEach((variant, variantIndex) => {
          if (variant.images && variant.images.length > 0) {
            variantImageMapping[variantIndex] = [];
            variant.images.forEach((image) => {
              formData.append(`variantImages`, image);
              variantImageMapping[variantIndex].push(imageIndex);
              imageIndex++;
            });
          }
        });

        // Add the mapping as JSON string
        if (Object.keys(variantImageMapping).length > 0) {
          formData.append(
            "variantImageMapping",
            JSON.stringify(variantImageMapping)
          );
          console.log("Variant image mapping:", variantImageMapping);
        }
      }

      // Colors and sizes are now handled through variants/attributes

      console.log("Submitting form data:", formData);

      // Submit to backend
      const response = await productService.createProduct(formData);

      console.log("Product created successfully:", response);

      // Show success message
      toast({
        title: "Success!",
        description: "Product created successfully",
      });

      // Store the created product ID
      setCreatedProductId(response.productId || response.id);

      // Show success modal
      setShowSuccessModal(true);

      // Reset form and stay on page
      form.reset();
      setMainImages([]);
      setMainImageUrls([]);
      setProductVideos([]);
      setVideoUrls([]);
      setAttributes([]);
      setVariants([]);
    } catch (error: any) {
      console.error("Error creating product:", error);

      let errorMessage = "Failed to create product. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
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
    setMainImages([]);
    setMainImageUrls([]);
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create Product
            </h1>
            <p className="text-muted-foreground">
              Add a new product to your inventory
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Product Information */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle>Basic Product Information</CardTitle>
                <CardDescription>
                  Enter the essential details about your product
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., AirPods Pro"
                            {...field}
                            className="border-primary/20 focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shortDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Brief product description"
                            {...field}
                            className="border-primary/20 focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Auto-generated if empty"
                            {...field}
                            className="border-primary/20 focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="barcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Barcode</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Product barcode"
                            {...field}
                            className="border-primary/20 focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            className="border-primary/20 focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="compareAtPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compare At Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            className="border-primary/20 focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="costPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            className="border-primary/20 focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stockQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Stock Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            className="border-primary/20 focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lowStockThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Low Stock Threshold</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="5"
                            {...field}
                            className="border-primary/20 focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Product model"
                            {...field}
                            className="border-primary/20 focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="URL-friendly slug"
                            {...field}
                            className="border-primary/20 focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Full Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed product description..."
                          className="min-h-[100px] border-primary/20 focus-visible:ring-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isActive"
                      checked={form.watch("isActive")}
                      onCheckedChange={(checked) =>
                        form.setValue("isActive", checked as boolean)
                      }
                      className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="isActive" className="text-sm font-medium">
                      Active
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isFeatured"
                      checked={form.watch("isFeatured")}
                      onCheckedChange={(checked) =>
                        form.setValue("isFeatured", checked as boolean)
                      }
                      className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="isFeatured" className="text-sm font-medium">
                      Featured
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isBestseller"
                      checked={form.watch("isBestseller")}
                      onCheckedChange={(checked) =>
                        form.setValue("isBestseller", checked as boolean)
                      }
                      className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                      htmlFor="isBestseller"
                      className="text-sm font-medium"
                    >
                      Bestseller
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isNewArrival"
                      checked={form.watch("isNewArrival")}
                      onCheckedChange={(checked) =>
                        form.setValue("isNewArrival", checked as boolean)
                      }
                      className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                      htmlFor="isNewArrival"
                      className="text-sm font-medium"
                    >
                      New Arrival
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isOnSale"
                      checked={form.watch("isOnSale")}
                      onCheckedChange={(checked) =>
                        form.setValue("isOnSale", checked as boolean)
                      }
                      className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="isOnSale" className="text-sm font-medium">
                      On Sale
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category & Brand Selection */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle>Category & Brand</CardTitle>
                <CardDescription>
                  Select the category and brand for your product
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <CategoryDropdown
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select Category"
                          label="Category *"
                          required={true}
                          error={fieldState.error?.message}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Brand ID (UUID)"
                            {...field}
                            className="border-primary/20 focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle>Product Images</CardTitle>
                <CardDescription>
                  Upload up to 10 product images
                </CardDescription>
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
                          PNG, JPG, JPEG (MAX. 10 files, 50MB each)
                        </p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleMainImageUpload}
                        className="hidden"
                        disabled={mainImages.length >= 10}
                      />
                    </label>
                  </div>

                  {mainImageUrls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {mainImageUrls.map((url, index) => (
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
                            onClick={() => removeMainImage(index)}
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

            {/* Product Videos */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle>Product Videos</CardTitle>
                <CardDescription>Upload up to 5 product videos</CardDescription>
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
                          MP4, WebM, Ogg (MAX. 5 files, 100MB each)
                        </p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                        disabled={productVideos.length >= 5}
                      />
                    </label>
                  </div>

                  {videoUrls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {videoUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square w-full h-24 overflow-hidden bg-muted rounded-md border border-border/40">
                            <video
                              src={url}
                              className="w-full h-full object-contain p-1"
                              controls
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-90 hover:opacity-100 shadow-sm"
                            onClick={() => removeVideo(index)}
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

            {/* Attributes */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle>Product Attributes</CardTitle>
                <CardDescription>
                  Add attributes and their values for product variants
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {attributes.map((attribute, index) => (
                    <div
                      key={index}
                      className="p-4 border border-border/30 rounded-md"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-4">
                        <div className="w-full sm:w-1/3 max-w-[200px]">
                          <Label className="mb-2 block">Attribute Name</Label>
                          <Input
                            placeholder="e.g., Color, Size"
                            value={attribute.name}
                            onChange={(e) =>
                              updateAttribute(index, "name", e.target.value)
                            }
                            className="border-primary/20 focus-visible:ring-primary"
                          />
                        </div>
                        <div className="w-full sm:w-1/3 max-w-[200px]">
                          <Label className="mb-2 block">Required</Label>
                          <Select
                            value={attribute.required ? "true" : "false"}
                            onValueChange={(value) =>
                              updateAttribute(
                                index,
                                "required",
                                value === "true"
                              )
                            }
                          >
                            <SelectTrigger className="border-primary/20 focus-visible:ring-primary">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Yes</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeAttribute(index)}
                          className="h-10 w-10 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Attribute Values */}
                      <div className="mb-4">
                        <Label className="mb-2 block">Attribute Values</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {attribute.values.map((value, valueIndex) => (
                            <Badge
                              key={valueIndex}
                              variant="secondary"
                              className="pl-2 pr-1 py-1 flex items-center gap-1"
                            >
                              {value}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 rounded-full"
                                onClick={() =>
                                  removeAttributeValue(index, valueIndex)
                                }
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder={`Add value for ${
                              attribute.name || "attribute"
                            }`}
                            className="flex-1 border-primary/20 focus-visible:ring-primary"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const input = e.target as HTMLInputElement;
                                if (input.value.trim()) {
                                  addAttributeValue(index, input.value.trim());
                                  input.value = "";
                                }
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const input = document.querySelector(
                                `input[placeholder*="${attribute.name}"]`
                              ) as HTMLInputElement;
                              if (input && input.value.trim()) {
                                addAttributeValue(index, input.value.trim());
                                input.value = "";
                              }
                            }}
                            className="border-primary/20 hover:bg-primary/5 hover:text-primary"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addAttribute}
                      className="flex-1 border-primary/20 hover:bg-primary/5 hover:text-primary"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Attribute
                    </Button>
                    <FetchAttributesDialog
                      onAttributesSelected={handleAttributesFromBackend}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Variants */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle>Product Variants</CardTitle>
                <CardDescription>
                  Define different combinations of attributes and their prices
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {variants.length === 0 && (
                    <p className="text-muted-foreground">
                      No variants defined. Click "Generate Variants" to create
                      combinations.
                    </p>
                  )}
                  {variants.map((variant, index) => (
                    <div
                      key={index}
                      className="p-4 border border-border/30 rounded-md"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-4">
                        <div className="w-full sm:w-1/4 max-w-[200px]">
                          <Label className="mb-2 block">Variant SKU</Label>
                          <Input
                            placeholder="e.g., RED-L, BLUE-M"
                            value={variant.variantSku}
                            onChange={(e) =>
                              updateVariant(index, "variantSku", e.target.value)
                            }
                            className="border-primary/20 focus-visible:ring-primary"
                          />
                        </div>
                        <div className="w-full sm:w-1/4 max-w-[200px]">
                          <Label className="mb-2 block">Price ($)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={variant.price}
                            onChange={(e) =>
                              updateVariant(
                                index,
                                "price",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="border-primary/20 focus-visible:ring-primary"
                          />
                        </div>
                        <div className="w-full sm:w-1/4 max-w-[200px]">
                          <Label className="mb-2 block">Stock</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={variant.stockQuantity}
                            onChange={(e) =>
                              updateVariant(
                                index,
                                "stockQuantity",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="border-primary/20 focus-visible:ring-primary"
                          />
                        </div>
                        <div className="w-full sm:w-1/4 max-w-[200px]">
                          <Label className="mb-2 block">
                            Low Stock Threshold
                          </Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={variant.lowStockThreshold}
                            onChange={(e) =>
                              updateVariant(
                                index,
                                "lowStockThreshold",
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
                          onClick={() => removeVariant(index)}
                          className="h-10 w-10 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Variant Attributes Display */}
                      {Object.keys(variant.attributes).length > 0 && (
                        <div className="mb-4 p-3 bg-muted/30 rounded-md">
                          <Label className="mb-2 block text-sm font-medium">
                            Variant Attributes
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(variant.attributes).map(
                              ([key, value]) => (
                                <Badge
                                  key={key}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {key}: {value}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Variant Images */}
                      <div className="mb-4">
                        <Label className="mb-2 block">Variant Images</Label>

                        {/* Show selected images */}
                        {variant.images && variant.images.length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-2">
                              {variant.images.map((image, imgIndex) => (
                                <div key={imgIndex} className="relative">
                                  <img
                                    src={
                                      typeof image === "string"
                                        ? image
                                        : URL.createObjectURL(image)
                                    }
                                    alt={`Variant image ${imgIndex + 1}`}
                                    className="w-16 h-16 object-cover rounded border"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newImages = variant.images.filter(
                                        (_, i) => i !== imgIndex
                                      );
                                      updateVariant(index, "images", newImages);
                                    }}
                                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-destructive/80"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Upload button */}
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition">
                            <div className="flex flex-col items-center justify-center">
                              <Upload className="w-5 h-5 mb-1 text-primary" />
                              <p className="text-xs text-foreground">
                                <span className="font-semibold">
                                  Click to upload
                                </span>{" "}
                                variant images (50MB each)
                              </p>
                            </div>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files) {
                                  const files = Array.from(e.target.files);

                                  // Validate each image file
                                  const validImages: File[] = [];
                                  const errors: string[] = [];

                                  for (const file of files) {
                                    // Check file size (max 50MB)
                                    if (file.size > 50 * 1024 * 1024) {
                                      errors.push(
                                        `${file.name}: File size exceeds 50MB limit`
                                      );
                                      continue;
                                    }

                                    // Check file type
                                    if (!file.type.startsWith("image/")) {
                                      errors.push(
                                        `${file.name}: Invalid file type. Only image files are allowed.`
                                      );
                                      continue;
                                    }

                                    validImages.push(file);
                                  }

                                  // Show errors if any
                                  if (errors.length > 0) {
                                    toast({
                                      title: "Variant Image Upload Errors",
                                      description: errors.join("\n"),
                                      variant: "destructive",
                                    });
                                  }

                                  // Only add valid images
                                  if (validImages.length > 0) {
                                    const currentImages = variant.images || [];
                                    updateVariant(index, "images", [
                                      ...currentImages,
                                      ...validImages,
                                    ]);

                                    toast({
                                      title: "Variant Images Added",
                                      description: `Successfully added ${validImages.length} image(s)`,
                                      variant: "default",
                                    });
                                  }
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateVariants}
                      className="flex-1 border-primary/20 hover:bg-primary/5 hover:text-primary"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Generate Variants
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearVariants}
                      className="border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Minus className="w-4 h-4 mr-2" />
                      Clear Variants
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Colors are now handled through variants/attributes */}

            {/* Sizes are now handled through variants/attributes */}

            {/* Product Details */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle>Product Details</CardTitle>
                <CardDescription>
                  Additional product specifications and details
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dimensions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dimensions (cm)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 5.4 x 4.5 x 2.1"
                            {...field}
                            className="border-primary/20 focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.001"
                            placeholder="0.056"
                            {...field}
                            className="border-primary/20 focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="material"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Material</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Plastic, Silicone"
                            {...field}
                            className="border-primary/20 focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="warranty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warranty</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 1 year limited warranty"
                            {...field}
                            className="border-primary/20 focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="careInstructions"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Care Instructions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Product care and maintenance instructions..."
                          className="min-h-[100px] border-primary/20 focus-visible:ring-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* SEO & Meta Information */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle>SEO & Meta Information</CardTitle>
                <CardDescription>
                  Search engine optimization and meta data
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="metaTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="SEO title for search engines"
                            {...field}
                            className="border-primary/20 focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metaDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="SEO description for search engines"
                            {...field}
                            className="border-primary/20 focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metaKeywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Keywords</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Comma-separated keywords"
                            {...field}
                            className="border-primary/20 focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="searchKeywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Search Keywords</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Internal search keywords"
                            {...field}
                            className="border-primary/20 focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 bottom-6 bg-background py-4 border-t border-border/30 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/products")}
                className="border-border/30 hover:bg-muted/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={!form.watch("categoryId") || isSubmitting}
                className="bg-primary hover:bg-primary/90"
                onClick={() => {
                  console.log("Submit button clicked");
                  if (!isSubmitting && form.watch("categoryId")) {
                    form.handleSubmit(onSubmit)();
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Product
                  </>
                )}
              </Button>
            </div>

            {/* Success Modal */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                    </div>
                    Product Created Successfully!
                  </DialogTitle>
                  <DialogDescription>
                    Your product has been created and is now available in your
                    inventory.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="dontShowAgain"
                      checked={dontShowAgain}
                      onCheckedChange={(checked) =>
                        setDontShowAgain(checked as boolean)
                      }
                    />
                    <Label htmlFor="dontShowAgain" className="text-sm">
                      Don't show this message again
                    </Label>
                  </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowSuccessModal(false);
                      router.push("/dashboard/products");
                    }}
                    className="w-full sm:w-auto"
                  >
                    View All Products
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowSuccessModal(false);
                      // Form is already reset, so we can stay on the page
                    }}
                    className="w-full sm:w-auto"
                  >
                    Create Another Product
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </form>
        </Form>
      </div>
    </div>
  );
}
