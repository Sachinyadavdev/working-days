import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { RedisService } from '../../redis/redis.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions are specified, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    // Try to get cached permissions from Redis
    const cacheKey = `user:${user.sub}:permissions`;
    let userPermissions = await this.redisService.getJson<string[]>(cacheKey);

    if (!userPermissions) {
      // If not cached, fetch from database
      const userRoles = await prisma.userRole.findMany({
        where: { userId: user.sub },
        include: {
          role: {
            include: { permissions: { include: { permission: true } } }
          }
        }
      });
      
      const permissionSet = new Set<string>();
      const isSuperAdmin = userRoles.some(ur => ur.role.slug === 'super-admin');

      if (isSuperAdmin) {
        const allPerms = await prisma.permission.findMany();
        allPerms.forEach(p => permissionSet.add(`${p.module}.${p.action}`));
      } else {
        userRoles.forEach(ur => {
          if (!ur.role.deletedAt) {
            ur.role.permissions.forEach(rp => {
              permissionSet.add(`${rp.permission.module}.${rp.permission.action}`);
            });
          }
        });
      }
      userPermissions = Array.from(permissionSet);
      await this.redisService.setJson(cacheKey, userPermissions, 3600);
    }

    return requiredPermissions.every((permission) =>
      userPermissions!.includes(permission),
    );
  }
}
