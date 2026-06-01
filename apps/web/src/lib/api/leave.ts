import { apiClient } from '../api-client';

// ============================
// Types
// ============================

export interface LeaveCategory {
  id: string;
  name: string;
  code: string;
  description: string | null;
  totalDaysPerYear: number;
  carryForwardAllowed: boolean;
  maxCarryForward: number;
  requiresApproval: boolean;
  requiresDocument: boolean;
  isPaid: boolean;
  isActive: boolean;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  categoryId: string;
  year: number;
  allocated: number;
  used: number;
  pending: number;
  carryForward: number;
  remarks: string | null;
  category?: LeaveCategory;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  categoryId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  halfDay: boolean;
  halfDayPeriod: string | null;
  reason: string;
  emergencyLeave: boolean;
  attachmentUrl: string | null;
  contactDuringLeave: string | null;
  backupEmployeeId: string | null;
  status: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  employee?: any;
  category?: LeaveCategory;
  comments?: LeaveComment[];
}

export interface LeaveComment {
  id: string;
  leaveRequestId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author?: { firstName: string; lastName: string; avatar: string | null };
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: string;
  region: string | null;
  isActive: boolean;
}

export interface CreateLeaveRequestDto {
  categoryId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  halfDay?: boolean;
  halfDayPeriod?: string;
  reason: string;
  emergencyLeave?: boolean;
  attachmentUrl?: string;
  contactDuringLeave?: string;
  backupEmployeeId?: string;
}

export interface EmployeeLeaveDashboard {
  employeeId: string;
  balances: LeaveBalance[];
  summary: {
    totalAllocated: number;
    totalUsed: number;
    totalPending: number;
    totalAvailable: number;
    pendingRequests: number;
    approvedLeaves: number;
    rejectedLeaves: number;
  };
  recentRequests: LeaveRequest[];
  holidays: Holiday[];
}

export interface AdminLeaveDashboard {
  statistics: {
    totalEmployees: number;
    onLeaveToday: number;
    pendingRequests: number;
    approvedThisYear: number;
    rejectedThisYear: number;
  };
  charts: {
    monthlyTrends: { month: number; count: number; total_days: number }[];
    leaveTypeDistribution: { categoryId: string; categoryName: string; categoryCode: string; count: number; totalDays: number }[];
    departmentUsage: { department: string; leave_count: number; total_days: number }[];
  };
}

// ============================
// API Functions
// ============================

export const leaveApi = {
  // Categories
  getCategories: async (): Promise<LeaveCategory[]> => {
    const response = await apiClient.get('/leave/categories');
    return response.data.data || response.data;
  },
  createCategory: async (data: Partial<LeaveCategory>) => {
    const response = await apiClient.post('/leave/categories', data);
    return response.data.data || response.data;
  },
  updateCategory: async (id: string, data: Partial<LeaveCategory>) => {
    const response = await apiClient.put(`/leave/categories/${id}`, data);
    return response.data.data || response.data;
  },
  deleteCategory: async (id: string) => {
    const response = await apiClient.delete(`/leave/categories/${id}`);
    return response.data.data || response.data;
  },

  // Balances
  getMyBalances: async (year?: number): Promise<LeaveBalance[]> => {
    let url = '/leave/balances/my';
    if (year) url += `?year=${year}`;
    const response = await apiClient.get(url);
    return response.data.data || response.data;
  },
  getAllBalances: async (year?: number) => {
    let url = '/leave/balances';
    if (year) url += `?year=${year}`;
    const response = await apiClient.get(url);
    return response.data.data || response.data;
  },
  getEmployeeBalances: async (employeeId: string, year?: number): Promise<LeaveBalance[]> => {
    let url = `/leave/balances/employee/${employeeId}`;
    if (year) url += `?year=${year}`;
    const response = await apiClient.get(url);
    return response.data.data || response.data;
  },
  allocateBalances: async (data: { year: number; allocations: { employeeId: string; categoryId: string; allocated: number; remarks?: string }[] }) => {
    const response = await apiClient.post('/leave/balances/allocate', data);
    return response.data.data || response.data;
  },
  adjustBalance: async (id: string, data: { allocated: number; remarks?: string }) => {
    const response = await apiClient.put(`/leave/balances/${id}/adjust`, data);
    return response.data.data || response.data;
  },

  // Requests
  getRequests: async (params?: { page?: number; limit?: number; status?: string; employeeId?: string; categoryId?: string; year?: number }) => {
    const response = await apiClient.get('/leave/requests', { params });
    return response.data.data || response.data;
  },
  getMyRequests: async (params?: { page?: number; limit?: number; status?: string; year?: number }) => {
    const response = await apiClient.get('/leave/requests/my', { params });
    return response.data.data || response.data;
  },
  getRequest: async (id: string): Promise<LeaveRequest> => {
    const response = await apiClient.get(`/leave/requests/${id}`);
    return response.data.data || response.data;
  },
  createRequest: async (data: CreateLeaveRequestDto): Promise<LeaveRequest> => {
    const response = await apiClient.post('/leave/requests', data);
    return response.data.data || response.data;
  },
  updateStatus: async (id: string, data: { status: string; reviewNote?: string; cancellationReason?: string }) => {
    const response = await apiClient.patch(`/leave/requests/${id}/status`, data);
    return response.data.data || response.data;
  },
  cancelRequest: async (id: string, reason?: string) => {
    const response = await apiClient.patch(`/leave/requests/${id}/cancel`, { cancellationReason: reason });
    return response.data.data || response.data;
  },

  // Comments
  addComment: async (leaveRequestId: string, content: string) => {
    const response = await apiClient.post(`/leave/requests/${leaveRequestId}/comments`, { content });
    return response.data.data || response.data;
  },

  // Holidays
  getHolidays: async (year?: number): Promise<Holiday[]> => {
    let url = '/leave/holidays';
    if (year) url += `?year=${year}`;
    const response = await apiClient.get(url);
    return response.data.data || response.data;
  },
  createHoliday: async (data: Partial<Holiday>) => {
    const response = await apiClient.post('/leave/holidays', data);
    return response.data.data || response.data;
  },
  updateHoliday: async (id: string, data: Partial<Holiday>) => {
    const response = await apiClient.put(`/leave/holidays/${id}`, data);
    return response.data.data || response.data;
  },
  deleteHoliday: async (id: string) => {
    const response = await apiClient.delete(`/leave/holidays/${id}`);
    return response.data.data || response.data;
  },

  // Dashboards
  getEmployeeDashboard: async (): Promise<EmployeeLeaveDashboard> => {
    const response = await apiClient.get('/leave/dashboard/employee');
    return response.data.data || response.data;
  },
  getAdminDashboard: async (): Promise<AdminLeaveDashboard> => {
    const response = await apiClient.get('/leave/dashboard/admin');
    return response.data.data || response.data;
  },
};
