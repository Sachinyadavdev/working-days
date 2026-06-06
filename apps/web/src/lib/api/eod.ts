import { apiClient } from '../api-client';
import { ApiResponse, EodReportEntity } from '@ems/shared-types';

// Assuming standard ApiResponse and Pagination types from your shared types
// You might need to adjust the return types based on your exact definitions

export const eodApi = {
  getAll: async (params?: any): Promise<ApiResponse<{ items: EodReportEntity[], meta: any }>> => {
    const response = await apiClient.get('/eod', { params });
    return response.data;
  },

  getMyEods: async (params?: any): Promise<ApiResponse<{ items: EodReportEntity[], meta: any }>> => {
    const response = await apiClient.get('/eod/me', { params });
    return response.data;
  },

  checkToday: async (): Promise<ApiResponse<{ submitted: boolean, report: EodReportEntity | null }>> => {
    const response = await apiClient.get('/eod/today');
    return response.data;
  },

  submit: async (data: { projectId?: string; tasksWorkedOn: string; description?: string; challengesFaced?: string; tomorrowPlan?: string; hoursSpent: number }): Promise<ApiResponse<EodReportEntity>> => {
    const response = await apiClient.post('/eod', data);
    return response.data;
  },

  review: async (id: string, data: { status: string; comments?: string }): Promise<ApiResponse<EodReportEntity>> => {
    const response = await apiClient.patch(`/eod/${id}/review`, data);
    return response.data;
  }
};
