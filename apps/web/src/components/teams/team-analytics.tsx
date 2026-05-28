'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, AlertTriangle, CheckCircle2, BarChart3, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WorkloadMember {
  employeeId: string;
  name: string;
  avatar: string | null;
  activeTasks: number;
  completedTasks: number;
  totalTasks: number;
}

interface StatusItem {
  status: string;
  count: number;
}

interface TeamAnalyticsProps {
  analytics: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    blockedTasks: number;
    delayedTasks: number;
    productivity: number;
    onTimeRate: number;
    totalMembers: number;
    totalProjects: number;
    statusDistribution: StatusItem[];
    workloadDistribution: WorkloadMember[];
  } | null;
  isLoading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  BACKLOG: '#94a3b8',
  DRAFT: '#94a3b8',
  PENDING: '#f59e0b',
  IN_PROGRESS: '#3b82f6',
  IN_REVIEW: '#8b5cf6',
  TESTING: '#f97316',
  COMPLETED: '#10b981',
  BLOCKED: '#ef4444',
  CANCELLED: '#6b7280',
};

const STATUS_LABELS: Record<string, string> = {
  BACKLOG: 'Backlog',
  DRAFT: 'Draft',
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  TESTING: 'Testing',
  COMPLETED: 'Completed',
  BLOCKED: 'Blocked',
  CANCELLED: 'Cancelled',
};

export function TeamAnalytics({ analytics, isLoading }: TeamAnalyticsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-xl bg-card border border-border" />
        ))}
      </div>
    );
  }

  if (!analytics) return <p className="text-sm text-muted-foreground text-center py-8">No analytics data available</p>;

  const maxWorkload = Math.max(...analytics.workloadDistribution.map((m) => m.totalTasks), 1);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Productivity', value: `${analytics.productivity}%`, icon: TrendingUp, gradient: 'from-emerald-500 to-emerald-600', desc: 'Tasks completed ratio' },
          { label: 'On-Time Rate', value: `${analytics.onTimeRate}%`, icon: Clock, gradient: 'from-blue-500 to-blue-600', desc: 'Tasks delivered on time' },
          { label: 'Blocked Tasks', value: analytics.blockedTasks, icon: AlertTriangle, gradient: 'from-red-500 to-red-600', desc: 'Currently blocked' },
          { label: 'Delayed Tasks', value: analytics.delayedTasks, icon: Clock, gradient: 'from-amber-500 to-amber-600', desc: 'Past deadline' },
        ].map((card) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${card.gradient} opacity-10 blur-2xl`} />
            <div className="relative">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${card.gradient} shadow-lg`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
              <p className="text-[10px] text-muted-foreground">{card.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Task Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-brand-500" /> Task Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.statusDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No task data</p>
            ) : (
              <div className="space-y-3">
                {analytics.statusDistribution.map((item) => {
                  const pct = analytics.totalTasks > 0 ? Math.round((item.count / analytics.totalTasks) * 100) : 0;
                  const color = STATUS_COLORS[item.status] || '#6b7280';
                  return (
                    <div key={item.status}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                          <span className="text-xs font-medium text-foreground">{STATUS_LABELS[item.status] || item.status}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.count} ({pct}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Member Workload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-brand-500" /> Member Workload
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.workloadDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No member data</p>
            ) : (
              <div className="space-y-3">
                {analytics.workloadDistribution.map((member) => {
                  const activePct = maxWorkload > 0 ? Math.round((member.activeTasks / maxWorkload) * 100) : 0;
                  const completedPct = maxWorkload > 0 ? Math.round((member.completedTasks / maxWorkload) * 100) : 0;
                  return (
                    <div key={member.employeeId}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-[9px] font-bold text-white">
                            {member.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <span className="text-xs font-medium text-foreground truncate max-w-[120px]">{member.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{member.activeTasks} active · {member.completedTasks} done</span>
                      </div>
                      <div className="flex gap-1 h-2">
                        <motion.div
                          className="h-full rounded-full bg-blue-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${activePct}%` }}
                          transition={{ duration: 0.8 }}
                        />
                        <motion.div
                          className="h-full rounded-full bg-emerald-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${completedPct}%` }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center gap-4 pt-2 border-t border-border mt-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-blue-500" /> Active
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" /> Completed
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Overall Stats Bar */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm font-semibold text-foreground">Overall Progress</p>
                <p className="text-xs text-muted-foreground">
                  {analytics.completedTasks} of {analytics.totalTasks} tasks · {analytics.totalMembers} members · {analytics.totalProjects} projects
                </p>
              </div>
            </div>
            <span className="text-2xl font-bold text-brand-500">{analytics.productivity}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 via-emerald-400 to-teal-400"
              initial={{ width: 0 }}
              animate={{ width: `${analytics.productivity}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
