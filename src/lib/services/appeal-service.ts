import apiClient from "@/lib/api-client";

export interface AppealDTO {
  id: number;
  returnRequestId: number;
  customerId?: string;
  level: number;
  reason: string;
  description?: string;
  status: "PENDING" | "APPROVED" | "DENIED";
  submittedAt: string;
  decisionAt?: string;
  decisionNotes?: string;
  createdAt: string;
  updatedAt: string;
  appealMedia?: AppealMediaDTO[];
  returnRequest?: {
    id: number;
    orderId: number;
    orderCode: string;
    customerName: string;
    customerEmail: string;
    status: string;
    reason: string;
    submittedAt: string;
  };
}

export interface AppealMediaDTO {
  id: number;
  appealId: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppealDecisionDTO {
  appealId: number;
  decision: "APPROVED" | "DENIED";
  decisionNotes?: string;
}

export interface AppealFilterParams {
  status?: "PENDING" | "APPROVED" | "DENIED";
  fromDate?: string;
  toDate?: string;
  customerName?: string;
  orderCode?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
}

export interface AppealPageResponse {
  content: AppealDTO[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface AppealStats {
  pendingCount: number;
  approvedCount: number;
  deniedCount: number;
  recentCount: number;
  urgentCount: number;
  approvalRate: number;
}

class AppealService {
  private readonly baseUrl = "/appeals";

  /**
   * Get all appeals with filtering and pagination
   */
  async getAllAppeals(params: AppealFilterParams = {}): Promise<AppealPageResponse> {
    const response = await apiClient.get(`${this.baseUrl}`, { params });
    return response.data;
  }

  /**
   * Get appeal by ID
   */
  async getAppealById(appealId: number): Promise<AppealDTO> {
    const response = await apiClient.get(`${this.baseUrl}/${appealId}`);
    return response.data;
  }

  /**
   * Get appeal by return request ID
   */
  async getAppealByReturnRequestId(returnRequestId: number): Promise<AppealDTO> {
    const response = await apiClient.get(`${this.baseUrl}/return-request/${returnRequestId}`);
    return response.data;
  }

  /**
   * Review and make decision on appeal
   */
  async reviewAppeal(decisionData: AppealDecisionDTO): Promise<AppealDTO> {
    const response = await apiClient.post(`${this.baseUrl}/review`, decisionData);
    return response.data;
  }

  /**
   * Get appeal statistics
   */
  async getAppealStats(): Promise<AppealStats> {
    const response = await apiClient.get(`${this.baseUrl}/stats`);
    return response.data;
  }

  /**
   * Get pending appeals count for sidebar badge
   */
  async getPendingAppealsCount(): Promise<number> {
    const response = await apiClient.get(`${this.baseUrl}/pending/count`);
    return response.data;
  }

  /**
   * Export appeals to CSV
   */
  async exportAppeals(params: AppealFilterParams = {}): Promise<Blob> {
    const response = await apiClient.get(`${this.baseUrl}/export`, {
      params,
      responseType: 'blob'
    });
    return response.data;
  }

  /**
   * Get appeal media file
   */
  async getAppealMedia(appealId: number): Promise<AppealMediaDTO[]> {
    const response = await apiClient.get(`${this.baseUrl}/${appealId}/media`);
    return response.data;
  }
}

export const appealService = new AppealService();
export default appealService;
