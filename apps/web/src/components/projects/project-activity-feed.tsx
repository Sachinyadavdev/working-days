'use client';

import React from 'react';
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
  Activity,
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
  CREATE: FolderPlus,
  UPDATE: Edit,
  DELETE: Trash2,
  ASSIGN: CheckCircle,
  MEMBER_ADDED: UserPlus,
  MEMBER_REMOVED: UserMinus,
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-emerald-100 text-emerald-600',
  UPDATE: 'bg-blue-100 text-blue-600',
  DELETE: 'bg-red-100 text-red-600',
  ASSIGN: 'bg-purple-100 text-purple-600',
  MEMBER_ADDED: 'bg-indigo-100 text-indigo-600',
  MEMBER_REMOVED: 'bg-orange-100 text-orange-600',
};

function renderChanges(changes: Record<string, any> | undefined): React.ReactNode {
  if (!changes) return null;
  const entries = Object.entries(changes);
  if (entries.length === 0) return null;

  return (
    <div className="mt-2 space-y-1.5 bg-background border border-border/50 p-3 rounded-md text-xs font-mono shadow-sm">
      {entries.map(([key, value]) => {
        if (typeof value === 'object' && value !== null && value.from !== undefined && value.to !== undefined) {
          return (
            <div key={key} className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-muted-foreground min-w-[80px]">{key}:</span>
              <span className="text-red-500/80 line-through bg-red-50 px-1 rounded">{String(value.from) || 'empty'}</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
              <span className="text-emerald-600 font-medium bg-emerald-50 px-1 rounded">{String(value.to) || 'empty'}</span>
            </div>
          );
        } else {
          return (
            <div key={key} className="flex flex-wrap items-start gap-2">
              <span className="font-semibold text-muted-foreground min-w-[80px]">{key}:</span>
              <span className="text-foreground bg-muted/50 px-1 rounded break-all">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
            </div>
          );
        }
      })}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ProjectActivityFeed({ logs, isLoading }: ProjectActivityFeedProps) {
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
      {logs.map((log, index) => {
        const Icon = ACTION_ICONS[log.action] || Activity;
        const colorClass = ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600';

        return (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
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
                  {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {log.action.replace('_', ' ').toLowerCase()} {log.entity.toLowerCase()}
                </span>
              </div>
              {renderChanges(log.changes)}
            </div>

            {/* Time */}
            <span className="text-xs text-muted-foreground shrink-0">{timeAgo(log.createdAt)}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
