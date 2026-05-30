'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { attendanceApi } from '@/lib/api/attendance';
import { Play, Square, Coffee, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { AttendanceStatus } from '@ems/shared-types';

export function CheckInWidget({ stats, onUpdate }: { stats: any; onUpdate: () => void }) {
  const [loading, setLoading] = useState(false);
  
  const today = stats?.today;
  const isCheckedIn = !!today;
  const isCheckedOut = !!today?.checkOutTime;
  const activeBreak = today?.breaks?.find((b: any) => !b.endTime);
  const isOnBreak = !!activeBreak;

  const requiredMins = (stats?.requiredDailyHours || 8) * 60;
  const loggedMins = stats?.todayLiveMinutes || today?.totalMinutes || 0;
  const remainingMins = Math.max(0, requiredMins - loggedMins);
  const overtimeMins = stats?.todayOvertimeMinutes || 0;
  const isOvertime = overtimeMins > 0;
  const progressPercent = Math.min(100, (loggedMins / requiredMins) * 100);

  const handleAction = async (action: 'checkIn' | 'checkOut' | 'startBreak' | 'endBreak') => {
    setLoading(true);
    try {
      if (action === 'checkIn') {
        // Mocking Geolocation capture for now
        await attendanceApi.checkIn({
          status: AttendanceStatus.PRESENT,
          ipAddress: '192.168.1.1',
          deviceInfo: navigator.userAgent,
          location: 'Office HQ',
        });
        toast.success('Checked in successfully!');
      } else if (action === 'checkOut') {
        await attendanceApi.checkOut();
        toast.success('Checked out successfully!');
      } else if (action === 'startBreak') {
        await attendanceApi.startBreak({ type: 'LUNCH' });
        toast.success('Break started!');
      } else if (action === 'endBreak') {
        await attendanceApi.endBreak();
        toast.success('Break ended!');
      }
      onUpdate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  if (isCheckedOut) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm text-center">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Square className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold mb-2">Shift Completed</h3>
        <p className="text-muted-foreground text-sm mb-6">
          You checked out at {new Date(today.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. 
          {today.totalMinutes != null ? ` You worked for ${Math.floor(today.totalMinutes / 60)}h ${today.totalMinutes % 60}m today.` : ''} Great work today!
        </p>

        <div className="w-full space-y-2 mb-8 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{Math.floor(loggedMins / 60)}h {loggedMins % 60}m logged</span>
            {isOvertime ? (
              <span className="font-medium text-brand-600 font-bold">Overtime: {Math.floor(overtimeMins / 60)}h {overtimeMins % 60}m</span>
            ) : (
              <span className="font-medium">{Math.floor(remainingMins / 60)}h {remainingMins % 60}m remaining</span>
            )}
          </div>
          <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${isOvertime ? 'bg-brand-500 shadow-[0_0_10px_rgba(var(--brand-500),0.5)]' : 'bg-emerald-500'}`} 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full sm:w-auto min-w-[200px] h-12 text-md rounded-full border-brand-500 text-brand-600 hover:bg-brand-50 hover:text-brand-700 transition-all"
          onClick={() => handleAction('checkIn')}
          disabled={loading}
        >
          <Play className="mr-2 h-4 w-4 fill-current" /> Resume Shift
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <h3 className="font-semibold text-lg mb-6">Today's Attendance</h3>
      
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="text-center">
          <div className="text-5xl font-bold tracking-tight">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-muted-foreground mt-2 text-sm flex items-center justify-center gap-1">
            <MapPin className="w-4 h-4" /> Office HQ
          </div>
        </div>

        {isCheckedIn && (
          <div className="w-full space-y-2 px-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{Math.floor(loggedMins / 60)}h {loggedMins % 60}m logged</span>
              {isOvertime ? (
                <span className="font-medium text-brand-600 font-bold">Overtime: {Math.floor(overtimeMins / 60)}h {overtimeMins % 60}m</span>
              ) : (
                <span className="font-medium text-foreground">{Math.floor(remainingMins / 60)}h {remainingMins % 60}m remaining</span>
              )}
            </div>
            <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${isOnBreak ? 'bg-amber-500' : isOvertime ? 'bg-brand-500 shadow-[0_0_10px_rgba(var(--brand-500),0.5)]' : 'bg-emerald-500'}`}
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
          </div>
        )}

        {!isCheckedIn ? (
          <Button 
            size="lg" 
            className="w-full sm:w-auto min-w-[200px] h-14 text-lg rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-emerald-600/20 transition-all"
            onClick={() => handleAction('checkIn')}
            disabled={loading}
          >
            <Play className="mr-2 h-5 w-5 fill-current" /> Check In
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {!isOnBreak ? (
              <Button 
                variant="outline" 
                className="flex-1 h-14 rounded-xl border-border bg-background hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/30 transition-all"
                onClick={() => handleAction('startBreak')}
                disabled={loading}
              >
                <Coffee className="mr-2 h-5 w-5" /> Start Break
              </Button>
            ) : (
              <Button 
                variant="default" 
                className="flex-1 h-14 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 transition-all"
                onClick={() => handleAction('endBreak')}
                disabled={loading}
              >
                <Play className="mr-2 h-5 w-5 fill-current" /> End Break
              </Button>
            )}
            
            <Button 
              variant="destructive" 
              className="flex-1 h-14 rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all"
              onClick={() => handleAction('checkOut')}
              disabled={loading || isOnBreak}
            >
              <Square className="mr-2 h-5 w-5 fill-current" /> Check Out
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
