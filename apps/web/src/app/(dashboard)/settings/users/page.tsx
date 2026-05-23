'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RequirePermission } from '@/components/auth/require-permission';
import { apiClient as api } from '@/lib/api-client';
import { AssignRoleDialog } from './components/assign-role-dialog';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles?: { id: string; name: string }[];
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      // For each user, we also need to fetch their roles if the backend doesn't provide it
      // Assuming backend provides it in res.data.data for simplicity here.
      // If not, we would need to map and fetch /users/:id/roles
      
      const usersData = res.data.data || res.data;
      
      const usersWithRoles = await Promise.all(
        usersData.map(async (u: any) => {
          try {
            const roleRes = await api.get(`/users/${u.id}/roles`);
            return { ...u, roles: roleRes.data };
          } catch (err) {
            return { ...u, roles: [] };
          }
        })
      );
      
      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Roles</h2>
          <p className="text-muted-foreground">Assign and manage roles for system users.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id} className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle>{user.firstName} {user.lastName}</CardTitle>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-2">
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map(role => (
                    <span key={role.id} className="text-xs bg-secondary px-2 py-1 rounded-md">
                      {role.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground italic">No roles assigned</span>
                )}
              </div>
              <RequirePermission permission="role.assign">
                <Button variant="outline" size="sm" onClick={() => { setSelectedUser(user); setIsAssignOpen(true); }}>
                  Manage Roles
                </Button>
              </RequirePermission>
            </CardContent>
          </Card>
        ))}
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
