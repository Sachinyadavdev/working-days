import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EmployeeProfilePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>General Information</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4 text-sm">
               <div className="grid grid-cols-2">
                 <span className="font-semibold text-muted-foreground">Employee ID</span>
                 <span>EMP-1002</span>
               </div>
               <div className="grid grid-cols-2">
                 <span className="font-semibold text-muted-foreground">Department</span>
                 <span>Engineering</span>
               </div>
               <div className="grid grid-cols-2">
                 <span className="font-semibold text-muted-foreground">Designation</span>
                 <span>Senior Developer</span>
               </div>
             </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>My Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-dashed rounded-md p-4 flex flex-col items-center justify-center text-muted-foreground h-32">
              <span className="mb-2 text-xs">Drag and drop files here to securely upload</span>
              <button className="text-xs text-brand-600 bg-brand-50 px-3 py-1 rounded-md">Upload Document</button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
