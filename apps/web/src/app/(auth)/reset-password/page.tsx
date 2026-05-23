'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

import { apiClient } from '@/lib/api-client';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }

    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing reset token');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      await apiClient.post('/auth/reset-password', { token, newPassword: password });
      setStatus('success');
      setMessage('Your password has been successfully reset.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to reset password. The link might be expired.');
    }
  };

  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <div className="rounded-lg bg-error/10 px-4 py-2.5 text-sm text-red-300">
          Invalid or missing reset link.
        </div>
        <Link
          href="/forgot-password"
          className="inline-block w-full rounded-lg bg-white/5 px-4 py-2.5 font-semibold text-white transition-all hover:bg-white/10"
        >
          Request new link
        </Link>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
          <svg className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white">Password reset complete</h2>
          <p className="text-sm text-brand-200">{message}</p>
        </div>
        <Link
          href="/login"
          className="inline-block w-full rounded-lg bg-brand-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-400 hover:shadow-brand-400/30"
        >
          Sign in with new password
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold text-white">Set new password</h2>
        <p className="text-sm text-brand-200">
          Please enter your new password below.
        </p>
      </div>

      <div className="space-y-1.5 pt-4 relative">
        <label htmlFor="new-password" className="block text-sm font-medium text-brand-100">
          New Password
        </label>
        <div className="relative">
          <input
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 pr-10 text-white placeholder-brand-300/50 outline-none ring-brand-400 focus:border-brand-400 focus:ring-1"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-300 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5 relative">
        <label htmlFor="confirm-password" className="block text-sm font-medium text-brand-100">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 pr-10 text-white placeholder-brand-300/50 outline-none ring-brand-400 focus:border-brand-400 focus:ring-1"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-300 hover:text-white transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {status === 'error' && (
        <div className="rounded-lg bg-error/10 px-4 py-2.5 text-sm text-red-300">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full rounded-lg bg-brand-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-400 hover:shadow-brand-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center text-brand-200 py-8">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
