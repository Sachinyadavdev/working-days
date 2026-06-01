'use client';

import {
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  Hourglass,
  TreePalm,
  Stethoscope,
  Briefcase,
} from 'lucide-react';
import type { EmployeeLeaveDashboard } from '@/lib/api/leave';

interface LeaveSummaryCardsProps {
  dashboard: EmployeeLeaveDashboard;
}

const categoryIcons: Record<string, any> = {
  CL: TreePalm,
  SL: Stethoscope,
  EL: Briefcase,
};

export function LeaveSummaryCards({ dashboard }: LeaveSummaryCardsProps) {
  const { summary, balances } = dashboard;

  const statCards = [
    {
      label: 'Total Available',
      value: summary.totalAvailable,
      suffix: 'days',
      icon: CalendarDays,
      color: 'text-brand-600',
      bgColor: 'bg-brand-50',
      ringColor: 'ring-brand-200',
    },
    {
      label: 'Pending Requests',
      value: summary.pendingRequests,
      icon: Hourglass,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      ringColor: 'ring-amber-200',
    },
    {
      label: 'Approved Leaves',
      value: summary.approvedLeaves,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      ringColor: 'ring-emerald-200',
    },
    {
      label: 'Rejected Leaves',
      value: summary.rejectedLeaves,
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      ringColor: 'ring-red-200',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {card.label}
                </p>
                <p className={`mt-2 text-3xl font-bold ${card.color}`}>
                  {card.value}
                  {card.suffix && (
                    <span className="ml-1 text-sm font-medium text-muted-foreground">
                      {card.suffix}
                    </span>
                  )}
                </p>
              </div>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bgColor} ring-1 ${card.ringColor}`}
              >
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
            {/* Decorative gradient bar */}
            <div
              className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${
                card.color.includes('brand')
                  ? 'from-brand-400 to-brand-600'
                  : card.color.includes('amber')
                  ? 'from-amber-400 to-amber-600'
                  : card.color.includes('emerald')
                  ? 'from-emerald-400 to-emerald-600'
                  : 'from-red-400 to-red-600'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Leave balance breakdown */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" /> Leave Balance Breakdown
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {balances.map((balance) => {
            const available =
              Number(balance.allocated) +
              Number(balance.carryForward) -
              Number(balance.used) -
              Number(balance.pending);
            const total = Number(balance.allocated) + Number(balance.carryForward);
            const usagePercent = total > 0 ? (Number(balance.used) / total) * 100 : 0;
            const Icon = categoryIcons[balance.category?.code || ''] || CalendarDays;

            return (
              <div
                key={balance.id}
                className="rounded-lg border border-border/60 bg-muted/20 p-3.5 transition-all hover:border-brand-300 hover:bg-muted/40"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-100 text-brand-600">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground leading-tight">
                      {balance.category?.code || '??'}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-tight truncate max-w-[80px]">
                      {balance.category?.name || 'Unknown'}
                    </p>
                  </div>
                </div>
                <p className="text-xl font-bold text-foreground">
                  {Number(balance.used)}
                  <span className="text-xs font-medium text-muted-foreground ml-0.5">
                    / {total}
                  </span>
                </p>
                {/* Mini progress bar */}
                <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500"
                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {available} available · {Number(balance.pending)} pending
                </p>
              </div>
            );
          })}
          {balances.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground text-center py-4">
              No leave balances allocated yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
