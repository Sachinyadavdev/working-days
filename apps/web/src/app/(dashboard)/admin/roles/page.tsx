import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminRolesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Role & Permission Governance</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md p-4 flex items-center justify-center text-muted-foreground">
            Role Permission Matrix goes here
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
