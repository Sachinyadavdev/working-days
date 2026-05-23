'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // First Login Reset Flow
  const [requiresPasswordReset, setRequiresPasswordReset] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      const result = data.data;
      
      if (result.requiresPasswordReset) {
        setRequiresPasswordReset(true);
        setTempToken(result.tempToken);
        return;
      }
      
      setAuth(result.user, result.accessToken, result.refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await apiClient.post('/auth/first-login-reset', { newPassword, token: tempToken });
      setRequiresPasswordReset(false);
      setTempToken('');
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password updated successfully. Please sign in with your new password.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (requiresPasswordReset) {
    return (
      <form onSubmit={handleResetSubmit} className="space-y-5">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white mb-2">Change Password Required</h2>
          <p className="text-sm text-brand-200">This is your first login. Please choose a new secure password.</p>
        </div>

        <div className="space-y-1.5 relative">
          <label className="block text-sm font-medium text-brand-100">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-brand-300/50 outline-none ring-brand-400 focus:border-brand-400 focus:ring-1"
            placeholder="••••••••"
          />
        </div>

        <div className="space-y-1.5 relative">
          <label className="block text-sm font-medium text-brand-100">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-brand-300/50 outline-none ring-brand-400 focus:border-brand-400 focus:ring-1"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-error/10 px-4 py-2.5 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-400 hover:shadow-brand-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating...' : 'Set New Password'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="login-email" className="block text-sm font-medium text-brand-100">
          Email Address
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-brand-300/50 outline-none ring-brand-400 focus:border-brand-400 focus:ring-1"
          placeholder="john@company.com"
        />
      </div>

      <div className="space-y-1.5 relative">
        <label htmlFor="login-password" className="block text-sm font-medium text-brand-100">
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
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

      {error && (
        <div className="rounded-lg bg-error/10 px-4 py-2.5 text-sm text-red-300">
          {error}
        </div>
      )}
      
      {success && (
        <div className="rounded-lg bg-green-500/10 px-4 py-2.5 text-sm text-green-400">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-brand-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-400 hover:shadow-brand-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <div className="flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="text-brand-300 hover:text-white transition-colors">
          Forgot password?
        </Link>
        <Link href="/register" className="text-brand-300 hover:text-white transition-colors">
          Create account
        </Link>
      </div>
    </form>
  );
}
