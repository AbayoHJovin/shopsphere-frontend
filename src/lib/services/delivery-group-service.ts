import apiClient from "../api-client";

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
  status: string;
}

export interface AgentDto {
  agentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  isAvailable: boolean;
  hasAGroup: boolean;
  lastActiveAt: string;
}

export interface CreateReadyForDeliveryGroupDTO {
  deliveryGroupName: string;
  deliveryGroupDescription?: string;
  delivererId: string;
  orderIds?: number[];
}

export interface BulkAddResult {
  totalRequested: number;
  successfullyAdded: number;
  skipped: number;
  skippedOrders: SkippedOrder[];
}

export interface SkippedOrder {
  orderId: number;
  reason: string;
  details: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

class DeliveryGroupService {
  private baseUrl = "/v1/delivery-groups";

  async getAvailableGroups(
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<DeliveryGroupDto>> {
    const response = await apiClient.get(`${this.baseUrl}/available`, {
      params: { page, size },
    });
    return response.data;
  }

  async createGroup(
    request: CreateReadyForDeliveryGroupDTO
  ): Promise<DeliveryGroupDto> {
    const response = await apiClient.post(this.baseUrl, request);
    return response.data.data;
  }

  async bulkAddOrdersToGroup(
    groupId: number,
    orderIds: number[]
  ): Promise<BulkAddResult> {
    const response = await apiClient.post(
      `${this.baseUrl}/bulk-add/${groupId}`,
      orderIds
    );
    return response.data.data;
  }

  async removeOrderFromGroup(groupId: number, orderId: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${groupId}/order/${orderId}`);
  }

  async getAvailableAgents(
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<AgentDto>> {
    const response = await apiClient.get(`${this.baseUrl}/agents`, {
      params: { page, size },
    });
    return response.data;
  }

  async findGroupByOrder(orderId: number): Promise<DeliveryGroupDto | null> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/order/${orderId}`);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async updateGroup(
    groupId: number,
    request: Partial<CreateReadyForDeliveryGroupDTO>
  ): Promise<DeliveryGroupDto> {
    const response = await apiClient.put(`${this.baseUrl}/${groupId}`, request);
    return response.data.data;
  }

  async deleteGroup(groupId: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${groupId}`);
  }

  async startDelivery(groupId: number): Promise<DeliveryGroupDto> {
    const response = await apiClient.put(
      `${this.baseUrl}/${groupId}/start-delivery`
    );
    return response.data.data;
  }
}

export const deliveryGroupService = new DeliveryGroupService();
