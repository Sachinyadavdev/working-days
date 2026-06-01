import { useState, useEffect } from 'react';
import { leaveApi, LeaveBalance, LeaveCategory } from '@/lib/api/leave';
import { employeeApi, Employee } from '@/lib/api/employee';

interface LeaveBalanceManagementProps {
  categories: LeaveCategory[];
}

export function LeaveBalanceManagement({ categories }: LeaveBalanceManagementProps) {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState<LeaveBalance | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Allocate Form
  const [allocateData, setAllocateData] = useState({
    employeeId: '',
    categoryId: '',
    allocated: 0,
    remarks: '',
  });

  // Adjust Form
  const [adjustData, setAdjustData] = useState({
    allocated: 0,
    remarks: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [bals, emps] = await Promise.all([
        leaveApi.getAllBalances(currentYear),
        employeeApi.getEmployees(),
      ]);
      setBalances(bals);
      setEmployees(emps);
    } catch (error) {
      console.error('Failed to load balances:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentYear]);

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocateData.employeeId || !allocateData.categoryId) {
      alert('Please select an employee and category');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await leaveApi.allocateBalances({
        year: currentYear,
        allocations: [{
          employeeId: allocateData.employeeId,
          categoryId: allocateData.categoryId,
          allocated: allocateData.allocated,
          remarks: allocateData.remarks,
        }]
      });
      setIsAllocateOpen(false);
      setAllocateData({ employeeId: '', categoryId: '', allocated: 0, remarks: '' });
      loadData();
    } catch (error) {
      console.error('Failed to allocate balance:', error);
      alert('Failed to allocate balance. They might already have a balance for this category this year.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBalance) return;

    try {
      setIsSubmitting(true);
      await leaveApi.adjustBalance(selectedBalance.id, adjustData);
      setIsAdjustOpen(false);
      setSelectedBalance(null);
      loadData();
    } catch (error) {
      console.error('Failed to adjust balance:', error);
      alert('Failed to adjust balance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAdjust = (balance: LeaveBalance) => {
    setSelectedBalance(balance);
    setAdjustData({
      allocated: balance.allocated,
      remarks: balance.remarks || '',
    });
    setIsAdjustOpen(true);
  };

  const getEmployeeName = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return 'Unknown';
    return `${emp.user?.firstName} ${emp.user?.lastName} (${emp.employeeCode})`;
  };

  const getCategoryName = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? `${cat.name} (${cat.code})` : 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Leave Balances</h2>
          <p className="text-sm text-muted-foreground">Allocate and manage employee leave balances for the year.</p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={currentYear} 
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            onClick={() => setIsAllocateOpen(true)}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 transition-colors"
          >
            Allocate Balance
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-brand-500" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Allocated</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Used</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Carry Forward</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Available</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {balances.map((balance) => {
                const totalAvailable = Number(balance.allocated) + Number(balance.carryForward) - Number(balance.used) - Number(balance.pending);
                return (
                  <tr key={balance.id} className="hover:bg-muted/20 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                      {getEmployeeName(balance.employeeId)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                      {getCategoryName(balance.categoryId)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">{balance.allocated}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-red-600">{balance.used}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-amber-600">{balance.pending}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-blue-600">{balance.carryForward}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-emerald-600">{totalAvailable}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button onClick={() => openAdjust(balance)} className="text-brand-600 hover:text-brand-900">Adjust</button>
                    </td>
                  </tr>
                );
              })}
              {balances.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-muted-foreground">
                    No leave balances found for {currentYear}. Allocate balances to employees to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Allocate Dialog */}
      {isAllocateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Allocate Leave Balance</h2>
            <form onSubmit={handleAllocate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Employee</label>
                <select
                  required
                  value={allocateData.employeeId}
                  onChange={(e) => setAllocateData(prev => ({ ...prev, employeeId: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">Select Employee...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.user?.firstName} {emp.user?.lastName} ({emp.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Leave Category</label>
                <select
                  required
                  value={allocateData.categoryId}
                  onChange={(e) => {
                    const cat = categories.find(c => c.id === e.target.value);
                    setAllocateData(prev => ({ 
                      ...prev, 
                      categoryId: e.target.value,
                      allocated: cat ? cat.totalDaysPerYear : 0
                    }));
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">Select Category...</option>
                  {categories.filter(c => c.isActive).map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Allocated Days</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.5"
                  value={allocateData.allocated}
                  onChange={(e) => setAllocateData(prev => ({ ...prev, allocated: Number(e.target.value) }))}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Remarks (Optional)</label>
                <input
                  type="text"
                  value={allocateData.remarks}
                  onChange={(e) => setAllocateData(prev => ({ ...prev, remarks: e.target.value }))}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => setIsAllocateOpen(false)}
                  className="rounded-md border border-input bg-transparent px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Allocating...' : 'Allocate Balance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Dialog */}
      {isAdjustOpen && selectedBalance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Adjust Balance</h2>
            <div className="mb-4 text-sm text-muted-foreground">
              <p><strong>Employee:</strong> {getEmployeeName(selectedBalance.employeeId)}</p>
              <p><strong>Category:</strong> {getCategoryName(selectedBalance.categoryId)}</p>
              <p><strong>Current Allocated:</strong> {selectedBalance.allocated}</p>
            </div>
            <form onSubmit={handleAdjust} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">New Allocated Days</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.5"
                  value={adjustData.allocated}
                  onChange={(e) => setAdjustData(prev => ({ ...prev, allocated: Number(e.target.value) }))}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <p className="text-xs text-muted-foreground mt-1">This replaces the total allocated amount for the year.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Remarks</label>
                <input
                  type="text"
                  required
                  placeholder="Reason for adjustment"
                  value={adjustData.remarks}
                  onChange={(e) => setAdjustData(prev => ({ ...prev, remarks: e.target.value }))}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdjustOpen(false);
                    setSelectedBalance(null);
                  }}
                  className="rounded-md border border-input bg-transparent px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Adjusting...' : 'Save Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
