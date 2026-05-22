import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../database/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ActivityLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(pagination: PaginationDto) {
    const { skip, limit } = pagination;
    const [items, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      }),
      this.prisma.activityLog.count(),
    ]);
    return { items, meta: { total, page: pagination.page, limit, totalPages: Math.ceil(total / limit), hasNextPage: pagination.page * limit < total, hasPreviousPage: pagination.page > 1 } };
  }

  async log(data: { userId?: string; action: string; entity: string; entityId: string; changes?: Record<string, unknown>; ipAddress?: string; userAgent?: string }) {
    return this.prisma.activityLog.create({ data: data as any });
  }

  // Event listeners for automatic activity logging
  @OnEvent('project.created')
  async onProjectCreated(project: { id: string; ownerId: string; name: string }) {
    await this.log({ userId: project.ownerId, action: 'CREATE', entity: 'Project', entityId: project.id, changes: { name: project.name } });
  }

  @OnEvent('task.assigned')
  async onTaskAssigned(task: { id: string; assigneeId: string; title: string }) {
    await this.log({ userId: task.assigneeId, action: 'ASSIGN', entity: 'Task', entityId: task.id, changes: { title: task.title } });
  }

  @OnEvent('employee.created')
  async onEmployeeCreated(employee: { id: string; userId: string }) {
    await this.log({ userId: employee.userId, action: 'CREATE', entity: 'Employee', entityId: employee.id });
  }
}
