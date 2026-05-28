'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarDays, Target, PalmtreeIcon } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'deadline' | 'milestone_start' | 'milestone_end' | 'leave';
  priority?: string;
  status?: string;
  assignee?: string;
  meta?: Record<string, any>;
}

interface TeamCalendarProps {
  taskDeadlines: any[];
  projectMilestones: any[];
  leaveRequests: any[];
  isLoading: boolean;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DOT_COLORS: Record<string, string> = {
  deadline: 'bg-orange-400',
  milestone_start: 'bg-emerald-400',
  milestone_end: 'bg-blue-400',
  leave: 'bg-rose-400',
};

export function TeamCalendar({ taskDeadlines, projectMilestones, leaveRequests, isLoading }: TeamCalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Convert all data into CalendarEvents
  const events = useMemo(() => {
    const items: CalendarEvent[] = [];

    // Task deadlines
    (taskDeadlines || []).forEach((t: any) => {
      if (t.deadline) {
        items.push({
          id: `task-${t.id}`,
          title: t.title,
          date: t.deadline,
          type: 'deadline',
          priority: t.priority,
          status: t.status,
          assignee: t.assignee?.user ? `${t.assignee.user.firstName} ${t.assignee.user.lastName}` : undefined,
          meta: { projectKey: t.project?.key, projectName: t.project?.name },
        });
      }
    });

    // Project milestones
    (projectMilestones || []).forEach((p: any) => {
      if (p.startDate) {
        items.push({
          id: `proj-start-${p.id}`,
          title: `${p.name} — Start`,
          date: p.startDate,
          type: 'milestone_start',
          status: p.status,
        });
      }
      if (p.endDate) {
        items.push({
          id: `proj-end-${p.id}`,
          title: `${p.name} — Deadline`,
          date: p.endDate,
          type: 'milestone_end',
          status: p.status,
        });
      }
    });

    // Leave requests
    (leaveRequests || []).forEach((lr: any) => {
      const name = lr.employee?.user ? `${lr.employee.user.firstName} ${lr.employee.user.lastName}` : 'Employee';
      items.push({
        id: `leave-${lr.id}`,
        title: `${name} on leave`,
        date: lr.startDate,
        type: 'leave',
        meta: { endDate: lr.endDate, leaveType: lr.leaveType },
      });
    });

    return items;
  }, [taskDeadlines, projectMilestones, leaveRequests]);

  // Generate calendar grid
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const calendarDays: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];

  // Previous month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = currentMonth === 0 ? 11 : currentMonth - 1;
    const y = currentMonth === 0 ? currentYear - 1 : currentYear;
    calendarDays.push({ day: d, isCurrentMonth: false, dateStr: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({
      day: d,
      isCurrentMonth: true,
      dateStr: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    });
  }

  // Next month padding
  const remaining = 42 - calendarDays.length;
  for (let d = 1; d <= remaining; d++) {
    const m = currentMonth === 11 ? 0 : currentMonth + 1;
    const y = currentMonth === 11 ? currentYear + 1 : currentYear;
    calendarDays.push({ day: d, isCurrentMonth: false, dateStr: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
  }

  // Events for a given date string
  const getEventsForDate = (dateStr: string) =>
    events.filter((e) => e.date?.substring(0, 10) === dateStr);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
    setSelectedDate(null);
  };

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-xl bg-card border border-border" />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Calendar Grid */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <h3 className="text-lg font-semibold text-foreground">
            {MONTHS[currentMonth]} {currentYear}
          </h3>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">{day}</div>
          ))}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-7">
          {calendarDays.map((cell, idx) => {
            const dayEvents = getEventsForDate(cell.dateStr);
            const isToday = cell.dateStr === todayStr;
            const isSelected = cell.dateStr === selectedDate;

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(cell.dateStr)}
                className={`relative p-2 min-h-[56px] text-left rounded-lg transition-all ${
                  !cell.isCurrentMonth ? 'text-muted-foreground/40' : 'text-foreground'
                } ${isToday ? 'bg-brand-50 ring-1 ring-brand-500/40' : ''} ${
                  isSelected ? 'bg-brand-100 ring-2 ring-brand-500' : 'hover:bg-muted/60'
                }`}
              >
                <span className={`text-sm font-medium ${isToday ? 'text-brand-600 font-bold' : ''}`}>
                  {cell.day}
                </span>
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-1 flex-wrap">
                    {dayEvents.slice(0, 3).map((e) => (
                      <div key={e.id} className={`h-1.5 w-1.5 rounded-full ${DOT_COLORS[e.type]}`} />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[8px] text-muted-foreground ml-0.5">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
          {[
            { type: 'deadline', label: 'Deadlines', icon: CalendarDays },
            { type: 'milestone_start', label: 'Starts', icon: Target },
            { type: 'milestone_end', label: 'Due Dates', icon: Target },
            { type: 'leave', label: 'Leave', icon: PalmtreeIcon },
          ].map((item) => (
            <div key={item.type} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <div className={`h-2 w-2 rounded-full ${DOT_COLORS[item.type]}`} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Event Details */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h4 className="text-sm font-semibold text-foreground mb-4">
          {selectedDate
            ? new Date(selectedDate + 'T00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
            : 'Select a date'}
        </h4>

        {!selectedDate ? (
          <p className="text-xs text-muted-foreground text-center py-8">Click a date on the calendar to see events</p>
        ) : selectedEvents.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">No events on this date</p>
        ) : (
          <div className="space-y-3">
            {selectedEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex items-start gap-2">
                  <div className={`mt-0.5 h-2.5 w-2.5 rounded-full shrink-0 ${DOT_COLORS[event.type]}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-2">{event.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">{event.type.replace('_', ' ')}</span>
                      {event.priority && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{event.priority}</span>
                      )}
                      {event.assignee && (
                        <span className="text-[10px] text-muted-foreground">→ {event.assignee}</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Upcoming Events Summary */}
        <div className="mt-6 pt-4 border-t border-border">
          <h5 className="text-xs font-medium text-muted-foreground mb-2">UPCOMING</h5>
          <div className="space-y-1.5">
            {events
              .filter((e) => new Date(e.date) >= today)
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 5)
              .map((e) => (
                <div key={e.id} className="flex items-center gap-2 text-xs">
                  <div className={`h-1.5 w-1.5 rounded-full ${DOT_COLORS[e.type]}`} />
                  <span className="text-muted-foreground truncate flex-1">{e.title}</span>
                  <span className="text-muted-foreground shrink-0">
                    {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
