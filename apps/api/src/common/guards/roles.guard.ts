import { Injectable, CanActivate, ExecutionContext, Optional } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY, ROLE_PERMISSION_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../database/prisma.service';


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Optional() private prisma?: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are specified, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    // JwtStrategy supplies current active roles, not the roles from the token.
    const userRolesList: string[] = user.roles || [];

    if (userRolesList.includes('SUPER_ADMIN')) {
      return true;
    }

    if (requiredRoles.some((role) => userRolesList.includes(role))) return true;
    const permission = this.reflector.getAllAndOverride<string>(ROLE_PERMISSION_KEY, [context.getHandler(), context.getClass()]);
    if (!permission || !user.sub || !this.prisma) return false;
    const [module, action] = permission.split('.');
    const assignment = await this.prisma.userRole.findFirst({
      where: { userId: user.sub, role: {
        status: 'ACTIVE', deletedAt: null,
        permissions: { some: { permission: { module, action } } },
      } },
      select: { roleId: true },
    });
    return !!assignment;
  }
}
