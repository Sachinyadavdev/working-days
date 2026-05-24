'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react';


import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { RequirePermission } from '@/components/auth/require-permission';
import { DepartmentModal } from './components/department-modal';

interface Department {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  managerId: string | null;
  createdAt: string;
  manager?: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  } | null;
}

export default function DepartmentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const { data: departments = [], isLoading, refetch } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await apiClient.get('/department');
      const data = response.data;
      return Array.isArray(data?.data) 
        ? data.data 
        : Array.isArray(data?.items) 
        ? data.items 
        : Array.isArray(data) 
        ? data 
        : [];
    },
  });

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this department?')) {
      try {
        await apiClient.delete(`/department/${id}`);
        refetch();
      } catch (error) {
        console.error('Failed to delete department', error);
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="text-brand-400" /> Departments
          </h1>
          <p className="text-brand-200 mt-1">Manage company departments and their heads.</p>
        </div>
        <RequirePermission permission="departments:create">
          <Button 
            className="bg-brand-500 hover:bg-brand-400 text-white shadow-lg shadow-brand-500/20"
            onClick={() => {
              setSelectedDepartment(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Department
          </Button>
        </RequirePermission>
      </div>

      <div className="bg-black/20 rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-brand-300 text-sm">
            <tr>
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold">Code</th>
              <th className="px-6 py-4 font-semibold">Manager</th>
              <th className="px-6 py-4 font-semibold">Created Date</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-brand-300">
                  Loading departments...
                </td>
              </tr>
            ) : departments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-brand-300">
                  No departments found.
                </td>
              </tr>
            ) : (
              departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{dept.name}</td>
                  <td className="px-6 py-4 text-brand-200">
                    {dept.code ? (
                      <span className="bg-brand-500/20 text-brand-300 px-2 py-1 rounded text-xs font-mono">
                        {dept.code}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-brand-200">
                    {dept.manager ? `${dept.manager.user.firstName} ${dept.manager.user.lastName}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-brand-200">
                    {new Date(dept.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <RequirePermission permission="departments:update">
                        <button 
                          onClick={() => {
                            setSelectedDepartment(dept);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-brand-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                      </RequirePermission>
                      <RequirePermission permission="departments:delete">
                        <button 
                          onClick={() => handleDelete(dept.id)}
                          className="p-2 text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </RequirePermission>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DepartmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        department={selectedDepartment}
      />
    </div>
  );
}
