import { useState, useEffect, useMemo } from 'react';
import { employeeApi, Employee } from '@/lib/api/employee';
import { leaveApi, LeaveRequest, LeaveBalance, Holiday } from '@/lib/api/leave';
import { LeaveCalendar } from '@/components/leave/leave-calendar';
import { CalendarDays, Filter, PieChart, Users, CheckCircle2, XCircle, Hourglass } from 'lucide-react';

interface AdminEmployeeLeaveAnalyticsProps {
  holidays: Holiday[];
}

export function AdminEmployeeLeaveAnalytics({ holidays }: AdminEmployeeLeaveAnalyticsProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await employeeApi.getEmployees();
        setEmployees(data || []);
        if (data && data.length > 0) {
          setSelectedEmployeeId(data[0].id);
        }
      } catch (error) {
        console.error('Failed to load employees:', error);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (!selectedEmployeeId) return;

    const fetchEmployeeData = async () => {
      setLoadingData(true);
      try {
        const [reqs, bals] = await Promise.all([
          leaveApi.getRequests({ employeeId: selectedEmployeeId, year: currentYear, limit: 100 }),
          leaveApi.getEmployeeBalances(selectedEmployeeId, currentYear),
        ]);
        setRequests(reqs.items || reqs || []);
        setBalances(bals || []);
      } catch (error) {
        console.error('Failed to load employee leave data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchEmployeeData();
  }, [selectedEmployeeId, currentYear]);

  // Derived statistics
  const stats = useMemo(() => {
    let approved = 0;
    let pending = 0;
    let rejected = 0;

    requests.forEach(req => {
      if (req.status === 'APPROVED') approved++;
      else if (req.status === 'PENDING') pending++;
      else if (req.status === 'REJECTED') rejected++;
    });

    return { approved, pending, rejected };
  }, [requests]);

  const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  if (loadingEmployees) {
    return <div className="p-8 text-center text-muted-foreground text-sm flex items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-brand-500 mr-2" />
      Loading employees...
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Employee Leave Analytics</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="" disabled>Select an employee</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.user?.firstName} {emp.user?.lastName} ({emp.employeeCode})
              </option>
            ))}
          </select>
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedEmployeeId ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-4">
                <PieChart className="h-4 w-4" /> Filter Wise Status
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Approved</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-700">{stats.approved}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <div className="flex items-center gap-2 text-amber-700">
                    <Hourglass className="h-4 w-4" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <span className="text-lg font-bold text-amber-700">{stats.pending}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-red-50 border border-red-100">
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Rejected</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">{stats.rejected}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4" /> Used Balances
              </h3>
              {loadingData ? (
                <div className="text-center py-4 text-xs text-muted-foreground">Loading...</div>
              ) : balances.length > 0 ? (
                <div className="space-y-3">
                  {balances.map(b => (
                    <div key={b.id} className="flex justify-between items-center p-2 rounded hover:bg-muted/30 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">{b.category?.code}</span>
                        <span className="text-xs text-muted-foreground">{b.category?.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-foreground">{Number(b.used)}</span>
                        <span className="text-xs text-muted-foreground ml-1">/ {Number(b.allocated) + Number(b.carryForward)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-muted-foreground">No balances found for {currentYear}.</div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-3">
            {loadingData ? (
              <div className="flex items-center justify-center h-64 border border-border rounded-xl bg-card">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-brand-500" />
                  <p className="text-sm text-muted-foreground">Loading calendar data...</p>
                </div>
              </div>
            ) : (
              <LeaveCalendar holidays={holidays} leaveRequests={requests} />
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground text-sm border border-dashed border-border rounded-xl">
          Please select an employee to view their leave analytics.
        </div>
      )}
    </div>
  );
}
