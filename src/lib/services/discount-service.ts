import apiClient from "../api-client";
import { handleApiError } from "../utils/error-handler";

export interface DiscountDTO {
  discountId: string;
  name: string;
  description?: string;
  percentage: number;
  discountCode?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
  discountType: string;
  createdAt: string;
  updatedAt: string;
  isValid: boolean;
  canBeUsed: boolean;
}

export interface CreateDiscountDTO {
  name: string;
  description?: string;
  percentage: number;
  discountCode?: string;
  startDate: string;
  endDate?: string;
  isActive?: boolean;
  usageLimit?: number;
  discountType?: string;
}

export interface UpdateDiscountDTO {
  name?: string;
  description?: string;
  percentage?: number;
  discountCode?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  usageLimit?: number;
  discountType?: string;
}

export interface DiscountPaginationResponse {
  content: DiscountDTO[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

class DiscountService {
  /**
   * Get all discounts with pagination
   */
  async getAllDiscounts(
    page: number = 0,
    size: number = 10,
    sortBy: string = "createdAt",
    sortDirection: string = "desc",
    activeOnly: boolean = false
  ): Promise<DiscountPaginationResponse> {
    try {
      const response = await apiClient.get(`/v1/discounts`, {
        params: { page, size, sortBy, sortDirection, activeOnly },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get discount by ID
   */
  async getDiscountById(discountId: string): Promise<DiscountDTO> {
    try {
      const response = await apiClient.get(`/v1/discounts/${discountId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get discount by code
   */
  async getDiscountByCode(discountCode: string): Promise<DiscountDTO> {
    try {
      const response = await apiClient.get(
        `/v1/discounts/code/${discountCode}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get products and variants by discount ID
   */
  async getProductsByDiscount(discountId: string): Promise<{
    products: any[];
    variants: any[];
    totalProducts: number;
    totalVariants: number;
  }> {
    try {
      const response = await apiClient.get(
        `/v1/discounts/${discountId}/products`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new discount
   */
  async createDiscount(discountData: CreateDiscountDTO): Promise<DiscountDTO> {
    try {
      const response = await apiClient.post(`/v1/discounts`, discountData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update an existing discount
   */
  async updateDiscount(
    discountId: string,
    discountData: UpdateDiscountDTO
  ): Promise<DiscountDTO> {
    try {
      const response = await apiClient.put(
        `/v1/discounts/${discountId}`,
        discountData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete a discount
   */
  async deleteDiscount(
    discountId: string
  ): Promise<{ message: string; discountId: string }> {
    try {
      const response = await apiClient.delete(`/v1/discounts/${discountId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Check if discount is valid
   */
  async isDiscountValid(
    discountId: string
  ): Promise<{ discountId: string; isValid: boolean }> {
    try {
      const response = await apiClient.get(`/v1/discounts/${discountId}/valid`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Check if discount code is valid
   */
  async isDiscountCodeValid(
    discountCode: string
  ): Promise<{ discountCode: string; isValid: boolean }> {
    try {
      const response = await apiClient.get(
        `/v1/discounts/code/${discountCode}/valid`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const discountService = new DiscountService();
