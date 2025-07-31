import { UUID } from "crypto";

// Gender enum to match backend
export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  UNISEX = "UNISEX"
}

// Size enum to match backend
export enum Size {
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE"
}

// Product image response
export interface ProductImageResponse {
  imageId: string;
  imageUrl: string;
  isMain: boolean;
  position: number;
}

// Category response
export interface CategoryResponse {
  categoryId: string;
  name: string;
  description: string;
  parentId?: string;
  parentName?: string;
  hasSubcategories: boolean;
  subcategoryCount: number;
  productCount: number;
}

// Rating response
export interface RatingResponse {
  ratingId: string;
  stars: number;
  comment: string;
  productId: string;
  productName: string;
  userId: string;
  username: string;
  userProfilePicture?: string;
  createdAt: string;
  verifiedPurchase: boolean;
}

// Product color response
export interface ProductColorResponse {
  colorId: string;
  colorName: string;
  colorHexCode: string;
}

// Product color for form handling
export interface ProductColor {
  colorId?: string;
  colorName: string;
  colorHexCode: string;
  productId?: string;
}

// Product size response
export interface ProductSizeResponse {
  sizeId: string;
  size: Size;
  stockForSize: number;
}

// Product size for form handling
export interface ProductSize {
  sizeId?: string;
  size: Size;
  stockForSize: number;
  productId?: string;
}

// Product discount response
export interface ProductDiscountResponse {
  discountId: string;
  name: string;
  percentage: number;
  startDate: string;
  endDate: string;
  active: boolean;
  current: boolean;
}

// Main product response
export interface ProductResponse {
  productId: string;
  name: string;
  description: string;
  price: number;
  previousPrice?: number;
  gender: Gender;
  stock: number;
  popular: boolean;
  images: ProductImageResponse[];
  categories: CategoryResponse[];
  mainImage?: string; // URL of the main product image for quick access
  averageRating: number | null;
  ratingCount: number | null;
  topRatings: RatingResponse[];
  
  // Color and size options
  colors: ProductColorResponse[];
  sizes: ProductSizeResponse[];
  
  // Discount information
  discounts: ProductDiscountResponse[];
  activeDiscount?: ProductDiscountResponse; // Currently active discount if any
  discountedPrice?: number; // Price after applying the active discount
  onSale: boolean; // True if there's an active discount
}

// Pagination response structure
export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    },
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// Product pagination response
export type ProductPaginationResponse = Page<ProductResponse>;

// Advanced search filter request
export interface ProductSearchFilterRequest {
  // Text search
  keyword?: string;
  
  // Price filters
  minPrice?: number;
  maxPrice?: number;
  
  // Category filters
  categories?: string[];  // Category names
  categoryIds?: string[];
  
  // Color filters
  colors?: string[];
  
  // Size filters
  sizes?: string[];
  
  // Discount filters
  discountRanges?: string[]; // String format like "1% - 20%", "21% - 40%", etc.
  
  // Rating filters
  rating?: number;      // Single rating value (e.g., 4 means 4+ stars)
  minRating?: number;   // For backward compatibility
  maxRating?: number;   // For backward compatibility
  
  // Stock filters
  inStock?: boolean;
  
  // Special filters
  onSale?: boolean;     // Has discount/previous price
  newArrivals?: boolean; // Recently added products
  popular?: boolean;     // Products marked as popular
  
  // Gender filter
  gender?: Gender;
  
  // Sorting
  sortBy?: string;
  sortDirection?: string;
  
  // Pagination
  page?: number;
  size?: number;
}