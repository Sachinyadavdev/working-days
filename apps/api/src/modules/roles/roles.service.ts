import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient, RoleStatus } from '@prisma/client';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RedisService } from '../../redis/redis.service';

const prisma = new PrismaClient(); // In a real app this should use a PrismaService

@Injectable()
export class RolesService {
  constructor(private readonly redisService: RedisService) {}

  async create(createRoleDto: CreateRoleDto) {
    const existing = await prisma.role.findFirst({
      where: { OR: [{ name: createRoleDto.name }, { slug: createRoleDto.slug }] }
    });
    if (existing) throw new BadRequestException('Role with this name or slug already exists');

    return prisma.role.create({
      data: createRoleDto
    });
  }

  async findAll(skip: number = 0, take: number = 10) {
    const [data, total] = await Promise.all([
      prisma.role.findMany({
        where: { deletedAt: null },
        skip,
        take,
        orderBy: { priority: 'desc' },
        include: {
          _count: {
            select: { users: true, permissions: true }
          }
        }
      }),
      prisma.role.count({ where: { deletedAt: null } })
    ]);
    return { data, total, skip, take };
  }

  async findOne(id: string) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { permission: true }
        }
      }
    });
    if (!role || role.deletedAt) throw new NotFoundException('Role not found');
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role || role.deletedAt) throw new NotFoundException('Role not found');
    if (role.isSystem && updateRoleDto.slug) {
      throw new BadRequestException('Cannot change slug of a system role');
    }
    
    // Invalidate caches related to this role
    await this.invalidateRoleCache(id);

    return prisma.role.update({
      where: { id },
      data: updateRoleDto
    });
  }

  async remove(id: string) {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    if (role.isSystem) throw new BadRequestException('Cannot delete a system role');

    await this.invalidateRoleCache(id);

    return prisma.role.update({
      where: { id },
      data: { deletedAt: new Date(), status: RoleStatus.INACTIVE }
    });
  }

  async restore(id: string) {
    return prisma.role.update({
      where: { id },
      data: { deletedAt: null, status: RoleStatus.ACTIVE }
    });
  }

  async assignPermissions(id: string, permissionIds: string[]) {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');

    // Remove existing permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId: id }
    });

    // Assign new ones
    if (permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissionIds.map(permId => ({
          roleId: id,
          permissionId: permId
        }))
      });
    }

    await this.invalidateRoleCache(id);

    return this.findOne(id);
  }

  private async invalidateRoleCache(roleId: string) {
    const userRoles = await prisma.userRole.findMany({ where: { roleId }, select: { userId: true } });
    for (const ur of userRoles) {
      await this.redisService.del(`user:${ur.userId}:permissions`);
      await this.redisService.del(`user:${ur.userId}:roles`);
    }
  }
}
