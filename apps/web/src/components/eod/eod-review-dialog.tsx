import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EodReportEntity } from '@ems/shared-types';
import { Label } from '@/components/ui/label';

interface EodReviewDialogProps {
  report: EodReportEntity | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, status: string, comments: string) => Promise<void>;
}

export function EodReviewDialog({ report, isOpen, onClose, onSubmit }: EodReviewDialogProps) {
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!report) return null;

  const handleReview = async (status: string) => {
    try {
      setIsSubmitting(true);
      await onSubmit(report.id, status, comments);
      setComments('');
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Review EOD Report</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="bg-slate-100 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 p-3 rounded-md text-sm">
            <p><span className="font-semibold text-slate-700 dark:text-slate-300">Employee:</span> {report.employee?.user?.firstName} {report.employee?.user?.lastName}</p>
            <p><span className="font-semibold text-slate-700 dark:text-slate-300">Hours Logged:</span> {report.hoursSpent}</p>
            <p><span className="font-semibold text-slate-700 dark:text-slate-300">Productivity:</span> {report.productivityScore}%</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Manager Comments (Optional)</Label>
            <textarea
              id="comments"
              className="w-full min-h-[100px] p-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Add feedback for the employee..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex space-x-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => handleReview('REJECTED')}
            disabled={isSubmitting}
          >
            Reject
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => handleReview('APPROVED')}
            disabled={isSubmitting}
          >
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
