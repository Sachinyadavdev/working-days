'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, GitBranch, CalendarDays } from 'lucide-react';

interface KanbanTask {
  id: string;
  title: string;
  taskNumber: number;
  priority: string;
  status: string;
  deadline?: string | null;
  project?: { id: string; name: string; key: string };
  assignee?: { id: string; user: { firstName: string; lastName: string; avatar?: string | null } };
  _count?: { subtasks: number; comments: number };
}

interface TeamKanbanProps {
  columns: Record<string, KanbanTask[]>;
  onTaskClick?: (taskId: string) => void;
}

const COLUMN_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  BACKLOG: { label: 'Backlog', color: 'bg-slate-400', bg: 'bg-slate-50 dark:bg-slate-500/10' },
  PENDING: { label: 'Pending', color: 'bg-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  IN_REVIEW: { label: 'In Review', color: 'bg-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  TESTING: { label: 'Testing', color: 'bg-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
  COMPLETED: { label: 'Completed', color: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  BLOCKED: { label: 'Blocked', color: 'bg-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
};

const PRIORITY_BADGE: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

export function TeamKanban({ columns, onTaskClick }: TeamKanbanProps) {
  const orderedStatuses = ['BACKLOG', 'PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'TESTING', 'COMPLETED', 'BLOCKED'];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {orderedStatuses.map((status) => {
        const config = COLUMN_CONFIG[status];
        const tasks = columns[status] || [];

        return (
          <div key={status} className="flex-shrink-0 w-72">
            {/* Column Header */}
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-t-xl ${config.bg} border border-border border-b-0`}>
              <div className={`h-2.5 w-2.5 rounded-full ${config.color}`} />
              <span className="text-sm font-semibold text-foreground">{config.label}</span>
              <span className="ml-auto text-xs text-muted-foreground font-medium bg-white/80 dark:bg-white/10 px-2 py-0.5 rounded-full">
                {tasks.length}
              </span>
            </div>

            {/* Tasks */}
            <div className="space-y-2 min-h-[200px] max-h-[600px] overflow-y-auto p-2 rounded-b-xl border border-border bg-muted/30">
              {tasks.length === 0 ? (
                <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
                  No tasks
                </div>
              ) : (
                tasks.map((task, idx) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => onTaskClick?.(task.id)}
                    className="p-3 rounded-lg bg-card border border-border hover:border-brand-500/30 hover:shadow-sm transition-all cursor-pointer"
                  >
                    {/* Project Key */}
                    {task.project && (
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {task.project.key}-{task.taskNumber}
                      </span>
                    )}

                    {/* Title */}
                    <p className="text-sm font-medium text-foreground mt-1 line-clamp-2">{task.title}</p>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${PRIORITY_BADGE[task.priority] || 'bg-gray-100 text-gray-700'}`}>
                          {task.priority}
                        </span>
                        {(task._count?.subtasks || 0) > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                            <GitBranch className="h-3 w-3" /> {task._count?.subtasks}
                          </span>
                        )}
                        {(task._count?.comments || 0) > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                            <MessageSquare className="h-3 w-3" /> {task._count?.comments}
                          </span>
                        )}
                      </div>

                      {task.assignee?.user && (
                        <div
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-[9px] font-bold text-white shadow"
                          title={`${task.assignee.user.firstName} ${task.assignee.user.lastName}`}
                        >
                          {task.assignee.user.firstName[0]}{task.assignee.user.lastName[0]}
                        </div>
                      )}
                    </div>

                    {task.deadline && (
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
