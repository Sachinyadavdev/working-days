'use client';

import { useState, useEffect } from 'react';
import { attendanceApi } from '@/lib/api/attendance';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AttendanceStatus } from '@ems/shared-types';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function AttendanceCalendar({ 
  employeeId, 
  employeeName, 
  onClearEmployee 
}: { 
  employeeId?: string; 
  employeeName?: string;
  onClearEmployee?: () => void;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendances, setAttendances] = useState<any[]>([]);
  const [selectedDayRecord, setSelectedDayRecord] = useState<any | null>(null);

  useEffect(() => {
    loadCalendar();
  }, [currentDate, employeeId]);

  const loadCalendar = async () => {
    try {
      const data = await attendanceApi.getCalendar(currentDate.getMonth() + 1, currentDate.getFullYear(), employeeId);
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

  const getDayRecord = (day: number) => {
    return attendances.find(a => new Date(a.date).getUTCDate() === day);
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

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1));
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }).map((_, i) => currentYear - 2 + i);

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            {employeeName ? `${employeeName}'s Calendar` : 'Attendance Calendar'}
          </h3>
          {employeeName && (
            <button onClick={onClearEmployee} className="text-xs text-brand-600 hover:underline mt-1 font-medium">
              &larr; Back to my calendar
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg border border-border">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8"><ChevronLeft className="w-4 h-4" /></Button>
          <div className="flex items-center gap-1">
            <select 
              value={currentDate.getMonth()} 
              onChange={handleMonthChange}
              className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer hover:bg-muted p-1 rounded-md appearance-none"
            >
              {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
            <select 
              value={currentDate.getFullYear()} 
              onChange={handleYearChange}
              className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer hover:bg-muted p-1 rounded-md appearance-none"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8"><ChevronRight className="w-4 h-4" /></Button>
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
          const record = getDayRecord(day);
          const status = record?.status;
          const isOvertime = record?.overtimeMins > 0;
          
          let colorClass = getStatusColor(status);
          if (isOvertime) {
            colorClass = 'bg-brand-50 text-brand-700 border-brand-300 ring-1 ring-brand-400 shadow-[0_0_10px_rgba(var(--brand-500),0.2)]';
          }

          return (
            <div 
              key={day} 
              onClick={() => record && setSelectedDayRecord(record)}
              className={`p-1.5 min-h-[4rem] flex flex-col items-center justify-center rounded-md border text-sm font-medium transition-colors ${record ? 'cursor-pointer hover:ring-2 hover:ring-brand-500/50' : ''} ${colorClass}`}
            >
              <span className="leading-none">{day}</span>
              {status && (
                <div className="flex flex-col items-center mt-1">
                  <span className="text-[10px] uppercase font-bold opacity-80 leading-none text-center">
                    {isOvertime ? 'OVERTIME' : getStatusInitial(status)}
                  </span>
                  {record.totalMins > 0 && (
                    <span className="text-[9px] font-bold mt-0.5 opacity-90 leading-none">
                      {Math.floor(record.totalMins / 60)}h {record.totalMins % 60}m
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={!!selectedDayRecord} onOpenChange={(open) => !open && setSelectedDayRecord(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Attendance Details - {selectedDayRecord && new Date(selectedDayRecord.date).toLocaleDateString()}
            </DialogTitle>
          </DialogHeader>
          {selectedDayRecord && (
            <div className="py-4 space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-muted-foreground font-medium">Status</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${getStatusColor(selectedDayRecord.status)}`}>
                  {selectedDayRecord.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 p-3 rounded-lg border border-border">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Check In</p>
                  <p className="text-sm font-semibold">
                    {selectedDayRecord.checkInTime ? new Date(selectedDayRecord.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </p>
                </div>
                <div className="bg-muted/30 p-3 rounded-lg border border-border">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Check Out</p>
                  <p className="text-sm font-semibold">
                    {selectedDayRecord.checkOutTime ? new Date(selectedDayRecord.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </p>
                </div>
              </div>

              <div className="bg-muted/30 p-3 rounded-lg border border-border flex justify-between items-center">
                <p className="text-sm font-medium">Total Logged Time</p>
                <p className="text-lg font-bold text-brand-600">
                  {Math.floor(selectedDayRecord.totalMins / 60)}h {selectedDayRecord.totalMins % 60}m
                </p>
              </div>

              {selectedDayRecord.overtimeMins > 0 && (
                <div className="bg-brand-50 p-3 rounded-lg border border-brand-200 flex justify-between items-center">
                  <p className="text-sm font-medium text-brand-700">Overtime</p>
                  <p className="text-lg font-bold text-brand-700">
                    +{Math.floor(selectedDayRecord.overtimeMins / 60)}h {selectedDayRecord.overtimeMins % 60}m
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
