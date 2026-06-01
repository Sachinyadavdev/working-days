import { apiClient } from '../api-client';

export interface Employee {
  id: string;
  userId: string;
  employeeCode: string;
  departmentId?: string;
  designationId?: string;
  joiningDate: string;
  status: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const employeeApi = {
  getEmployees: async (): Promise<Employee[]> => {
    const response = await apiClient.get('/employees');
    // Ensure we handle pagination format if the backend returns it
    return response.data.data?.items || response.data.data || response.data;
  },
};
