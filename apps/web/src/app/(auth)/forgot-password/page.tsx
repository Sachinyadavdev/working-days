'use client';

import { useState } from 'react';
import Link from 'next/link';

import { apiClient } from '@/lib/api-client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const { data } = await apiClient.post('/auth/forgot-password', { email });
      setStatus('success');
      setMessage(data.data?.message || 'If that email address is in our database, we will send you an email to reset your password.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'An error occurred. Please try again later.');
    }
  };

  if (status === 'success') {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/10">
          <svg className="h-6 w-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white">Check your email</h2>
          <p className="text-sm text-brand-200">{message}</p>
        </div>
        <Link
          href="/login"
          className="inline-block w-full rounded-lg bg-white/5 px-4 py-2.5 font-semibold text-white transition-all hover:bg-white/10"
        >
          Return to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold text-white">Reset your password</h2>
        <p className="text-sm text-brand-200">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <div className="space-y-1.5 pt-4">
        <label htmlFor="reset-email" className="block text-sm font-medium text-brand-100">
          Email Address
        </label>
        <input
          id="reset-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-brand-300/50 outline-none ring-brand-400 focus:border-brand-400 focus:ring-1"
          placeholder="john@company.com"
        />
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
        {status === 'loading' ? 'Sending link...' : 'Send reset link'}
      </button>

      <div className="text-center text-sm">
        <Link href="/login" className="text-brand-300 hover:text-white transition-colors">
          Return to sign in
        </Link>
      </div>
    </form>
  );
}
