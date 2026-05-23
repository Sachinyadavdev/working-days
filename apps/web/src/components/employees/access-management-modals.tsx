'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';

// --- Reset Password Modal ---

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeEmail: string;
}

export function ResetPasswordModal({ isOpen, onClose, employeeId, employeeEmail }: ResetPasswordModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  const handleReset = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post(`/employees/${employeeId}/reset-password`, {});
      setTempPassword(response.data.data.temporaryPassword);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTempPassword('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-brand-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Reset Password</DialogTitle>
        </DialogHeader>
        
        {tempPassword ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <p className="text-brand-200 text-sm">Password has been reset for <strong>{employeeEmail}</strong>.</p>
            <div className="bg-black/30 p-3 rounded-lg border border-white/5">
              <p className="text-xs text-brand-300 mb-2">New Temporary Password:</p>
              <div className="text-xl font-mono text-green-400 tracking-wider select-all">{tempPassword}</div>
            </div>
            <button
              onClick={handleClose}
              className="w-full rounded-lg bg-brand-500 px-4 py-2 mt-4 font-semibold hover:bg-brand-400"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded flex items-start gap-3 text-yellow-200 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>This action will immediately invalidate the current password and force the user to set a new password on their next login.</p>
            </div>
            {error && <div className="text-red-400 text-sm bg-red-500/10 p-2 rounded">{error}</div>}
            
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded bg-white/5 hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={loading}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 font-semibold transition disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// --- Change Role Modal ---

const roleSchema = z.object({
  roles: z.array(z.string()).min(1, 'At least one role is required'),
});

interface ChangeRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  currentRoles: string[];
}

export function ChangeRoleModal({ isOpen, onClose, employeeId, currentRoles }: ChangeRoleModalProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, reset } = useForm({
    resolver: zodResolver(roleSchema),
    defaultValues: { roles: currentRoles || ['EMPLOYEE'] }
  });

  useEffect(() => {
    if (isOpen) {
      reset({ roles: currentRoles || ['EMPLOYEE'] });
    }
  }, [isOpen, currentRoles, reset]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError('');
    try {
      await apiClient.patch(`/employees/${employeeId}/role`, data);
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update roles');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-brand-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Manage Roles</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-3">
            {['EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'].map((role) => (
              <label key={role} className="flex items-center space-x-3 bg-white/5 p-3 rounded border border-white/5 cursor-pointer hover:bg-white/10">
                <input
                  type="checkbox"
                  value={role}
                  {...register('roles')}
                  className="w-4 h-4 rounded border-white/20 text-brand-500"
                />
                <span className="font-medium text-sm">{role.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
          {error && <div className="text-red-400 text-sm bg-red-500/10 p-2 rounded">{error}</div>}
          
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-white/5 hover:bg-white/10">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-brand-500 hover:bg-brand-400 font-semibold disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Roles'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Change Status Modal ---

interface ChangeStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  currentStatus: string;
}

export function ChangeStatusModal({ isOpen, onClose, employeeId, currentStatus }: ChangeStatusModalProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const isSuspending = currentStatus === 'ACTIVE';

  const handleStatusChange = async () => {
    setLoading(true);
    setError('');
    try {
      await apiClient.patch(`/employees/${employeeId}/status`, {
        status: isSuspending ? 'TERMINATED' : 'ACTIVE', // Or 'SUSPENDED' if your enum supports it. We map to TERMINATED based on existing enum.
      });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-brand-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isSuspending ? 'Suspend Account' : 'Activate Account'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-brand-200">
            Are you sure you want to {isSuspending ? 'suspend' : 'activate'} this account? 
            {isSuspending ? ' They will immediately lose access to the system.' : ' They will regain access to the system.'}
          </p>
          {error && <div className="text-red-400 text-sm bg-red-500/10 p-2 rounded">{error}</div>}
          
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={onClose} className="px-4 py-2 rounded bg-white/5 hover:bg-white/10">
              Cancel
            </button>
            <button
              onClick={handleStatusChange}
              disabled={loading}
              className={`px-4 py-2 rounded font-semibold disabled:opacity-50 ${
                isSuspending ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'
              }`}
            >
              {loading ? 'Updating...' : `Confirm ${isSuspending ? 'Suspend' : 'Activate'}`}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
