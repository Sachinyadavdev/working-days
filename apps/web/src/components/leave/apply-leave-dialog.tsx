'use client';

import { useState } from 'react';
import { Plus, AlertTriangle, Phone, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import type { LeaveCategory, CreateLeaveRequestDto } from '@/lib/api/leave';
import { leaveApi } from '@/lib/api/leave';

interface ApplyLeaveDialogProps {
  categories: LeaveCategory[];
  onSuccess: () => void;
}

export function ApplyLeaveDialog({ categories, onSuccess }: ApplyLeaveDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<CreateLeaveRequestDto>({
    categoryId: '',
    startDate: '',
    endDate: '',
    totalDays: 1,
    reason: '',
  });
  const [halfDay, setHalfDay] = useState(false);
  const [halfDayPeriod, setHalfDayPeriod] = useState('FIRST_HALF');
  const [emergencyLeave, setEmergencyLeave] = useState(false);
  const [contactDuringLeave, setContactDuringLeave] = useState('');

  const activeCategories = categories.filter(c => c.isActive);

  const calculateDays = (start: string, end: string, isHalf: boolean) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (endDate < startDate) return 0;
    let days = 0;
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) days++;
    }
    return isHalf ? 0.5 : days;
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const updated = { ...form, [field]: value };
    if (halfDay) {
      updated.endDate = updated.startDate;
      updated.totalDays = 0.5;
    } else {
      updated.totalDays = calculateDays(updated.startDate, updated.endDate, false);
    }
    setForm(updated);
  };

  const handleHalfDayToggle = (checked: boolean) => {
    setHalfDay(checked);
    if (checked) {
      setForm(prev => ({
        ...prev,
        endDate: prev.startDate,
        totalDays: 0.5,
      }));
    } else {
      setForm(prev => ({
        ...prev,
        totalDays: calculateDays(prev.startDate, prev.endDate, false),
      }));
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.categoryId || !form.startDate || !form.endDate || !form.reason) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await leaveApi.createRequest({
        ...form,
        halfDay,
        halfDayPeriod: halfDay ? halfDayPeriod : undefined,
        emergencyLeave,
        contactDuringLeave: contactDuringLeave || undefined,
      });
      setOpen(false);
      resetForm();
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ categoryId: '', startDate: '', endDate: '', totalDays: 1, reason: '' });
    setHalfDay(false);
    setHalfDayPeriod('FIRST_HALF');
    setEmergencyLeave(false);
    setContactDuringLeave('');
    setError('');
  };

  return (
    <>
      <Button onClick={() => { resetForm(); setOpen(true); }} className="gap-2">
        <Plus className="h-4 w-4" /> Apply Leave
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-brand-500" /> Apply for Leave
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to submit your leave request.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Leave Type */}
            <div className="space-y-1.5">
              <Label>Leave Type *</Label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm(prev => ({ ...prev, categoryId: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select leave type</option>
                {activeCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>From Date *</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>To Date *</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  disabled={halfDay}
                  min={form.startDate}
                />
              </div>
            </div>

            {/* Total days display */}
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-brand-50 px-4 py-2 ring-1 ring-brand-200">
                <span className="text-xs text-muted-foreground">Total Days: </span>
                <span className="text-lg font-bold text-brand-600">{form.totalDays}</span>
              </div>
            </div>

            {/* Half day + Emergency toggles */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="halfDay"
                  checked={halfDay}
                  onCheckedChange={(checked) => handleHalfDayToggle(checked as boolean)}
                />
                <Label htmlFor="halfDay" className="text-sm cursor-pointer">Half Day</Label>
              </div>
              {halfDay && (
                <select
                  value={halfDayPeriod}
                  onChange={(e) => setHalfDayPeriod(e.target.value)}
                  className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                >
                  <option value="FIRST_HALF">First Half</option>
                  <option value="SECOND_HALF">Second Half</option>
                </select>
              )}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="emergency"
                  checked={emergencyLeave}
                  onCheckedChange={(checked) => setEmergencyLeave(checked as boolean)}
                />
                <Label htmlFor="emergency" className="text-sm cursor-pointer flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Emergency
                </Label>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <Label>Reason *</Label>
              <textarea
                value={form.reason}
                onChange={(e) => setForm(prev => ({ ...prev, reason: e.target.value }))}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                placeholder="Provide the reason for your leave..."
              />
            </div>

            {/* Contact during leave */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Contact During Leave
              </Label>
              <Input
                value={contactDuringLeave}
                onChange={(e) => setContactDuringLeave(e.target.value)}
                placeholder="Phone or email..."
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
