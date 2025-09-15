import apiClient from "../api-client";
import { handleApiError } from "../utils/error-handler";
import { API_ENDPOINTS } from "../constants";
import {
  BrandResponse,
  CreateBrandRequest,
  UpdateBrandRequest,
  BrandSearchDTO,
  BrandPageResponse,
} from "../types/brand";

class BrandService {
  async getAllBrandsForDropdown(): Promise<BrandResponse[]> {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.BRANDS.BASE}/dropdown`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getAllBrands(
    page: number = 0,
    size: number = 10,
    sortBy: string = "brandName",
    sortDir: string = "asc"
  ): Promise<BrandPageResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BRANDS.BASE, {
        params: { page, size, sortBy, sortDir },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getBrandById(brandId: string): Promise<BrandResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BRANDS.BY_ID(brandId));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getBrandBySlug(slug: string): Promise<BrandResponse> {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.BRANDS.BASE}/slug/${slug}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getActiveBrands(): Promise<BrandResponse[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BRANDS.ACTIVE);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getFeaturedBrands(): Promise<BrandResponse[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BRANDS.FEATURED);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async searchBrands(searchDTO: BrandSearchDTO): Promise<BrandPageResponse> {
    try {
      const response = await apiClient.post(`/v1/brands/search`, searchDTO);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async createBrand(brandData: CreateBrandRequest): Promise<BrandResponse> {
    try {
      const response = await apiClient.post(`/v1/brands`, brandData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async updateBrand(
    brandId: string,
    brandData: UpdateBrandRequest
  ): Promise<BrandResponse> {
    try {
      const response = await apiClient.put(`/v1/brands/${brandId}`, brandData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async deleteBrand(brandId: string): Promise<void> {
    try {
      await apiClient.delete(`/v1/brands/${brandId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async checkBrandNameAvailability(
    brandName: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      const params: any = { brandName };
      if (excludeId) {
        params.excludeId = excludeId;
      }
      const response = await apiClient.get(`/v1/brands/check-name`, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async checkBrandSlugAvailability(
    slug: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      const params: any = { slug };
      if (excludeId) {
        params.excludeId = excludeId;
      }
      const response = await apiClient.get(`/v1/brands/check-slug`, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const brandService = new BrandService();
