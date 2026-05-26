'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/ui/error-message';
import { apiClient } from '@/lib/api-client';
import { X, Plus } from 'lucide-react';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | null;
}

const selectClass = 'w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

export function EditProjectModal({ isOpen, onClose, projectId }: EditProjectModalProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientName: '',
    estimatedBudget: '',
    priority: 'MEDIUM',
    status: 'PLANNING',
    startDate: '',
    endDate: '',
    projectManagerId: '',
    tags: [] as string[],
  });

  // Fetch project data
  const { data: projectData } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/projects/${projectId}`);
      return data?.data || data;
    },
    enabled: isOpen && !!projectId,
  });

  // Pre-populate form when project data loads
  useEffect(() => {
    if (projectData) {
      setFormData({
        name: projectData.name || '',
        description: projectData.description || '',
        clientName: projectData.clientName || '',
        estimatedBudget: projectData.estimatedBudget ? String(projectData.estimatedBudget) : '',
        priority: projectData.priority || 'MEDIUM',
        status: projectData.status || 'PLANNING',
        startDate: projectData.startDate ? new Date(projectData.startDate).toISOString().split('T')[0] : '',
        endDate: projectData.endDate ? new Date(projectData.endDate).toISOString().split('T')[0] : '',
        projectManagerId: projectData.projectManagerId || '',
        tags: projectData.tags || [],
      });
    }
  }, [projectData]);

  // Fetch employees
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

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload: any = { ...data };
      if (payload.estimatedBudget) payload.estimatedBudget = Number(payload.estimatedBudget);
      else delete payload.estimatedBudget;
      if (!payload.startDate) delete payload.startDate;
      if (!payload.endDate) delete payload.endDate;
      if (!payload.projectManagerId) payload.projectManagerId = null;
      if (!payload.clientName) delete payload.clientName;
      const res = await apiClient.patch(`/projects/${projectId}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-stats'] });
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message || 'Failed to update project');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    updateMutation.mutate(formData);
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Project</DialogTitle>
          <DialogDescription>
            Update project details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && <ErrorMessage message={error} />}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="ep-name">Project Name *</Label>
              <Input id="ep-name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ep-client">Client Name</Label>
              <Input id="ep-client" value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ep-budget">Estimated Budget</Label>
              <Input id="ep-budget" type="number" min="0" step="0.01" value={formData.estimatedBudget} onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })} />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="ep-desc">Description</Label>
              <textarea
                id="ep-desc"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ep-status">Status</Label>
              <select id="ep-status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={selectClass}>
                <option value="PLANNING">Planning</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ep-priority">Priority</Label>
              <select id="ep-priority" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className={selectClass}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ep-start">Start Date</Label>
              <Input id="ep-start" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ep-end">End Date</Label>
              <Input id="ep-end" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="ep-pm">Project Manager</Label>
              <select id="ep-pm" value={formData.projectManagerId} onChange={(e) => setFormData({ ...formData, projectManagerId: e.target.value })} className={selectClass}>
                <option value="">Select Manager</option>
                {employees.map((emp: any) => (
                  <option key={emp.id} value={emp.id}>{emp.user?.firstName} {emp.user?.lastName}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="col-span-2 space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input placeholder="Add a tag..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
                <Button type="button" variant="outline" size="sm" onClick={addTag} className="shrink-0"><Plus className="h-4 w-4" /></Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="text-brand-500 hover:text-brand-700"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={updateMutation.isPending}>Cancel</Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
