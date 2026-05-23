import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SuperAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      totalRoles,
      totalProjects,
      totalTasks,
      recentActivity,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.role.count(),
      this.prisma.project.count(),
      this.prisma.task.count(),
      this.prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, firstName: true, lastName: true } } },
      }),
    ]);

    return {
      users: { total: totalUsers, active: activeUsers },
      roles: { total: totalRoles },
      projects: { total: totalProjects },
      tasks: { total: totalTasks },
      recentActivity,
    };
  }

  // Example of an override method, to lock or unlock an account globally
  async toggleUserStatus(userId: string, isActive: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: { id: true, email: true, isActive: true },
    });
  }
}
