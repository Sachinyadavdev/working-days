import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminWorkspacesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Enterprise Workspaces</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Workspace Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md p-4 flex items-center justify-center text-muted-foreground">
            Data Table will be rendered here showing all active Workspaces and associated projects.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
