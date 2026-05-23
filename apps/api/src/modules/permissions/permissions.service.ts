import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class PermissionsService {
  async findAll() {
    return prisma.permission.findMany({
      orderBy: [
        { module: 'asc' },
        { action: 'asc' }
      ]
    });
  }

  async findGroupedByModules() {
    const permissions = await this.findAll();
    const grouped = permissions.reduce((acc, curr) => {
      if (!acc[curr.module]) {
        acc[curr.module] = [];
      }
      acc[curr.module].push(curr);
      return acc;
    }, {} as Record<string, typeof permissions>);

    return Object.entries(grouped).map(([module, perms]) => ({
      module,
      permissions: perms
    }));
  }
}
