'use client';

import { useState, useEffect } from 'react';
import { eodApi } from '@/lib/api/eod';
import { EodReportEntity } from '@ems/shared-types';
import { EodCard } from '@/components/eod/eod-card';
import { EodReviewDialog } from '@/components/eod/eod-review-dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

export default function EodDashboardPage() {
  const [eods, setEods] = useState<EodReportEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewReport, setReviewReport] = useState<EodReportEntity | null>(null);
  
  const router = useRouter();
  const { user } = useAuthStore();
  const isManager = user?.roles.some(r => r === 'SUPER_ADMIN' || r === 'ADMIN' || r === 'MANAGER');

  useEffect(() => {
    fetchEods();
  }, [isManager]);

  const fetchEods = async () => {
    try {
      setIsLoading(true);
      const res = isManager ? await eodApi.getAll() : await eodApi.getMyEods();
      if (res.success) {
        setEods(res.data.items);
      }
    } catch (error) {
      console.error('Failed to fetch EODs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = async (id: string, status: string, comments: string) => {
    await eodApi.review(id, { status, comments });
    fetchEods(); // Refresh list
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">EOD Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isManager ? 'Review team End of Day reports.' : 'View your daily activity and performance.'}
          </p>
        </div>
        
        {!isManager && (
          <Button onClick={() => router.push('/eod/submit')} className="bg-brand-600 hover:bg-brand-700">
            <PlusCircle className="w-4 h-4 mr-2" />
            Submit Today's EOD
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : eods.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <p className="text-gray-500">No EOD reports found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {eods.map((report) => (
            <EodCard 
              key={report.id} 
              report={report} 
              isManagerView={isManager} 
              onReview={(r) => setReviewReport(r)} 
            />
          ))}
        </div>
      )}

      <EodReviewDialog 
        report={reviewReport}
        isOpen={!!reviewReport}
        onClose={() => setReviewReport(null)}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}
