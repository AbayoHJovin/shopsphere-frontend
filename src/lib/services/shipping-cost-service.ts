import apiClient from "../api-client";

export interface ShippingCostDTO {
  id: number;
  name: string;
  description?: string;
  distanceKmCost?: number;
  weightKgCost?: number;
  baseFee?: number;
  internationalFee?: number;
  maxWeightKg?: number;
  maxDistanceKm?: number;
  freeShippingThreshold?: number;
  regionCode?: string;
  isActive: boolean;
  priorityOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShippingCostDTO {
  name: string;
  description?: string;
  distanceKmCost?: number;
  weightKgCost?: number;
  baseFee?: number;
  internationalFee?: number;
  maxWeightKg?: number;
  maxDistanceKm?: number;
  freeShippingThreshold?: number;
  regionCode?: string;
  isActive: boolean;
  priorityOrder?: number;
}

export interface UpdateShippingCostDTO {
  name?: string;
  description?: string;
  distanceKmCost?: number;
  weightKgCost?: number;
  baseFee?: number;
  internationalFee?: number;
  maxWeightKg?: number;
  maxDistanceKm?: number;
  freeShippingThreshold?: number;
  regionCode?: string;
  isActive?: boolean;
  priorityOrder?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface CalculateShippingCostRequest {
  weight?: number;
  distance?: number;
  orderValue?: number;
}

export interface CalculateOrderShippingRequest {
  deliveryAddress: {
    streetAddress: string;
    city: string;
    country: string;
  };
  items: Array<{
    productId: string;
    variantId?: number;
    quantity: number;
    weight?: number;
  }>;
  orderValue: number;
}

class ShippingCostService {
  private baseUrl = "/shipping-costs";

  async getAllShippingCosts(
    page: number = 0,
    size: number = 10,
    sort?: string
  ): Promise<PaginatedResponse<ShippingCostDTO>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (sort) {
      params.append("sort", sort);
    }

    const response = await apiClient.get(`${this.baseUrl}?${params}`);
    return response.data;
  }

  async getActiveShippingCosts(): Promise<ShippingCostDTO[]> {
    const response = await apiClient.get(`${this.baseUrl}/active`);
    return response.data;
  }

  async getShippingCostById(id: number): Promise<ShippingCostDTO> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async createShippingCost(
    data: CreateShippingCostDTO
  ): Promise<ShippingCostDTO> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  async updateShippingCost(
    id: number,
    data: UpdateShippingCostDTO
  ): Promise<ShippingCostDTO> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteShippingCost(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async searchShippingCosts(
    name: string,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<ShippingCostDTO>> {
    const params = new URLSearchParams({
      name,
      page: page.toString(),
      size: size.toString(),
    });

    const response = await apiClient.get(`${this.baseUrl}/search?${params}`);
    return response.data;
  }

  async calculateShippingCost(
    request: CalculateShippingCostRequest
  ): Promise<number> {
    const params = new URLSearchParams();

    if (request.weight !== undefined) {
      params.append("weight", request.weight.toString());
    }
    if (request.distance !== undefined) {
      params.append("distance", request.distance.toString());
    }
    if (request.orderValue !== undefined) {
      params.append("orderValue", request.orderValue.toString());
    }

    const response = await apiClient.get(`${this.baseUrl}/calculate?${params}`);
    return response.data;
  }

  async toggleShippingCostStatus(id: number): Promise<ShippingCostDTO> {
    const response = await apiClient.put(`${this.baseUrl}/${id}/toggle`);
    return response.data;
  }

  async calculateOrderShippingCost(
    request: CalculateOrderShippingRequest
  ): Promise<number> {
    const response = await apiClient.post(
      `${this.baseUrl}/calculate-order`,
      request
    );
    return response.data;
  }
}

export const shippingCostService = new ShippingCostService();
