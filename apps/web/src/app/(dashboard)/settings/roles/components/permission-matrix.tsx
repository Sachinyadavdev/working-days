'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { apiClient as api } from '@/lib/api-client';

interface PermissionMatrixProps {
  isOpen: boolean;
  onClose: () => void;
  role: any;
  onSuccess: () => void;
}

interface PermissionGroup {
  module: string;
  permissions: { id: string; action: string; description: string }[];
}

export function PermissionMatrix({ isOpen, onClose, role, onSuccess }: PermissionMatrixProps) {
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && role) {
      fetchData();
    }
  }, [isOpen, role]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [modulesRes, roleRes] = await Promise.all([
        api.get('/permissions/modules'),
        api.get(`/roles/${role.id}`),
      ]);
      setPermissionGroups(modulesRes.data);
      const rolePerms = roleRes.data.permissions.map((rp: any) => rp.permissionId);
      setSelectedPermissions(new Set(rolePerms));
    } catch (error) {
      console.error('Failed to load permissions', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (permissionId: string) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  const handleToggleModule = (modulePerms: { id: string }[]) => {
    const newSelected = new Set(selectedPermissions);
    const allSelected = modulePerms.every(p => newSelected.has(p.id));
    
    if (allSelected) {
      modulePerms.forEach(p => newSelected.delete(p.id));
    } else {
      modulePerms.forEach(p => newSelected.add(p.id));
    }
    setSelectedPermissions(newSelected);
  };

  const onSave = async () => {
    try {
      await api.post(`/roles/${role.id}/permissions`, {
        permissionIds: Array.from(selectedPermissions),
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save permissions', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Permissions for {role.name}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center">Loading...</div>
        ) : (
          <div className="space-y-6">
            {permissionGroups.map((group) => {
              const allSelected = group.permissions.every(p => selectedPermissions.has(p.id));
              const someSelected = group.permissions.some(p => selectedPermissions.has(p.id)) && !allSelected;
              
              return (
                <div key={group.module} className="border rounded-md p-4">
                  <div className="flex items-center space-x-2 mb-4 pb-2 border-b">
                    <Checkbox 
                      checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                      onCheckedChange={() => handleToggleModule(group.permissions)}
                      id={`module-${group.module}`}
                    />
                    <label htmlFor={`module-${group.module}`} className="text-lg font-semibold capitalize cursor-pointer">
                      {group.module.replace('-', ' ')} Module
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {group.permissions.map((perm) => (
                      <div key={perm.id} className="flex items-start space-x-2">
                        <Checkbox 
                          id={`perm-${perm.id}`}
                          checked={selectedPermissions.has(perm.id)}
                          onCheckedChange={() => handleToggle(perm.id)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor={`perm-${perm.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {perm.action.replace('-', ' ')}
                          </label>
                          {perm.description && (
                            <p className="text-sm text-muted-foreground">
                              {perm.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={onSave} disabled={isLoading}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
