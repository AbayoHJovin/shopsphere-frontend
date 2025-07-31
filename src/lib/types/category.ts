// Response types - matching Java DTOs
export interface CategoryResponse {
  categoryId: string;
  name: string;
  description: string | null;
  parentId: string | null;
  parentName: string | null;
  hasSubcategories: boolean;
  subcategoryCount: number;
  productCount: number;
}

export interface CategorySummaryResponse {
  categoryId: string;
  name: string;
  productCount: number;
  hasSubcategories: boolean;
  totalSold: number;
  percentageOfTotalSales: number;
}

// Request types - matching Java DTOs
export interface CategoryCreateRequest {
  name: string;
  description?: string;
  parentId?: string | null;
}

export interface CategoryUpdateRequest {
  name: string;
  description?: string;
  parentId?: string | null;
}

// Type for pagination params
export interface CategoryPaginationParams {
  page: number;
  size: number;
  search?: string;
} 