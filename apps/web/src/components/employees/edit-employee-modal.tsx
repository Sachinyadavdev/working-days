'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useQueryClient, useQuery } from '@tanstack/react-query';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';

const employeeSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  emergencyContact: z.string().optional().nullable(),
  
  employeeCode: z.string().optional().nullable(),
  workLocation: z.string().optional().nullable(),
  bloodGroup: z.string().optional().nullable(),
  
  departmentId: z.string().optional().nullable(),
  designationId: z.string().optional().nullable(),
  employeeType: z.string().min(1, 'Employee type is required'),
  dateOfJoining: z.string().min(1, 'Joining date is required'),
  requiredDailyHours: z.coerce.number().min(1, 'Hours must be at least 1').max(24, 'Hours cannot exceed 24').optional().default(8),
  
  roles: z.array(z.string()).min(1, 'At least one role must be selected'),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string | null;
}

export function EditEmployeeModal({ isOpen, onClose, employeeId }: EditEmployeeModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  const { data: employeeData, isLoading: isFetching } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: async () => {
      const response = await apiClient.get(`/employees/${employeeId}`);
      return response.data;
    },
    enabled: !!employeeId && isOpen,
  });

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

  const { data: designations = [] } = useQuery({
    queryKey: ['designations'],
    queryFn: async () => {
      const response = await apiClient.get('/designation');
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
    trigger,
    watch,
    formState: { errors },
    reset,
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employeeType: 'FULL_TIME',
      roles: ['EMPLOYEE'],
      requiredDailyHours: 8.0,
    },
  });

  useEffect(() => {
    if (employeeData) {
      const data = employeeData.data || employeeData;
      
      const roles = data.user?.roles?.map((r: any) => r.role?.name || r) || [];
      
      // format dates to YYYY-MM-DD
      const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
      };

      reset({
        firstName: data.user?.firstName || '',
        lastName: data.user?.lastName || '',
        email: data.user?.email || '',
        phone: data.phone || '',
        gender: data.gender || '',
        dateOfBirth: formatDate(data.dateOfBirth),
        address: data.address || '',
        emergencyContact: data.emergencyContact || '',
        
        employeeCode: data.employeeCode || '',
        departmentId: data.departmentId || '',
        designationId: data.designationId || '',
        employeeType: data.employeeType || 'FULL_TIME',
        dateOfJoining: formatDate(data.dateOfJoining),
        workLocation: data.workLocation || '',
        bloodGroup: data.bloodGroup || '',
        requiredDailyHours: data.requiredDailyHours || 8.0,
        roles: roles.length > 0 ? roles : ['EMPLOYEE'],
      });
    }
  }, [employeeData, reset]);

  const formDepartmentId = watch('departmentId');

  const nextStep = async () => {
    const fieldsToValidate = 
      step === 1 ? ['firstName', 'lastName', 'email', 'phone', 'gender', 'dateOfBirth', 'address', 'emergencyContact'] 
      : step === 2 ? ['employeeCode', 'departmentId', 'designationId', 'employeeType', 'dateOfJoining', 'workLocation', 'bloodGroup', 'requiredDailyHours']
      : [];
      
    const isStepValid = await trigger(fieldsToValidate as any);
    if (isStepValid) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const onSubmit = async (data: EmployeeFormValues) => {
    setLoading(true);
    setError('');
    
    try {
      await apiClient.patch(`/employees/${employeeId}/admin-update`, data);
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update employee');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setStep(1);
    setSuccess(false);
    setError('');
    onClose();
  };

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md text-center p-8 bg-brand-900 border-white/10 text-white">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Employee Updated!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-brand-200">The employee profile has been successfully updated.</p>
            <button
              onClick={handleClose}
              className="w-full rounded-lg bg-brand-500 px-4 py-2.5 font-semibold text-white mt-4 hover:bg-brand-400"
            >
              Done
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl bg-brand-900 border-white/10 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Employee</DialogTitle>
        </DialogHeader>

        {isFetching ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-brand-500 rounded-full border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8 mt-4">
              <div className="flex gap-2 w-full">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex-1">
                    <div className={`h-2 rounded-full ${step >= i ? 'bg-brand-500' : 'bg-white/10'}`} />
                    <div className={`text-xs mt-2 font-medium ${step >= i ? 'text-brand-300' : 'text-brand-300/50'}`}>
                      {i === 1 ? 'Basic Details' : i === 2 ? 'Professional Details' : 'Role & Access'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/20">
                  {error}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-200">First Name *</label>
                      <input
                        {...register('firstName')}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-brand-400"
                        placeholder="John"
                      />
                      {errors.firstName && <span className="text-xs text-red-400">{errors.firstName.message}</span>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-200">Last Name *</label>
                      <input
                        {...register('lastName')}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-brand-400"
                        placeholder="Doe"
                      />
                      {errors.lastName && <span className="text-xs text-red-400">{errors.lastName.message}</span>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-200">Email Address *</label>
                    <input
                      {...register('email')}
                      type="email"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-brand-400"
                      placeholder="john.doe@company.com"
                    />
                    {errors.email && <span className="text-xs text-red-400">{errors.email.message}</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-200">Phone Number</label>
                      <input
                        {...register('phone')}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-brand-400"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-200">Gender</label>
                      <select
                        {...register('gender')}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-brand-400 text-white [&>option]:bg-brand-900"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-200">Date of Birth</label>
                      <input
                        {...register('dateOfBirth')}
                        type="date"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-brand-400"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-200">Emergency Contact</label>
                      <input
                        {...register('emergencyContact')}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-brand-400"
                        placeholder="Name, Relation, Phone..."
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-200">Address</label>
                    <textarea
                      {...register('address')}
                      rows={2}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-brand-400 resize-none"
                      placeholder="Full address..."
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-200">Employee Code</label>
                    <input
                      {...register('employeeCode')}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-brand-400"
                      placeholder="Leave empty to auto-generate"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-200">Department</label>
                      <select
                        {...register('departmentId')}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-brand-400 text-white [&>option]:bg-brand-900"
                      >
                        <option value="">Unassigned</option>
                        {departments.map((dept: any) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-200">Designation</label>
                      <select
                        {...register('designationId')}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-brand-400 text-white [&>option]:bg-brand-900"
                      >
                        <option value="">Unassigned</option>
                        {designations
                          .filter((desig: any) => !formDepartmentId || desig.departmentId === formDepartmentId)
                          .map((desig: any) => (
                          <option key={desig.id} value={desig.id}>
                            {desig.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-200">Employee Type *</label>
                      <select
                        {...register('employeeType')}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-brand-400 text-white [&>option]:bg-brand-900"
                      >
                        <option value="FULL_TIME">Full Time</option>
                        <option value="PART_TIME">Part Time</option>
                        <option value="CONTRACT">Contract</option>
                      </select>
                      {errors.employeeType && <span className="text-xs text-red-400">{errors.employeeType.message}</span>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-200">Joining Date *</label>
                      <input
                        {...register('dateOfJoining')}
                        type="date"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-brand-400"
                      />
                      {errors.dateOfJoining && <span className="text-xs text-red-400">{errors.dateOfJoining.message}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-200">Work Location</label>
                      <input
                        {...register('workLocation')}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-brand-400"
                        placeholder="e.g. New York Office"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-200">Blood Group</label>
                      <input
                        {...register('bloodGroup')}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-brand-400"
                        placeholder="e.g. O+"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-200">Required Daily Hours</label>
                      <input
                        {...register('requiredDailyHours')}
                        type="number"
                        step="0.5"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-brand-400"
                        placeholder="8.0"
                      />
                      {errors.requiredDailyHours && <span className="text-xs text-red-400">{errors.requiredDailyHours.message}</span>}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-brand-200">Assign System Roles *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'].map((role) => (
                        <label key={role} className="flex items-center space-x-3 bg-white/5 p-4 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                          <input
                            type="checkbox"
                            value={role}
                            {...register('roles')}
                            className="w-4 h-4 rounded border-white/20 bg-transparent text-brand-500 focus:ring-brand-500"
                          />
                          <div className="flex flex-col">
                            <span className="font-medium text-white">{role.replace('_', ' ')}</span>
                            <span className="text-xs text-brand-300">Provides {role.toLowerCase().replace('_', ' ')} access</span>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.roles && <span className="text-xs text-red-400 block mt-2">{errors.roles.message}</span>}
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8 pt-4 border-t border-white/10">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 flex items-center transition-colors"
                  >
                    <ChevronLeft size={18} className="mr-2" /> Back
                  </button>
                ) : (
                  <div /> // Spacer
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-400 flex items-center transition-colors"
                  >
                    Continue <ChevronRight size={18} className="ml-2" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 flex items-center transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
