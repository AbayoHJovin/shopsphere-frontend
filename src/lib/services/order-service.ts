import apiClient from '../api-client';
import { OrderPaginationResponse, OrderResponse } from '../types/order';
import { handleApiError } from '../utils/error-handler';

class OrderService {
  /**
   * Get all orders with pagination, sorting, and filtering for admin/co-worker
   */
  async getAllOrders(
    page: number = 0,
    size: number = 10,
    sortBy: string = "orderDate",
    sortDir: string = "desc"
  ): Promise<OrderPaginationResponse> {
    try {
      const response = await apiClient.get('/admin/orders', {
        params: { page, size, sortBy, sortDir },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get order by ID for admin/co-worker
   */
  async getOrderById(orderId: string): Promise<OrderResponse> {
    try {
      const response = await apiClient.get(`/admin/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: string): Promise<OrderResponse> {
    try {
      const response = await apiClient.patch(`/admin/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(orderId: string, paymentStatus: string): Promise<OrderResponse> {
    try {
      const response = await apiClient.patch(`/admin/orders/${orderId}/payment-status`, { paymentStatus });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update QR scan status
   */
  async updateQrScanStatus(orderId: string, isQrScanned: boolean): Promise<OrderResponse> {
    try {
      const response = await apiClient.patch(`/admin/orders/${orderId}/qr-scan`, { isQrScanned });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const orderService = new OrderService();