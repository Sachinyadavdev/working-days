import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Global Configurations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md p-4 flex items-center justify-center text-muted-foreground">
            Settings Form goes here
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
