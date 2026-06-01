'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, CalendarDays, CheckCircle2, XCircle, Clock, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { leaveApi, type LeaveRequest } from '@/lib/api/leave';
import { LeaveDetailSheet } from './leave-detail-sheet';

interface LeaveHistoryProps {
  employeeMode?: boolean;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  DRAFT: { label: 'Draft', color: 'text-gray-600', bg: 'bg-gray-100', icon: Clock },
  PENDING: { label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
  APPROVED: { label: 'Approved', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
  CANCELLED: { label: 'Cancelled', color: 'text-gray-500', bg: 'bg-gray-50', icon: X },
};

export function LeaveHistory({ employeeMode = true }: LeaveHistoryProps) {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (yearFilter) params.year = yearFilter;

      const result = employeeMode
        ? await leaveApi.getMyRequests(params)
        : await leaveApi.getRequests(params);

      setRequests(result.items || []);
      setMeta(result.meta || null);
    } catch (error) {
      console.error('Failed to load leave requests:', error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, yearFilter, employeeMode]);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const columns = [
    ...(employeeMode ? [] : [{
      header: 'Employee',
      cell: (item: LeaveRequest) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
            {item.employee?.user?.firstName?.[0]}{item.employee?.user?.lastName?.[0]}
          </div>
          <div>
            <p className="text-sm font-medium">{item.employee?.user?.firstName} {item.employee?.user?.lastName}</p>
            <p className="text-xs text-muted-foreground">{item.employee?.department?.name || ''}</p>
          </div>
        </div>
      ),
    }]),
    {
      header: 'Leave Type',
      cell: (item: LeaveRequest) => (
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
            {item.category?.code || '??'}
          </span>
          <p className="mt-0.5 text-xs text-muted-foreground">{item.category?.name || 'Unknown'}</p>
        </div>
      ),
    },
    {
      header: 'Duration',
      cell: (item: LeaveRequest) => (
        <div>
          <p className="text-sm font-medium">
            {new Date(item.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
            {item.startDate !== item.endDate && (
              <> – {new Date(item.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {item.totalDays} {Number(item.totalDays) === 1 ? 'day' : 'days'}
            {item.halfDay && <span className="ml-1 text-amber-600">(Half Day)</span>}
          </p>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (item: LeaveRequest) => {
        const config = statusConfig[item.status] || statusConfig.DRAFT;
        const Icon = config.icon;
        return (
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${config.bg} ${config.color} ring-1 ring-current/10`}>
            <Icon className="h-3 w-3" />
            {config.label}
          </span>
        );
      },
    },
    {
      header: 'Applied On',
      cell: (item: LeaveRequest) => (
        <span className="text-sm text-muted-foreground">
          {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      header: '',
      cell: (item: LeaveRequest) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); setSelectedRequest(item); }}
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
      className: 'w-10',
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 border-b border-border">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-brand-500" />
          {employeeMode ? 'My Leave History' : 'All Leave Requests'}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={yearFilter}
            onChange={(e) => { setYearFilter(parseInt(e.target.value)); setPage(1); }}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-3">
        <DataTable
          data={requests}
          columns={columns}
          keyExtractor={(item) => item.id}
          isLoading={loading}
          onRowClick={(item) => setSelectedRequest(item)}
          pagination={meta ? {
            page: meta.page,
            limit: meta.limit,
            total: meta.total,
            totalPages: meta.totalPages,
            onPageChange: setPage,
          } : undefined}
        />
      </div>

      {selectedRequest && (
        <LeaveDetailSheet
          request={selectedRequest}
          open={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onUpdate={loadRequests}
          showAdminActions={!employeeMode}
        />
      )}
    </div>
  );
}
