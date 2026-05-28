'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';

const selectClass = 'h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTeamModal({ isOpen, onClose }: CreateTeamModalProps) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: '',
    description: '',
    leadId: '',
    departmentId: '',
    status: 'ACTIVE',
    maxCapacity: 20,
    tags: '',
    memberIds: [] as string[],
    projectIds: [] as string[],
  });

  // Fetch employees for lead select
  const { data: employeesData } = useQuery({
    queryKey: ['employees-list-for-teams'],
    queryFn: async () => {
      const { data } = await apiClient.get('/employees', { params: { limit: '100' } });
      const items = data?.data?.items || data?.items || data?.data || [];
      return Array.isArray(items) ? items : [];
    },
    enabled: isOpen,
  });

  // Fetch departments
  const { data: departmentsData } = useQuery({
    queryKey: ['departments-list-for-teams'],
    queryFn: async () => {
      const { data } = await apiClient.get('/department', { params: { limit: '100' } });
      const items = data?.data?.items || data?.items || data?.data || [];
      return Array.isArray(items) ? items : [];
    },
    enabled: isOpen,
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects-list-for-teams'],
    queryFn: async () => {
      const { data } = await apiClient.get('/projects', { params: { limit: '100' } });
      const items = data?.data?.items || data?.items || data?.data || [];
      return Array.isArray(items) ? items : [];
    },
    enabled: isOpen,
  });

  const employees = employeesData || [];
  const departments = departmentsData || [];
  const projects = projectsData || [];

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        name: form.name,
        description: form.description || undefined,
        leadId: form.leadId || undefined,
        departmentId: form.departmentId || undefined,
        status: form.status,
        maxCapacity: form.maxCapacity,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        memberIds: form.memberIds,
        projectIds: form.projectIds,
      };
      const { data } = await apiClient.post('/teams', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['team-stats'] });
      resetForm();
      onClose();
    },
  });

  const resetForm = () => {
    setForm({ name: '', description: '', leadId: '', departmentId: '', status: 'ACTIVE', maxCapacity: 20, tags: '', memberIds: [], projectIds: [] });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    createMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { resetForm(); onClose(); } }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Team</DialogTitle>
          <DialogDescription>Set up a new team to organize your employees and projects.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Team Name */}
          <div className="space-y-2">
            <Label htmlFor="create-team-name">Team Name *</Label>
            <Input
              id="create-team-name"
              placeholder="e.g., Frontend Engineering"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="create-team-desc">Description</Label>
            <textarea
              id="create-team-desc"
              rows={3}
              placeholder="Brief description of the team's purpose..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Department & Lead */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Department</Label>
              <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} className={selectClass}>
                <option value="">No Department</option>
                {departments.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Team Lead</Label>
              <select value={form.leadId} onChange={(e) => setForm({ ...form, leadId: e.target.value })} className={selectClass}>
                <option value="">No Lead</option>
                {employees.map((emp: any) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.user?.firstName} {emp.user?.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status & Capacity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={selectClass}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-team-capacity">Max Capacity</Label>
              <Input
                id="create-team-capacity"
                type="number"
                min={1}
                max={500}
                value={form.maxCapacity}
                onChange={(e) => setForm({ ...form, maxCapacity: parseInt(e.target.value) || 20 })}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="create-team-tags">Tags</Label>
            <Input
              id="create-team-tags"
              placeholder="react, frontend, web (comma separated)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
            {/* Initial Members */}
            <div className="space-y-2">
              <Label>Initial Members</Label>
              <div className="max-h-[160px] overflow-y-auto space-y-1 p-2 border border-border rounded-lg bg-muted/20">
                {employees.map((emp: any) => (
                  <label key={emp.id} className="flex items-center gap-2 text-sm p-1 hover:bg-muted/50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.memberIds.includes(emp.id)}
                      onChange={(e) => {
                        const newIds = e.target.checked
                          ? [...form.memberIds, emp.id]
                          : form.memberIds.filter(id => id !== emp.id);
                        setForm({ ...form, memberIds: newIds });
                      }}
                      className="rounded border-border text-brand-500 focus:ring-brand-500 h-4 w-4"
                    />
                    <span>{emp.user?.firstName} {emp.user?.lastName}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Initial Projects */}
            <div className="space-y-2">
              <Label>Initial Projects</Label>
              <div className="max-h-[160px] overflow-y-auto space-y-1 p-2 border border-border rounded-lg bg-muted/20">
                {projects.map((proj: any) => (
                  <label key={proj.id} className="flex items-center gap-2 text-sm p-1 hover:bg-muted/50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.projectIds.includes(proj.id)}
                      onChange={(e) => {
                        const newIds = e.target.checked
                          ? [...form.projectIds, proj.id]
                          : form.projectIds.filter(id => id !== proj.id);
                        setForm({ ...form, projectIds: newIds });
                      }}
                      className="rounded border-border text-brand-500 focus:ring-brand-500 h-4 w-4"
                    />
                    <span className="truncate">{proj.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => { resetForm(); onClose(); }}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || !form.name.trim()}>
              {createMutation.isPending ? 'Creating...' : 'Create Team'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
