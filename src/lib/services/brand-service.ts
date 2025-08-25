import apiClient from "../api-client";
import { handleApiError } from "../utils/error-handler";
import {
  BrandResponse,
  CreateBrandRequest,
  UpdateBrandRequest,
  BrandSearchDTO,
  BrandPageResponse,
} from "../types/brand";

class BrandService {
  async getAllBrands(
    page: number = 0,
    size: number = 10,
    sortBy: string = "brandName",
    sortDir: string = "asc"
  ): Promise<BrandPageResponse> {
    try {
      const response = await apiClient.get(`/v1/brands`, {
        params: { page, size, sortBy, sortDir },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getBrandById(brandId: string): Promise<BrandResponse> {
    try {
      const response = await apiClient.get(`/v1/brands/${brandId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getBrandBySlug(slug: string): Promise<BrandResponse> {
    try {
      const response = await apiClient.get(`/v1/brands/slug/${slug}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getActiveBrands(): Promise<BrandResponse[]> {
    try {
      const response = await apiClient.get(`/v1/brands/active`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getFeaturedBrands(): Promise<BrandResponse[]> {
    try {
      const response = await apiClient.get(`/v1/brands/featured`);
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
