'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { RequirePermission } from '@/components/auth/require-permission';
import { RequireRole } from '@/components/auth/require-role';
import { apiClient as api } from '@/lib/api-client';
import { RoleDialog } from './components/role-dialog';
import { PermissionMatrix } from './components/permission-matrix';

interface Role {
  id: string;
  name: string;
  slug: string;
  description: string;
  isSystem: boolean;
  priority: number;
  status: string;
  _count?: { users: number; permissions: number };
}

export default function RolesPage() {
  return (
    <RequireRole role={['ADMIN', 'SUPER_ADMIN']} fallback={<p role="alert" className="p-6 text-muted-foreground">Role management is available to administrators only.</p>}>
      <RolesContent />
    </RequireRole>
  );
}

function RolesContent() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const pageSize = 12;

  const fetchRoles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/roles', { params: { skip: page * pageSize, take: pageSize } });
      setRoles(res.data.data.data);
      setTotal(res.data.data.total);
    } catch (error) {
      setError('Unable to load roles. Please retry or ask your administrator to check your access.');
    }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchRoles();
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Roles & Permissions</h2>
          <p className="text-muted-foreground">Manage system roles and their access levels.</p>
        </div>
        <RequirePermission permission="role.create">
          <Button onClick={() => { setSelectedRole(null); setIsRoleDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        </RequirePermission>
      </div>

      {error && <div role="alert" className="text-sm text-destructive">{error} <Button variant="outline" size="sm" onClick={fetchRoles}>Retry</Button></div>}
      {isLoading && <p role="status">Loading roles…</p>}
      {!isLoading && !error && roles.length === 0 && <p>No roles found.</p>}
      {!isLoading && !error && <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <Card key={role.id} className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {role.name}
                {role.isSystem && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">System</span>
                )}
              </CardTitle>
              <CardDescription>{role.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-4">
                Users: {role._count?.users || 0} &bull; Permissions: {role._count?.permissions || 0}
              </div>
              <div className="flex gap-2">
                <RequirePermission permission="role.update">
                  <Button variant="outline" size="sm" onClick={() => { setSelectedRole(role); setIsRoleDialogOpen(true); }}>
                    Edit
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => { setSelectedRole(role); setIsMatrixOpen(true); }}>
                    Permissions
                  </Button>
                </RequirePermission>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>}

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" disabled={isLoading || page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
        <span className="text-sm text-muted-foreground">Page {page + 1} of {Math.max(1, Math.ceil(total / pageSize))}</span>
        <Button variant="outline" disabled={isLoading || (page + 1) * pageSize >= total} onClick={() => setPage(page + 1)}>Next</Button>
      </div>

      {isRoleDialogOpen && (
        <RoleDialog
          isOpen={isRoleDialogOpen}
          onClose={() => setIsRoleDialogOpen(false)}
          role={selectedRole}
          onSuccess={fetchRoles}
        />
      )}

      {isMatrixOpen && selectedRole && (
        <PermissionMatrix
          isOpen={isMatrixOpen}
          onClose={() => setIsMatrixOpen(false)}
          role={selectedRole}
          onSuccess={fetchRoles}
        />
      )}
    </div>
  );
}
