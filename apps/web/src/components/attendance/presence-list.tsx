'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function PresenceList({ data }: { data: any }) {
  const recentCheckIns = data?.recentCheckIns || [];

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <h3 className="font-semibold text-lg mb-4">Live Presence</h3>
      
      <div className="space-y-4">
        {recentCheckIns.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No recent check-ins.</p>
        ) : (
          recentCheckIns.map((attendance: any) => {
            const user = attendance.employee.user;
            const initials = `${user.firstName[0]}${user.lastName[0]}`;
            
            const isOnline = !attendance.checkOutTime && !attendance.breaks?.some((b: any) => !b.endTime);
            const isOnBreak = !attendance.checkOutTime && attendance.breaks?.some((b: any) => !b.endTime);
            const isOffline = !!attendance.checkOutTime;

            let statusColor = 'bg-emerald-500';
            let statusText = 'Online';
            if (isOnBreak) {
              statusColor = 'bg-amber-500';
              statusText = 'On Break';
            } else if (isOffline) {
              statusColor = 'bg-gray-400';
              statusText = 'Checked Out';
            }

            return (
              <div key={attendance.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || undefined} alt={user.firstName} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${statusColor}`}></span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground">{statusText} • In at {new Date(attendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
