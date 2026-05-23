import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class WorkspaceService {
  constructor(private prisma: PrismaService) {}

  async createWorkspace(ownerId: string, data: { name: string; description?: string }) {
    return this.prisma.workspace.create({
      data: {
        name: data.name,
        description: data.description,
        ownerId,
      },
    });
  }

  async getWorkspaces(userId: string, role: string) {
    if (role === 'SUPER_ADMIN') {
      return this.prisma.workspace.findMany();
    }
    
    // Admins see what they own or are members of. Employees see what they are members of.
    return this.prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { employee: { userId } } } }
        ]
      },
      include: {
        members: true,
        projects: true,
      }
    });
  }

  async getWorkspaceById(workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: { include: { employee: true } }, projects: true },
    });
    if (!workspace) throw new NotFoundException('Workspace not found');
    return workspace;
  }
}
