import { 
  ReturnRequestDTO, 
  ReturnRequestsResponse, 
  ReturnDecisionDTO,
  ReturnRequestSearchParams,
  ReturnRequestFilters,
  ReturnStatus 
} from '@/types/return';
import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';

class ReturnService {

  /**
   * Get all return requests with comprehensive filtering (Admin/Employee only)
   */
  async getAllReturnRequests(params: ReturnRequestSearchParams = {}): Promise<ReturnRequestsResponse> {
    const { 
      page = 0, 
      size = 20, 
      sort = 'submittedAt', 
      direction = 'DESC',
      filters = {}
    } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: `${sort},${direction}`,
    });

    // Add filters to query params
    if (filters.status && filters.status !== 'ALL') {
      queryParams.append('status', filters.status);
    }
    
    if (filters.customerType && filters.customerType !== 'ALL') {
      queryParams.append('customerType', filters.customerType);
    }
    
    if (filters.search && filters.search.trim()) {
      queryParams.append('search', filters.search.trim());
    }
    
    if (filters.dateFrom) {
      queryParams.append('dateFrom', filters.dateFrom);
    }
    
    if (filters.dateTo) {
      queryParams.append('dateTo', filters.dateTo);
    }

    const response = await apiClient.get(`${API_ENDPOINTS.RETURNS.ADMIN_ALL}?${queryParams}`);
    return response.data;
  }

  /**
   * Get return requests by status (Admin/Employee only)
   */
  async getReturnRequestsByStatus(
    status: ReturnStatus, 
    params: ReturnRequestSearchParams = {}
  ): Promise<ReturnRequestsResponse> {
    const { page = 0, size = 20, sort = 'submittedAt', direction = 'DESC' } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: `${sort},${direction}`,
    });

    const response = await apiClient.get(`${API_ENDPOINTS.RETURNS.ADMIN_BY_STATUS(status)}?${queryParams}`);
    return response.data;
  }

  /**
   * Get guest return requests (Admin/Employee only)
   */
  async getGuestReturnRequests(params: ReturnRequestSearchParams = {}): Promise<ReturnRequestsResponse> {
    const { page = 0, size = 20, sort = 'submittedAt', direction = 'DESC' } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: `${sort},${direction}`,
    });

    const response = await apiClient.get(`${API_ENDPOINTS.RETURNS.ADMIN_GUEST}?${queryParams}`);
    return response.data;
  }

  /**
   * Get specific return request details
   */
  async getReturnRequestById(id: string): Promise<ReturnRequestDTO> {
    const response = await apiClient.get(API_ENDPOINTS.RETURNS.BY_ID(id));
    return response.data;
  }

  /**
   * Review return request (Admin/Employee only)
   */
  async reviewReturnRequest(decision: ReturnDecisionDTO): Promise<ReturnRequestDTO> {
    const requestData = {
      ...decision,
      returnRequestId: String(decision.returnRequestId) // Ensure ID is sent as string
    };
    const response = await apiClient.post(API_ENDPOINTS.RETURNS.ADMIN_REVIEW, requestData);
    return response.data;
  }

  /**
   * Get return statistics efficiently from a single API call
   */
  async getReturnStatistics(filters: ReturnRequestFilters = {}): Promise<{
    total: number;
    pending: number;
    approved: number;
    denied: number;
    completed: number;
  }> {
    try {
      // Get all return requests with current filters to calculate statistics
      const response = await this.getAllReturnRequests({
        page: 0,
        size: 1000, // Get a large number to calculate accurate statistics
        filters: { ...filters, status: 'ALL' } // Override status to get all for statistics
      });

      const returnRequests = response.content;
      
      // Calculate statistics from the filtered results
      const statistics = {
        total: returnRequests.length,
        pending: returnRequests.filter(r => r.status === 'PENDING').length,
        approved: returnRequests.filter(r => r.status === 'APPROVED').length,
        denied: returnRequests.filter(r => r.status === 'DENIED').length,
        completed: returnRequests.filter(r => r.status === 'COMPLETED').length,
      };

      return statistics;
    } catch (error) {
      console.error('Failed to fetch return statistics:', error);
      return {
        total: 0,
        pending: 0,
        approved: 0,
        denied: 0,
        completed: 0,
      };
    }
  }
}

export const returnService = new ReturnService();
export default returnService;
