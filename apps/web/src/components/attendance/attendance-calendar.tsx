'use client';

import { useState, useEffect } from 'react';
import { attendanceApi } from '@/lib/api/attendance';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AttendanceStatus } from '@ems/shared-types';

export function AttendanceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendances, setAttendances] = useState<any[]>([]);

  useEffect(() => {
    loadCalendar();
  }, [currentDate]);

  const loadCalendar = async () => {
    try {
      const data = await attendanceApi.getCalendar(currentDate.getMonth() + 1, currentDate.getFullYear());
      setAttendances(data);
    } catch (err) {
      console.error(err);
    }
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getDayStatus = (day: number) => {
    const record = attendances.find(a => new Date(a.date).getUTCDate() === day);
    return record?.status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case AttendanceStatus.PRESENT: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case AttendanceStatus.ABSENT: return 'bg-red-100 text-red-700 border-red-200';
      case AttendanceStatus.LATE: return 'bg-orange-100 text-orange-700 border-orange-200';
      case AttendanceStatus.ON_LEAVE: return 'bg-purple-100 text-purple-700 border-purple-200';
      case AttendanceStatus.HOLIDAY: return 'bg-blue-100 text-blue-700 border-blue-200';
      case AttendanceStatus.WEEKEND: return 'bg-gray-100 text-gray-500 border-gray-200';
      case AttendanceStatus.WORK_FROM_HOME: return 'bg-teal-100 text-teal-700 border-teal-200';
      default: return 'bg-background hover:bg-muted border-transparent';
    }
  };

  const getStatusInitial = (status: string) => {
    switch (status) {
      case AttendanceStatus.PRESENT: return 'P';
      case AttendanceStatus.ABSENT: return 'A';
      case AttendanceStatus.LATE: return 'L';
      case AttendanceStatus.ON_LEAVE: return 'LV';
      case AttendanceStatus.HOLIDAY: return 'H';
      case AttendanceStatus.WEEKEND: return 'W';
      case AttendanceStatus.WORK_FROM_HOME: return 'WFH';
      default: return '';
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg">Attendance Calendar</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="w-4 h-4" /></Button>
          <span className="font-medium min-w-[120px] text-center">
            {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
          </span>
          <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm font-medium text-muted-foreground">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="p-2 h-14 rounded-md" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const status = getDayStatus(day);
          return (
            <div 
              key={day} 
              className={`p-2 h-14 flex flex-col items-center justify-center rounded-md border text-sm font-medium transition-colors ${getStatusColor(status)}`}
            >
              <span>{day}</span>
              {status && <span className="text-[10px] uppercase font-bold mt-1 opacity-80">{getStatusInitial(status)}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
