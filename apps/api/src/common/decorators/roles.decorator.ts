import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const ROLE_PERMISSION_KEY = 'rolePermission';
/** Explicit permission alternative to the endpoint's legacy role allowlist. */
export const RolePermission = (permission: string) => SetMetadata(ROLE_PERMISSION_KEY, permission);

/**
 * Decorator to specify which roles can access an endpoint.
 * Usage: @Roles('ADMIN', 'MANAGER')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
