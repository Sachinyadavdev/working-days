'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { CalendarDays, Clock, User, Tag, Paperclip, AlertCircle, FileText, CheckSquare, Square, Check } from 'lucide-react';

interface ViewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null;
}

export function ViewTaskModal({ isOpen, onClose, taskId }: ViewTaskModalProps) {
  const queryClient = useQueryClient();
  const { data: task, isLoading } = useQuery({
    queryKey: ['tasks', taskId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/tasks/${taskId}`);
      return data;
    },
    enabled: isOpen && !!taskId,
  });

  const toggleMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { data } = await apiClient.patch(`/tasks/${taskId}/checklist/${itemId}/toggle`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Update lists/kanban boards
    },
  });

  if (!isOpen) return null;

  const actualTask = task?.data || task;
  const checklist = actualTask?.checklist || [];
  const completedCount = checklist.filter((item: any) => item.completed).length;
  const progressPct = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-brand-900 border-white/10 text-white p-0 flex flex-col max-h-[90vh] overflow-hidden">
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
            <DialogHeader className="p-6 border-b border-white/5 bg-black/20 shrink-0">
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

            <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              <div>
                <h4 className="text-sm font-semibold text-brand-100 flex items-center gap-2 mb-2">
                  <FileText size={16} /> Description
                </h4>
                <div className="text-sm text-brand-300 bg-black/20 p-4 rounded-lg border border-white/5 whitespace-pre-wrap">
                  {actualTask.description || 'No description provided.'}
                </div>
              </div>

              {checklist.length > 0 && (
                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-brand-100 flex items-center gap-2">
                      <CheckSquare size={16} /> Checklist ({completedCount}/{checklist.length})
                    </h4>
                    <div className="text-xs font-semibold text-brand-400">{progressPct}%</div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden mb-4">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${progressPct === 100 ? 'bg-emerald-500' : 'bg-brand-500'}`} 
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  <div className="space-y-2">
                    {checklist.map((item: any) => (
                      <div 
                        key={item.id} 
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${item.completed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-black/20 border-white/5 hover:border-white/10'}`}
                      >
                        <button
                          onClick={() => toggleMutation.mutate(item.id)}
                          disabled={toggleMutation.isPending}
                          className={`mt-0.5 shrink-0 flex items-center justify-center h-5 w-5 rounded ${item.completed ? 'bg-emerald-500 text-white' : 'border border-white/20 text-transparent hover:border-white/40'}`}
                        >
                          {item.completed && <Check size={14} strokeWidth={3} />}
                        </button>
                        <div className={`flex-1 text-sm ${item.completed ? 'text-brand-300 line-through' : 'text-brand-100'}`}>
                          {item.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
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

            <DialogFooter className="p-6 border-t border-white/5 bg-black/20 shrink-0">
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
