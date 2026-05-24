'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQueryClient, useQuery } from '@tanstack/react-query';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';

const departmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().optional(),
  description: z.string().optional(),
  managerId: z.string().optional(),
  employeeIds: z.array(z.string()).optional(),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: any | null;
}

export function DepartmentModal({ isOpen, onClose, department }: DepartmentModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!department;

  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await apiClient.get('/employees');
      return response.data;
    },
    enabled: isOpen,
  });

  const getEmployeesArray = () => {
    if (!employeesData) return [];
    if (Array.isArray(employeesData)) return employeesData;
    if (Array.isArray(employeesData.items)) return employeesData.items;
    if (Array.isArray(employeesData.data)) return employeesData.data;
    if (employeesData.data && Array.isArray(employeesData.data.items)) return employeesData.data.items;
    return [];
  };

  const employees = getEmployeesArray();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      managerId: '',
      employeeIds: [],
    },
  });

  useEffect(() => {
    if (department) {
      reset({
        name: department.name,
        code: department.code || '',
        description: department.description || '',
        managerId: department.managerId || '',
        employeeIds: department.employees ? department.employees.map((e: any) => e.id) : [],
      });
    } else {
      reset({
        name: '',
        code: '',
        description: '',
        managerId: '',
        employeeIds: [],
      });
    }
  }, [department, reset, isOpen]);

  const onSubmit = async (data: DepartmentFormValues) => {
    try {
      const payload = {
        ...data,
        managerId: data.managerId === '' ? undefined : data.managerId,
        employeeIds: data.employeeIds,
      };

      if (isEditing) {
        await apiClient.patch(`/department/${department.id}`, payload);
      } else {
        await apiClient.post('/department', payload);
      }
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      onClose();
    } catch (error) {
      console.error('Failed to save department', error);
      alert('Failed to save department. Check console for details.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-brand-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Department' : 'Add Department'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-brand-200">Department Name <span className="text-red-400">*</span></Label>
            <Input
              id="name"
              {...register('name')}
              className="bg-white/5 border-white/10 focus-visible:ring-brand-500"
              placeholder="e.g. Engineering"
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="code" className="text-brand-200">Department Code</Label>
            <Input
              id="code"
              {...register('code')}
              className="bg-white/5 border-white/10 focus-visible:ring-brand-500"
              placeholder="e.g. ENG-01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-brand-200">Description</Label>
            <textarea
              id="description"
              {...register('description')}
              className="w-full h-24 rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              placeholder="Description..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="managerId" className="text-brand-200">Department Head (Manager)</Label>
            <select
              id="managerId"
              {...register('managerId')}
              className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 text-white [&>option]:bg-brand-900"
            >
              <option value="">No Manager Assigned</option>
              {employees.map((emp: any) => (
                <option key={emp.id} value={emp.id}>
                  {emp.user?.firstName} {emp.user?.lastName} ({emp.user?.email})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-brand-200">Assign Employees</Label>
            <div className="max-h-40 overflow-y-auto space-y-2 p-3 rounded-md bg-white/5 border border-white/10">
              {employees.length === 0 && (
                <p className="text-xs text-brand-300">No employees found.</p>
              )}
              {employees.map((emp: any) => (
                <label key={emp.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={emp.id}
                    {...register('employeeIds')}
                    className="rounded border-white/20 bg-black/20 text-brand-500 focus:ring-brand-500"
                  />
                  <span className="text-sm text-white">
                    {emp.user?.firstName} {emp.user?.lastName} <span className="text-brand-300 text-xs">({emp.user?.email})</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={onClose} className="hover:bg-white/10">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-brand-500 hover:bg-brand-400">
              {isSubmitting ? 'Saving...' : 'Save Department'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
