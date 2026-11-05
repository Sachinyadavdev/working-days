'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RequireRole } from '@/components/auth/require-role';
import { RequirePermission } from '@/components/auth/require-permission';
import { apiClient as api } from '@/lib/api-client';
import { AssignRoleDialog } from './components/assign-role-dialog';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleAssignments: { id: string; name: string; status: string }[];
}

export default function UsersPage() {
  return (
    <RequireRole
      role={['ADMIN', 'SUPER_ADMIN']}
      fallback={<p role="alert">User access management is available to administrators only.</p>}
    >
      <UsersContent />
    </RequireRole>
  );
}

function UsersContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/users', { params: { page, limit: 12 } });
      setUsers(res.data.data.items);
      setTotalPages(Math.max(1, res.data.data.meta.totalPages));
    } catch {
      setError('Unable to load users. Check your access and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Access</h2>
          <p className="text-muted-foreground">Assign and manage roles for system users.</p>
        </div>
      </div>

      {isLoading && <p role="status">Loading users...</p>}
      {error && (
        <div role="alert">
          {error}{' '}
          <Button variant="outline" onClick={fetchUsers}>
            Retry
          </Button>
        </div>
      )}
      {!isLoading && !error && users.length === 0 && <p>No users found.</p>}
      {!isLoading && !error && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card key={user.id} className="flex flex-col justify-between">
              <CardHeader>
                <CardTitle>
                  {user.firstName} {user.lastName}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-wrap gap-2">
                  {user.roleAssignments && user.roleAssignments.length > 0 ? (
                    user.roleAssignments.map((role) => (
                      <span key={role.id} className="text-xs bg-secondary px-2 py-1 rounded-md">
                        {role.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No roles assigned</span>
                  )}
                </div>
                <RequirePermission permission="role.assign">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setIsAssignOpen(true);
                    }}
                  >
                    Manage Roles
                  </Button>
                </RequirePermission>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          disabled={isLoading || page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={isLoading || !!error || page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>

      {isAssignOpen && selectedUser && (
        <AssignRoleDialog
          isOpen={isAssignOpen}
          onClose={() => setIsAssignOpen(false)}
          user={selectedUser}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  );
}
