import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { RedisService } from '../../redis/redis.service';

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
      // If not cached, permissions should be loaded by the auth service
      // For now, extract from user object if available
      userPermissions = user.permissions || [];
    }

    return requiredPermissions.every((permission) =>
      userPermissions!.includes(permission),
    );
  }
}
