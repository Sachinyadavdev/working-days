'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await apiClient.post('/auth/register', form);
      const result = data.data;
      setAuth(result.user, result.accessToken, result.refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="register-firstName" className="block text-sm font-medium text-brand-100">First Name</label>
          <input id="register-firstName" name="firstName" value={form.firstName} onChange={handleChange} required className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-brand-300/50 outline-none ring-brand-400 focus:border-brand-400 focus:ring-1" placeholder="John" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="register-lastName" className="block text-sm font-medium text-brand-100">Last Name</label>
          <input id="register-lastName" name="lastName" value={form.lastName} onChange={handleChange} required className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-brand-300/50 outline-none ring-brand-400 focus:border-brand-400 focus:ring-1" placeholder="Doe" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="register-email" className="block text-sm font-medium text-brand-100">Email</label>
        <input id="register-email" name="email" type="email" value={form.email} onChange={handleChange} required className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-brand-300/50 outline-none ring-brand-400 focus:border-brand-400 focus:ring-1" placeholder="john@company.com" />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="register-password" className="block text-sm font-medium text-brand-100">Password</label>
        <input id="register-password" name="password" type="password" value={form.password} onChange={handleChange} required minLength={8} className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-brand-300/50 outline-none ring-brand-400 focus:border-brand-400 focus:ring-1" placeholder="Minimum 8 characters" />
      </div>

      {error && <div className="rounded-lg bg-error/10 px-4 py-2.5 text-sm text-red-300">{error}</div>}

      <button type="submit" disabled={loading} className="w-full rounded-lg bg-brand-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-400 disabled:opacity-50">
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      <p className="text-center text-sm text-brand-300">
        Already have an account?{' '}
        <Link href="/login" className="text-white hover:underline">Sign in</Link>
      </p>
    </form>
  );
}
