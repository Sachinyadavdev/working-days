'use client';

import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GripVertical,
  User,
  CalendarDays,
  MessageSquare,
  ListTree,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface KanbanTask {
  id: string;
  taskNumber: number;
  title: string;
  status: string;
  priority: string;
  deadline?: string;
  assignee?: {
    id: string;
    user: { id: string; firstName: string; lastName: string; avatar?: string };
  };
  _count?: { subtasks: number; comments: number };
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  dotColor: string;
  tasks: KanbanTask[];
}

interface ProjectKanbanProps {
  columns: Record<string, KanbanTask[]>;
  projectKey: string;
  projectId: string;
  onTaskClick?: (taskId: string) => void;
}

const COLUMN_CONFIG: { id: string; title: string; color: string; dotColor: string }[] = [
  { id: 'BACKLOG', title: 'Backlog', color: 'border-t-slate-400', dotColor: 'bg-slate-400' },
  { id: 'PENDING', title: 'Pending', color: 'border-t-amber-400', dotColor: 'bg-amber-400' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-t-blue-500', dotColor: 'bg-blue-500' },
  { id: 'IN_REVIEW', title: 'In Review', color: 'border-t-purple-500', dotColor: 'bg-purple-500' },
  { id: 'TESTING', title: 'Testing', color: 'border-t-orange-500', dotColor: 'bg-orange-500' },
  { id: 'COMPLETED', title: 'Completed', color: 'border-t-emerald-500', dotColor: 'bg-emerald-500' },
];

function PriorityIcon({ priority }: { priority: string }) {
  switch (priority) {
    case 'CRITICAL': return <AlertCircle className="h-3.5 w-3.5 text-red-500" />;
    case 'HIGH': return <ArrowUp className="h-3.5 w-3.5 text-orange-500" />;
    case 'MEDIUM': return <Minus className="h-3.5 w-3.5 text-yellow-500" />;
    default: return <ArrowDown className="h-3.5 w-3.5 text-blue-400" />;
  }
}

function TaskCard({ task, projectKey, onDragStart, onClick }: { task: KanbanTask; projectKey: string; onDragStart: (e: React.DragEvent, taskId: string) => void; onClick?: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      draggable
      onDragStart={(e) => onDragStart(e as any, task.id)}
      onClick={onClick}
      className="group cursor-grab active:cursor-grabbing rounded-lg border border-border bg-card p-3 shadow-sm hover:shadow-md hover:border-brand-500/30 transition-all"
    >
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex-1 min-w-0">
          {/* Task key */}
          <p className="text-xs font-mono text-muted-foreground mb-1">
            {projectKey}-{task.taskNumber}
          </p>
          {/* Title */}
          <p className="text-sm font-medium text-foreground leading-snug truncate">
            {task.title}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-2.5">
            <PriorityIcon priority={task.priority} />

            {task.deadline && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}

            {(task._count?.subtasks ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <ListTree className="h-3 w-3" />
                {task._count?.subtasks}
              </span>
            )}

            {(task._count?.comments ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                {task._count?.comments}
              </span>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Assignee avatar */}
            {task.assignee?.user && (
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700 ring-2 ring-card"
                title={`${task.assignee.user.firstName} ${task.assignee.user.lastName}`}
              >
                {task.assignee.user.firstName[0]}{task.assignee.user.lastName[0]}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ProjectKanban({ columns, projectKey, projectId, onTaskClick }: ProjectKanbanProps) {
  const queryClient = useQueryClient();
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const dragTaskRef = useRef<string | null>(null);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      await apiClient.patch(`/tasks/${taskId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-kanban', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    dragTaskRef.current = taskId;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = dragTaskRef.current;
    if (!taskId) return;
    dragTaskRef.current = null;

    // Find the task to check its current status
    for (const [status, tasks] of Object.entries(columns)) {
      const found = tasks.find((t) => t.id === taskId);
      if (found && status !== targetStatus) {
        updateStatusMutation.mutate({ taskId, status: targetStatus });
        break;
      }
    }
  };

  const kanbanColumns: KanbanColumn[] = COLUMN_CONFIG.map((config) => ({
    ...config,
    tasks: columns[config.id] || [],
  }));

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {kanbanColumns.map((column) => (
          <div
            key={column.id}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
            className={`w-72 shrink-0 rounded-xl border-t-4 ${column.color} border border-border bg-muted/30 transition-colors ${
              dragOverColumn === column.id ? 'bg-brand-50/50 border-brand-500/30 ring-2 ring-brand-500/20' : ''
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between p-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${column.dotColor}`} />
                <span className="text-sm font-semibold text-foreground">{column.title}</span>
              </div>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
                {column.tasks.length}
              </span>
            </div>

            {/* Tasks */}
            <div className="p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-320px)] overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {column.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    projectKey={projectKey}
                    onDragStart={handleDragStart}
                    onClick={() => onTaskClick?.(task.id)}
                  />
                ))}
              </AnimatePresence>

              {column.tasks.length === 0 && (
                <div className="flex items-center justify-center h-24 text-xs text-muted-foreground border-2 border-dashed border-border rounded-lg">
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
