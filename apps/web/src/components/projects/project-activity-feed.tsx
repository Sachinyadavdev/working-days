'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FolderPlus,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  CheckSquare,
  Square,
  Activity,
  MessageSquare,
} from 'lucide-react';

interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  changes?: Record<string, any>;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface ProjectActivityFeedProps {
  logs: ActivityLog[];
  isLoading: boolean;
}

const ACTION_ICONS: Record<string, React.ElementType> = {
  COMMENT_ADDED: MessageSquare,
  COMMENT_DELETED: Trash2,
  CREATE: FolderPlus,
  UPDATE: Edit,
  DELETE: Trash2,
  ASSIGN: CheckCircle,
  MEMBER_ADDED: UserPlus,
  MEMBER_REMOVED: UserMinus,
  CHECKLIST_COMPLETED: CheckSquare,
  CHECKLIST_UNCOMPLETED: Square,
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-emerald-100 text-emerald-600',
  UPDATE: 'bg-blue-100 text-blue-600',
  DELETE: 'bg-red-100 text-red-600',
  ASSIGN: 'bg-purple-100 text-purple-600',
  MEMBER_ADDED: 'bg-indigo-100 text-indigo-600',
  MEMBER_REMOVED: 'bg-orange-100 text-orange-600',
  CHECKLIST_COMPLETED: 'bg-emerald-100 text-emerald-600',
  CHECKLIST_UNCOMPLETED: 'bg-yellow-100 text-yellow-600',
};

function renderChanges(changes: Record<string, any> | undefined): React.ReactNode {
  if (!changes) return null;
  const entries = Object.entries(changes).filter(([key]) => !['projectId', 'commentId'].includes(key));
  if (entries.length === 0) return null;

  return (
    <div className="mt-2 space-y-1.5 bg-background border border-border/50 p-3 rounded-md text-xs font-mono shadow-sm">
      {entries.map(([key, value]) => {
        if (typeof value === 'object' && value !== null && value.from !== undefined && value.to !== undefined) {
          return (
            <div key={key} className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-muted-foreground min-w-[80px]">{key.replace(/([a-z])([A-Z])/g, '$1 $2')}: </span>
              <span className="text-red-500/80 line-through bg-red-50 px-1 rounded">{formatValue(value.from)}</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
              <span className="text-emerald-600 font-medium bg-emerald-50 px-1 rounded">{formatValue(value.to)}</span>
            </div>
          );
        } else {
          return (
            <div key={key} className="flex flex-wrap items-start gap-2">
              <span className="font-semibold text-muted-foreground min-w-[80px]">{key.replace(/([a-z])([A-Z])/g, '$1 $2')}: </span>
              <span className="text-foreground bg-muted/50 px-1 rounded break-all">{formatValue(value)}</span>
            </div>
          );
        }
      })}
    </div>
  );
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'Not set';
  if (Array.isArray(value)) return value.length ? value.map(formatValue).join(', ') : 'None';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

const actionLabels: Record<string, string> = {
  CREATE: 'created', UPDATE: 'updated', DELETE: 'deleted', ASSIGN: 'assigned',
  MEMBER_ADDED: 'added a member to', MEMBER_REMOVED: 'removed a member from',
  COMMENT_ADDED: 'commented on', COMMENT_DELETED: 'deleted a comment from',
  CHECKLIST_COMPLETED: 'completed a checklist item in', CHECKLIST_UNCOMPLETED: 'reopened a checklist item in',
};

export function ProjectActivityFeed({ logs, isLoading }: ProjectActivityFeedProps) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const visibleLogs = logs.filter(log => {
    const category = log.entity === 'Task' ? 'tasks' : log.action.startsWith('MEMBER_') ? 'members' : log.action.startsWith('COMMENT_') ? 'comments' : 'project';
    return (filter === 'all' || category === filter) && `${log.user?.firstName || ''} ${log.user?.lastName || ''} ${log.action} ${JSON.stringify(log.changes || {})}`.toLowerCase().includes(search.toLowerCase());
  });
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground border-2 border-dashed border-border rounded-xl">
        <Activity className="h-8 w-8 mb-2" />
        <p className="text-sm">No activity logs yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="mb-4 flex flex-wrap gap-3">
        <input aria-label="Search loaded activity" placeholder="Search loaded activity..." className="rounded-md border border-border bg-background px-3 py-2 text-sm" value={search} onChange={event => setSearch(event.target.value)} />
        <select aria-label="Activity type" className="rounded-md border border-border bg-background px-3 py-2 text-sm" value={filter} onChange={event => setFilter(event.target.value)}>
          <option value="all">All activity</option><option value="project">Project changes</option><option value="tasks">Tasks</option><option value="members">Members</option><option value="comments">Comments</option>
        </select>
      </div>
      {visibleLogs.length === 0 && <p className="py-6 text-sm text-muted-foreground">No matching activity in the loaded history.</p>}
      {visibleLogs.map((log, index) => {
        const Icon = ACTION_ICONS[log.action] || Activity;
        const colorClass = ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600';

        return (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(index, 10) * 0.03 }}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            {/* Icon */}
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
              <Icon className="h-4 w-4" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Unknown actor'}
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  {actionLabels[log.action] || log.action.replace(/_/g, ' ').toLowerCase()} {log.entity.toLowerCase()}
                </span>
              </div>
              {renderChanges(log.changes)}
            </div>

            {/* Time */}
            <span className="text-[10px] text-muted-foreground shrink-0 text-right">
              {formatDateTime(log.createdAt)}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
