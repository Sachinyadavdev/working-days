'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { leaveApi } from '@/lib/api/leave';
import type {
  EmployeeLeaveDashboard,
  AdminLeaveDashboard,
  LeaveCategory,
  LeaveRequest,
} from '@/lib/api/leave';

import { LeaveSummaryCards } from '@/components/leave/leave-summary-cards';
import { LeaveCalendar } from '@/components/leave/leave-calendar';
import { ApplyLeaveDialog } from '@/components/leave/apply-leave-dialog';
import { LeaveHistory } from '@/components/leave/leave-history';
import { AdminLeaveStats } from '@/components/leave/admin-leave-stats';
import { LeaveCategoriesManagement } from '@/components/leave/leave-categories-management';
import { LeaveBalanceManagement } from '@/components/leave/leave-balance-management';
import { AdminEmployeeLeaveAnalytics } from '@/components/leave/admin-employee-leave-analytics';

export default function LeavePage() {
  const { user } = useAuthStore();
  const isAdmin = user?.roles?.some(
    (r) => r === 'SUPER_ADMIN' || r === 'ADMIN'
  );

  const [employeeDashboard, setEmployeeDashboard] =
    useState<EmployeeLeaveDashboard | null>(null);
  const [adminDashboard, setAdminDashboard] =
    useState<AdminLeaveDashboard | null>(null);
  const [categories, setCategories] = useState<LeaveCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'admin' | 'policies' | 'balances' | 'analytics'>(
    'overview'
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [cats, empDash] = await Promise.all([
        leaveApi.getCategories(),
        leaveApi.getEmployeeDashboard(),
      ]);
      setCategories(cats);
      setEmployeeDashboard(empDash);

      if (isAdmin) {
        const admDash = await leaveApi.getAdminDashboard();
        setAdminDashboard(admDash);
      }
    } catch (error) {
      console.error('Failed to load leave data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-500" />
          <p className="text-sm text-muted-foreground">Loading leave dashboard...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'history' as const, label: 'My History' },
    ...(isAdmin ? [
      { id: 'admin' as const, label: 'Admin Dashboard' },
      { id: 'analytics' as const, label: 'Employee Analytics' },
      { id: 'policies' as const, label: 'Leave Policies' },
      { id: 'balances' as const, label: 'Leave Balances' }
    ] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Leave Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Apply for leave, track your balances, and view history.
          </p>
        </div>
        <ApplyLeaveDialog categories={categories} onSuccess={loadData} />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && employeeDashboard && (
        <div className="space-y-6">
          <LeaveSummaryCards dashboard={employeeDashboard} />

          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <LeaveCalendar
                holidays={employeeDashboard.holidays}
                leaveRequests={employeeDashboard.recentRequests}
              />
            </div>
            <div className="lg:col-span-3">
              {/* Recent Requests */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Recent Leave Requests
                </h3>
                <div className="space-y-3">
                  {employeeDashboard.recentRequests.length > 0 ? (
                    employeeDashboard.recentRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between rounded-lg border border-border/60 p-3 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-600">
                            {req.category?.code || '??'}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {req.category?.name || 'Leave'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(req.startDate).toLocaleDateString(
                                'en-IN',
                                { day: '2-digit', month: 'short' }
                              )}
                              {req.startDate !== req.endDate && (
                                <>
                                  {' – '}
                                  {new Date(req.endDate).toLocaleDateString(
                                    'en-IN',
                                    { day: '2-digit', month: 'short' }
                                  )}
                                </>
                              )}{' '}
                              · {req.totalDays} day
                              {Number(req.totalDays) !== 1 && 's'}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-current/10 ${
                            req.status === 'APPROVED'
                              ? 'text-emerald-600 bg-emerald-50'
                              : req.status === 'REJECTED'
                              ? 'text-red-600 bg-red-50'
                              : req.status === 'PENDING'
                              ? 'text-amber-600 bg-amber-50'
                              : 'text-gray-500 bg-gray-50'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No leave requests yet. Click &quot;Apply Leave&quot; to get started.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && <LeaveHistory employeeMode={true} />}

      {activeTab === 'admin' && isAdmin && (
        <div className="space-y-6">
          {adminDashboard && <AdminLeaveStats dashboard={adminDashboard} />}
          <LeaveHistory employeeMode={false} />
        </div>
      )}

      {activeTab === 'policies' && isAdmin && (
        <LeaveCategoriesManagement categories={categories} onRefresh={loadData} />
      )}

      {activeTab === 'balances' && isAdmin && (
        <LeaveBalanceManagement categories={categories} />
      )}

      {activeTab === 'analytics' && isAdmin && employeeDashboard && (
        <AdminEmployeeLeaveAnalytics holidays={employeeDashboard.holidays} />
      )}
    </div>
  );
}
