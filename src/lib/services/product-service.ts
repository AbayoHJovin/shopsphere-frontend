import apiClient from "../api-client";
import {
  ProductPaginationResponse,
  ProductSearchFilterRequest,
} from "../types/product";
import { handleApiError } from "../utils/error-handler";

class ProductService {
  /**
   * Get all products with pagination, sorting, and filtering
   */
  async getAllProducts(
    page: number = 0,
    size: number = 10,
    sortBy: string = "name",
    sortDir: string = "asc"
  ): Promise<ProductPaginationResponse> {
    try {
      const response = await apiClient.get(`/products`, {
        params: { page, size, sortBy, sortDir },
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
      const response = await apiClient.get(`/products/category/${categoryId}`, {
        params: { page, size },
      });
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
      const response = await apiClient.get(`/products/${productId}`);
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
      const response = await apiClient.post(`/products`, productData, {
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
        `/products/${productId}`,
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
      const response = await apiClient.delete(`/products/${productId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Advanced search for products with complex filtering
   */
  async advancedSearchProducts(
    filters: ProductSearchFilterRequest
  ): Promise<ProductPaginationResponse> {
    try {
      const response = await apiClient.post(
        `/products/advanced-search`,
        filters
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const productService = new ProductService();
