'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, MoreVertical, Key, Shield, UserX, UserCheck } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';

import { AddEmployeeModal } from '@/components/employees/add-employee-modal';
import { ResetPasswordModal, ChangeRoleModal, ChangeStatusModal } from '@/components/employees/access-management-modals';

export default function EmployeeDirectoryPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.roles?.includes('SUPER_ADMIN') || user?.roles?.includes('ADMIN');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [resetModal, setResetModal] = useState<{ isOpen: boolean; employeeId: string; email: string }>({ isOpen: false, employeeId: '', email: '' });
  const [roleModal, setRoleModal] = useState<{ isOpen: boolean; employeeId: string; roles: string[] }>({ isOpen: false, employeeId: '', roles: [] });
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean; employeeId: string; status: string }>({ isOpen: false, employeeId: '', status: '' });
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Fetch all employees
  const { data: employeesResponse, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      // The old endpoint was '/employee-profile/all'. Wait, let's use '/employees' which we just added in the controller.
      // Wait, EmployeesController has GET /employees which uses pagination.
      // The original code used /employee-profile/all, let's keep it if it works, or use /employees. 
      // Let's assume /employees returns { items: [] } 
      const { data } = await apiClient.get('/employees');
      return data;
    },
  });

  // Extract employees array depending on API structure
  let employees: any[] = [];
  if (Array.isArray(employeesResponse)) {
    employees = employeesResponse;
  } else if (employeesResponse?.data?.items && Array.isArray(employeesResponse.data.items)) {
    employees = employeesResponse.data.items;
  } else if (employeesResponse?.items && Array.isArray(employeesResponse.items)) {
    employees = employeesResponse.items;
  } else if (employeesResponse?.data && Array.isArray(employeesResponse.data)) {
    employees = employeesResponse.data;
  }

  const columns = [
    {
      header: 'Employee Name',
      accessorKey: 'name',
      cell: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white font-semibold shadow-inner">
            {item.user?.firstName?.[0] || 'U'}
            {item.user?.lastName?.[0] || ''}
          </div>
          <div>
            <div className="font-semibold text-white">
              {item.user?.firstName} {item.user?.lastName}
            </div>
            <div className="text-xs text-brand-300">{item.user?.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      accessorKey: 'role',
      cell: (item: any) => {
        const roles = item.user?.roles || [];
        return (
          <div className="flex flex-wrap gap-1">
            {roles.length > 0 ? roles.map((r: any) => (
              <span key={r.role?.name || r} className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-brand-700/50 text-brand-200 border border-brand-500/30">
                {r.role?.name?.replace('_', ' ') || r.replace?.('_', ' ') || 'Unknown'}
              </span>
            )) : <span className="text-xs text-brand-400">No Roles</span>}
          </div>
        )
      },
    },
    {
      header: 'Department',
      accessorKey: 'department',
      cell: (item: any) => (
        <div className="text-sm text-brand-100">{item.department?.name || item.departmentId || 'Unassigned'}</div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (item: any) => {
        const isActive = item.status === 'ACTIVE' || item.user?.isActive;
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
              isActive
                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}
          >
            {isActive ? 'Active' : 'Suspended'}
          </span>
        );
      },
    },
  ];

  if (isAdmin) {
    columns.push({
      header: 'Actions',
      accessorKey: 'actions',
      cell: (item: any) => {
        const isActive = item.status === 'ACTIVE' || item.user?.isActive;
        const isMenuOpen = openMenuId === item.id;

        return (
          <DropdownMenu.Root open={isMenuOpen} onOpenChange={(open) => setOpenMenuId(open ? item.id : null)}>
            <DropdownMenu.Trigger asChild>
              <button 
                className="p-1 rounded-md hover:bg-white/10 text-brand-300 transition-colors outline-none"
              >
                <MoreVertical size={18} />
              </button>
            </DropdownMenu.Trigger>
            
            <DropdownMenu.Portal>
              <DropdownMenu.Content 
                align="end"
                className="z-[100] w-48 rounded-md bg-brand-800 border border-white/10 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
              >
                <DropdownMenu.Item
                  onSelect={() => {
                    setResetModal({ isOpen: true, employeeId: item.id, email: item.user?.email });
                    setOpenMenuId(null);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-brand-100 hover:bg-white/5 flex items-center gap-2 transition-colors outline-none cursor-pointer"
                >
                  <Key size={14} /> Reset Password
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => {
                    const currentRoles = item.user?.roles?.map((r: any) => r.role?.name || r) || [];
                    setRoleModal({ isOpen: true, employeeId: item.id, roles: currentRoles });
                    setOpenMenuId(null);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-brand-100 hover:bg-white/5 flex items-center gap-2 transition-colors border-t border-white/5 outline-none cursor-pointer"
                >
                  <Shield size={14} /> Manage Roles
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => {
                    setStatusModal({ isOpen: true, employeeId: item.id, status: item.status || (item.user?.isActive ? 'ACTIVE' : 'INACTIVE') });
                    setOpenMenuId(null);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors border-t border-white/5 outline-none cursor-pointer ${isActive ? 'text-red-400 hover:bg-red-500/10 focus:bg-red-500/10' : 'text-green-400 hover:bg-green-500/10 focus:bg-green-500/10'}`}
                >
                  {isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                  {isActive ? 'Suspend Account' : 'Activate Account'}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        );
      },
    });
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Employee Directory</h2>
          <p className="text-brand-300">Manage organization members, access, and roles.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white px-4 py-2 rounded-lg font-semibold shadow-lg shadow-brand-500/25 transition-all"
          >
            <Plus size={18} /> Add Employee
          </button>
        )}
      </div>

      <Card className="bg-brand-900 border-white/5 shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-white/5 bg-black/20">
          <CardTitle className="text-xl text-white">Organization Members</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={employees}
            columns={columns}
            keyExtractor={(item: any) => item.id}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <AddEmployeeModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      
      <ResetPasswordModal 
        isOpen={resetModal.isOpen} 
        onClose={() => setResetModal({ isOpen: false, employeeId: '', email: '' })}
        employeeId={resetModal.employeeId}
        employeeEmail={resetModal.email}
      />

      <ChangeRoleModal 
        isOpen={roleModal.isOpen} 
        onClose={() => setRoleModal({ isOpen: false, employeeId: '', roles: [] })}
        employeeId={roleModal.employeeId}
        currentRoles={roleModal.roles}
      />

      <ChangeStatusModal 
        isOpen={statusModal.isOpen} 
        onClose={() => setStatusModal({ isOpen: false, employeeId: '', status: '' })}
        employeeId={statusModal.employeeId}
        currentStatus={statusModal.status}
      />
    </div>
  );
}
