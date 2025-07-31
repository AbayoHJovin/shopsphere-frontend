"use client";

import apiClient from '../api-client';
import { API_ENDPOINTS } from '../constants';
import { AdminDashboardResponse, CoWorkerDashboardResponse, DashboardResponse } from '../types/dashboard';
import { AxiosError } from 'axios';

class DashboardService {
  // Fetches dashboard data from the API
  async getDashboardData(): Promise<DashboardResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DASHBOARD.BASE);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error fetching dashboard data:', axiosError);
      throw new Error('Failed to load dashboard data');
    }
  }
  
  // Type guard to check if the dashboard response is for an admin
  isAdminDashboard(data: DashboardResponse): data is AdminDashboardResponse {
    return 'totalAdmins' in data;
  }
  
  // Type guard to check if the dashboard response is for a co-worker
  isCoWorkerDashboard(data: DashboardResponse): data is CoWorkerDashboardResponse {
    return 'shippedOrders' in data;
  }
}

export const dashboardService = new DashboardService(); 