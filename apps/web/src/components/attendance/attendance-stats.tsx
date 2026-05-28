'use client';

import { Clock, Briefcase, AlertTriangle, CalendarDays } from 'lucide-react';

export function AttendanceStats({ stats }: { stats: any }) {
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
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <h3 className="font-semibold text-lg mb-4">Weekly Summary</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-muted/50 flex flex-col gap-1">
          <span className="text-muted-foreground text-sm flex items-center gap-1">
            <Clock className="w-4 h-4" /> Total Hours
          </span>
          <span className="text-2xl font-bold">{weekly.totalHoursFormatted || `${weekly.hours}h`}</span>
        </div>
        
        <div className="p-4 rounded-lg bg-muted/50 flex flex-col gap-1">
          <span className="text-muted-foreground text-sm flex items-center gap-1">
            <Briefcase className="w-4 h-4" /> Present Days
          </span>
          <span className="text-2xl font-bold">{weekly.presentDays}</span>
        </div>
        
        <div className="p-4 rounded-lg bg-muted/50 flex flex-col gap-1">
          <span className="text-muted-foreground text-sm flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" /> Late Days
          </span>
          <span className="text-2xl font-bold text-destructive">{weekly.lateDays}</span>
        </div>

        <div className="p-4 rounded-lg bg-muted/50 flex flex-col gap-1">
          <span className="text-muted-foreground text-sm flex items-center gap-1">
            <CalendarDays className="w-4 h-4" /> Today's Status
          </span>
          <span className={`text-xl font-bold ${today ? getStatusColor(today.status) : 'text-muted-foreground'}`}>
            {today ? today.status.replace(/_/g, ' ') : 'NOT CHECKED IN'}
          </span>
        </div>
      </div>
    </div>
  );
}
