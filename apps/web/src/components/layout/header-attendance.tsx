'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { attendanceApi } from '@/lib/api/attendance';
import { Play, Square, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AttendanceStatus } from '@ems/shared-types';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';

export function HeaderAttendance() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStats = async (isInitial = false) => {
    if (!user) return;
    try {
      const res = await attendanceApi.getEmployeeStats();
      setStats(res);

      if (isInitial && !res?.today && !user.roles?.includes('SUPER_ADMIN')) {
        try {
          await attendanceApi.checkIn({
            status: AttendanceStatus.PRESENT,
            ipAddress: '192.168.1.1',
            deviceInfo: navigator.userAgent,
            location: 'Office HQ',
          });
          toast.success('Automatically checked in for the day!');
          const updatedRes = await attendanceApi.getEmployeeStats();
          setStats(updatedRes);
          window.dispatchEvent(new Event('attendance-updated'));
        } catch (checkInErr) {
          console.error('Auto check-in failed', checkInErr);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    
    // Add slight delay to prevent 429 Too Many Requests alongside page mounts
    const initialFetch = setTimeout(() => fetchStats(true), 500);
    
    // Refresh every 60 seconds to keep time live
    const interval = setInterval(() => fetchStats(false), 60000);
    
    // Listen for custom event from other widgets
    const handleUpdate = () => fetchStats(false);
    window.addEventListener('attendance-updated', handleUpdate);
    
    return () => {
      clearTimeout(initialFetch);
      clearInterval(interval);
      window.removeEventListener('attendance-updated', handleUpdate);
    };
  }, [user]);

  // Don't render for super admins or if not loaded
  if (!user || user.roles?.includes('SUPER_ADMIN')) return null;

  if (loading) {
    return (
      <div className="h-9 w-24 bg-muted animate-pulse rounded-lg flex items-center justify-center">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const today = stats?.today;
  const isCheckedIn = !!today;
  const isCheckedOut = !!today?.checkOutTime;
  const activeBreak = today?.breaks?.find((b: any) => !b.endTime);
  const isOnBreak = !!activeBreak;
  
  const loggedMins = stats?.todayLiveMinutes || today?.totalMinutes || 0;
  const overtimeMins = stats?.todayOvertimeMinutes || 0;
  const isOvertime = overtimeMins > 0;

  const handleAction = async (action: 'checkIn' | 'checkOut' | 'endBreak') => {
    setActionLoading(true);
    try {
      if (action === 'checkIn') {
        await attendanceApi.checkIn({
          status: AttendanceStatus.PRESENT,
          ipAddress: '192.168.1.1',
          deviceInfo: navigator.userAgent,
          location: 'Office HQ',
        });
        toast.success('Checked in successfully!');
      } else if (action === 'endBreak') {
        await attendanceApi.endBreak();
        toast.success('Break ended!');
      } else {
        await attendanceApi.checkOut();
        toast.success('Checked out successfully!');
      }
      await fetchStats();
      // Notify other widgets
      window.dispatchEvent(new Event('attendance-updated'));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (isCheckedOut) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border">
        <span className="text-xs font-medium text-muted-foreground">Shift Completed</span>
        <span className="text-sm font-bold ml-1">
          {Math.floor(loggedMins / 60)}h {loggedMins % 60}m
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-xl border border-border">
      {isCheckedIn ? (
        <>
          <div className={cn("flex flex-col items-end px-3 py-0.5 rounded-lg border", isOnBreak ? "bg-amber-50 border-amber-200" : isOvertime ? "bg-brand-50 border-brand-200" : "bg-card border-border")}>
            <span className={cn("text-[10px] font-semibold uppercase tracking-wider", isOnBreak ? "text-amber-600" : isOvertime ? "text-brand-600" : "text-emerald-600")}>
              {isOnBreak ? 'On Break' : isOvertime ? 'Overtime' : 'Logged In'}
            </span>
            <span className={cn("text-sm font-bold leading-none mb-0.5", isOnBreak ? "text-amber-700" : isOvertime ? "text-brand-700" : "text-foreground")}>
              {isOnBreak || !isOvertime
                ? `${Math.floor(loggedMins / 60)}h ${loggedMins % 60}m`
                : `+${Math.floor(overtimeMins / 60)}h ${overtimeMins % 60}m`}
            </span>
          </div>
          {isOnBreak ? (
            <Button 
              variant="default" 
              size="sm" 
              className="h-8 px-3 rounded-lg shadow-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => handleAction('endBreak')}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-3 h-3 mr-1.5 fill-current" />}
              End Break
            </Button>
          ) : (
            <Button 
              variant="destructive" 
              size="sm" 
              className="h-8 px-3 rounded-lg shadow-sm font-semibold"
              onClick={() => handleAction('checkOut')}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-3 h-3 mr-1.5 fill-current" />}
              Check Out
            </Button>
          )}
        </>
      ) : (
        <Button 
          size="sm" 
          className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold"
          onClick={() => handleAction('checkIn')}
          disabled={actionLoading}
        >
          {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-3 h-3 mr-1.5 fill-current" />}
          Check In
        </Button>
      )}
    </div>
  );
}
