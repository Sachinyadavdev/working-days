'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { apiClient as api } from '@/lib/api-client';
import { toast } from 'sonner';

interface AssignRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    roleAssignments: { id: string; name: string; status: string }[];
  };
  onSuccess: () => void;
}

export function AssignRoleDialog({ isOpen, onClose, user, onSuccess }: AssignRoleDialogProps) {
  const [allRoles, setAllRoles] = useState<{ id: string; name: string; status: string }[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const [isFetching, setIsFetching] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      if (user?.roleAssignments) {
        setSelectedRoles(new Set(user.roleAssignments.map((r) => r.id)));
      }
    }
  }, [isOpen, user]);

  const fetchRoles = async () => {
    setIsFetching(true);
    setLoadError(null);
    try {
      const roles: { id: string; name: string; status: string }[] = [];
      let total = 0;
      do {
        const res = await api.get('/roles', { params: { skip: roles.length, take: 100 } });
        const result = res.data.data;
        roles.push(...result.data);
        total = result.total;
        if (result.data.length === 0) break;
      } while (roles.length < total);
      // Keep existing inactive assignments visible so they can be removed.
      const available = new Map(
        roles.filter((role) => role.status === 'ACTIVE').map((role) => [role.id, role]),
      );
      user.roleAssignments.forEach((role) => available.set(role.id, role));
      setAllRoles(Array.from(available.values()));
    } catch {
      setLoadError('Unable to load roles. Check your access and try again.');
    } finally {
      setIsFetching(false);
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
    if (isFetching || loadError || isLoading) return;
    try {
      setIsLoading(true);
      // Determine what to add and what to remove
      const initialRoles = new Set<string>(user.roleAssignments?.map((r) => r.id) || []);

      const rolesToAdd = Array.from(selectedRoles).filter((id) => !initialRoles.has(id));
      const rolesToRemove = Array.from(initialRoles).filter((id) => !selectedRoles.has(id));

      for (const id of rolesToAdd) await api.post(`/users/${user.id}/roles`, { roleId: id });
      for (const id of rolesToRemove) await api.delete(`/users/${user.id}/roles/${id}`);
      toast.success('User roles updated.');

      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        'Unable to finish updating roles. The user list will refresh to show any changes saved.',
      );
      onSuccess();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        if (!isLoading) onClose();
      }}
    >
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Assign Roles to {user.firstName} {user.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isFetching && <p role="status">Loading roles...</p>}
          {loadError && (
            <div role="alert">
              {loadError}{' '}
              <Button variant="outline" onClick={fetchRoles}>
                Retry
              </Button>
            </div>
          )}
          {!isFetching &&
            !loadError &&
            allRoles.map((role) => (
              <div key={role.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`role-${role.id}`}
                  disabled={isLoading}
                  checked={selectedRoles.has(role.id)}
                  onCheckedChange={() => handleToggle(role.id)}
                />
                <label
                  htmlFor={`role-${role.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {role.name}
                  {role.status !== 'ACTIVE' ? ' (Inactive)' : ''}
                </label>
              </div>
            ))}
          {!isFetching && !loadError && allRoles.length === 0 && (
            <p className="text-sm text-muted-foreground">No roles available.</p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" disabled={isLoading} onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={onSave} disabled={isLoading || isFetching || !!loadError}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
