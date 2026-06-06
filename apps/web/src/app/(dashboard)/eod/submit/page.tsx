'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { eodApi } from '@/lib/api/eod';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function SubmitEodPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingToday, setCheckingToday] = useState(true);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    tasksWorkedOn: '',
    description: '',
    challengesFaced: '',
    tomorrowPlan: '',
    hoursSpent: 8,
  });

  useEffect(() => {
    eodApi.checkToday().then((res) => {
      if (res.success && res.data.submitted) {
        setAlreadySubmitted(true);
      }
      setCheckingToday(false);
    }).catch(() => {
      setCheckingToday(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await eodApi.submit(formData);
      router.push('/eod');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit EOD report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingToday) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  }

  if (alreadySubmitted) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md flex">
          <AlertCircle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Already Submitted</h3>
            <p className="mt-1 text-sm text-yellow-700">
              You have already submitted an EOD report for today. Please check the EOD dashboard.
            </p>
          </div>
        </div>
        <Button onClick={() => router.push('/eod')} className="mt-4">Back to EODs</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <Card>
        <CardHeader>
          <CardTitle>Submit End of Day Report</CardTitle>
          <CardDescription>Document your progress, challenges, and plan for tomorrow.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="tasksWorkedOn">Tasks Worked On *</Label>
              <Input 
                id="tasksWorkedOn" 
                placeholder="E.g., Built login page, Fixed Bug #123" 
                required
                value={formData.tasksWorkedOn}
                onChange={(e) => setFormData({ ...formData, tasksWorkedOn: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description (Optional)</Label>
              <textarea 
                id="description" 
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                placeholder="Provide more context on what you achieved..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="challengesFaced">Challenges Faced</Label>
                <textarea 
                  id="challengesFaced" 
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px]"
                  placeholder="Any blockers?"
                  value={formData.challengesFaced}
                  onChange={(e) => setFormData({ ...formData, challengesFaced: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tomorrowPlan">Plan for Tomorrow</Label>
                <textarea 
                  id="tomorrowPlan" 
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px]"
                  placeholder="What will you work on next?"
                  value={formData.tomorrowPlan}
                  onChange={(e) => setFormData({ ...formData, tomorrowPlan: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hoursSpent">Hours Spent Working *</Label>
              <Input 
                id="hoursSpent" 
                type="number" 
                step="0.5"
                min="0"
                max="24"
                required
                className="w-32"
                value={formData.hoursSpent}
                onChange={(e) => setFormData({ ...formData, hoursSpent: parseFloat(e.target.value) })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => router.push('/eod')} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-brand-600 hover:bg-brand-700" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Submit Report
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
