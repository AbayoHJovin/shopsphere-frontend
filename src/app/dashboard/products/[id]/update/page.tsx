"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  productService,
  ProductBasicInfo,
  ProductBasicInfoUpdate,
} from "@/lib/services/product-service";
import { CategoryDropdown } from "@/components/products/CategoryDropdown";
import { BrandDropdown } from "@/components/products/BrandDropdown";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  WarehouseSelector,
  WarehouseStock,
} from "@/components/WarehouseSelector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Upload,
  X,
  Star,
  Eye,
  Edit,
  Package,
  Warehouse,
  DollarSign,
  Image as ImageIcon,
  Video,
  Settings,
  Layers,
  Globe,
  Tag,
  Ruler,
  Weight,
  Hash,
  Barcode,
  CheckCircle,
  XCircle,
  ExternalLink,
  AlertTriangle,
  Loader2,
} from "lucide-react";

// Mock warehouse data
const mockWarehouses = [
  {
    warehouseId: "wh-001",
    warehouseName: "Main Distribution Center",
    location: "New York, NY",
    address: "123 Commerce St, New York, NY 10001",
    capacity: 10000,
    currentStock: 7500,
    active: true,
    manager: "John Smith",
    phone: "+1 (555) 123-4567",
    email: "john.smith@warehouse.com",
  },
  {
    warehouseId: "wh-002",
    warehouseName: "West Coast Hub",
    location: "Los Angeles, CA",
    address: "456 Industrial Blvd, Los Angeles, CA 90210",
    capacity: 8000,
    currentStock: 6200,
    active: true,
    manager: "Sarah Johnson",
    phone: "+1 (555) 987-6543",
    email: "sarah.johnson@warehouse.com",
  },
  {
    warehouseId: "wh-003",
    warehouseName: "Midwest Storage",
    location: "Chicago, IL",
    address: "789 Storage Ave, Chicago, IL 60601",
    capacity: 6000,
    currentStock: 4800,
    active: true,
    manager: "Mike Davis",
    phone: "+1 (555) 456-7890",
    email: "mike.davis@warehouse.com",
  },
  {
    warehouseId: "wh-004",
    warehouseName: "Southern Depot",
    location: "Atlanta, GA",
    address: "321 Depot Rd, Atlanta, GA 30309",
    capacity: 5000,
    currentStock: 3200,
    active: true,
    manager: "Lisa Wilson",
    phone: "+1 (555) 321-0987",
    email: "lisa.wilson@warehouse.com",
  },
];

// Mock variant warehouse stock data
const mockVariantWarehouseStock = {
  "variant-1": [
    {
      warehouseId: "wh-001",
      stockQuantity: 150,
      stockThreshold: 50,
      lastUpdated: "2024-01-15",
    },
    {
      warehouseId: "wh-002",
      stockQuantity: 200,
      stockThreshold: 75,
      lastUpdated: "2024-01-14",
    },
    {
      warehouseId: "wh-003",
      stockQuantity: 100,
      stockThreshold: 40,
      lastUpdated: "2024-01-13",
    },
  ],
  "variant-2": [
    {
      warehouseId: "wh-001",
      stockQuantity: 80,
      stockThreshold: 30,
      lastUpdated: "2024-01-15",
    },
    {
      warehouseId: "wh-002",
      stockQuantity: 120,
      stockThreshold: 50,
      lastUpdated: "2024-01-14",
    },
    {
      warehouseId: "wh-004",
      stockQuantity: 60,
      stockThreshold: 25,
      lastUpdated: "2024-01-12",
    },
  ],
  "variant-3": [
    {
      warehouseId: "wh-001",
      stockQuantity: 90,
      stockThreshold: 35,
      lastUpdated: "2024-01-15",
    },
    {
      warehouseId: "wh-003",
      stockQuantity: 70,
      stockThreshold: 30,
      lastUpdated: "2024-01-13",
    },
    {
      warehouseId: "wh-004",
      stockQuantity: 45,
      stockThreshold: 20,
      lastUpdated: "2024-01-12",
    },
  ],
};

// Mock data for demonstration
const mockProduct = {
  productName: "iPhone 17 Pro",
  shortDescription: "The latest iPhone with advanced features",
  description:
    "Experience the future with iPhone 17 Pro featuring cutting-edge technology, enhanced camera system, and powerful performance.",
  sku: "IPH17PRO-001",
  barcode: "1234567890123",
  model: "A3101",
  slug: "iphone-17-pro",
  price: 1099.99,
  compareAtPrice: 1199.99,
  costPrice: 800.0,
  stockQuantity: 150,
  categoryId: 1,
  brandId: 1,
  active: true,
  featured: true,
  bestseller: true,
  newArrival: true,
  onSale: false,
  metaTitle: "iPhone 17 Pro - Latest Apple Smartphone",
  metaDescription:
    "Buy the new iPhone 17 Pro with advanced features and cutting-edge technology",
  metaKeywords: "iPhone, Apple, smartphone, mobile, technology",
  searchKeywords:
    "iPhone 17 Pro, Apple phone, smartphone, mobile device, latest iPhone, premium phone, titanium phone, advanced camera, wireless charging, Face ID, iOS, Apple ecosystem, flagship phone, mobile technology, smartphone camera, wireless phone, premium smartphone",
  dimensionsCm: "15.5 x 7.6 x 0.8",
  weightKg: 0.187,
  material: "Titanium",
  warranty: "1 Year",
  careInstructions: "Handle with care, avoid water exposure",
  images: [
    {
      imageId: 1,
      url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop",
      altText: "iPhone 17 Pro Front View",
      isPrimary: true,
      sortOrder: 0,
    },
    {
      imageId: 2,
      url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop",
      altText: "iPhone 17 Pro Back View",
      isPrimary: false,
      sortOrder: 1,
    },
  ],
  videos: [
    {
      videoId: 1,
      url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      altText: "iPhone 17 Pro Demo Video",
      sortOrder: 0,
    },
  ],
  variants: [
    {
      variantId: "var-1",
      variantSku: "IPH17PRO-128GB-BLK",
      variantName: "128GB Black",
      price: 1099.99,
      salePrice: 999.99,
      stockQuantity: 50,
      active: true,
      attributes: [
        { attributeValue: "128GB", attributeType: "Storage" },
        { attributeValue: "Black", attributeType: "Color" },
      ],
      images: [
        {
          imageId: 4,
          url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop",
          altText: "iPhone 17 Pro 128GB Black",
          isPrimary: true,
        },
      ],
    },
  ],
  warehouses: [
    {
      warehouseId: 1,
      warehouseName: "Main Warehouse",
      location: "New York, NY",
      stockQuantity: 100,
      lowStockThreshold: 10,
      active: true,
    },
  ],
};

const mockCategories = [
  { id: 1, name: "Electronics", parentId: null },
  { id: 2, name: "Smartphones", parentId: 1 },
];

const mockBrands = [
  {
    id: 1,
    name: "Apple",
    logoUrl:
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&h=100&fit=crop",
  },
  {
    id: 2,
    name: "Samsung",
    logoUrl:
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&h=100&fit=crop",
  },
];

const productUpdateSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().optional(),
  model: z.string().optional(),
  slug: z.string().optional(),
  material: z.string().optional(),
  warranty: z.string().optional(),
  careInstructions: z.string().optional(),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  compareAtPrice: z.coerce.number().min(0.01).optional(),
  costPrice: z.coerce.number().min(0.01).optional(),
  stockQuantity: z.coerce
    .number()
    .min(0, "Stock quantity must be 0 or greater"),
  categoryId: z.coerce.number().min(1, "Category is required"),
  brandId: z.string().optional(),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  bestseller: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  onSale: z.boolean().default(false),
  salePercentage: z.coerce.number().min(0).max(100).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  searchKeywords: z.string().optional(),
  dimensionsCm: z.string().optional(),
  weightKg: z.coerce.number().min(0).optional(),
});

type ProductUpdateForm = z.infer<typeof productUpdateSchema>;

interface ProductUpdateProps {
  params: Promise<{ id: string }>;
}

export default function ProductUpdate({ params }: ProductUpdateProps) {
  const [productId, setProductId] = useState<string>("");

  useEffect(() => {
    params.then((resolvedParams) => {
      setProductId(resolvedParams.id);
    });
  }, [params]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // State management
  const [product, setProduct] = useState<ProductBasicInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get("tab");
    return tab || "basic";
  });
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [existingVideos, setExistingVideos] = useState<any[]>([]);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [variants, setVariants] = useState<any[]>(mockProduct.variants);
  const [availableAttributeTypes, setAvailableAttributeTypes] = useState<
    string[]
  >(["Color", "Size", "Material", "Style", "Pattern", "Weight", "Dimensions"]);
  const [isAttributeModalOpen, setIsAttributeModalOpen] = useState(false);
  const [newAttributeType, setNewAttributeType] = useState("");
  const [newAttributeValues, setNewAttributeValues] = useState<string[]>([]);
  const [currentAttributeValue, setCurrentAttributeValue] = useState("");
  const [warehouses] = useState<any[]>(mockWarehouses);
  const [variantWarehouseStock, setVariantWarehouseStock] = useState<any>(
    mockVariantWarehouseStock
  );
  const [currentWarehousePage, setCurrentWarehousePage] = useState<
    Record<string, number>
  >({});
  const [warehousePageSize] = useState(3);
  const [isWarehouseSelectorOpen, setIsWarehouseSelectorOpen] = useState(false);
  const [selectedVariantForWarehouse, setSelectedVariantForWarehouse] =
    useState<number | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] =
    useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const initialFormData = useRef<any>(null);

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
      price: 0,
      compareAtPrice: 0,
      costPrice: 0,
      stockQuantity: 0,
      categoryId: undefined,
      brandId: "",
      active: true,
      featured: false,
      bestseller: false,
      newArrival: false,
      onSale: false,
      salePercentage: 0,
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      searchKeywords: "",
      dimensionsCm: "",
      weightKg: 0,
      material: "",
      warranty: "",
      careInstructions: "",
    },
  });

  // Fetch product data when productId changes
  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId) return;

      try {
        setIsLoading(true);
        const productData = await productService.getProductBasicInfo(productId);
        setProduct(productData);

        const [images, videos] = await Promise.all([
          productService.getProductImages(productId),
          productService.getProductVideos(productId),
        ]);
        setExistingImages(images);
        setExistingVideos(videos);

        form.reset({
          name: productData.productName,
          description: productData.description || "",
          shortDescription: productData.shortDescription || "",
          sku: productData.sku,
          barcode: productData.barcode || "",
          model: productData.model || "",
          slug: productData.slug,
          price: productData.price,
          compareAtPrice: productData.compareAtPrice || 0,
          costPrice: productData.costPrice || 0,
          categoryId: productData.categoryId,
          brandId: productData.brandId || "",
          active: productData.active,
          featured: productData.featured,
          bestseller: productData.bestseller,
          newArrival: productData.newArrival,
          onSale: productData.onSale,
          salePercentage: productData.salePercentage || 0,
          material: productData.material || "",
          warranty: productData.warrantyInfo || "",
          careInstructions: productData.careInstructions || "",
        });
      } catch (error) {
        console.error("Error fetching product data:", error);
        toast({
          title: "Error",
          description: "Failed to load product data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [productId, form, toast]);

  // Change detection and unsaved changes handling
  useEffect(() => {
    // Store initial form data only once when component mounts
    if (!initialFormData.current) {
      const initialData = {
        formData: form.getValues(),
        variants: [...variants],
        existingImages: [...existingImages],
        existingVideos: [...existingVideos],
        variantWarehouseStock: { ...variantWarehouseStock },
      };

      initialFormData.current = initialData;
    }
  }, []);

  useEffect(() => {
    // Only check for changes if initial data has been set
    if (!initialFormData.current) {
      return;
    }

    // Check for changes in form data
    const currentFormData = form.getValues();
    const formChanged =
      JSON.stringify(currentFormData) !==
      JSON.stringify(initialFormData.current?.formData);

    // Check for changes in variants
    const variantsChanged =
      JSON.stringify(variants) !==
      JSON.stringify(initialFormData.current?.variants);

    // Check for changes in images
    const imagesChanged =
      JSON.stringify(existingImages) !==
      JSON.stringify(initialFormData.current?.existingImages);

    // Check for changes in videos
    const videosChanged =
      JSON.stringify(existingVideos) !==
      JSON.stringify(initialFormData.current?.existingVideos);

    // Check for changes in variant warehouse stock
    const warehouseStockChanged =
      JSON.stringify(variantWarehouseStock) !==
      JSON.stringify(initialFormData.current?.variantWarehouseStock);

    const hasChanges =
      formChanged ||
      variantsChanged ||
      imagesChanged ||
      videosChanged ||
      warehouseStockChanged;

    setHasUnsavedChanges(hasChanges);
  }, [
    form.watch(),
    variants,
    existingImages,
    existingVideos,
    variantWarehouseStock,
  ]);

  // Navigation protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        setIsUnsavedChangesModalOpen(true);
        setPendingAction(() => () => {
          window.history.pushState(null, "", window.location.href);
          window.history.back();
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges]);

  const handleSaveChanges = async () => {
    try {
      await form.handleSubmit(onSubmit)();

      // Update the initial form data to reflect the saved state
      initialFormData.current = {
        formData: form.getValues(),
        variants: [...variants],
        existingImages: [...existingImages],
        existingVideos: [...existingVideos],
        variantWarehouseStock: { ...variantWarehouseStock },
      };

      setHasUnsavedChanges(false);
      setIsUnsavedChangesModalOpen(false);

      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveBasicInfo = async () => {
    try {
      setIsSubmitting(true);

      const currentFormData = form.getValues();
      const initialData = initialFormData.current.formData;

      // Detect changed fields
      const changedFields: Partial<ProductBasicInfoUpdate> = {};

      if (currentFormData.name !== initialData.name) {
        changedFields.productName = currentFormData.name;
      }
      if (currentFormData.shortDescription !== initialData.shortDescription) {
        changedFields.shortDescription = currentFormData.shortDescription;
      }
      if (currentFormData.description !== initialData.description) {
        changedFields.description = currentFormData.description;
      }
      if (currentFormData.sku !== initialData.sku) {
        changedFields.sku = currentFormData.sku;
      }
      if (currentFormData.barcode !== initialData.barcode) {
        changedFields.barcode = currentFormData.barcode;
      }
      if (currentFormData.model !== initialData.model) {
        changedFields.model = currentFormData.model;
      }
      if (currentFormData.slug !== initialData.slug) {
        changedFields.slug = currentFormData.slug;
      }
      if (currentFormData.material !== initialData.material) {
        changedFields.material = currentFormData.material;
      }
      if (currentFormData.warranty !== initialData.warranty) {
        changedFields.warrantyInfo = currentFormData.warranty;
      }
      if (currentFormData.careInstructions !== initialData.careInstructions) {
        changedFields.careInstructions = currentFormData.careInstructions;
      }
      if (currentFormData.price !== initialData.price) {
        changedFields.price = currentFormData.price;
      }
      if (currentFormData.compareAtPrice !== initialData.compareAtPrice) {
        changedFields.compareAtPrice = currentFormData.compareAtPrice;
      }
      if (currentFormData.costPrice !== initialData.costPrice) {
        changedFields.costPrice = currentFormData.costPrice;
      }
      if (currentFormData.categoryId !== initialData.categoryId) {
        changedFields.categoryId = currentFormData.categoryId;
      }
      if (currentFormData.brandId !== initialData.brandId) {
        changedFields.brandId = currentFormData.brandId;
      }
      if (currentFormData.active !== initialData.active) {
        changedFields.active = currentFormData.active;
      }
      if (currentFormData.featured !== initialData.featured) {
        changedFields.featured = currentFormData.featured;
      }
      if (currentFormData.bestseller !== initialData.bestseller) {
        changedFields.bestseller = currentFormData.bestseller;
      }
      if (currentFormData.newArrival !== initialData.newArrival) {
        changedFields.newArrival = currentFormData.newArrival;
      }
      if (currentFormData.onSale !== initialData.onSale) {
        changedFields.onSale = currentFormData.onSale;
      }
      if (currentFormData.salePercentage !== initialData.salePercentage) {
        changedFields.salePercentage = currentFormData.salePercentage;
      }

      // Only send request if there are changes
      if (Object.keys(changedFields).length === 0) {
        toast({
          title: "No Changes",
          description: "No changes detected to save",
          variant: "default",
        });
        return;
      }

      // Send update request
      const updatedProduct = await productService.updateProductBasicInfo(
        productId,
        changedFields as ProductBasicInfoUpdate
      );

      // Update the product state with the response
      setProduct(updatedProduct);

      // Update the initial form data to reflect the saved state
      initialFormData.current = {
        ...initialFormData.current,
        formData: currentFormData,
      };
      setHasUnsavedChanges(false);

      toast({
        title: "Basic Info Updated",
        description: "Basic information has been updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating basic info:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update basic information",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscardChanges = () => {
    initialFormData.current = {
      formData: form.getValues(),
      variants: [...variants],
      existingImages: [...existingImages],
      existingVideos: [...existingVideos],
      variantWarehouseStock: { ...variantWarehouseStock },
    };

    setHasUnsavedChanges(false);
    setIsUnsavedChangesModalOpen(false);

    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleCancelAction = () => {
    setIsUnsavedChangesModalOpen(false);
    setPendingAction(null);
  };

  // Tab switching protection
  const handleTabChange = async (newTab: string) => {
    if (hasUnsavedChanges) {
      setIsUnsavedChangesModalOpen(true);
      setPendingAction(() => () => {
        setActiveTab(newTab);
        updateUrlTab(newTab);
      });
      return;
    }

    // Load pricing data when switching to pricing tab
    if (newTab === "pricing") {
      try {
        const pricingData = await productService.getProductPricing(productId);
        // Update form with current pricing data
        form.setValue("price", pricingData.price);
        form.setValue("compareAtPrice", pricingData.compareAtPrice || 0);
        form.setValue("costPrice", pricingData.costPrice || 0);

        // Update initial form data to reflect current pricing state
        const currentFormData = form.getValues();
        initialFormData.current = {
          ...initialFormData.current,
          formData: currentFormData,
        };
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error("Error loading pricing data:", error);
        toast({
          title: "Error",
          description: "Failed to load pricing information",
          variant: "destructive",
        });
      }
    }

    if (newTab === "media") {
      // Media data is already loaded when component initializes
      // No need to reload here
    }

    setActiveTab(newTab);
    updateUrlTab(newTab);
  };

  const updateUrlTab = (tab: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    router.replace(url.pathname + url.search, { scroll: false });
  };

  // Listen for URL changes and update active tab
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams, activeTab]);

  // Helper functions for dynamic content
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsImageUploading(true);

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newImage = {
            imageId: Math.floor(Date.now() + Math.random() * 1000),
            url: event.target?.result as string,
            altText: file.name,
            isPrimary: false,
            sortOrder: existingImages.length,
            file: file,
          };
          setExistingImages((prev) => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });

    setTimeout(() => {
      setIsImageUploading(false);
      toast({
        title: "Images Added",
        description: `${files.length} image(s) have been added to the product`,
      });
    }, 1000);
  };

  const removeImageById = async (imageId: number) => {
    try {
      await productService.deleteProductImage(productId, imageId);
      setExistingImages((prev) =>
        prev.filter((img) => img.imageId !== imageId)
      );
      toast({
        title: "Image Removed",
        description: "Image has been removed from the product",
      });
    } catch (error) {
      console.error("Error removing image:", error);
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive",
      });
    }
  };

  const removeVideoById = async (videoId: number) => {
    try {
      await productService.deleteProductVideo(productId, videoId);
      setExistingVideos((prev) =>
        prev.filter((video) => video.videoId !== videoId)
      );
      toast({
        title: "Video Removed",
        description: "Video has been removed from the product",
      });
    } catch (error) {
      console.error("Error removing video:", error);
      toast({
        title: "Error",
        description: "Failed to remove video",
        variant: "destructive",
      });
    }
  };

  const setPrimaryImage = async (imageId: number) => {
    try {
      await productService.setPrimaryImage(productId, imageId);
      setExistingImages((prev) =>
        prev.map((img) => ({
          ...img,
          isPrimary: img.imageId === imageId,
        }))
      );
      toast({
        title: "Primary Image Set",
        description: "Main image has been updated",
      });
    } catch (error) {
      console.error("Error setting primary image:", error);
      toast({
        title: "Error",
        description: "Failed to set primary image",
        variant: "destructive",
      });
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsVideoUploading(true);

    files.forEach((file) => {
      if (file.type.startsWith("video/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newVideo = {
            videoId: Math.floor(Date.now() + Math.random() * 1000),
            url: event.target?.result as string,
            altText: file.name,
            sortOrder: existingVideos.length,
            file: file,
          };
          setExistingVideos((prev) => [...prev, newVideo]);
        };
        reader.readAsDataURL(file);
      }
    });

    setTimeout(() => {
      setIsVideoUploading(false);
      toast({
        title: "Videos Added",
        description: `${files.length} video(s) have been added to the product`,
      });
    }, 1000);
  };

  // Variant management functions
  const addNewVariant = () => {
    const newVariant = {
      variantId: Date.now() + Math.random(),
      variantSku: `SKU-${Date.now()}`,
      variantName: "New Variant",
      price: 0,
      salePrice: null,
      stockQuantity: 0,
      active: true,
      attributes: [],
      images: [],
    };
    setVariants((prev) => [...prev, newVariant]);
    toast({
      title: "Variant Added",
      description: "New product variant has been created",
    });
  };

  const removeVariant = (variantId: number) => {
    setVariants((prev) =>
      prev.filter((variant) => variant.variantId !== variantId)
    );
    toast({
      title: "Variant Removed",
      description: "Product variant has been removed",
    });
  };

  const addAttributeToVariant = (
    variantId: number,
    attributeType: string,
    attributeValue: string
  ) => {
    setVariants((prev) =>
      prev.map((variant) => {
        if (variant.variantId === variantId) {
          const newAttribute = { attributeType, attributeValue };
          return {
            ...variant,
            attributes: [...variant.attributes, newAttribute],
          };
        }
        return variant;
      })
    );
  };

  const removeAttributeFromVariant = (
    variantId: number,
    attributeIndex: number
  ) => {
    setVariants((prev) =>
      prev.map((variant) => {
        if (variant.variantId === variantId) {
          return {
            ...variant,
            attributes: variant.attributes.filter(
              (_: any, index: number) => index !== attributeIndex
            ),
          };
        }
        return variant;
      })
    );
  };

  const addNewAttributeType = () => {
    if (newAttributeType.trim() && newAttributeValues.length > 0) {
      if (!availableAttributeTypes.includes(newAttributeType.trim())) {
        setAvailableAttributeTypes((prev) => [
          ...prev,
          newAttributeType.trim(),
        ]);
        toast({
          title: "Attribute Type Added",
          description: `New attribute type "${newAttributeType}" with ${newAttributeValues.length} values has been created`,
        });
      }
      // Reset form
      setNewAttributeType("");
      setNewAttributeValues([]);
      setCurrentAttributeValue("");
      setIsAttributeModalOpen(false);
    }
  };

  const addAttributeValue = () => {
    if (
      currentAttributeValue.trim() &&
      !newAttributeValues.includes(currentAttributeValue.trim())
    ) {
      setNewAttributeValues((prev) => [...prev, currentAttributeValue.trim()]);
      setCurrentAttributeValue("");
    }
  };

  const removeAttributeValue = (value: string) => {
    setNewAttributeValues((prev) => prev.filter((v) => v !== value));
  };

  const getAttributeValues = (type: string) => {
    const valueMap: Record<string, string[]> = {
      Color: [
        "Red",
        "Blue",
        "Green",
        "Black",
        "White",
        "Yellow",
        "Purple",
        "Orange",
        "Pink",
        "Gray",
      ],
      Size: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
      Material: [
        "Cotton",
        "Polyester",
        "Wool",
        "Silk",
        "Leather",
        "Denim",
        "Linen",
        "Cashmere",
      ],
      Style: [
        "Casual",
        "Formal",
        "Sport",
        "Vintage",
        "Modern",
        "Classic",
        "Trendy",
      ],
      Pattern: [
        "Solid",
        "Striped",
        "Polka Dot",
        "Floral",
        "Geometric",
        "Abstract",
        "Plaid",
      ],
      Weight: ["Light", "Medium", "Heavy", "Ultra Light", "Ultra Heavy"],
      Dimensions: ["Small", "Medium", "Large", "Extra Large", "Custom"],
    };
    return valueMap[type] || [];
  };

  const handleVariantImageUpload = (
    variantId: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newImage = {
            imageId: Date.now() + Math.random(),
            url: event.target?.result as string,
            altText: file.name,
            file: file,
          };
          setVariants((prev) =>
            prev.map((variant) => {
              if (variant.variantId === variantId) {
                return {
                  ...variant,
                  images: [...variant.images, newImage],
                };
              }
              return variant;
            })
          );
        };
        reader.readAsDataURL(file);
      }
    });

    toast({
      title: "Images Added",
      description: `${files.length} image(s) have been added to the variant`,
    });
  };

  const removeVariantImage = (variantId: number, imageId: number) => {
    setVariants((prev) =>
      prev.map((variant) => {
        if (variant.variantId === variantId) {
          return {
            ...variant,
            images: variant.images.filter(
              (img: any) => img.imageId !== imageId
            ),
          };
        }
        return variant;
      })
    );
  };

  // Warehouse management functions
  const getVariantWarehouseStock = (variantId: number) => {
    return variantWarehouseStock[`variant-${variantId}`] || [];
  };

  const updateVariantWarehouseStock = (
    variantId: number,
    warehouseId: string,
    field: string,
    value: number
  ) => {
    setVariantWarehouseStock((prev: any) => {
      const variantKey = `variant-${variantId}`;
      const currentStock = prev[variantKey] || [];
      const updatedStock = currentStock.map((stock: any) =>
        stock.warehouseId === warehouseId
          ? {
              ...stock,
              [field]: value,
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : stock
      );
      return {
        ...prev,
        [variantKey]: updatedStock,
      };
    });
    toast({
      title: "Stock Updated",
      description: `${field} has been updated for this warehouse`,
    });
  };

  const getWarehouseById = (warehouseId: string) => {
    return warehouses.find(
      (warehouse) => warehouse.warehouseId === warehouseId
    );
  };

  const getWarehousePage = (variantId: number) => {
    return currentWarehousePage[variantId] || 0;
  };

  const setWarehousePage = (variantId: number, page: number) => {
    setCurrentWarehousePage((prev) => ({
      ...prev,
      [variantId]: page,
    }));
  };

  const getPaginatedWarehouseStock = (variantId: number) => {
    const stock = getVariantWarehouseStock(variantId);
    const page = getWarehousePage(variantId);
    const startIndex = page * warehousePageSize;
    const endIndex = startIndex + warehousePageSize;
    return stock.slice(startIndex, endIndex);
  };

  const getTotalWarehousePages = (variantId: number) => {
    const stock = getVariantWarehouseStock(variantId);
    return Math.ceil(stock.length / warehousePageSize);
  };

  const navigateToWarehouse = (warehouseId: string) => {
    // In a real app, this would navigate to the warehouse page
    toast({
      title: "Navigation",
      description: `Would navigate to warehouse ${warehouseId} page`,
    });
  };

  // Warehouse assignment functions
  const openWarehouseSelector = (variantId: number) => {
    setSelectedVariantForWarehouse(variantId);
    setIsWarehouseSelectorOpen(true);
  };

  const handleWarehouseAssignment = (warehouseStocks: WarehouseStock[]) => {
    if (selectedVariantForWarehouse === null) return;

    // Convert WarehouseStock format to our internal format
    const convertedStocks = warehouseStocks.map((stock) => ({
      warehouseId: `wh-${stock.warehouseId.toString().padStart(3, "0")}`, // Convert to our format
      stockQuantity: stock.stockQuantity,
      stockThreshold: stock.lowStockThreshold,
      lastUpdated: new Date().toISOString().split("T")[0],
    }));

    // Update the variant warehouse stock
    setVariantWarehouseStock((prev: any) => ({
      ...prev,
      [`variant-${selectedVariantForWarehouse}`]: convertedStocks,
    }));

    toast({
      title: "Warehouses Assigned",
      description: `${warehouseStocks.length} warehouse(s) have been assigned to this variant`,
    });

    // Close modal and reset state
    setIsWarehouseSelectorOpen(false);
    setSelectedVariantForWarehouse(null);
  };

  const getVariantWarehouseStocks = (variantId: number): WarehouseStock[] => {
    const stocks = getVariantWarehouseStock(variantId);
    return stocks.map((stock: any) => ({
      warehouseId: parseInt(stock.warehouseId.replace("wh-", "")),
      warehouseName:
        getWarehouseById(stock.warehouseId)?.warehouseName ||
        "Unknown Warehouse",
      stockQuantity: stock.stockQuantity,
      lowStockThreshold: stock.stockThreshold,
    }));
  };

  // Warehouse removal function
  const removeWarehouseFromVariant = (
    variantId: number,
    warehouseId: string
  ) => {
    setVariantWarehouseStock((prev: any) => {
      const variantKey = `variant-${variantId}`;
      const currentStock = prev[variantKey] || [];
      const updatedStock = currentStock.filter(
        (stock: any) => stock.warehouseId !== warehouseId
      );
      return {
        ...prev,
        [variantKey]: updatedStock,
      };
    });

    const warehouse = getWarehouseById(warehouseId);
    toast({
      title: "Warehouse Removed",
      description: `${
        warehouse?.warehouseName || "Warehouse"
      } has been unassigned from this variant`,
    });
  };

  // Form submission
  const onSubmit = async (data: ProductUpdateForm) => {
    try {
      setIsSubmitting(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Product Updated",
        description: "Product has been updated successfully with mock data",
      });
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

  if (isLoading || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading product data...</p>
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
                Modify product details for:{" "}
                <strong>{product.productName}</strong>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (hasUnsavedChanges) {
                  setIsUnsavedChangesModalOpen(true);
                  setPendingAction(
                    () => () => router.push(`/dashboard/products/${productId}`)
                  );
                } else {
                  router.push(`/dashboard/products/${productId}`);
                }
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Product
            </Button>
          </div>
        </div>
      </div>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="space-y-8 max-w-7xl mx-auto"
      >
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="sticky top-0 z-10 bg-background border-b border-border/40 pb-2">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Pricing
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Media
              </TabsTrigger>
              <TabsTrigger value="variants" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Variants
              </TabsTrigger>
              <TabsTrigger
                value="inventory"
                className="flex items-center gap-2"
              >
                <Warehouse className="h-4 w-4" />
                Inventory
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                SEO
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
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

                  <div>
                    <Label htmlFor="material">Material</Label>
                    <Input
                      id="material"
                      placeholder="Enter material"
                      {...form.register("material")}
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
                    <Label htmlFor="warranty">Warranty Information</Label>
                    <Textarea
                      id="warranty"
                      placeholder="Enter warranty details and terms"
                      {...form.register("warranty")}
                      className="min-h-[80px] border-primary/20 focus-visible:ring-primary mt-2"
                      rows={3}
                    />
                  </div>

                  <div className="col-span-full">
                    <Label htmlFor="careInstructions">Care Instructions</Label>
                    <Textarea
                      id="careInstructions"
                      placeholder="Enter care and maintenance instructions"
                      {...form.register("careInstructions")}
                      className="min-h-[80px] border-primary/20 focus-visible:ring-primary mt-2"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Categorization */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Categorization
                </CardTitle>
                <CardDescription>
                  Organize your product with categories and brands
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <CategoryDropdown
                      value={form.watch("categoryId")}
                      onValueChange={(value) =>
                        form.setValue("categoryId", value)
                      }
                      placeholder="Select Category"
                      label="Category *"
                      required={true}
                      error={form.formState.errors.categoryId?.message}
                    />
                  </div>

                  <div>
                    <BrandDropdown
                      value={form.watch("brandId")}
                      onValueChange={(value) => form.setValue("brandId", value)}
                      placeholder="Select Brand"
                      label="Brand"
                      required={false}
                      error={form.formState.errors.brandId?.message}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Status */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Product Status
                </CardTitle>
                <CardDescription>
                  Control product visibility and special flags
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      {...form.register("active")}
                      checked={form.watch("active")}
                      onCheckedChange={(checked) =>
                        form.setValue("active", checked)
                      }
                    />
                    <Label htmlFor="active" className="text-sm cursor-pointer">
                      Active Product
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      {...form.register("featured")}
                      checked={form.watch("featured")}
                      onCheckedChange={(checked) =>
                        form.setValue("featured", checked)
                      }
                    />
                    <Label
                      htmlFor="featured"
                      className="text-sm cursor-pointer"
                    >
                      Featured Product
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="bestseller"
                      {...form.register("bestseller")}
                      checked={form.watch("bestseller")}
                      onCheckedChange={(checked) =>
                        form.setValue("bestseller", checked)
                      }
                    />
                    <Label
                      htmlFor="bestseller"
                      className="text-sm cursor-pointer"
                    >
                      Bestseller
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="newArrival"
                      {...form.register("newArrival")}
                      checked={form.watch("newArrival")}
                      onCheckedChange={(checked) =>
                        form.setValue("newArrival", checked)
                      }
                    />
                    <Label
                      htmlFor="newArrival"
                      className="text-sm cursor-pointer"
                    >
                      New Arrival
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="onSale"
                      {...form.register("onSale")}
                      checked={form.watch("onSale")}
                      onCheckedChange={(checked) =>
                        form.setValue("onSale", checked)
                      }
                    />
                    <Label htmlFor="onSale" className="text-sm cursor-pointer">
                      On Sale
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Info Save Button */}
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleSaveBasicInfo}
                disabled={!hasUnsavedChanges || isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Basic Info
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing Information
                </CardTitle>
                <CardDescription>
                  Set product pricing and cost information
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...form.register("price")}
                      className="border-primary/20 focus-visible:ring-primary mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="compareAtPrice">Compare At Price</Label>
                    <Input
                      id="compareAtPrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...form.register("compareAtPrice")}
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
                </div>
              </CardContent>
            </Card>

            {/* Pricing Save Button */}
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={async () => {
                  try {
                    setIsSubmitting(true);
                    const currentFormData = form.getValues();

                    // Prepare pricing update data
                    const pricingUpdateData: any = {};

                    // Only include fields that have values
                    if (
                      currentFormData.price !== undefined &&
                      currentFormData.price !== null
                    ) {
                      pricingUpdateData.price = currentFormData.price;
                    }
                    if (
                      currentFormData.compareAtPrice !== undefined &&
                      currentFormData.compareAtPrice !== null
                    ) {
                      pricingUpdateData.compareAtPrice =
                        currentFormData.compareAtPrice;
                    }
                    if (
                      currentFormData.costPrice !== undefined &&
                      currentFormData.costPrice !== null
                    ) {
                      pricingUpdateData.costPrice = currentFormData.costPrice;
                    }

                    // Call the API to update pricing
                    await productService.updateProductPricing(
                      productId,
                      pricingUpdateData
                    );

                    // Update the initial form data to reflect the saved state
                    initialFormData.current = {
                      ...initialFormData.current,
                      formData: currentFormData,
                    };
                    setHasUnsavedChanges(false);

                    toast({
                      title: "Pricing Saved",
                      description:
                        "Pricing information has been saved successfully",
                    });
                  } catch (error) {
                    console.error("Error saving pricing:", error);
                    toast({
                      title: "Error",
                      description:
                        "Failed to save pricing information. Please try again.",
                      variant: "destructive",
                    });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={!hasUnsavedChanges || isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Pricing
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6">
            {/* Product Images */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
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
                    <Label className="text-sm font-medium">
                      Current Images
                    </Label>
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
                              <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                className="h-6 w-6 rounded-full opacity-90 hover:opacity-100 shadow-sm bg-gray-200"
                                onClick={() => setPrimaryImage(image.imageId)}
                              >
                                <Star className="w-3 h-3 text-gray-500" />
                              </Button>
                            )}
                            {image.isPrimary && (
                              <div className="h-6 w-6 rounded-full flex items-center justify-center bg-yellow-500 text-white shadow-sm">
                                <Star className="w-3 h-3 fill-current text-yellow-100" />
                              </div>
                            )}
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="h-6 w-6 rounded-full opacity-90 hover:opacity-100 shadow-sm"
                              onClick={() => removeImageById(image.imageId)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          {image.isPrimary && (
                            <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-xs text-center py-0.5">
                              Main Image
                            </div>
                          )}
                          <div className="absolute top-0 left-0 bg-black/50 text-white text-xs p-1 rounded-br-md">
                            {image.file
                              ? `${(image.file.size / 1024 / 1024).toFixed(
                                  1
                                )}MB`
                              : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Upload Area */}
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition">
                    <div className="flex flex-col items-center justify-center pt-4 pb-4">
                      <Upload className="w-8 h-8 mb-2 text-primary" />
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">
                          Click to upload images
                        </span>{" "}
                        or drag and drop
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

            {/* Product Videos */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Product Videos
                </CardTitle>
                <CardDescription>Manage product videos</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Existing Videos */}
                {existingVideos.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">
                      Current Videos
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {existingVideos.map((video) => (
                        <div key={video.videoId} className="relative group">
                          <div className="aspect-video w-full bg-muted rounded-md border border-border/40 overflow-hidden">
                            <video
                              src={video.url}
                              className="w-full h-full object-cover"
                              controls
                              preload="metadata"
                            />
                          </div>
                          <div className="absolute -top-2 -right-2">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="h-6 w-6 rounded-full opacity-90 hover:opacity-100 shadow-sm"
                              onClick={() => removeVideoById(video.videoId)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1">
                            {video.altText}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Video Upload Area */}
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition">
                    <div className="flex flex-col items-center justify-center pt-4 pb-4">
                      <Video className="w-8 h-8 mb-2 text-primary" />
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">
                          Click to upload videos
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        MP4, MOV, AVI (MAX. 5 files)
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isVideoUploading
                          ? "Uploading..."
                          : `${existingVideos.length}/5 videos used`}
                      </p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                      disabled={isVideoUploading || existingVideos.length >= 5}
                    />
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Media Save Button */}
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={async () => {
                  try {
                    setIsSubmitting(true);

                    const newImages = existingImages.filter((img) => img.file);
                    const newVideos = existingVideos.filter(
                      (video) => video.file
                    );

                    if (newImages.length > 0) {
                      const imageFiles = newImages.map((img) => img.file!);
                      const uploadedImages =
                        await productService.uploadProductImages(
                          productId,
                          imageFiles
                        );

                      setExistingImages((prev) => [
                        ...prev.filter((img) => !img.file),
                        ...uploadedImages,
                      ]);
                    }

                    if (newVideos.length > 0) {
                      const videoFiles = newVideos.map((video) => video.file!);
                      const uploadedVideos =
                        await productService.uploadProductVideos(
                          productId,
                          videoFiles
                        );

                      setExistingVideos((prev) => [
                        ...prev.filter((video) => !video.file),
                        ...uploadedVideos,
                      ]);
                    }

                    initialFormData.current = {
                      ...initialFormData.current,
                      existingImages: [...existingImages],
                      existingVideos: [...existingVideos],
                    };
                    setHasUnsavedChanges(false);

                    toast({
                      title: "Media Saved",
                      description:
                        "Media files have been uploaded and saved successfully",
                    });
                  } catch (error) {
                    console.error("Error saving media:", error);
                    toast({
                      title: "Error",
                      description:
                        "Failed to save media files. Please try again.",
                      variant: "destructive",
                    });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={!hasUnsavedChanges || isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Media
              </Button>
            </div>
          </TabsContent>

          {/* Variants Tab */}
          <TabsContent value="variants" className="space-y-6">
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Product Variants
                </CardTitle>
                <CardDescription>
                  Manage product variants with different attributes and pricing
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {variants.map((variant, index) => (
                    <div
                      key={variant.variantId}
                      className="p-4 border border-border/30 rounded-md space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Variant {index + 1}</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => removeVariant(variant.variantId)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <Label>Variant SKU</Label>
                          <Input
                            placeholder="Enter variant SKU"
                            defaultValue={variant.variantSku}
                            className="border-primary/20 focus-visible:ring-primary mt-2"
                          />
                        </div>

                        <div>
                          <Label>Variant Name</Label>
                          <Input
                            placeholder="Enter variant name"
                            defaultValue={variant.variantName}
                            className="border-primary/20 focus-visible:ring-primary mt-2"
                          />
                        </div>

                        <div>
                          <Label>Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            defaultValue={variant.price}
                            className="border-primary/20 focus-visible:ring-primary mt-2"
                          />
                        </div>

                        <div>
                          <Label>Sale Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            defaultValue={variant.salePrice}
                            className="border-primary/20 focus-visible:ring-primary mt-2"
                          />
                        </div>

                        <div>
                          <Label>Stock Quantity</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            defaultValue={variant.stockQuantity}
                            className="border-primary/20 focus-visible:ring-primary mt-2"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`variant-${index}-active`}
                            defaultChecked={variant.isActive}
                          />
                          <Label
                            htmlFor={`variant-${index}-active`}
                            className="text-sm cursor-pointer"
                          >
                            Active
                          </Label>
                        </div>
                      </div>

                      {/* Variant Attributes */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">
                            Attributes
                          </Label>
                          <div className="flex gap-2">
                            <Select
                              onValueChange={(value) => {
                                if (value) {
                                  const [type, attrValue] = value.split(":");
                                  addAttributeToVariant(
                                    variant.variantId,
                                    type,
                                    attrValue
                                  );
                                }
                              }}
                            >
                              <SelectTrigger className="w-[200px] text-xs">
                                <SelectValue placeholder="Add Attribute" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableAttributeTypes.map((type) => (
                                  <div key={type}>
                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                      {type}
                                    </div>
                                    {getAttributeValues(type).map((value) => (
                                      <SelectItem
                                        key={`${type}:${value}`}
                                        value={`${type}:${value}`}
                                      >
                                        {value}
                                      </SelectItem>
                                    ))}
                                  </div>
                                ))}
                              </SelectContent>
                            </Select>
                            <Dialog
                              open={isAttributeModalOpen}
                              onOpenChange={setIsAttributeModalOpen}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  New Type
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>
                                    Create New Attribute Type
                                  </DialogTitle>
                                  <DialogDescription>
                                    Create a new attribute type and define its
                                    possible values.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                      htmlFor="attribute-type"
                                      className="text-right"
                                    >
                                      Type Name
                                    </Label>
                                    <Input
                                      id="attribute-type"
                                      value={newAttributeType}
                                      onChange={(e) =>
                                        setNewAttributeType(e.target.value)
                                      }
                                      className="col-span-3"
                                      placeholder="e.g., Brand, Model, etc."
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                      htmlFor="attribute-value"
                                      className="text-right"
                                    >
                                      Add Value
                                    </Label>
                                    <div className="col-span-3 flex gap-2">
                                      <Input
                                        id="attribute-value"
                                        value={currentAttributeValue}
                                        onChange={(e) =>
                                          setCurrentAttributeValue(
                                            e.target.value
                                          )
                                        }
                                        placeholder="Enter value"
                                        onKeyPress={(e) => {
                                          if (e.key === "Enter") {
                                            addAttributeValue();
                                          }
                                        }}
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addAttributeValue}
                                        disabled={!currentAttributeValue.trim()}
                                      >
                                        <Plus className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  {newAttributeValues.length > 0 && (
                                    <div className="grid grid-cols-4 items-start gap-4">
                                      <Label className="text-right pt-2">
                                        Values
                                      </Label>
                                      <div className="col-span-3">
                                        <div className="flex flex-wrap gap-2">
                                          {newAttributeValues.map(
                                            (value, index) => (
                                              <Badge
                                                key={index}
                                                variant="secondary"
                                                className="flex items-center gap-1"
                                              >
                                                {value}
                                                <X
                                                  className="w-3 h-3 cursor-pointer hover:text-destructive"
                                                  onClick={() =>
                                                    removeAttributeValue(value)
                                                  }
                                                />
                                              </Badge>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <DialogFooter>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      setNewAttributeType("");
                                      setNewAttributeValues([]);
                                      setCurrentAttributeValue("");
                                      setIsAttributeModalOpen(false);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="button"
                                    onClick={addNewAttributeType}
                                    disabled={
                                      !newAttributeType.trim() ||
                                      newAttributeValues.length === 0
                                    }
                                  >
                                    Create Attribute Type
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {variant.attributes.map(
                            (attr: any, attrIndex: number) => (
                              <Badge
                                key={attrIndex}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {attr.attributeType}: {attr.attributeValue}
                                <X
                                  className="w-3 h-3 cursor-pointer hover:text-destructive"
                                  onClick={() =>
                                    removeAttributeFromVariant(
                                      variant.variantId,
                                      attrIndex
                                    )
                                  }
                                />
                              </Badge>
                            )
                          )}
                          {variant.attributes.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                              No attributes added
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Variant Images */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">
                            Variant Images
                          </Label>
                          <div className="flex items-center justify-center">
                            <label className="flex items-center justify-center px-3 py-1 border border-dashed border-border rounded cursor-pointer hover:bg-muted/50 transition text-xs">
                              <Upload className="w-3 h-3 mr-1" />
                              Upload Images
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) =>
                                  handleVariantImageUpload(variant.variantId, e)
                                }
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        {variant.images && variant.images.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {variant.images.map((image: any) => (
                              <div
                                key={image.imageId}
                                className="relative group"
                              >
                                <div className="aspect-square w-full h-16 overflow-hidden bg-muted rounded-md border border-border/40">
                                  <img
                                    src={image.url}
                                    alt={image.altText || "Variant image"}
                                    className="w-full h-full object-contain p-1"
                                  />
                                </div>
                                <div className="absolute -top-1 -right-1">
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="h-4 w-4 rounded-full opacity-90 hover:opacity-100 shadow-sm"
                                    onClick={() =>
                                      removeVariantImage(
                                        variant.variantId,
                                        image.imageId
                                      )
                                    }
                                  >
                                    <X className="w-2 h-2" />
                                  </Button>
                                </div>
                                <div className="absolute top-0 left-0 bg-black/50 text-white text-xs p-1 rounded-br-md">
                                  {image.file
                                    ? `${(
                                        image.file.size /
                                        1024 /
                                        1024
                                      ).toFixed(1)}MB`
                                    : ""}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground py-4 text-sm">
                            No images uploaded for this variant
                          </div>
                        )}
                      </div>

                      {/* Warehouse Management */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <Warehouse className="w-4 h-4" />
                            Warehouse Stock Management
                          </Label>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-muted-foreground">
                              {
                                getVariantWarehouseStock(variant.variantId)
                                  .length
                              }{" "}
                              warehouses
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                openWarehouseSelector(variant.variantId)
                              }
                              className="border-primary/20 hover:bg-primary/5 hover:text-primary"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Assign Warehouses
                            </Button>
                          </div>
                        </div>

                        {getVariantWarehouseStock(variant.variantId).length >
                        0 ? (
                          <div className="space-y-3">
                            {getPaginatedWarehouseStock(variant.variantId).map(
                              (stock: any) => {
                                const warehouse = getWarehouseById(
                                  stock.warehouseId
                                );
                                const isLowStock =
                                  stock.stockQuantity <= stock.stockThreshold;

                                return (
                                  <div
                                    key={stock.warehouseId}
                                    className="p-3 border border-border/30 rounded-lg bg-muted/20"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <Button
                                          type="button"
                                          variant="link"
                                          className="p-0 h-auto text-sm font-medium text-primary hover:text-primary/80"
                                          onClick={() =>
                                            navigateToWarehouse(
                                              stock.warehouseId
                                            )
                                          }
                                        >
                                          {warehouse?.warehouseName}
                                          <ExternalLink className="w-3 h-3 ml-1" />
                                        </Button>
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {warehouse?.location}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {isLowStock ? (
                                          <Badge
                                            variant="destructive"
                                            className="text-xs"
                                          >
                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                            Low Stock
                                          </Badge>
                                        ) : (
                                          <Badge
                                            variant="default"
                                            className="text-xs bg-green-100 text-green-800"
                                          >
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            In Stock
                                          </Badge>
                                        )}
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            removeWarehouseFromVariant(
                                              variant.variantId,
                                              stock.warehouseId
                                            )
                                          }
                                          className="h-6 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                      <div>
                                        <Label className="text-xs text-muted-foreground">
                                          Stock Quantity
                                        </Label>
                                        <div className="flex items-center gap-2 mt-1">
                                          <Input
                                            type="number"
                                            min="0"
                                            value={stock.stockQuantity}
                                            onChange={(e) =>
                                              updateVariantWarehouseStock(
                                                variant.variantId,
                                                stock.warehouseId,
                                                "stockQuantity",
                                                parseInt(e.target.value) || 0
                                              )
                                            }
                                            className="h-8 text-sm"
                                          />
                                          <span className="text-xs text-muted-foreground">
                                            units
                                          </span>
                                        </div>
                                      </div>

                                      <div>
                                        <Label className="text-xs text-muted-foreground">
                                          Stock Threshold
                                        </Label>
                                        <div className="flex items-center gap-2 mt-1">
                                          <Input
                                            type="number"
                                            min="0"
                                            value={stock.stockThreshold}
                                            onChange={(e) =>
                                              updateVariantWarehouseStock(
                                                variant.variantId,
                                                stock.warehouseId,
                                                "stockThreshold",
                                                parseInt(e.target.value) || 0
                                              )
                                            }
                                            className="h-8 text-sm"
                                          />
                                          <span className="text-xs text-muted-foreground">
                                            units
                                          </span>
                                        </div>
                                      </div>

                                      <div>
                                        <Label className="text-xs text-muted-foreground">
                                          Last Updated
                                        </Label>
                                        <div className="text-sm text-muted-foreground mt-1">
                                          {new Date(
                                            stock.lastUpdated
                                          ).toLocaleDateString()}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="mt-2 text-xs text-muted-foreground">
                                      Manager: {warehouse?.manager} • Phone:{" "}
                                      {warehouse?.phone}
                                    </div>
                                  </div>
                                );
                              }
                            )}

                            {/* Pagination */}
                            {getTotalWarehousePages(variant.variantId) > 1 && (
                              <div className="flex items-center justify-between pt-2">
                                <div className="text-xs text-muted-foreground">
                                  Page {getWarehousePage(variant.variantId) + 1}{" "}
                                  of {getTotalWarehousePages(variant.variantId)}
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2"
                                    onClick={() =>
                                      setWarehousePage(
                                        variant.variantId,
                                        getWarehousePage(variant.variantId) - 1
                                      )
                                    }
                                    disabled={
                                      getWarehousePage(variant.variantId) === 0
                                    }
                                  >
                                    Previous
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2"
                                    onClick={() =>
                                      setWarehousePage(
                                        variant.variantId,
                                        getWarehousePage(variant.variantId) + 1
                                      )
                                    }
                                    disabled={
                                      getWarehousePage(variant.variantId) >=
                                      getTotalWarehousePages(
                                        variant.variantId
                                      ) -
                                        1
                                    }
                                  >
                                    Next
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground py-8 text-sm border border-dashed border-border/30 rounded-lg">
                            <Warehouse className="w-8 h-8 mx-auto mb-3 opacity-50" />
                            <p className="mb-2">
                              No warehouse stock configured for this variant
                            </p>
                            <p className="text-xs mb-4">
                              Assign warehouses to manage stock levels
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                openWarehouseSelector(variant.variantId)
                              }
                              className="border-primary/20 hover:bg-primary/5 hover:text-primary"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Assign Warehouses
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-2 border-primary/20 hover:bg-primary/5 hover:text-primary"
                    onClick={addNewVariant}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product Variant
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Variants Save Button */}
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => {
                  // Save variants changes
                  initialFormData.current = {
                    ...initialFormData.current,
                    variants: [...variants],
                    variantWarehouseStock: { ...variantWarehouseStock },
                  };
                  setHasUnsavedChanges(false);
                  toast({
                    title: "Variants Saved",
                    description:
                      "Product variants have been saved successfully",
                  });
                }}
                disabled={!hasUnsavedChanges}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Variants
              </Button>
            </div>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            {variants.length > 0 ? (
              // Product has variants - show message directing to variants tab
              <Card className="border-border/40 shadow-sm">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="flex items-center gap-2">
                    <Warehouse className="h-5 w-5" />
                    Inventory Management
                  </CardTitle>
                  <CardDescription>
                    This product has variants. Stock and warehouse management is
                    handled at the variant level.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-4 rounded-full bg-primary/10">
                        <Layers className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      Variants-Based Inventory
                    </h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      This product has {variants.length} variant
                      {variants.length !== 1 ? "s" : ""}. Stock quantities and
                      warehouse assignments are managed individually for each
                      variant.
                    </p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>
                          Each variant can have different stock levels
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Warehouse assignments are per variant</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Individual stock thresholds and alerts</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        // Scroll to variants tab
                        const variantsTab = document.querySelector(
                          '[value="variants"]'
                        ) as HTMLElement;
                        if (variantsTab) {
                          variantsTab.click();
                        }
                      }}
                      className="border-primary/20 hover:bg-primary/5 hover:text-primary"
                    >
                      <Layers className="w-4 h-4 mr-2" />
                      Manage Variant Inventory
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Product has no variants - show direct inventory management
              <Card className="border-border/40 shadow-sm">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="flex items-center gap-2">
                    <Warehouse className="h-5 w-5" />
                    Direct Inventory Management
                  </CardTitle>
                  <CardDescription>
                    Manage stock levels and warehouse assignments for this
                    product directly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Product-level stock summary */}
                    <div className="p-4 border border-border/30 rounded-md bg-muted/20">
                      <h4 className="font-medium mb-2">
                        Product Stock Summary
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            0
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total Stock
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            0
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Available
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            0
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Low Stock Alerts
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Warehouse assignments */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Warehouse Assignments</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-primary/20 hover:bg-primary/5 hover:text-primary"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Assign Warehouse
                        </Button>
                      </div>

                      <div className="text-center py-8 text-muted-foreground border border-dashed border-border/30 rounded-lg">
                        <Warehouse className="w-8 h-8 mx-auto mb-3 opacity-50" />
                        <p className="mb-2">
                          No warehouses assigned to this product
                        </p>
                        <p className="text-xs mb-4">
                          Assign warehouses to manage stock levels
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-primary/20 hover:bg-primary/5 hover:text-primary"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Assign First Warehouse
                        </Button>
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="p-4 border border-border/30 rounded-md">
                      <h4 className="font-medium mb-3">Quick Actions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="justify-start"
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Bulk Stock Update
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="justify-start"
                        >
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Set Stock Alerts
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Inventory Save Button */}
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => {
                  // Save inventory changes
                  const currentFormData = form.getValues();
                  initialFormData.current = {
                    ...initialFormData.current,
                    formData: currentFormData,
                  };
                  setHasUnsavedChanges(false);
                  toast({
                    title: "Inventory Saved",
                    description:
                      "Inventory information has been saved successfully",
                  });
                }}
                disabled={!hasUnsavedChanges}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Inventory
              </Button>
            </div>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-6">
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  SEO & Meta Information
                </CardTitle>
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

                  <div className="col-span-full">
                    <Label htmlFor="searchKeywords">Search Keywords</Label>
                    <Textarea
                      id="searchKeywords"
                      placeholder="Enter search keywords that customers might use to find this product. Separate multiple keywords with commas or new lines."
                      {...form.register("searchKeywords")}
                      className="min-h-[100px] border-primary/20 focus-visible:ring-primary mt-2"
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      These keywords help customers find your product through
                      search. Include synonyms, alternative names, and related
                      terms.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO Save Button */}
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => {
                  // Save SEO changes
                  const currentFormData = form.getValues();
                  initialFormData.current = {
                    ...initialFormData.current,
                    formData: currentFormData,
                  };
                  setHasUnsavedChanges(false);
                  toast({
                    title: "SEO Saved",
                    description: "SEO information has been saved successfully",
                  });
                }}
                disabled={!hasUnsavedChanges}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="mr-2 h-4 w-4" />
                Save SEO
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
      </form>

      {/* Warehouse Selector Modal */}
      {isWarehouseSelectorOpen && selectedVariantForWarehouse !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Assign Warehouses to Variant
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsWarehouseSelectorOpen(false);
                    setSelectedVariantForWarehouse(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <WarehouseSelector
                warehouseStocks={getVariantWarehouseStocks(
                  selectedVariantForWarehouse
                )}
                onWarehouseStocksChange={handleWarehouseAssignment}
                title="Warehouse Stock Assignment"
                description={`Assign stock quantities to warehouses for variant ${selectedVariantForWarehouse}`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Confirmation Modal */}
      <AlertDialog
        open={isUnsavedChangesModalOpen}
        onOpenChange={setIsUnsavedChangesModalOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes that will be lost if you continue. What
              would you like to do?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelAction}>
              Cancel
            </AlertDialogCancel>
            <Button variant="outline" onClick={handleDiscardChanges}>
              Discard Changes
            </Button>
            <AlertDialogAction onClick={handleSaveChanges}>
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
