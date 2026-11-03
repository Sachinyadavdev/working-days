import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

  async getWorkspaces(userId: string, roles: string[]) {
    if (roles.includes('SUPER_ADMIN')) {
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

  async getWorkspaceById(workspaceId: string, userId: string, roles: string[]) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: { include: { employee: true } }, projects: true },
    });
    if (!workspace) throw new NotFoundException('Workspace not found');
    if (!roles.includes('SUPER_ADMIN') && workspace.ownerId !== userId &&
        !workspace.members.some(member => member.employee.userId === userId)) {
      throw new ForbiddenException('You do not have access to this workspace');
    }
    return workspace;
  }
}
