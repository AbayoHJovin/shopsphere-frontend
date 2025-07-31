import axios from "axios";
import {
  ProductPaginationResponse,
  ProductSearchFilterRequest,
} from "../types/product";
import { handleApiError } from "../utils/error-handler";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

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
      const response = await axios.get(`${API_URL}/products`, {
        params: { page, size, sortBy, sortDir },
        withCredentials: true,
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
      const response = await axios.get(
        `${API_URL}/products/category/${categoryId}`,
        {
          params: { page, size },
          withCredentials: true,
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
      const response = await axios.get(`${API_URL}/products/${productId}`, {
        withCredentials: true,
      });
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
      const response = await axios.post(`${API_URL}/products`, productData, {
        withCredentials: true,
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
      
      const response = await axios.put(
        `${API_URL}/products/${productId}`,
        productData,
        {
          withCredentials: true,
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
      const response = await axios.delete(`${API_URL}/products/${productId}`, {
        withCredentials: true,
      });
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
      const response = await axios.post(
        `${API_URL}/products/advanced-search`,
        filters,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const productService = new ProductService();
