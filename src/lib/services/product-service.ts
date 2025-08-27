import apiClient from "../api-client";
import {
  ProductPaginationResponse,
  ProductSearchFilterRequest,
  ManyProductsPaginationResponse,
  ProductSearchDTO,
} from "../types/product";
import { handleApiError } from "../utils/error-handler";

class ProductService {
  /**
   * Get all products with pagination, sorting, and filtering
   * Uses the backend /api/v1/products endpoint
   */
  async getAllProducts(
    page: number = 0,
    size: number = 10,
    sortBy: string = "createdAt",
    sortDir: string = "desc"
  ): Promise<ManyProductsPaginationResponse> {
    try {
      const response = await apiClient.get(`/v1/products`, {
        params: { page, size, sortBy, sortDirection: sortDir },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get products by category ID
   */
  async getProductsByCategory(
    categoryId: string,
    page: number = 0,
    size: number = 10
  ): Promise<ProductPaginationResponse> {
    try {
      const response = await apiClient.get(
        `/v1/products/category/${categoryId}`,
        {
          params: { page, size },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get a product by ID
   */
  async getProductById(productId: string) {
    try {
      const response = await apiClient.get(`/v1/products/${productId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new product
   */
  async createProduct(productData: FormData) {
    try {
      const response = await apiClient.post(`/v1/products`, productData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update an existing product
   */
  async updateProduct(productId: string, productData: FormData | any) {
    try {
      // Check if productData is FormData or a regular object
      const isFormData = productData instanceof FormData;

      const response = await apiClient.put(
        `/v1/products/${productId}`,
        productData,
        {
          headers: isFormData
            ? { "Content-Type": "multipart/form-data" }
            : { "Content-Type": "application/json" },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(productId: string) {
    try {
      const response = await apiClient.delete(`/v1/products/${productId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Advanced search for products with complex filtering
   * Uses the backend /api/v1/products/search endpoint
   */
  async advancedSearchProducts(
    filters: ProductSearchDTO
  ): Promise<ManyProductsPaginationResponse> {
    try {
      const response = await apiClient.post(`/v1/products/search`, filters);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Legacy search method for backward compatibility
   */
  async searchProducts(
    filters: ProductSearchFilterRequest
  ): Promise<ManyProductsPaginationResponse> {
    try {
      // Convert legacy filters to new ProductSearchDTO format
      const searchDTO: ProductSearchDTO = {
        page: filters.page,
        size: filters.size,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection,
        searchKeyword: filters.keyword,
        basePriceMin: filters.minPrice,
        basePriceMax: filters.maxPrice,
        inStock: filters.inStock,
        isOnSale: filters.onSale,
        isFeatured: filters.popular,
        isNewArrival: filters.newArrivals,
        isBestseller: filters.popular,
      };

      // Add category filters if present
      if (filters.categoryIds && filters.categoryIds.length > 0) {
        searchDTO.categoryIds = filters.categoryIds.map((id) => parseInt(id));
      }

      return this.advancedSearchProducts(searchDTO);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const productService = new ProductService();
