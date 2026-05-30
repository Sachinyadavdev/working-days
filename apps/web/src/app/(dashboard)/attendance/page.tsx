'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { CheckInWidget } from '@/components/attendance/check-in-widget';
import { PresenceList } from '@/components/attendance/presence-list';
import { AllEmployeesHours } from '@/components/attendance/all-employees-hours';
import { AttendanceStats } from '@/components/attendance/attendance-stats';
import { AttendanceCalendar } from '@/components/attendance/attendance-calendar';
import { Button } from '@/components/ui/button';
import { attendanceApi } from '@/lib/api/attendance';
import { AttendanceEntity } from '@ems/shared-types';

export default function AttendancePage() {
  const { user } = useAuthStore();
  const isAdmin = user?.roles?.some(r => r === 'SUPER_ADMIN' || r === 'ADMIN');
  
  const [employeeStats, setEmployeeStats] = useState<any>(null);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      if (isAdmin) {
        const aStats = await attendanceApi.getAdminStats();
        setAdminStats(aStats);
      }
      const eStats = await attendanceApi.getEmployeeStats();
      setEmployeeStats(eStats);
    } catch (error) {
      console.error('Failed to load attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Attendance Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your daily attendance, breaks, and view history.
          </p>
        </div>
      </div>

      {isAdmin && adminStats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Total Present</h3>
            <p className="mt-2 text-3xl font-bold">{adminStats.presentCount} / {adminStats.totalEmployees}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Late Arrivals</h3>
            <p className="mt-2 text-3xl font-bold text-destructive">{adminStats.lateCount}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Currently Online</h3>
            <p className="mt-2 text-3xl font-bold text-emerald-500">{adminStats.liveStatus?.online || 0}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">On Break</h3>
            <p className="mt-2 text-3xl font-bold text-amber-500">{adminStats.liveStatus?.onBreak || 0}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <CheckInWidget stats={employeeStats} onUpdate={loadData} />
          {isAdmin && adminStats && (
            <>
              <PresenceList data={adminStats} onUpdate={loadData} />
              <AllEmployeesHours data={adminStats} onUpdate={loadData} />
            </>
          )}
        </div>
        <div className="lg:col-span-2 space-y-6">
          <AttendanceStats stats={employeeStats} />
          <AttendanceCalendar />
        </div>
      </div>
    </div>
  );
}
