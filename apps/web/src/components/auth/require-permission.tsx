'use client';

import { useAuthStore } from '@/stores/auth.store';
import React from 'react';

interface RequirePermissionProps {
  permission: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean;
}

export function RequirePermission({
  permission,
  children,
  fallback = null,
  requireAll = false,
}: RequirePermissionProps) {
  const permissions = useAuthStore((s) => s.permissions);
  const roles = useAuthStore((s) => s.user?.roles || []);

  const isSuperAdmin = roles.includes('super-admin');

  if (isSuperAdmin) {
    return <>{children}</>;
  }

  const permissionsToCheck = Array.isArray(permission) ? permission : [permission];

  const hasAccess = requireAll
    ? permissionsToCheck.every((p) => permissions.includes(p))
    : permissionsToCheck.some((p) => permissions.includes(p));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
