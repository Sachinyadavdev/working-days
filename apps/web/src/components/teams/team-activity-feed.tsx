'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, UserMinus, FolderPlus, FolderMinus, Edit, Trash2, Shield, GitPullRequest } from 'lucide-react';

interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  changes?: Record<string, unknown> | null;
  createdAt: string;
  user?: { id: string; firstName: string; lastName: string; avatar?: string | null } | null;
}

interface TeamActivityFeedProps {
  logs: ActivityLog[];
  isLoading: boolean;
}

const ACTION_ICONS: Record<string, React.ElementType> = {
  CREATE: Edit,
  UPDATE: Edit,
  DELETE: Trash2,
  MEMBER_ADDED: UserPlus,
  MEMBER_REMOVED: UserMinus,
  PROJECT_ASSIGNED: FolderPlus,
  PROJECT_REMOVED: FolderMinus,
  LEAD_CHANGED: Shield,
  ASSIGN: GitPullRequest,
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-emerald-100 text-emerald-600',
  UPDATE: 'bg-blue-100 text-blue-600',
  DELETE: 'bg-red-100 text-red-600',
  MEMBER_ADDED: 'bg-violet-100 text-violet-600',
  MEMBER_REMOVED: 'bg-orange-100 text-orange-600',
  PROJECT_ASSIGNED: 'bg-indigo-100 text-indigo-600',
  PROJECT_REMOVED: 'bg-amber-100 text-amber-600',
  LEAD_CHANGED: 'bg-teal-100 text-teal-600',
  ASSIGN: 'bg-purple-100 text-purple-600',
};

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'created the team',
  UPDATE: 'updated team info',
  DELETE: 'deleted the team',
  MEMBER_ADDED: 'added a member',
  MEMBER_REMOVED: 'removed a member',
  PROJECT_ASSIGNED: 'assigned a project',
  PROJECT_REMOVED: 'removed a project',
  LEAD_CHANGED: 'changed team lead',
  ASSIGN: 'assigned a task',
};

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function TeamActivityFeed({ logs, isLoading }: TeamActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Edit className="h-10 w-10 mb-3" />
        <p>No activity yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

      <div className="space-y-1">
        {logs.map((log, idx) => {
          const Icon = ACTION_ICONS[log.action] || Edit;
          const colorClass = ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600';
          const label = ACTION_LABELS[log.action] || log.action.toLowerCase().replace('_', ' ');
          const changes = log.changes as Record<string, any> | null;

          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="relative flex items-start gap-4 py-3 pl-2"
            >
              {/* Icon */}
              <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colorClass} shadow-sm`}>
                <Icon className="h-3.5 w-3.5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">
                    {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                  </span>
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{formatRelativeTime(log.createdAt)}</span>
                </div>

                {/* Change details */}
                {changes && Object.keys(changes).length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {Object.entries(changes).map(([key, value]) => {
                      let displayVal = '';
                      if (typeof value === 'object' && value !== null && 'from' in value && 'to' in value) {
                        displayVal = `${key}: ${value.from} → ${value.to}`;
                      } else if (key === 'name' || key === 'teamName' || key === 'projectName') {
                        displayVal = `${String(value)}`;
                      } else {
                        displayVal = `${key}: ${String(value)}`;
                      }
                      return (
                        <span key={key} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                          {displayVal}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
