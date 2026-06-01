import { useState, useEffect } from 'react';
import { leaveApi, LeaveCategory } from '@/lib/api/leave';
import { employeeApi, Employee } from '@/lib/api/employee';

interface LeaveCategoriesManagementProps {
  categories: LeaveCategory[];
  onRefresh: () => void;
}

export function LeaveCategoriesManagement({ categories, onRefresh }: LeaveCategoriesManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<LeaveCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allocateToEmployees, setAllocateToEmployees] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);

  useEffect(() => {
    employeeApi.getEmployees().then(setEmployees).catch(console.error);
  }, []);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    totalDaysPerYear: 0,
    carryForwardAllowed: false,
    maxCarryForward: 0,
    requiresApproval: true,
  });

  const handleOpenNew = () => {
    setEditingCategory(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      totalDaysPerYear: 0,
      carryForwardAllowed: false,
      maxCarryForward: 0,
      requiresApproval: true,
    });
    setAllocateToEmployees(false);
    setSelectedEmployeeIds([]);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (category: LeaveCategory) => {
    setEditingCategory(category);
    setFormData({
      code: category.code,
      name: category.name,
      description: category.description || '',
      totalDaysPerYear: category.totalDaysPerYear,
      carryForwardAllowed: category.carryForwardAllowed,
      maxCarryForward: category.maxCarryForward,
      requiresApproval: category.requiresApproval,
    });
    setAllocateToEmployees(false);
    setSelectedEmployeeIds([]);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingCategory) {
        await leaveApi.updateCategory(editingCategory.id, formData);
        
        if (allocateToEmployees && selectedEmployeeIds.length > 0) {
          const currentYear = new Date().getFullYear();
          await leaveApi.allocateBalances({
            year: currentYear,
            allocations: selectedEmployeeIds.map(empId => ({
              employeeId: empId,
              categoryId: editingCategory.id,
              allocated: formData.totalDaysPerYear,
              remarks: 'Allocation updated upon policy edit'
            }))
          });
        }
      } else {
        const newCategory = await leaveApi.createCategory(formData);
        
        if (allocateToEmployees && selectedEmployeeIds.length > 0 && newCategory?.id) {
          const currentYear = new Date().getFullYear();
          await leaveApi.allocateBalances({
            year: currentYear,
            allocations: selectedEmployeeIds.map(empId => ({
              employeeId: empId,
              categoryId: newCategory.id,
              allocated: formData.totalDaysPerYear,
              remarks: 'Initial allocation upon policy creation'
            }))
          });
        }
      }
      setIsDialogOpen(false);
      onRefresh();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Failed to save leave category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (category: LeaveCategory) => {
    if (!confirm(`Are you sure you want to ${category.isActive ? 'deactivate' : 'activate'} this policy?`)) return;
    
    try {
      if (category.isActive) {
        await leaveApi.deleteCategory(category.id);
      } else {
        await leaveApi.updateCategory(category.id, { isActive: true });
      }
      onRefresh();
    } catch (error) {
      console.error('Failed to toggle category status:', error);
      alert('Failed to update status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Leave Policies</h2>
          <p className="text-sm text-muted-foreground">Define and manage leave types, quotas, and rules.</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 transition-colors"
        >
          Add Leave Policy
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Policy Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Code</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Days</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Carry Forward</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Approval Required</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-muted/20 transition-colors">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="font-medium text-foreground">{category.name}</div>
                  <div className="text-xs text-muted-foreground">{category.description}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  <span className="rounded-md bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
                    {category.code}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">{category.totalDaysPerYear}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  {category.carryForwardAllowed ? category.maxCarryForward : 'No'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {category.requiresApproval ? (
                    <span className="text-emerald-600 font-medium">Yes</span>
                  ) : (
                    <span className="text-amber-600 font-medium">No</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${category.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button onClick={() => handleOpenEdit(category)} className="text-brand-600 hover:text-brand-900 mr-4">Edit</button>
                  <button onClick={() => handleToggleActive(category)} className={category.isActive ? "text-red-600 hover:text-red-900" : "text-emerald-600 hover:text-emerald-900"}>
                    {category.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-muted-foreground">
                  No leave policies found. Create your first leave policy to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-card p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">{editingCategory ? 'Edit Leave Policy' : 'Create Leave Policy'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Code</label>
                  <input
                    required
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. SL"
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Sick Leave"
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Total Days (Yearly)</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={formData.totalDaysPerYear}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalDaysPerYear: Number(e.target.value) }))}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="carryForwardAllowed"
                  checked={formData.carryForwardAllowed}
                  onChange={(e) => setFormData(prev => ({ ...prev, carryForwardAllowed: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600"
                />
                <label htmlFor="carryForwardAllowed" className="ml-2 block text-sm text-foreground">
                  Allow Carry Forward
                </label>
              </div>

              {formData.carryForwardAllowed && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Max Carry Forward Days</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.maxCarryForward}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxCarryForward: Number(e.target.value) }))}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              )}

              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="requiresApproval"
                  checked={formData.requiresApproval}
                  onChange={(e) => setFormData(prev => ({ ...prev, requiresApproval: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600"
                />
                <label htmlFor="requiresApproval" className="ml-2 block text-sm text-foreground">
                  Requires Manager/Admin Approval
                </label>
              </div>

              <div className="pt-4 border-t border-border mt-4 space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allocateToEmployees"
                      checked={allocateToEmployees}
                      onChange={(e) => setAllocateToEmployees(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600"
                    />
                    <label htmlFor="allocateToEmployees" className="ml-2 block text-sm font-medium text-foreground">
                      Allocate balances to employees now
                    </label>
                  </div>
                  
                  {allocateToEmployees && (
                    <div className="pl-6 space-y-2">
                      <div className="flex items-center pb-2 mb-2 border-b border-border">
                        <input
                          type="checkbox"
                          id="selectAllEmployees"
                          checked={selectedEmployeeIds.length === employees.length && employees.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEmployeeIds(employees.map(emp => emp.id));
                            } else {
                              setSelectedEmployeeIds([]);
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600"
                        />
                        <label htmlFor="selectAllEmployees" className="ml-2 block text-sm font-medium text-foreground">
                          Select All Employees
                        </label>
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-1 rounded-md border border-input p-2 bg-background">
                        {employees.map(emp => (
                          <div key={emp.id} className="flex items-center py-1">
                            <input
                              type="checkbox"
                              id={`emp-${emp.id}`}
                              checked={selectedEmployeeIds.includes(emp.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEmployeeIds(prev => [...prev, emp.id]);
                                } else {
                                  setSelectedEmployeeIds(prev => prev.filter(id => id !== emp.id));
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600"
                            />
                            <label htmlFor={`emp-${emp.id}`} className="ml-2 block text-sm text-foreground cursor-pointer">
                              {emp.user?.firstName} {emp.user?.lastName} ({emp.employeeCode})
                            </label>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        They will be allocated {formData.totalDaysPerYear} days for the current year.
                      </p>
                    </div>
                  )}
                </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-md border border-input bg-transparent px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
