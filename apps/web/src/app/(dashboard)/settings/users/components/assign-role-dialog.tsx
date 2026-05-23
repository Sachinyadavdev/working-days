'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { apiClient as api } from '@/lib/api-client';

interface AssignRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSuccess: () => void;
}

export function AssignRoleDialog({ isOpen, onClose, user, onSuccess }: AssignRoleDialogProps) {
  const [allRoles, setAllRoles] = useState<{ id: string; name: string }[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      if (user?.roles) {
        setSelectedRoles(new Set(user.roles.map((r: any) => r.id)));
      }
    }
  }, [isOpen, user]);

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles');
      setAllRoles(res.data.data);
    } catch (error) {
      console.error('Failed to fetch roles', error);
    }
  };

  const handleToggle = (roleId: string) => {
    const newSelected = new Set(selectedRoles);
    if (newSelected.has(roleId)) {
      newSelected.delete(roleId);
    } else {
      newSelected.add(roleId);
    }
    setSelectedRoles(newSelected);
  };

  const onSave = async () => {
    try {
      setIsLoading(true);
      // Determine what to add and what to remove
      const initialRoles = new Set(user.roles?.map((r: any) => r.id) || []);
      
      const rolesToAdd = Array.from(selectedRoles).filter(id => !initialRoles.has(id));
      const rolesToRemove = Array.from(initialRoles).filter(id => !selectedRoles.has(id));

      await Promise.all([
        ...rolesToAdd.map(id => api.post(`/users/${user.id}/roles`, { roleId: id })),
        ...rolesToRemove.map(id => api.delete(`/users/${user.id}/roles/${id}`))
      ]);

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update user roles', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Roles to {user.firstName} {user.lastName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {allRoles.map((role) => (
            <div key={role.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`role-${role.id}`}
                checked={selectedRoles.has(role.id)}
                onCheckedChange={() => handleToggle(role.id)}
              />
              <label
                htmlFor={`role-${role.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {role.name}
              </label>
            </div>
          ))}
          {allRoles.length === 0 && <p className="text-sm text-muted-foreground">No roles available.</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={onSave} disabled={isLoading}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
