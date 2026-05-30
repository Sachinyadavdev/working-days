'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pencil, Loader2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';

export function AllEmployeesHours({ data, onUpdate }: { data: any, onUpdate?: () => void }) {
  const allEmployees = data?.allEmployees || [];
  
  const [editingEmployee, setEditingEmployee] = useState<{ id: string, name: string, currentHours: number } | null>(null);
  const [newHours, setNewHours] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredEmployees = allEmployees.filter((emp: any) => 
    `${emp.user.firstName} ${emp.user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm mt-6 flex flex-col h-[500px]">
      <div className="flex flex-col gap-3 mb-4">
        <h3 className="font-semibold text-base shrink-0">Organization Hours</h3>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
          />
        </div>
      </div>
      
      <div className="space-y-2 overflow-y-auto pr-2 flex-1 custom-scrollbar">
        {filteredEmployees.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No employees found.</p>
        ) : (
          filteredEmployees.map((employee: any) => {
            const user = employee.user;
            const initials = `${user.firstName[0]}${user.lastName[0]}`;
            const requiredHours = employee.requiredDailyHours || 8.0;

            return (
              <div key={employee.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                <div className="flex items-center gap-2 overflow-hidden mr-2">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={user.avatar || undefined} alt={user.firstName} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="truncate">
                    <p className="text-xs font-medium truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Required</p>
                    <p className="text-xs font-semibold whitespace-nowrap">{requiredHours}h / day</p>
                  </div>
                  <button 
                    onClick={() => handleEditClick(employee, requiredHours)}
                    className="p-1.5 rounded-md hover:bg-brand-500/10 text-muted-foreground hover:text-brand-500 transition-colors"
                    title="Edit Required Hours"
                  >
                    <Pencil size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog open={!!editingEmployee} onOpenChange={(open) => !open && setEditingEmployee(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Required Hours</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Update the required daily working hours for <strong>{editingEmployee?.name}</strong>.
            </p>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hours-all" className="text-right">
                Hours
              </Label>
              <Input
                id="hours-all"
                type="number"
                step="0.5"
                min="1"
                max="24"
                value={newHours}
                onChange={(e) => setNewHours(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEmployee(null)}>
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
