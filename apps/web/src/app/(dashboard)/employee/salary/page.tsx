import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EmployeeSalaryPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Compensation & Salary</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Salary Slips & Tax Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-dashed rounded-md p-4 flex items-center justify-center text-muted-foreground bg-slate-50 dark:bg-slate-900 h-40">
            You do not have authorization to view other employees' salaries. 
            Your personal salary breakdown will be rendered here securely.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
