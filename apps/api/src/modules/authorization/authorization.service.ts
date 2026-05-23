import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RedisService } from '../../redis/redis.service';

const prisma = new PrismaClient();

@Injectable()
export class AuthorizationService {
  constructor(private readonly redisService: RedisService) {}

  async assignRole(userId: string, roleId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role not found');

    const existing = await prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } }
    });

    if (existing) {
      throw new BadRequestException('User already has this role');
    }

    await prisma.userRole.create({
      data: { userId, roleId }
    });

    await this.invalidateUserCache(userId);
    return { success: true };
  }

  async removeRole(userId: string, roleId: string) {
    const existing = await prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } }
    });

    if (!existing) {
      throw new BadRequestException('User does not have this role');
    }

    await prisma.userRole.delete({
      where: { userId_roleId: { userId, roleId } }
    });

    await this.invalidateUserCache(userId);
    return { success: true };
  }

  async getUserRoles(userId: string) {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: { role: true }
    });
    return userRoles.map(ur => ur.role);
  }

  async getUserEffectivePermissions(userId: string) {
    // Check cache first
    const cacheKey = `user:${userId}:permissions`;
    let permissions = await this.redisService.getJson<string[]>(cacheKey);

    if (permissions) {
      return permissions;
    }

    // Fetch from DB
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true }
            }
          }
        }
      }
    });

    const permissionSet = new Set<string>();
    
    // Determine if super admin
    const isSuperAdmin = userRoles.some(ur => ur.role.name === 'SUPER_ADMIN');

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

    permissions = Array.from(permissionSet);
    
    // Cache for 1 hour
    await this.redisService.setJson(cacheKey, permissions, 3600);
    return permissions;
  }

  private async invalidateUserCache(userId: string) {
    await this.redisService.del(`user:${userId}:permissions`);
    await this.redisService.del(`user:${userId}:roles`);
  }
}
