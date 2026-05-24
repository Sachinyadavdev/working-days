'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/ui/error-message';
import { apiClient } from '@/lib/api-client';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null;
}

export function EditTaskModal({ isOpen, onClose, taskId }: EditTaskModalProps) {
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

  // Fetch the current task data
  const { data: task, isLoading: isLoadingTask } = useQuery({
    queryKey: ['tasks', taskId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/tasks/${taskId}`);
      return data;
    },
    enabled: isOpen && !!taskId,
  });

  // Fetch projects and employees for dropdowns
  const { data: projectsResponse } = useQuery({ queryKey: ['projects'], queryFn: async () => (await apiClient.get('/projects')).data, enabled: isOpen });
  const { data: employeesResponse } = useQuery({ queryKey: ['employees'], queryFn: async () => (await apiClient.get('/employees')).data, enabled: isOpen });

  let projects: any[] = Array.isArray(projectsResponse) ? projectsResponse : projectsResponse?.data?.items || projectsResponse?.items || projectsResponse?.data || [];
  let employees: any[] = Array.isArray(employeesResponse) ? employeesResponse : employeesResponse?.data?.items || employeesResponse?.items || employeesResponse?.data || [];

  // Populate form data when task is loaded
  useEffect(() => {
    const actualTask = task?.data || task;
    if (actualTask && isOpen) {
      setFormData({
        title: actualTask.title || '',
        description: actualTask.description || '',
        status: actualTask.status || 'PENDING',
        priority: actualTask.priority || 'MEDIUM',
        projectId: actualTask.projectId || '',
        assignedTo: actualTask.assignedTo || '',
        deadline: actualTask.deadline ? new Date(actualTask.deadline).toISOString().split('T')[0] : '',
        estimatedHours: actualTask.estimatedHours || 0,
      });
    }
  }, [task, isOpen]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload: any = { ...data };
      if (!payload.projectId) payload.projectId = null;
      if (!payload.assignedTo) payload.assignedTo = null;
      if (!payload.deadline) payload.deadline = null;
      payload.estimatedHours = Number(payload.estimatedHours);

      const res = await apiClient.patch(`/tasks/${taskId}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message || 'Failed to update task');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    updateMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-brand-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Task</DialogTitle>
          <DialogDescription className="text-brand-300">
            Modify the task details below.
          </DialogDescription>
        </DialogHeader>

        {isLoadingTask ? (
          <div className="p-8 text-center text-brand-300">Loading task details...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {error && <ErrorMessage message={error} />}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="title" className="text-brand-100">Task Title</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-black/20 border-white/10 text-white"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="description" className="text-brand-100">Description</Label>
                <Input
                  id="description"
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
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.key})
                    </option>
                  ))}
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
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.user?.firstName} {employee.user?.lastName} ({employee.user?.email})
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <DialogFooter className="mt-6 border-t border-white/10 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={updateMutation.isPending}
                className="bg-transparent border-white/20 text-brand-100 hover:bg-white/5 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-brand-500 text-white hover:bg-brand-400"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
