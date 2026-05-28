'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, UserPlus } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';

const selectClass = 'h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring';

const TEAM_ROLES = [
  { value: 'MEMBER', label: 'Member' },
  { value: 'TEAM_LEAD', label: 'Team Lead' },
  { value: 'SENIOR_DEVELOPER', label: 'Senior Developer' },
  { value: 'DEVELOPER', label: 'Developer' },
  { value: 'QA_ENGINEER', label: 'QA Engineer' },
  { value: 'UI_UX_DESIGNER', label: 'UI/UX Designer' },
  { value: 'DEVOPS_ENGINEER', label: 'DevOps Engineer' },
  { value: 'INTERN', label: 'Intern' },
];

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  existingMemberIds: string[];
}

export function AddTeamMemberModal({ isOpen, onClose, teamId, existingMemberIds }: AddTeamMemberModalProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('MEMBER');

  const { data: employeesData } = useQuery({
    queryKey: ['employees-list-for-teams'],
    queryFn: async () => {
      const { data } = await apiClient.get('/employees', { params: { limit: '200' } });
      const items = data?.data?.items || data?.items || data?.data || [];
      return Array.isArray(items) ? items : [];
    },
    enabled: isOpen,
  });

  const allEmployees = employeesData || [];
  const availableEmployees = allEmployees.filter(
    (emp: any) => !existingMemberIds.includes(emp.id)
  );

  const filteredEmployees = availableEmployees.filter((emp: any) => {
    if (!search) return true;
    const name = `${emp.user?.firstName} ${emp.user?.lastName}`.toLowerCase();
    const code = (emp.employeeCode || '').toLowerCase();
    return name.includes(search.toLowerCase()) || code.includes(search.toLowerCase());
  });

  const addMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      await apiClient.post(`/teams/${teamId}/members`, { employeeId, role: selectedRole });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      queryClient.invalidateQueries({ queryKey: ['team-stats'] });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { setSearch(''); onClose(); } }}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-brand-500" /> Add Team Member
          </DialogTitle>
          <DialogDescription>Search and add employees to this team.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Role Select */}
          <div className="space-y-2">
            <Label>Role</Label>
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className={selectClass}>
              {TEAM_ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Employee List */}
          <div className="space-y-2 max-h-[350px] overflow-y-auto">
            {filteredEmployees.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No available employees found</p>
            ) : (
              filteredEmployees.map((emp: any) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-brand-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white text-xs font-bold shadow">
                      {emp.user?.firstName?.[0]}{emp.user?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{emp.user?.firstName} {emp.user?.lastName}</p>
                      <p className="text-xs text-muted-foreground">{emp.employeeCode}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addMutation.mutate(emp.id)}
                    disabled={addMutation.isPending}
                    className="text-xs"
                  >
                    <UserPlus className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
