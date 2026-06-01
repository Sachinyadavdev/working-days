import { useState, useEffect } from 'react';
import { leaveApi, Holiday } from '@/lib/api/leave';
import { Plus, Edit2, Trash2, CalendarDays } from 'lucide-react';

interface HolidaysManagementProps {
  initialHolidays?: Holiday[];
}

export function HolidaysManagement({ initialHolidays = [] }: HolidaysManagementProps) {
  const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'COMPANY',
    region: '',
    isActive: true,
  });

  const loadHolidays = async (year: number) => {
    setLoading(true);
    try {
      const data = await leaveApi.getHolidays(year);
      setHolidays(data || []);
    } catch (error) {
      console.error('Failed to load holidays:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialHolidays.length || currentYear !== new Date().getFullYear()) {
      loadHolidays(currentYear);
    }
  }, [currentYear]);

  const handleOpenCreate = () => {
    setEditingHoliday(null);
    setFormData({
      name: '',
      date: new Date().toISOString().split('T')[0],
      type: 'COMPANY',
      region: '',
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setFormData({
      name: holiday.name,
      date: new Date(holiday.date).toISOString().split('T')[0],
      type: holiday.type,
      region: holiday.region || '',
      isActive: holiday.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        date: new Date(formData.date).toISOString(),
      };

      if (editingHoliday) {
        await leaveApi.updateHoliday(editingHoliday.id, payload);
      } else {
        await leaveApi.createHoliday(payload);
      }
      
      setIsDialogOpen(false);
      loadHolidays(currentYear);
    } catch (error) {
      console.error('Failed to save holiday:', error);
      alert('Failed to save holiday. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this holiday?')) return;
    try {
      await leaveApi.deleteHoliday(id);
      loadHolidays(currentYear);
    } catch (error) {
      console.error('Failed to delete holiday:', error);
      alert('Failed to delete holiday.');
    }
  };

  const handleToggleActive = async (holiday: Holiday) => {
    try {
      await leaveApi.updateHoliday(holiday.id, { isActive: !holiday.isActive });
      loadHolidays(currentYear);
    } catch (error) {
      console.error('Failed to toggle holiday status:', error);
    }
  };

  const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Holidays Management</h2>
          <p className="text-sm text-muted-foreground">Define company-wide holidays that appear on the calendar.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            Add Holiday
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-muted-foreground">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">Holiday Name</th>
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm">
                  <div className="flex justify-center items-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-brand-500" />
                    Loading holidays...
                  </div>
                </td>
              </tr>
            ) : holidays.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm">
                  No holidays defined for {currentYear}.
                </td>
              </tr>
            ) : (
              holidays.map((holiday) => (
                <tr key={holiday.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-brand-500" />
                      {new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">{holiday.name}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium">
                      {holiday.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(holiday)}
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        holiday.isActive ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      {holiday.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(holiday)}
                      className="text-brand-600 hover:text-brand-900 mr-4 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(holiday.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-card p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">{editingHoliday ? 'Edit Holiday' : 'Add Holiday'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Holiday Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Christmas Day"
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Date</label>
                <input
                  required
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="COMPANY">Company Holiday</option>
                  <option value="PUBLIC">Public Holiday</option>
                  <option value="RESTRICTED">Restricted Holiday</option>
                </select>
              </div>

              <div className="flex items-center pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-foreground">
                  Active
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-md border border-input bg-transparent px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
