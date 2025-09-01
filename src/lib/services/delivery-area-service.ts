import apiClient from "../api-client";
import { API_ENDPOINTS } from "../constants";

// Types based on backend DTOs
export interface DeliveryAreaDTO {
  deliveryAreaId: number;
  deliveryAreaName: string;
  parentId: number | null;
  parentName: string | null;
  createdAt: string;
  children: DeliveryAreaDTO[];
  level: number;
  deliveryCost: number | null;
  expectedDeliveryMinDays: number | null;
  expectedDeliveryMaxDays: number | null;
}

export interface CreateDeliveryAreaDTO {
  deliveryAreaName: string;
  parentId?: number | null;
  deliveryCost?: number | null;
  expectedDeliveryMinDays?: number | null;
  expectedDeliveryMaxDays?: number | null;
}

export interface UpdateDeliveryAreaDTO {
  deliveryAreaName?: string;
  parentId?: number | null;
  deliveryCost?: number | null;
  expectedDeliveryMinDays?: number | null;
  expectedDeliveryMaxDays?: number | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class DeliveryAreaService {
  // Create a new delivery area
  async createDeliveryArea(
    deliveryAreaData: CreateDeliveryAreaDTO
  ): Promise<ApiResponse<DeliveryAreaDTO>> {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.DELIVERY_AREAS.BASE}`,
        deliveryAreaData
      );
      // Backend returns the created delivery area directly
      return {
        success: true,
        message: "Delivery area created successfully",
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to create delivery area",
        error: error.response?.data?.message || "Network error",
      };
    }
  }

  // Update an existing delivery area
  async updateDeliveryArea(
    deliveryAreaId: number,
    updateData: UpdateDeliveryAreaDTO
  ): Promise<ApiResponse<DeliveryAreaDTO>> {
    try {
      const response = await apiClient.put(
        `${API_ENDPOINTS.DELIVERY_AREAS.BASE}/${deliveryAreaId}`,
        updateData
      );
      // Backend returns the updated delivery area directly
      return {
        success: true,
        message: "Delivery area updated successfully",
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to update delivery area",
        error: error.response?.data?.message || "Network error",
      };
    }
  }

  // Delete a delivery area
  async deleteDeliveryArea(
    deliveryAreaId: number
  ): Promise<ApiResponse<boolean>> {
    try {
      const response = await apiClient.delete(
        `${API_ENDPOINTS.DELIVERY_AREAS.BASE}/${deliveryAreaId}`
      );
      // Backend returns 204 No Content for successful deletion
      return {
        success: true,
        message: "Delivery area deleted successfully",
        data: true,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to delete delivery area",
        error: error.response?.data?.message || "Network error",
      };
    }
  }

  // Get delivery area by ID
  async getDeliveryAreaById(
    deliveryAreaId: number
  ): Promise<ApiResponse<DeliveryAreaDTO>> {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.DELIVERY_AREAS.BASE}/${deliveryAreaId}`
      );
      // Backend returns the delivery area directly
      return {
        success: true,
        message: "Delivery area retrieved successfully",
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get delivery area",
        error: error.response?.data?.message || "Network error",
      };
    }
  }

  // Get all delivery areas
  async getAllDeliveryAreas(): Promise<ApiResponse<DeliveryAreaDTO[]>> {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.DELIVERY_AREAS.BASE}`
      );
      // Backend returns the array directly, not wrapped in a data property
      return {
        success: true,
        message: "Delivery areas retrieved successfully",
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to get delivery areas",
        error: error.response?.data?.message || "Network error",
      };
    }
  }

  // Get top-level delivery areas (areas with no parent)
  async getTopLevelDeliveryAreas(): Promise<ApiResponse<DeliveryAreaDTO[]>> {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.DELIVERY_AREAS.BASE}/top-level`
      );
      // Backend returns the array directly, not wrapped in a data property
      return {
        success: true,
        message: "Top-level delivery areas retrieved successfully",
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to get top-level delivery areas",
        error: error.response?.data?.message || "Network error",
      };
    }
  }

  // Get sub-areas of a specific parent
  async getSubAreas(parentId: number): Promise<ApiResponse<DeliveryAreaDTO[]>> {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.DELIVERY_AREAS.BASE}/sub-areas/${parentId}`
      );
      // Backend returns the array directly, not wrapped in a data property
      return {
        success: true,
        message: "Sub-areas retrieved successfully",
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get sub-areas",
        error: error.response?.data?.message || "Network error",
      };
    }
  }

  // Search delivery areas by name
  async searchDeliveryAreas(
    query: string
  ): Promise<ApiResponse<DeliveryAreaDTO[]>> {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.DELIVERY_AREAS.BASE}/search`,
        {
          params: { query },
        }
      );
      // Backend returns the array directly, not wrapped in a data property
      return {
        success: true,
        message: "Search results retrieved successfully",
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to search delivery areas",
        error: error.response?.data?.message || "Network error",
      };
    }
  }
}

export const deliveryAreaService = new DeliveryAreaService();
export default deliveryAreaService;
