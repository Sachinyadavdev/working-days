'use client';

import { Clock, Briefcase, AlertTriangle, CalendarDays } from 'lucide-react';

export function AttendanceStats({ stats, isAdminView }: { stats: any, isAdminView?: boolean }) {
  const weekly = stats?.weeklyStats || { hours: 0, presentDays: 0, lateDays: 0 };
  const today = stats?.today;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'text-emerald-500';
      case 'LATE': return 'text-destructive';
      case 'ON_LEAVE': return 'text-amber-500';
      case 'WORK_FROM_HOME': return 'text-blue-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
      <h3 className="font-semibold text-base mb-4 text-muted-foreground">{isAdminView ? 'Organization Overview' : 'Attendance Overview'}</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {isAdminView ? (
          <>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Total Hours
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl lg:text-2xl font-bold">
                  {Math.floor((stats?.organizationTotalMinutes || 0) / 60)}h {(stats?.organizationTotalMinutes || 0) % 60}m
                </span>
                {(stats?.organizationOvertimeMinutes || 0) > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-brand-100 text-brand-700 ring-1 ring-brand-300">
                    +{Math.floor(stats.organizationOvertimeMinutes / 60)}h {stats.organizationOvertimeMinutes % 60}m OT
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Present
              </span>
              <span className="text-xl lg:text-2xl font-bold">
                {stats?.presentCount || 0}<span className="text-muted-foreground text-sm font-medium ml-1">/ {stats?.totalEmployees || 0}</span>
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Absent
              </span>
              <span className="text-xl lg:text-2xl font-bold text-destructive">
                {stats?.absentCount || 0}
              </span>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Late
              </span>
              <span className="text-xl lg:text-2xl font-bold text-orange-500">
                {stats?.lateCount || 0}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" /> Online
              </span>
              <span className="text-xl lg:text-2xl font-bold text-emerald-500">
                {stats?.liveStatus?.online || 0}
              </span>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> On Break
              </span>
              <span className="text-xl lg:text-2xl font-bold text-amber-500">
                {stats?.liveStatus?.onBreak || 0}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Weekly Total
              </span>
              <span className="text-xl lg:text-2xl font-bold">
                {weekly.totalHoursFormatted || `${weekly.hours}h`}
              </span>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Present
              </span>
              <span className="text-xl lg:text-2xl font-bold">
                {weekly.presentDays}
              </span>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Late
              </span>
              <span className="text-xl lg:text-2xl font-bold text-destructive">
                {weekly.lateDays}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" /> Status
              </span>
              <span className={`text-xl lg:text-2xl font-bold ${today ? getStatusColor(today.status) : 'text-muted-foreground'}`}>
                {today ? today.status.replace(/_/g, ' ') : 'NOT LOGGED'}
              </span>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Required
              </span>
              <span className="text-xl lg:text-2xl font-bold">
                {stats?.requiredDailyHours || 8}h
              </span>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-brand-600 text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Logged Today
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl lg:text-2xl font-bold text-brand-600">
                  {stats?.todayLiveMinutes != null ? `${Math.floor(stats.todayLiveMinutes / 60)}h ${stats.todayLiveMinutes % 60}m` : '0h 0m'}
                </span>
                {(stats?.todayOvertimeMinutes || 0) > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-brand-100 text-brand-700 ring-1 ring-brand-300">
                    +{Math.floor(stats.todayOvertimeMinutes / 60)}h {stats.todayOvertimeMinutes % 60}m OT
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
