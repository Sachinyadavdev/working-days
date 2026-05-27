'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, Clock, Trophy, TrendingUp, BarChart3, Users } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  estimatedHours?: number;
  assignee?: {
    id: string;
    user?: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
}

interface ProjectContributionsProps {
  tasks: Task[];
  members: any[];
}

const BAR_COLORS = [
  { bg: 'bg-brand-500', text: 'text-brand-700', light: 'bg-brand-100', ring: 'ring-brand-500' },
  { bg: 'bg-emerald-500', text: 'text-emerald-700', light: 'bg-emerald-100', ring: 'ring-emerald-500' },
  { bg: 'bg-violet-500', text: 'text-violet-700', light: 'bg-violet-100', ring: 'ring-violet-500' },
  { bg: 'bg-amber-500', text: 'text-amber-700', light: 'bg-amber-100', ring: 'ring-amber-500' },
  { bg: 'bg-rose-500', text: 'text-rose-700', light: 'bg-rose-100', ring: 'ring-rose-500' },
  { bg: 'bg-cyan-500', text: 'text-cyan-700', light: 'bg-cyan-100', ring: 'ring-cyan-500' },
  { bg: 'bg-indigo-500', text: 'text-indigo-700', light: 'bg-indigo-100', ring: 'ring-indigo-500' },
  { bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-100', ring: 'ring-orange-500' },
];

const DONUT_COLORS = [
  '#6366f1', '#10b981', '#8b5cf6', '#f59e0b',
  '#f43f5e', '#06b6d4', '#4f46e5', '#f97316',
];

export function ProjectContributions({ tasks, members }: ProjectContributionsProps) {
  const contributions = useMemo(() => {
    const memberMap = new Map<string, {
      id: string;
      name: string;
      initials: string;
      avatar?: string;
      totalTasks: number;
      completedTasks: number;
      inProgressTasks: number;
      totalHours: number;
      completedHours: number;
    }>();

    // Initialize from members
    members.forEach((m: any) => {
      const empId = m.employeeId || m.employee?.id;
      const user = m.employee?.user;
      if (empId && user) {
        memberMap.set(empId, {
          id: empId,
          name: `${user.firstName} ${user.lastName}`,
          initials: `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`,
          avatar: user.avatar,
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          totalHours: 0,
          completedHours: 0,
        });
      }
    });

    // Aggregate task data
    tasks.forEach((task) => {
      const assigneeId = task.assignee?.id;
      if (!assigneeId) return;

      let member = memberMap.get(assigneeId);
      if (!member && task.assignee?.user) {
        member = {
          id: assigneeId,
          name: `${task.assignee.user.firstName} ${task.assignee.user.lastName}`,
          initials: `${task.assignee.user.firstName?.[0] || ''}${task.assignee.user.lastName?.[0] || ''}`,
          avatar: task.assignee.user.avatar,
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          totalHours: 0,
          completedHours: 0,
        };
        memberMap.set(assigneeId, member);
      }

      if (member) {
        member.totalTasks++;
        member.totalHours += task.estimatedHours || 0;
        if (task.status === 'COMPLETED') {
          member.completedTasks++;
          member.completedHours += task.estimatedHours || 0;
        }
        if (task.status === 'IN_PROGRESS' || task.status === 'IN_REVIEW' || task.status === 'TESTING') {
          member.inProgressTasks++;
        }
      }
    });

    return Array.from(memberMap.values())
      .filter(m => m.totalTasks > 0)
      .sort((a, b) => b.completedTasks - a.completedTasks || b.totalHours - a.totalHours);
  }, [tasks, members]);

  const totalTasksAll = tasks.length;
  const totalCompletedAll = tasks.filter(t => t.status === 'COMPLETED').length;
  const totalHoursAll = tasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
  const totalCompletedHoursAll = tasks.filter(t => t.status === 'COMPLETED').reduce((acc, t) => acc + (t.estimatedHours || 0), 0);

  const maxTasks = Math.max(...contributions.map(c => c.totalTasks), 1);
  const maxHours = Math.max(...contributions.map(c => c.totalHours), 1);

  // Donut chart calculations
  const donutData = contributions.map((c, i) => ({
    name: c.name,
    value: c.completedTasks,
    color: DONUT_COLORS[i % DONUT_COLORS.length],
  })).filter(d => d.value > 0);

  const donutTotal = donutData.reduce((acc, d) => acc + d.value, 0);

  // SVG donut segments
  const donutSegments = useMemo(() => {
    const segments: { offset: number; length: number; color: string; name: string; value: number }[] = [];
    let cumulative = 0;
    const circumference = 2 * Math.PI * 45; // radius = 45

    donutData.forEach((d) => {
      const fraction = donutTotal > 0 ? d.value / donutTotal : 0;
      const length = fraction * circumference;
      segments.push({
        offset: cumulative,
        length,
        color: d.color,
        name: d.name,
        value: d.value,
      });
      cumulative += length;
    });

    return { segments, circumference };
  }, [donutData, donutTotal]);

  if (contributions.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-xl">
        <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
        <p className="text-lg font-medium">No contributions yet</p>
        <p className="text-sm mt-1">Assign tasks to team members to see their contributions here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-brand-50 to-white border-brand-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-brand-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-700">{contributions.length}</p>
                <p className="text-xs text-brand-500">Contributors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckSquare className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700">{totalCompletedAll}/{totalTasksAll}</p>
                <p className="text-xs text-emerald-500">Tasks Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-50 to-white border-violet-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-violet-700">{totalCompletedHoursAll}h</p>
                <p className="text-xs text-violet-500">Hours Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">{contributions[0]?.name?.split(' ')[0] || '—'}</p>
                <p className="text-xs text-amber-500">Top Contributor</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Task Distribution Donut */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" /> Task Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {donutTotal === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No completed tasks yet.</p>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <svg width="160" height="160" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                    {/* Segments */}
                    {donutSegments.segments.map((seg, i) => (
                      <motion.circle
                        key={i}
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="10"
                        strokeDasharray={`${seg.length} ${donutSegments.circumference - seg.length}`}
                        strokeDashoffset={-seg.offset}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.15, duration: 0.5 }}
                      />
                    ))}
                    {/* Center text */}
                    <text x="50" y="46" textAnchor="middle" className="fill-foreground text-lg font-bold" fontSize="16" fontWeight="700">
                      {donutTotal}
                    </text>
                    <text x="50" y="60" textAnchor="middle" className="fill-muted-foreground" fontSize="8">
                      completed
                    </text>
                  </svg>
                </div>
                {/* Legend */}
                <div className="w-full space-y-1.5">
                  {donutData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-foreground truncate">{d.name}</span>
                      </div>
                      <span className="text-muted-foreground font-medium">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tasks by Member Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4" /> Tasks by Member
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contributions.map((c, i) => {
                const color = BAR_COLORS[i % BAR_COLORS.length];
                const totalPercent = (c.totalTasks / maxTasks) * 100;
                const completedPercent = (c.completedTasks / maxTasks) * 100;
                return (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`h-7 w-7 shrink-0 rounded-full ${color.light} flex items-center justify-center ${color.text} text-[10px] font-bold uppercase`}>
                          {c.avatar ? (
                            <img src={c.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                          ) : c.initials}
                        </div>
                        <span className="font-medium text-foreground truncate">{c.name}</span>
                      </div>
                      <span className="text-muted-foreground text-xs font-semibold">{c.completedTasks}/{c.totalTasks}</span>
                    </div>
                    <div className="relative h-5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`absolute inset-y-0 left-0 ${color.bg} opacity-25 rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${totalPercent}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                      />
                      <motion.div
                        className={`absolute inset-y-0 left-0 ${color.bg} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${completedPercent}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 + 0.2, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-brand-500" /> Completed</div>
              <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-brand-500 opacity-25" /> Total Assigned</div>
            </div>
          </CardContent>
        </Card>

        {/* Hours by Member Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" /> Hours by Member
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contributions.map((c, i) => {
                const color = BAR_COLORS[i % BAR_COLORS.length];
                const totalPercent = (c.totalHours / maxHours) * 100;
                const completedPercent = (c.completedHours / maxHours) * 100;
                return (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`h-7 w-7 shrink-0 rounded-full ${color.light} flex items-center justify-center ${color.text} text-[10px] font-bold uppercase`}>
                          {c.avatar ? (
                            <img src={c.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                          ) : c.initials}
                        </div>
                        <span className="font-medium text-foreground truncate">{c.name}</span>
                      </div>
                      <span className="text-muted-foreground text-xs font-semibold">{c.completedHours}h / {c.totalHours}h</span>
                    </div>
                    <div className="relative h-5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`absolute inset-y-0 left-0 ${color.bg} opacity-25 rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${totalPercent}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                      />
                      <motion.div
                        className={`absolute inset-y-0 left-0 ${color.bg} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${completedPercent}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 + 0.2, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Delivered</div>
              <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-emerald-500 opacity-25" /> Estimated</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4" /> Contribution Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground w-10">#</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Member</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Total Tasks</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Completed</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">In Progress</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Completion %</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Hours (Done/Est.)</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((c, i) => {
                  const color = BAR_COLORS[i % BAR_COLORS.length];
                  const completionPct = c.totalTasks > 0 ? Math.round((c.completedTasks / c.totalTasks) * 100) : 0;
                  return (
                    <motion.tr
                      key={c.id}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <td className="py-3 px-4">
                        {i === 0 ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-bold">🥇</span>
                        ) : i === 1 ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-xs font-bold">🥈</span>
                        ) : i === 2 ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-orange-700 text-xs font-bold">🥉</span>
                        ) : (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-semibold">{i + 1}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 shrink-0 rounded-full ${color.light} flex items-center justify-center ${color.text} text-xs font-bold uppercase overflow-hidden`}>
                            {c.avatar ? (
                              <img src={c.avatar} alt="" className="h-full w-full object-cover" />
                            ) : c.initials}
                          </div>
                          <span className="font-medium text-foreground">{c.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold">{c.totalTasks}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                          {c.completedTasks}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                          {c.inProgressTasks}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${completionPct >= 75 ? 'bg-emerald-500' : completionPct >= 50 ? 'bg-amber-500' : 'bg-red-400'}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${completionPct}%` }}
                              transition={{ duration: 0.6, delay: i * 0.08 }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground">{completionPct}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-muted-foreground">
                        {c.completedHours}h / {c.totalHours}h
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
