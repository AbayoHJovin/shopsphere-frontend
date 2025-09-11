import apiClient from "../api-client";

export interface DeliveryAgentStats {
  totalGroups: number;
  completedGroups: number;
  totalOrders: number;
}

export interface DeliveryAgentDashboard {
  stats: DeliveryAgentStats;
  currentGroups: DeliveryGroupDto[];
  completedGroups: DeliveryGroupDto[];
}

export interface DeliveryGroupDto {
  deliveryGroupId: number;
  deliveryGroupName: string;
  deliveryGroupDescription: string;
  delivererId: string;
  delivererName: string;
  orderIds: number[];
  memberCount: number;
  createdAt: string;
  scheduledAt?: string;
  hasDeliveryStarted: boolean;
  deliveryStartedAt?: string;
  hasDeliveryFinished: boolean;
  deliveryFinishedAt?: string;
  status: string;
}

export interface OrderDTO {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDTO[];
  shippingAddress: AddressDTO;
}

export interface OrderItemDTO {
  id: number;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface AddressDTO {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

class DeliveryAgentService {
  private baseUrl = "/v1/delivery-agent";

  async getDashboardData(): Promise<DeliveryAgentDashboard> {
    try {
      const response = await apiClient.get<DeliveryAgentDashboard>(
        `${this.baseUrl}/dashboard`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  }

  async getOrdersForGroup(groupId: number): Promise<OrderDTO[]> {
    try {
      const response = await apiClient.get<OrderDTO[]>(
        `${this.baseUrl}/groups/${groupId}/orders`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching orders for group:", error);
      throw error;
    }
  }

  async startDelivery(groupId: number): Promise<DeliveryGroupDto> {
    try {
      const response = await apiClient.put<DeliveryGroupDto>(
        `${this.baseUrl}/groups/${groupId}/start-delivery`
      );
      return response.data;
    } catch (error) {
      console.error("Error starting delivery:", error);
      throw error;
    }
  }

  async finishDelivery(groupId: number): Promise<DeliveryGroupDto> {
    try {
      const response = await apiClient.put<DeliveryGroupDto>(
        `${this.baseUrl}/groups/${groupId}/finish-delivery`
      );
      return response.data;
    } catch (error) {
      console.error("Error finishing delivery:", error);
      throw error;
    }
  }

  async getOrderDetails(orderId: number): Promise<OrderDTO> {
    try {
      const response = await apiClient.get<OrderDTO>(
        `${this.baseUrl}/orders/${orderId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching order details:", error);
      throw error;
    }
  }
}

export const deliveryAgentService = new DeliveryAgentService();
