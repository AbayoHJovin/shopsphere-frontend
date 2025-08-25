export interface Brand {
  id: string;
  brandName: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  slug: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBrandRequest {
  brandName: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface UpdateBrandRequest {
  brandName?: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface BrandSearchDTO {
  brandName?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

export interface BrandPageResponse {
  content: Brand[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface BrandResponse {
  id: string;
  brandName: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  slug: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}
