import { apiClient } from '../api-client';

export interface CheckInDto {
  status?: string;
  notes?: string;
  ipAddress?: string;
  deviceInfo?: string;
  location?: string;
}

export interface StartBreakDto {
  type: string;
}

export interface CorrectionRequestDto {
  attendanceId: string;
  type: string;
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  reason: string;
}

export const attendanceApi = {
  checkIn: async (data: CheckInDto) => {
    const response = await apiClient.post('/attendance/check-in', data);
    return response.data.data || response.data;
  },

  checkOut: async () => {
    const response = await apiClient.post('/attendance/check-out');
    return response.data.data || response.data;
  },

  startBreak: async (data: StartBreakDto) => {
    const response = await apiClient.post('/attendance/break/start', data);
    return response.data.data || response.data;
  },

  endBreak: async () => {
    const response = await apiClient.post('/attendance/break/end');
    return response.data.data || response.data;
  },

  getEmployeeStats: async () => {
    const response = await apiClient.get('/attendance/stats/employee');
    return response.data.data || response.data;
  },

  getAdminStats: async () => {
    const response = await apiClient.get('/attendance/stats/admin');
    return response.data.data || response.data;
  },

  getCalendar: async (month: number, year: number) => {
    const response = await apiClient.get(`/attendance/calendar?month=${month}&year=${year}`);
    return response.data.data || response.data;
  },

  requestCorrection: async (data: CorrectionRequestDto) => {
    const response = await apiClient.post('/attendance/corrections', data);
    return response.data.data || response.data;
  },

  getMyCorrections: async () => {
    const response = await apiClient.get('/attendance/corrections/my-requests');
    return response.data.data || response.data;
  },

  getAllCorrections: async () => {
    const response = await apiClient.get('/attendance/corrections');
    return response.data.data || response.data;
  },

  approveCorrection: async (id: string) => {
    const response = await apiClient.patch(`/attendance/corrections/${id}/approve`);
    return response.data.data || response.data;
  },

  rejectCorrection: async (id: string) => {
    const response = await apiClient.patch(`/attendance/corrections/${id}/reject`);
    return response.data.data || response.data;
  },
};
