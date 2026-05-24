'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/ui/error-message';
import { apiClient } from '@/lib/api-client';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTaskModal({ isOpen, onClose }: CreateTaskModalProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'PENDING',
    priority: 'MEDIUM',
    projectId: '',
    assignedTo: '',
    deadline: '',
    estimatedHours: 0,
  });

  const { data: projectsResponse, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await apiClient.get('/projects');
      return data;
    },
    enabled: isOpen,
  });

  let projects: any[] = [];
  if (Array.isArray(projectsResponse)) {
    projects = projectsResponse;
  } else if (projectsResponse?.data?.items && Array.isArray(projectsResponse.data.items)) {
    projects = projectsResponse.data.items;
  } else if (projectsResponse?.items && Array.isArray(projectsResponse.items)) {
    projects = projectsResponse.items;
  } else if (projectsResponse?.data && Array.isArray(projectsResponse.data)) {
    projects = projectsResponse.data;
  }

  const { data: employeesResponse, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data } = await apiClient.get('/employees');
      return data;
    },
    enabled: isOpen,
  });

  let employees: any[] = [];
  if (Array.isArray(employeesResponse)) {
    employees = employeesResponse;
  } else if (employeesResponse?.data?.items && Array.isArray(employeesResponse.data.items)) {
    employees = employeesResponse.data.items;
  } else if (employeesResponse?.items && Array.isArray(employeesResponse.items)) {
    employees = employeesResponse.items;
  } else if (employeesResponse?.data && Array.isArray(employeesResponse.data)) {
    employees = employeesResponse.data;
  }

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload: any = { ...data };
      if (!payload.projectId) delete payload.projectId;
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.deadline) delete payload.deadline;
      payload.estimatedHours = Number(payload.estimatedHours);

      const res = await apiClient.post('/tasks', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setFormData({ title: '', description: '', status: 'PENDING', priority: 'MEDIUM', projectId: '', assignedTo: '', deadline: '', estimatedHours: 0 });
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message || 'Failed to create task');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-brand-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Task</DialogTitle>
          <DialogDescription className="text-brand-300">
            Fill out the form below to create a new task.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && <ErrorMessage message={error} />}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="title" className="text-brand-100">Task Title</Label>
              <Input
                id="title"
                required
                placeholder="E.g., Create Login API"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-black/20 border-white/10 text-white"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description" className="text-brand-100">Description</Label>
              <Input
                id="description"
                placeholder="Brief description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-black/20 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-brand-100">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full flex h-10 rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="TESTING">Testing</option>
                <option value="COMPLETED">Completed</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-brand-100">Priority</Label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full flex h-10 rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-brand-100">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="bg-black/20 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedHours" className="text-brand-100">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                min="0"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: Number(e.target.value) })}
                className="bg-black/20 border-white/10 text-white"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="projectId" className="text-brand-100">Project (Optional)</Label>
              <select
                id="projectId"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full flex h-10 rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
              >
                <option value="">No Project (Standalone Task)</option>
                {isLoadingProjects ? (
                  <option value="" disabled>Loading projects...</option>
                ) : (
                  projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.key})
                    </option>
                  ))
                )}
              </select>
            </div>
            
            <div className="col-span-2 space-y-2">
              <Label htmlFor="assignedTo" className="text-brand-100">Assigned To (Optional)</Label>
              <select
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full flex h-10 rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
              >
                <option value="">Unassigned</option>
                {isLoadingEmployees ? (
                  <option value="" disabled>Loading employees...</option>
                ) : (
                  employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.user?.firstName} {employee.user?.lastName} ({employee.user?.email})
                    </option>
                  ))
                )}
              </select>
            </div>

          </div>

          <DialogFooter className="mt-6 border-t border-white/10 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="bg-transparent border-white/20 text-brand-100 hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-brand-500 text-white hover:bg-brand-400"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
