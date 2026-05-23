import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminAuditPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Audit Logs & Activity</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Enterprise Audit Viewer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md p-4 flex items-center justify-center text-muted-foreground">
            Audit Data Table goes here
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
