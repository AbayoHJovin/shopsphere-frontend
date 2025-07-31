import axios from "axios";
import { ProductColorResponse } from "../types/product";
import { handleApiError } from "../utils/error-handler";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface ProductColorRequest {
  colorName: string;
  colorHexCode: string;
  productId?: string;
}

export interface ProductColorPaginationResponse {
  content: ProductColorResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

class ProductColorService {
  /**
   * Get all product colors with pagination
   */
  async getAllColors(
    page: number = 0,
    size: number = 10
  ): Promise<ProductColorPaginationResponse> {
    try {
      const response = await axios.get(`${API_URL}/product-colors`, {
        params: { page, size },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new product color
   */
  async createColor(colorData: ProductColorRequest): Promise<ProductColorResponse> {
    try {
      const response = await axios.post(`${API_URL}/product-colors`, colorData, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update an existing product color
   */
  async updateColor(colorId: string, colorData: ProductColorRequest): Promise<ProductColorResponse> {
    try {
      const response = await axios.put(
        `${API_URL}/product-colors/${colorId}`,
        colorData,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete a product color
   */
  async deleteColor(colorId: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/product-colors/${colorId}`, {
        withCredentials: true,
      });
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get colors by product ID
   */
  async getColorsByProduct(productId: string): Promise<ProductColorResponse[]> {
    try {
      const response = await axios.get(`${API_URL}/product-colors/product/${productId}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Search colors by name
   */
  async searchColors(name: string, page: number = 0, size: number = 10): Promise<ProductColorPaginationResponse> {
    try {
      const response = await axios.get(`${API_URL}/product-colors/search`, {
        params: { name, page, size },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const productColorService = new ProductColorService();