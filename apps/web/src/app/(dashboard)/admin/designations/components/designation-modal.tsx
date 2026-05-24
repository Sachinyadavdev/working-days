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

const designationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  level: z.string().optional(),
  departmentId: z.string().optional(),
});

type DesignationFormValues = z.infer<typeof designationSchema>;

interface DesignationModalProps {
  isOpen: boolean;
  onClose: () => void;
  designation: any | null;
}

export function DesignationModal({ isOpen, onClose, designation }: DesignationModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!designation;

  const { data: departments = [] } = useQuery({
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
    enabled: isOpen,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DesignationFormValues>({
    resolver: zodResolver(designationSchema),
    defaultValues: {
      name: '',
      level: '',
      departmentId: '',
    },
  });

  useEffect(() => {
    if (designation) {
      reset({
        name: designation.name,
        level: designation.level || '',
        departmentId: designation.departmentId || '',
      });
    } else {
      reset({
        name: '',
        level: '',
        departmentId: '',
      });
    }
  }, [designation, reset, isOpen]);

  const onSubmit = async (data: DesignationFormValues) => {
    try {
      // transform empty string to undefined so prisma removes the relation if unset
      const payload = {
        ...data,
        departmentId: data.departmentId === '' ? undefined : data.departmentId
      };

      if (isEditing) {
        await apiClient.patch(`/designation/${designation.id}`, payload);
      } else {
        await apiClient.post('/designation', payload);
      }
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      onClose();
    } catch (error) {
      console.error('Failed to save designation', error);
      alert('Failed to save designation. Check console for details.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-brand-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Designation' : 'Add Designation'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-brand-200">Job Title <span className="text-red-400">*</span></Label>
            <Input
              id="name"
              {...register('name')}
              className="bg-white/5 border-white/10 focus-visible:ring-brand-500"
              placeholder="e.g. Senior Software Engineer"
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="level" className="text-brand-200">Level</Label>
            <Input
              id="level"
              {...register('level')}
              className="bg-white/5 border-white/10 focus-visible:ring-brand-500"
              placeholder="e.g. L4, Manager, Executive"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="departmentId" className="text-brand-200">Department</Label>
            <select
              id="departmentId"
              {...register('departmentId')}
              className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 text-white [&>option]:bg-brand-900"
            >
              <option value="">None / Unassigned</option>
              {departments.map((dept: any) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter className="pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={onClose} className="hover:bg-white/10">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-brand-500 hover:bg-brand-400">
              {isSubmitting ? 'Saving...' : 'Save Designation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
