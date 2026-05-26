'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/ui/error-message';
import { apiClient } from '@/lib/api-client';
import { X, Plus } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const selectClass = 'w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    key: '',
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

  // Fetch employees for project manager selector
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

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload: any = { ...data };
      if (!payload.projectManagerId) delete payload.projectManagerId;
      if (!payload.estimatedBudget) delete payload.estimatedBudget;
      else payload.estimatedBudget = Number(payload.estimatedBudget);
      if (!payload.startDate) delete payload.startDate;
      if (!payload.endDate) delete payload.endDate;
      if (!payload.clientName) delete payload.clientName;
      const res = await apiClient.post('/projects', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-stats'] });
      resetForm();
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message || 'Failed to create project');
    },
  });

  const resetForm = () => {
    setFormData({ name: '', key: '', description: '', clientName: '', estimatedBudget: '', priority: 'MEDIUM', status: 'PLANNING', startDate: '', endDate: '', projectManagerId: '', tags: [] });
    setTagInput('');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    createMutation.mutate(formData);
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

  // Auto-generate key from name
  const handleNameChange = (name: string) => {
    const key = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase();
    setFormData({ ...formData, name, key: formData.key || key });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { resetForm(); onClose(); }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && <ErrorMessage message={error} />}

          <div className="grid grid-cols-2 gap-4">
            {/* Project Name */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="cp-name">Project Name *</Label>
              <Input
                id="cp-name"
                required
                placeholder="e.g. Employee Management System"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>

            {/* Project Key */}
            <div className="space-y-2">
              <Label htmlFor="cp-key">Project Key *</Label>
              <Input
                id="cp-key"
                required
                placeholder="e.g. EMS"
                maxLength={10}
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
              />
              <p className="text-xs text-muted-foreground">Used for task numbering (e.g. EMS-1)</p>
            </div>

            {/* Client Name */}
            <div className="space-y-2">
              <Label htmlFor="cp-client">Client Name</Label>
              <Input
                id="cp-client"
                placeholder="e.g. Acme Corp"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="cp-desc">Description</Label>
              <textarea
                id="cp-desc"
                rows={3}
                placeholder="Brief project description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="cp-status">Status</Label>
              <select id="cp-status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={selectClass}>
                <option value="PLANNING">Planning</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="cp-priority">Priority</Label>
              <select id="cp-priority" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className={selectClass}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="cp-start">Start Date</Label>
              <Input id="cp-start" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="cp-end">End Date</Label>
              <Input id="cp-end" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="cp-budget">Estimated Budget</Label>
              <Input id="cp-budget" type="number" min="0" step="0.01" placeholder="0.00" value={formData.estimatedBudget} onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })} />
            </div>

            {/* Project Manager */}
            <div className="space-y-2">
              <Label htmlFor="cp-pm">Project Manager</Label>
              <select id="cp-pm" value={formData.projectManagerId} onChange={(e) => setFormData({ ...formData, projectManagerId: e.target.value })} className={selectClass}>
                <option value="">Select Manager</option>
                {employees.map((emp: any) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.user?.firstName} {emp.user?.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="col-span-2 space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                />
                <Button type="button" variant="outline" size="sm" onClick={addTag} className="shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="text-brand-500 hover:text-brand-700">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => { resetForm(); onClose(); }} disabled={createMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
