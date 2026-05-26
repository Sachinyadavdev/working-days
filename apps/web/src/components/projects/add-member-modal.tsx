'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/ui/error-message';
import { apiClient } from '@/lib/api-client';
import { Search, UserPlus } from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  existingMemberIds: string[];
}

const selectClass = 'w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

export function AddMemberModal({ isOpen, onClose, projectId, existingMemberIds }: AddMemberModalProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [role, setRole] = useState('MEMBER');

  const { data: employeesResponse } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data } = await apiClient.get('/employees');
      return data;
    },
    enabled: isOpen,
  });

  let employees: any[] = [];
  if (Array.isArray(employeesResponse)) employees = employeesResponse;
  else if (employeesResponse?.data?.items) employees = employeesResponse.data.items;
  else if (employeesResponse?.items) employees = employeesResponse.items;
  else if (employeesResponse?.data && Array.isArray(employeesResponse.data)) employees = employeesResponse.data;

  // Filter out existing members and apply search
  const availableEmployees = employees.filter((emp: any) => {
    if (existingMemberIds.includes(emp.id)) return false;
    if (!searchTerm) return true;
    const name = `${emp.user?.firstName || ''} ${emp.user?.lastName || ''}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || emp.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`/projects/${projectId}/members`, {
        employeeId: selectedEmployeeId,
        role,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
      setSelectedEmployeeId('');
      setRole('MEMBER');
      setSearchTerm('');
      setError('');
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message || 'Failed to add member');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      setError('Please select an employee');
      return;
    }
    setError('');
    addMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-brand-500" />
            Add Team Member
          </DialogTitle>
          <DialogDescription>Search and add an employee to this project.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && <ErrorMessage message={error} />}

          {/* Search */}
          <div className="space-y-2">
            <Label>Search Employees</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Employee list */}
          <div className="space-y-2">
            <Label>Select Employee</Label>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-border divide-y divide-border">
              {availableEmployees.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {employees.length === 0 ? 'Loading employees...' : 'No available employees found'}
                </div>
              ) : (
                availableEmployees.map((emp: any) => (
                  <label
                    key={emp.id}
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedEmployeeId === emp.id ? 'bg-brand-50 border-l-2 border-l-brand-500' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="employee"
                      value={emp.id}
                      checked={selectedEmployeeId === emp.id}
                      onChange={() => setSelectedEmployeeId(emp.id)}
                      className="sr-only"
                    />
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                      {emp.user?.firstName?.[0]}{emp.user?.lastName?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{emp.user?.firstName} {emp.user?.lastName}</p>
                      <p className="text-xs text-muted-foreground">{emp.employeeCode} · {emp.user?.email}</p>
                    </div>
                    {selectedEmployeeId === emp.id && (
                      <div className="h-2 w-2 rounded-full bg-brand-500" />
                    )}
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="am-role">Role</Label>
            <select id="am-role" value={role} onChange={(e) => setRole(e.target.value)} className={selectClass}>
              <option value="MEMBER">Member</option>
              <option value="LEAD">Lead</option>
              <option value="MANAGER">Manager</option>
            </select>
          </div>

          <DialogFooter className="mt-6 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={addMutation.isPending}>Cancel</Button>
            <Button type="submit" disabled={addMutation.isPending || !selectedEmployeeId}>
              {addMutation.isPending ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
