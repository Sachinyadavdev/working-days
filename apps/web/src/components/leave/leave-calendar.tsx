'use client';

import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  TreePalm,
  CalendarDays,
} from 'lucide-react';
import type { Holiday, LeaveRequest } from '@/lib/api/leave';

interface LeaveCalendarProps {
  holidays: Holiday[];
  leaveRequests: LeaveRequest[];
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function LeaveCalendar({ holidays, leaveRequests }: LeaveCalendarProps) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const totalCells = firstDayOfWeek + daysInMonth;
  const rows = Math.ceil(totalCells / 7);

  const holidayMap = useMemo(() => {
    const map = new Map<string, Holiday>();
    holidays.forEach(h => {
      const d = new Date(h.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      map.set(key, h);
    });
    return map;
  }, [holidays]);

  const leaveMap = useMemo(() => {
    const map = new Map<string, { status: string; category?: string }>();
    leaveRequests.forEach(lr => {
      const start = new Date(lr.startDate);
      const end = new Date(lr.endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        map.set(key, {
          status: lr.status,
          category: lr.category?.code,
        });
      }
    });
    return map;
  }, [leaveRequests]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const renderDay = (day: number) => {
    const key = `${year}-${month}-${day}`;
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
    const dayOfWeek = new Date(year, month, day).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const holiday = holidayMap.get(key);
    const leave = leaveMap.get(key);

    let bgClass = '';
    let textClass = 'text-foreground';
    let dotColor = '';
    let tooltip = '';

    if (isToday) {
      bgClass = 'bg-brand-500 text-white ring-2 ring-brand-300';
      textClass = 'text-white';
    } else if (holiday) {
      bgClass = 'bg-purple-50';
      textClass = 'text-purple-700';
      dotColor = 'bg-purple-500';
      tooltip = holiday.name;
    } else if (leave) {
      if (leave.status === 'APPROVED') {
        bgClass = 'bg-emerald-50';
        textClass = 'text-emerald-700';
        dotColor = 'bg-emerald-500';
        tooltip = `Approved: ${leave.category || 'Leave'}`;
      } else if (leave.status === 'PENDING') {
        bgClass = 'bg-amber-50';
        textClass = 'text-amber-700';
        dotColor = 'bg-amber-500';
        tooltip = `Pending: ${leave.category || 'Leave'}`;
      } else if (leave.status === 'REJECTED') {
        bgClass = 'bg-red-50';
        textClass = 'text-red-400 line-through';
        dotColor = 'bg-red-400';
        tooltip = 'Rejected';
      }
    } else if (isWeekend) {
      textClass = 'text-muted-foreground/50';
      bgClass = 'bg-muted/30';
    }

    return (
      <div
        key={day}
        className={`relative flex flex-col items-center justify-center rounded-lg py-2 px-1 text-sm font-medium transition-all cursor-default ${bgClass} ${textClass}`}
        title={tooltip}
      >
        {day}
        {dotColor && (
          <div className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${dotColor}`} />
        )}
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <CalendarDays className="h-4 w-4" /> Leave Calendar
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold min-w-[140px] text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <button onClick={nextMonth} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => renderDay(i + 1))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-brand-500" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span>Approved</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-purple-500" />
          <span>Holiday</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <span>Weekend</span>
        </div>
      </div>
    </div>
  );
}
