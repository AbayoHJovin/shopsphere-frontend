import apiClient from "../api-client";
import {
  AdminOrderListResponse,
  AdminOrderDTO,
  ApiResponse,
} from "../types/order";
import { API_ENDPOINTS } from "../constants";

class OrderService {
  /**
   * Get all orders for admin dashboard
   */
  async getAllOrders(): Promise<AdminOrderDTO[]> {
    try {
      const response = await apiClient.get<AdminOrderListResponse>(
        API_ENDPOINTS.ADMIN_ORDERS.ALL
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  }

  /**
   * Get orders by status for admin dashboard
   */
  async getOrdersByStatus(status: string): Promise<AdminOrderDTO[]> {
    try {
      const response = await apiClient.get<AdminOrderListResponse>(
        API_ENDPOINTS.ADMIN_ORDERS.BY_STATUS(status)
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching orders by status:", error);
      throw error;
    }
  }

  /**
   * Get order by ID for admin
   */
  async getOrderById(orderId: string): Promise<AdminOrderDTO> {
    try {
      const response = await apiClient.get<ApiResponse<AdminOrderDTO>>(
        API_ENDPOINTS.ADMIN_ORDERS.BY_ID(orderId)
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  }

  /**
   * Get order by order number for admin
   */
  async getOrderByNumber(orderNumber: string): Promise<AdminOrderDTO> {
    try {
      const response = await apiClient.get<ApiResponse<AdminOrderDTO>>(
        API_ENDPOINTS.ADMIN_ORDERS.BY_NUMBER(orderNumber)
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching order by number:", error);
      throw error;
    }
  }

  /**
   * Update order status (admin only)
   */
  async updateOrderStatus(
    orderId: string,
    status: string
  ): Promise<AdminOrderDTO> {
    try {
      const response = await apiClient.put<ApiResponse<AdminOrderDTO>>(
        API_ENDPOINTS.ADMIN_ORDERS.UPDATE_STATUS(orderId),
        { status }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  }

  /**
   * Update order tracking information (admin only)
   */
  async updateOrderTracking(
    orderId: string,
    trackingNumber: string,
    estimatedDelivery?: string
  ): Promise<AdminOrderDTO> {
    try {
      const payload: { trackingNumber: string; estimatedDelivery?: string } = {
        trackingNumber,
      };

      if (estimatedDelivery) {
        payload.estimatedDelivery = estimatedDelivery;
      }

      const response = await apiClient.put<ApiResponse<AdminOrderDTO>>(
        API_ENDPOINTS.ADMIN_ORDERS.UPDATE_TRACKING(orderId),
        payload
      );
      return response.data.data;
    } catch (error) {
      console.error("Error updating order tracking:", error);
      throw error;
    }
  }

  /**
   * Cancel order (customer endpoint - keeping for compatibility)
   */
  async cancelOrder(orderId: string, userId: string): Promise<any> {
    try {
      const response = await apiClient.put<ApiResponse<any>>(
        API_ENDPOINTS.ORDERS.CANCEL(orderId),
        {},
        { params: { userId } }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error cancelling order:", error);
      throw error;
    }
  }

  /**
   * Get order tracking (customer endpoint - keeping for compatibility)
   */
  async getOrderTracking(orderId: string, userId: string): Promise<any> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        API_ENDPOINTS.ORDERS.TRACKING(orderId),
        { params: { userId } }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching order tracking:", error);
      throw error;
    }
  }

  /**
   * Verify delivery by pickup token (delivery agent only)
   */
  async verifyDelivery(pickupToken: string): Promise<any> {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        `/api/v1/orders/delivery/verify/${pickupToken}`,
        {}
      );
      return response.data;
    } catch (error) {
      console.error("Error verifying delivery:", error);
      throw error;
    }
  }
}

export const orderService = new OrderService();
