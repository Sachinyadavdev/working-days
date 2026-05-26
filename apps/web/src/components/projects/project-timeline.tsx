'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface TimelineTask {
  id: string;
  taskNumber: number;
  title: string;
  status: string;
  priority: string;
  startedAt?: string;
  completedAt?: string;
  deadline?: string;
  createdAt: string;
  assignee?: {
    id: string;
    user: { firstName: string; lastName: string; avatar?: string };
  };
}

interface ProjectTimelineProps {
  projectStartDate?: string;
  projectEndDate?: string;
  projectKey: string;
  tasks: TimelineTask[];
  onTaskClick?: (taskId: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  BACKLOG: 'bg-slate-400',
  PENDING: 'bg-amber-400',
  IN_PROGRESS: 'bg-blue-500',
  IN_REVIEW: 'bg-purple-500',
  TESTING: 'bg-orange-500',
  COMPLETED: 'bg-emerald-500',
  BLOCKED: 'bg-red-500',
  CANCELLED: 'bg-gray-400',
};

const STATUS_BG: Record<string, string> = {
  BACKLOG: 'bg-slate-100 text-slate-700 border-slate-200',
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-200',
  IN_REVIEW: 'bg-purple-100 text-purple-700 border-purple-200',
  TESTING: 'bg-orange-100 text-orange-700 border-orange-200',
  COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  BLOCKED: 'bg-red-100 text-red-700 border-red-200',
  CANCELLED: 'bg-gray-100 text-gray-700 border-gray-200',
};

function daysBetween(d1: Date, d2: Date): number {
  return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export function ProjectTimeline({ projectStartDate, projectEndDate, projectKey, tasks, onTaskClick }: ProjectTimelineProps) {
  const { timelineStart, timelineEnd, totalDays, weeks } = useMemo(() => {
    // Determine date range
    const allDates: Date[] = [];
    if (projectStartDate) allDates.push(new Date(projectStartDate));
    if (projectEndDate) allDates.push(new Date(projectEndDate));
    tasks.forEach((t) => {
      if (t.createdAt) allDates.push(new Date(t.createdAt));
      if (t.deadline) allDates.push(new Date(t.deadline));
      if (t.startedAt) allDates.push(new Date(t.startedAt));
      if (t.completedAt) allDates.push(new Date(t.completedAt));
    });

    if (allDates.length === 0) {
      const now = new Date();
      allDates.push(new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000));
      allDates.push(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000));
    }

    const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));

    // Add padding
    const start = new Date(minDate.getTime() - 3 * 24 * 60 * 60 * 1000);
    const end = new Date(maxDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const total = Math.max(daysBetween(start, end), 14);

    // Generate week markers
    const weekMarkers: { date: Date; offset: number }[] = [];
    const current = new Date(start);
    while (current <= end) {
      weekMarkers.push({
        date: new Date(current),
        offset: daysBetween(start, current),
      });
      current.setDate(current.getDate() + 7);
    }

    return { timelineStart: start, timelineEnd: end, totalDays: total, weeks: weekMarkers };
  }, [projectStartDate, projectEndDate, tasks]);

  const today = new Date();
  const todayOffset = daysBetween(timelineStart, today);
  const todayPercent = Math.min(Math.max((todayOffset / totalDays) * 100, 0), 100);

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground border-2 border-dashed border-border rounded-xl">
        No tasks to display on timeline. Create tasks with deadlines to see them here.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <div className="min-w-[800px]">
        {/* Header - week markers */}
        <div className="relative h-10 border-b border-border bg-muted/50">
          {weeks.map((week, i) => (
            <div
              key={i}
              className="absolute top-0 h-full border-l border-border flex items-center px-2"
              style={{ left: `${(week.offset / totalDays) * 100}%` }}
            >
              <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                {week.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))}

          {/* Today marker */}
          {todayPercent >= 0 && todayPercent <= 100 && (
            <div
              className="absolute top-0 h-full w-0.5 bg-red-500 z-10"
              style={{ left: `${todayPercent}%` }}
            >
              <div className="absolute -top-0.5 -left-2.5 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded">
                Today
              </div>
            </div>
          )}
        </div>

        {/* Task bars */}
        <div className="relative">
          {tasks.map((task, index) => {
            const taskStart = task.startedAt ? new Date(task.startedAt) : new Date(task.createdAt);
            const taskEnd = task.completedAt
              ? new Date(task.completedAt)
              : task.deadline
              ? new Date(task.deadline)
              : new Date(taskStart.getTime() + 7 * 24 * 60 * 60 * 1000);

            const startPercent = Math.max((daysBetween(timelineStart, taskStart) / totalDays) * 100, 0);
            const daysSpan = Math.max(daysBetween(taskStart, taskEnd), 1); // at least 1 day
            const width = Math.max((daysSpan / totalDays) * 100, 3); // min 3% width for visibility
            
            const tooltipText = `${task.title} (${task.status.replace('_', ' ')})
Start: ${taskStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
${task.completedAt ? 'Completed' : 'Due'}: ${taskEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative flex items-center h-12 border-b border-border hover:bg-muted/30 group"
              >
                {/* Week grid lines */}
                {weeks.map((week, i) => (
                  <div
                    key={i}
                    className="absolute top-0 h-full border-l border-border/50"
                    style={{ left: `${(week.offset / totalDays) * 100}%` }}
                  />
                ))}

                {/* Today line */}
                {todayPercent >= 0 && todayPercent <= 100 && (
                  <div className="absolute top-0 h-full w-0.5 bg-red-500/20 z-0" style={{ left: `${todayPercent}%` }} />
                )}

                {/* Task label (left side) */}
                <div className="absolute left-2 flex items-center gap-2 z-10">
                  <span className="text-[10px] font-mono text-muted-foreground">{projectKey}-{task.taskNumber}</span>
                </div>

                {/* Task bar */}
                <motion.div
                  className={`absolute h-7 rounded-md ${STATUS_COLORS[task.status] || 'bg-slate-400'} opacity-80 hover:opacity-100 transition-opacity cursor-pointer z-5 flex items-center px-2 overflow-hidden`}
                  style={{ left: `${startPercent}%`, width: `${width}%`, minWidth: '40px' }}
                  initial={{ scaleX: 0, transformOrigin: 'left' }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: index * 0.05 + 0.2, duration: 0.4 }}
                  title={tooltipText}
                  onClick={() => onTaskClick?.(task.id)}
                >
                  <span className="text-[10px] font-medium text-white truncate pr-1">{task.title}</span>
                  {task.status === 'COMPLETED' && (
                    <svg className="w-3 h-3 text-white ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 p-3 border-t border-border bg-muted/30">
          {Object.entries(STATUS_BG).slice(0, 6).map(([status, className]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={`h-2.5 w-2.5 rounded-sm ${STATUS_COLORS[status]}`} />
              <span className="text-[10px] font-medium text-muted-foreground">{status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
