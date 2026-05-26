'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { CalendarDays, Clock, User, Tag, Paperclip, AlertCircle, FileText } from 'lucide-react';

interface ViewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null;
}

export function ViewTaskModal({ isOpen, onClose, taskId }: ViewTaskModalProps) {
  const { data: task, isLoading } = useQuery({
    queryKey: ['tasks', taskId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/tasks/${taskId}`);
      return data;
    },
    enabled: isOpen && !!taskId,
  });

  if (!isOpen) return null;

  const actualTask = task?.data || task;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-brand-900 border-white/10 text-white p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-brand-300">
            <DialogTitle className="sr-only">Loading task</DialogTitle>
            Loading task details...
          </div>
        ) : !actualTask ? (
          <div className="p-8 text-center text-red-400">
            <DialogTitle className="sr-only">Error</DialogTitle>
            Task not found
          </div>
        ) : (
          <>
            <DialogHeader className="p-6 border-b border-white/5 bg-black/20">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-800 text-brand-300 border border-brand-500/20">
                      {actualTask.project?.key ? `${actualTask.project.key}-${actualTask.taskNumber}` : `TASK-${actualTask.taskNumber}`}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {actualTask.status?.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      {actualTask.priority}
                    </span>
                  </div>
                  <DialogTitle className="text-2xl font-bold text-white">{actualTask.title}</DialogTitle>
                </div>
              </div>
            </DialogHeader>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-brand-100 flex items-center gap-2 mb-2">
                  <FileText size={16} /> Description
                </h4>
                <div className="text-sm text-brand-300 bg-black/20 p-4 rounded-lg border border-white/5 whitespace-pre-wrap">
                  {actualTask.description || 'No description provided.'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-brand-400 flex items-center gap-1"><User size={12} /> Assignee</span>
                  <div className="text-sm font-medium text-brand-100">
                    {actualTask.assignee?.user ? `${actualTask.assignee.user.firstName} ${actualTask.assignee.user.lastName}` : 'Unassigned'}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-brand-400 flex items-center gap-1"><User size={12} /> Reporter</span>
                  <div className="text-sm font-medium text-brand-100">
                    {actualTask.reporter ? `${actualTask.reporter.firstName} ${actualTask.reporter.lastName}` : 'System'}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-brand-400 flex items-center gap-1"><CalendarDays size={12} /> Deadline</span>
                  <div className="text-sm font-medium text-brand-100">
                    {actualTask.deadline ? new Date(actualTask.deadline).toLocaleDateString() : 'No deadline'}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-brand-400 flex items-center gap-1"><Clock size={12} /> Est. Hours</span>
                  <div className="text-sm font-medium text-brand-100">
                    {actualTask.estimatedHours ? `${actualTask.estimatedHours}h` : 'Not set'}
                  </div>
                </div>
              </div>

              {actualTask.project && (
                <div className="pt-4 border-t border-white/5">
                  <span className="text-xs text-brand-400">Project</span>
                  <div className="text-sm font-medium text-brand-100">{actualTask.project.name}</div>
                </div>
              )}
            </div>

            <DialogFooter className="p-6 border-t border-white/5 bg-black/20">
              <Button onClick={onClose} variant="outline" className="bg-brand-800 text-white border-white/10 hover:bg-brand-700">
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
