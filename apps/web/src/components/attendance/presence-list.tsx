'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pencil, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';

export function PresenceList({ data, onUpdate }: { data: any, onUpdate?: () => void }) {
  const recentCheckIns = data?.recentCheckIns || [];
  
  const [editingEmployee, setEditingEmployee] = useState<{ id: string, name: string, currentHours: number } | null>(null);
  const [newHours, setNewHours] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const handleEditClick = (employee: any, currentHours: number) => {
    setEditingEmployee({ 
      id: employee.id, 
      name: `${employee.user.firstName} ${employee.user.lastName}`,
      currentHours 
    });
    setNewHours(currentHours.toString());
  };

  const handleSave = async () => {
    if (!editingEmployee) return;
    setIsSaving(true);
    try {
      await apiClient.patch(`/employees/${editingEmployee.id}/admin-update`, {
        requiredDailyHours: parseFloat(newHours),
      });
      setEditingEmployee(null);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to update hours', error);
    } finally {
      setIsSaving(false);
    }
  };

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

            const requiredHours = attendance.employee?.requiredDailyHours || 8.0;
            const liveTotalMinutes = attendance.liveTotalMinutes || 0;
            const liveHours = Math.floor(liveTotalMinutes / 60);
            const liveMins = liveTotalMinutes % 60;
            const progress = Math.min(100, (liveTotalMinutes / (requiredHours * 60)) * 100);

            return (
              <div key={attendance.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 w-full">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || undefined} alt={user.firstName} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${statusColor}`}></span>
                  </div>
                  <div className="flex-1 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-muted-foreground">{statusText} • In at {new Date(attendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium whitespace-nowrap">{liveHours}h {liveMins}m <span className="text-muted-foreground">/ {requiredHours}h</span></p>
                        <button 
                          onClick={() => handleEditClick(attendance.employee, requiredHours)}
                          className="p-1 rounded hover:bg-white/10 text-brand-300 hover:text-brand-100 transition-colors"
                          title="Edit Required Hours"
                        >
                          <Pencil size={12} />
                        </button>
                      </div>
                      <div className="w-20 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                        <div className={`h-full ${progress >= 100 ? 'bg-emerald-500' : 'bg-brand-500'}`} style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog open={!!editingEmployee} onOpenChange={(open) => !open && setEditingEmployee(null)}>
        <DialogContent className="sm:max-w-[425px] bg-brand-900 text-white border-white/10">
          <DialogHeader>
            <DialogTitle>Edit Required Hours</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-brand-300">
              Update the required daily working hours for <strong className="text-white">{editingEmployee?.name}</strong>.
            </p>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hours" className="text-right text-brand-200">
                Hours
              </Label>
              <Input
                id="hours"
                type="number"
                step="0.5"
                min="1"
                max="24"
                value={newHours}
                onChange={(e) => setNewHours(e.target.value)}
                className="col-span-3 bg-white/5 border-white/10 focus:border-brand-500 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEmployee(null)} className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-brand-500 hover:bg-brand-400 text-white">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
