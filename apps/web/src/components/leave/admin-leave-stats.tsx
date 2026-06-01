'use client';

import {
  Users, CalendarOff, Hourglass, CheckCircle2, XCircle,
  TrendingUp, PieChart, Building2,
} from 'lucide-react';
import type { AdminLeaveDashboard } from '@/lib/api/leave';

interface AdminLeaveStatsProps {
  dashboard: AdminLeaveDashboard;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CHART_COLORS = [
  'bg-brand-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-orange-500', 'bg-indigo-500',
];

export function AdminLeaveStats({ dashboard }: AdminLeaveStatsProps) {
  const { statistics, charts } = dashboard;

  const statCards = [
    { label: 'Total Employees', value: statistics.totalEmployees, icon: Users, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'On Leave Today', value: statistics.onLeaveToday, icon: CalendarOff, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Pending Requests', value: statistics.pendingRequests, icon: Hourglass, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Approved (Year)', value: statistics.approvedThisYear, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Rejected (Year)', value: statistics.rejectedThisYear, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  // Calculate max for trend chart
  const maxTrend = Math.max(...(charts.monthlyTrends?.map(t => t.count) || [1]), 1);
  const maxDeptDays = Math.max(...(charts.departmentUsage?.map(d => d.total_days) || [1]), 1);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{card.label}</p>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trends */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4" /> Monthly Leave Trends
          </h3>
          <div className="flex items-end gap-2 h-40">
            {Array.from({ length: 12 }, (_, i) => {
              const trend = charts.monthlyTrends?.find(t => Number(t.month) === i + 1);
              const count = trend?.count || 0;
              const height = maxTrend > 0 ? (count / maxTrend) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold text-foreground">{count || ''}</span>
                  <div className="w-full relative group">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-brand-500 to-brand-400 transition-all duration-500 hover:from-brand-600 hover:to-brand-500"
                      style={{ height: `${Math.max(height, 2)}%`, minHeight: count > 0 ? '8px' : '2px' }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{MONTH_NAMES[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leave Type Distribution */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-4">
            <PieChart className="h-4 w-4" /> Leave Type Distribution
          </h3>
          <div className="space-y-3">
            {charts.leaveTypeDistribution && charts.leaveTypeDistribution.length > 0 ? (
              charts.leaveTypeDistribution.map((item, idx) => {
                const totalAll = charts.leaveTypeDistribution.reduce((s, i) => s + i.count, 0);
                const percent = totalAll > 0 ? (item.count / totalAll) * 100 : 0;
                return (
                  <div key={item.categoryId} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${CHART_COLORS[idx % CHART_COLORS.length]}`} />
                        {item.categoryCode}
                      </span>
                      <span className="text-muted-foreground text-xs">{item.count} ({percent.toFixed(0)}%)</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${CHART_COLORS[idx % CHART_COLORS.length]} transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Department Usage */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-4">
          <Building2 className="h-4 w-4" /> Department Leave Usage
        </h3>
        <div className="space-y-3">
          {charts.departmentUsage && charts.departmentUsage.length > 0 ? (
            charts.departmentUsage.map((dept, idx) => {
              const percent = maxDeptDays > 0 ? (dept.total_days / maxDeptDays) * 100 : 0;
              return (
                <div key={dept.department} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{dept.department}</span>
                    <span className="text-muted-foreground text-xs">{dept.leave_count} leaves · {dept.total_days} days</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${CHART_COLORS[idx % CHART_COLORS.length]} transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
