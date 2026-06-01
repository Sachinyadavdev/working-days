'use client';

import { useState } from 'react';
import {
  X, CheckCircle2, XCircle, Clock, Send, User, CalendarDays,
  Phone, AlertTriangle, FileText, MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { leaveApi, type LeaveRequest } from '@/lib/api/leave';

interface LeaveDetailSheetProps {
  request: LeaveRequest;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  showAdminActions?: boolean;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: 'Draft', color: 'text-gray-600', bg: 'bg-gray-100' },
  PENDING: { label: 'Pending Approval', color: 'text-amber-600', bg: 'bg-amber-50' },
  APPROVED: { label: 'Approved', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  REJECTED: { label: 'Rejected', color: 'text-red-600', bg: 'bg-red-50' },
  CANCELLED: { label: 'Cancelled', color: 'text-gray-500', bg: 'bg-gray-50' },
};

export function LeaveDetailSheet({ request, open, onClose, onUpdate, showAdminActions }: LeaveDetailSheetProps) {
  const [comment, setComment] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const config = statusConfig[request.status] || statusConfig.DRAFT;

  const handleAction = async (status: 'APPROVED' | 'REJECTED') => {
    setLoading(true);
    try {
      await leaveApi.updateStatus(request.id, { status, reviewNote });
      onUpdate();
      onClose();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      await leaveApi.addComment(request.id, comment);
      setComment('');
      onUpdate();
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await leaveApi.cancelRequest(request.id, 'Cancelled by employee');
      onUpdate();
      onClose();
    } catch (err) {
      console.error('Failed to cancel:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-50 w-full max-w-md bg-background border-l border-border shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Leave Request</h3>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${config.bg} ${config.color} mt-1`}>
                {config.label}
              </span>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-5">
          {/* Employee Info */}
          {request.employee && (
            <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                {request.employee?.user?.firstName?.[0]}{request.employee?.user?.lastName?.[0]}
              </div>
              <div>
                <p className="font-medium">{request.employee?.user?.firstName} {request.employee?.user?.lastName}</p>
                <p className="text-xs text-muted-foreground">{request.employee?.user?.email}</p>
              </div>
            </div>
          )}

          {/* Leave Details */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <DetailItem icon={FileText} label="Leave Type" value={`${request.category?.name || 'Unknown'} (${request.category?.code || '??'})`} />
              <DetailItem icon={CalendarDays} label="Duration" value={`${request.totalDays} ${Number(request.totalDays) === 1 ? 'day' : 'days'}${request.halfDay ? ' (Half Day)' : ''}`} />
              <DetailItem icon={CalendarDays} label="From" value={new Date(request.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} />
              <DetailItem icon={CalendarDays} label="To" value={new Date(request.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} />
            </div>

            {request.emergencyLeave && (
              <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-2.5 text-sm text-amber-700 border border-amber-200">
                <AlertTriangle className="h-4 w-4" /> Emergency Leave
              </div>
            )}

            <div className="rounded-lg border border-border p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Reason</p>
              <p className="text-sm">{request.reason}</p>
            </div>

            {request.contactDuringLeave && (
              <DetailItem icon={Phone} label="Contact During Leave" value={request.contactDuringLeave} />
            )}

            {request.reviewNote && (
              <div className="rounded-lg border border-border p-3 bg-muted/20">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  {request.status === 'APPROVED' ? '✅ Approval' : request.status === 'REJECTED' ? '❌ Rejection' : ''} Note
                </p>
                <p className="text-sm italic">&quot;{request.reviewNote}&quot;</p>
              </div>
            )}
          </div>

          {/* Comments / Discussion Thread */}
          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-3">
              <MessageSquare className="h-4 w-4 text-brand-500" /> Discussion
            </h4>
            <div className="space-y-2.5 max-h-48 overflow-y-auto">
              {request.comments && request.comments.length > 0 ? (
                request.comments.map(c => (
                  <div key={c.id} className="flex gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                      {c.author?.firstName?.[0]}{c.author?.lastName?.[0]}
                    </div>
                    <div className="flex-1 rounded-lg bg-muted/40 p-2.5">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold">{c.author?.firstName} {c.author?.lastName}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm">{c.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">No comments yet</p>
              )}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="h-8 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <Button size="sm" variant="ghost" onClick={handleAddComment} className="h-8 w-8 p-0 shrink-0">
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Admin Actions */}
          {showAdminActions && request.status === 'PENDING' && (
            <div className="border-t border-border pt-4 space-y-3">
              <h4 className="text-sm font-semibold">Admin Action</h4>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={2}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                placeholder="Add review note (optional)..."
              />
              <div className="flex items-center gap-2">
                <Button onClick={() => handleAction('APPROVED')} disabled={loading} className="flex-1 gap-1 bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </Button>
                <Button onClick={() => handleAction('REJECTED')} disabled={loading} variant="destructive" className="flex-1 gap-1">
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
              </div>
            </div>
          )}

          {/* Employee Cancel Action */}
          {!showAdminActions && (request.status === 'PENDING' || request.status === 'DRAFT') && (
            <div className="border-t border-border pt-4">
              <Button onClick={handleCancel} disabled={loading} variant="outline" className="w-full gap-1 text-red-600 hover:text-red-700 hover:bg-red-50">
                <X className="h-4 w-4" /> Cancel Request
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
