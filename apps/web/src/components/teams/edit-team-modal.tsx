'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';

const selectClass = 'h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring';

interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string | null;
}

export function EditTeamModal({ isOpen, onClose, teamId }: EditTeamModalProps) {
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

  const { data: team } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/teams/${teamId}`);
      return data?.data || data;
    },
    enabled: !!teamId && isOpen,
  });

  const { data: employeesData } = useQuery({
    queryKey: ['employees-list-for-teams'],
    queryFn: async () => {
      const { data } = await apiClient.get('/employees', { params: { limit: '100' } });
      const items = data?.data?.items || data?.items || data?.data || [];
      return Array.isArray(items) ? items : [];
    },
    enabled: isOpen,
  });

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

  useEffect(() => {
    if (team) {
      setForm({
        name: team.name || '',
        description: team.description || '',
        leadId: team.leadId || '',
        departmentId: team.departmentId || '',
        status: team.status || 'ACTIVE',
        maxCapacity: team.maxCapacity || 20,
        tags: (team.tags || []).join(', '),
        memberIds: (team.members || []).map((m: any) => m.employeeId || m.id || m.employee?.id),
        projectIds: (team.projects || []).map((p: any) => p.projectId || p.id || p.project?.id),
      });
    }
  }, [team]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        name: form.name,
        description: form.description || undefined,
        leadId: form.leadId,
        departmentId: form.departmentId,
        status: form.status,
        maxCapacity: form.maxCapacity,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        memberIds: form.memberIds,
        projectIds: form.projectIds,
      };
      await apiClient.patch(`/teams/${teamId}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      queryClient.invalidateQueries({ queryKey: ['team-stats'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    updateMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Team</DialogTitle>
          <DialogDescription>Update team information and settings.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-team-name">Team Name *</Label>
            <Input id="edit-team-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-team-desc">Description</Label>
            <textarea
              id="edit-team-desc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={selectClass}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-team-capacity">Max Capacity</Label>
              <Input id="edit-team-capacity" type="number" min={1} max={500} value={form.maxCapacity} onChange={(e) => setForm({ ...form, maxCapacity: parseInt(e.target.value) || 20 })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-team-tags">Tags</Label>
            <Input id="edit-team-tags" placeholder="comma separated" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
            {/* Initial Members */}
            <div className="space-y-2">
              <Label>Team Members</Label>
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
              <Label>Assigned Projects</Label>
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

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={updateMutation.isPending || !form.name.trim()}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
