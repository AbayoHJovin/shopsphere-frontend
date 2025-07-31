import axios from "axios";
import { ProductSizeResponse, Size } from "../types/product";
import { handleApiError } from "../utils/error-handler";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface ProductSizeRequest {
  size: Size;
  stockForSize: number;
  productId?: string;
}

class ProductSizeService {
  /**
   * Get sizes for a specific product
   */
  async getSizesByProduct(productId: string): Promise<ProductSizeResponse[]> {
    try {
      const response = await axios.get(`${API_URL}/products/${productId}/sizes`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Add a size to a product
   */
  async addSizeToProduct(productId: string, sizeData: ProductSizeRequest): Promise<ProductSizeResponse> {
    try {
      const response = await axios.post(
        `${API_URL}/products/${productId}/sizes`,
        sizeData,
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
   * Update a product size
   */
  async updateProductSize(sizeId: string, sizeData: ProductSizeRequest): Promise<ProductSizeResponse> {
    try {
      const response = await axios.put(
        `${API_URL}/products/sizes/${sizeId}`,
        sizeData,
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
   * Delete a product size
   */
  async deleteProductSize(sizeId: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/products/sizes/${sizeId}`, {
        withCredentials: true,
      });
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get all available sizes (enum values)
   */
  getAvailableSizes(): Size[] {
    return [Size.SMALL, Size.MEDIUM, Size.LARGE];
  }
}

export const productSizeService = new ProductSizeService();