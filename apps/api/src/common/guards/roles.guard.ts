import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';
import { RedisService } from '../../redis/redis.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private redisService: RedisService,
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

    let userRolesList: string[] | null = null;
    if (user.sub) {
      const cacheKey = `user:${user.sub}:roles`;
      userRolesList = await this.redisService.getJson<string[]>(cacheKey);

      if (!userRolesList) {
        const userRoles = await prisma.userRole.findMany({
          where: { userId: user.sub },
          include: { role: true },
        });
        userRolesList = userRoles.map((ur) => ur.role.slug);
        await this.redisService.setJson(cacheKey, userRolesList, 3600);
      }
    }

    if (!userRolesList && user.roles) {
      userRolesList = user.roles;
    }

    if (!userRolesList) {
      return false;
    }

    if (userRolesList.includes('super-admin')) {
      return true;
    }

    return requiredRoles.some((role) => userRolesList!.includes(role));
  }
}
