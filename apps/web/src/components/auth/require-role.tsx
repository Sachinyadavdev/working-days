'use client';

import { useAuthStore } from '@/stores/auth.store';
import React from 'react';

interface RequireRoleProps {
  role: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean;
}

export function RequireRole({
  role,
  children,
  fallback = null,
  requireAll = false,
}: RequireRoleProps) {
  const roles = useAuthStore((s) => s.user?.roles || []);

  const isSuperAdmin = roles.includes('super-admin');

  if (isSuperAdmin) {
    return <>{children}</>;
  }

  const rolesToCheck = Array.isArray(role) ? role : [role];

  const hasAccess = requireAll
    ? rolesToCheck.every((r) => roles.includes(r))
    : rolesToCheck.some((r) => roles.includes(r));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
