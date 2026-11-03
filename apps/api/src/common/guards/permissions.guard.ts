import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(), context.getClass(),
    ]);
    if (!required?.length) return true;
    const { user } = context.switchToHttp().getRequest();
    if (!user?.sub) return false;

    // Read active assignments so revoked permissions cannot survive in the login cache.
    const assignments = await this.prisma.userRole.findMany({
      where: { userId: user.sub, role: { deletedAt: null, status: 'ACTIVE' } },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });
    if (assignments.some(({ role }) => role.name === 'SUPER_ADMIN')) return true;
    const permissions = new Set(assignments.flatMap(({ role }) =>
      role.permissions.map(({ permission }) => `${permission.module}.${permission.action}`),
    ));
    return required.every(permission => permissions.has(permission.replace(':', '.')));
  }
}
