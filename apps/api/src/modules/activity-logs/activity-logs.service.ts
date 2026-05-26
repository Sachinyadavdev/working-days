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

  // ────────── Project Events ──────────

  @OnEvent('project.created')
  async onProjectCreated(project: { id: string; ownerId: string; name: string }) {
    await this.log({ userId: project.ownerId, action: 'CREATE', entity: 'Project', entityId: project.id, changes: { name: project.name } });
  }

  @OnEvent('project.updated')
  async onProjectUpdated(payload: { before: any; after: any }) {
    const changes: Record<string, unknown> = {};
    const trackFields = ['name', 'status', 'priority', 'endDate', 'projectManagerId', 'description'];
    for (const field of trackFields) {
      if (String(payload.before[field]) !== String(payload.after[field])) {
        changes[field] = { from: payload.before[field], to: payload.after[field] };
      }
    }
    if (Object.keys(changes).length > 0) {
      await this.log({ userId: payload.after.ownerId, action: 'UPDATE', entity: 'Project', entityId: payload.after.id, changes });
    }
  }

  @OnEvent('project.deleted')
  async onProjectDeleted(project: { id: string; ownerId: string; name: string }) {
    await this.log({ userId: project.ownerId, action: 'DELETE', entity: 'Project', entityId: project.id, changes: { name: project.name } });
  }

  @OnEvent('project.memberAdded')
  async onMemberAdded(payload: { projectId: string; projectName: string; employeeId: string; userId: string; role: string }) {
    await this.log({ userId: payload.userId, action: 'MEMBER_ADDED', entity: 'Project', entityId: payload.projectId, changes: { employeeId: payload.employeeId, role: payload.role } });
  }

  @OnEvent('project.memberRemoved')
  async onMemberRemoved(payload: { projectId: string; employeeId: string }) {
    await this.log({ action: 'MEMBER_REMOVED', entity: 'Project', entityId: payload.projectId, changes: { employeeId: payload.employeeId } });
  }

  // ────────── Task Events ──────────

  @OnEvent('task.assigned')
  async onTaskAssigned(task: { id: string; assigneeId: string; title: string }) {
    await this.log({ userId: task.assigneeId, action: 'ASSIGN', entity: 'Task', entityId: task.id, changes: { title: task.title } });
  }

  @OnEvent('task.updated')
  async onTaskUpdated(payload: { before: any; after: any }) {
    const changes: Record<string, unknown> = {};
    const trackFields = ['status', 'priority', 'assignedTo', 'deadline'];
    for (const field of trackFields) {
      if (String(payload.before[field]) !== String(payload.after[field])) {
        changes[field] = { from: payload.before[field], to: payload.after[field] };
      }
    }
    if (Object.keys(changes).length > 0) {
      await this.log({ userId: payload.after.reporterId, action: 'UPDATE', entity: 'Task', entityId: payload.after.id, changes });
    }
  }

  // ────────── Employee Events ──────────

  @OnEvent('employee.created')
  async onEmployeeCreated(employee: { id: string; userId: string }) {
    await this.log({ userId: employee.userId, action: 'CREATE', entity: 'Employee', entityId: employee.id });
  }
}
