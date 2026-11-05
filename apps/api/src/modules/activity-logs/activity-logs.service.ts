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
  async onProjectUpdated(payload: { before: any; after: any; actorId?: string }) {
    const changes: Record<string, unknown> = {};
    const trackFields = ['name', 'status', 'priority', 'startDate', 'endDate', 'projectManagerId', 'description', 'clientName', 'estimatedBudget', 'tags', 'attachments'];
    for (const field of trackFields) {
      if (JSON.stringify(payload.before[field]) !== JSON.stringify(payload.after[field])) {
        changes[field] = { from: payload.before[field], to: payload.after[field] };
      }
    }
    for (const field of ['readme', 'developerDocs', 'credentials']) {
      if (JSON.stringify(payload.before[field]) !== JSON.stringify(payload.after[field])) changes[field] = 'Updated';
    }
    if (Object.keys(changes).length > 0) {
      await this.log({ userId: payload.actorId, action: 'UPDATE', entity: 'Project', entityId: payload.after.id, changes });
    }
  }

  @OnEvent('project.deleted')
  async onProjectDeleted(project: { id: string; ownerId: string; name: string; actorId?: string }) {
    await this.log({ userId: project.actorId, action: 'DELETE', entity: 'Project', entityId: project.id, changes: { name: project.name } });
  }

  @OnEvent('project.memberAdded')
  async onMemberAdded(payload: { projectId: string; projectName: string; employeeId: string; userId: string; role: string; actorId?: string; memberName?: string }) {
    await this.log({ userId: payload.actorId, action: 'MEMBER_ADDED', entity: 'Project', entityId: payload.projectId, changes: { member: payload.memberName || payload.employeeId, role: payload.role } });
  }

  @OnEvent('project.memberRemoved')
  async onMemberRemoved(payload: { projectId: string; employeeId: string; actorId?: string }) {
    await this.log({ userId: payload.actorId, action: 'MEMBER_REMOVED', entity: 'Project', entityId: payload.projectId, changes: { employeeId: payload.employeeId } });
  }

  // ────────── Task Events ──────────

  @OnEvent('project.commentAdded')
  async onCommentAdded(payload: { projectId: string; actorId?: string; commentId: string }) {
    await this.log({ userId: payload.actorId, action: 'COMMENT_ADDED', entity: 'Project', entityId: payload.projectId, changes: { commentId: payload.commentId } });
  }

  @OnEvent('project.commentDeleted')
  async onCommentDeleted(payload: { projectId: string; actorId?: string; commentId: string }) {
    await this.log({ userId: payload.actorId, action: 'COMMENT_DELETED', entity: 'Project', entityId: payload.projectId, changes: { commentId: payload.commentId } });
  }

  @OnEvent('task.created')
  async onTaskCreated(task: { id: string; reporterId: string; title: string; projectId?: string | null; assignedTo?: string | null }) {
    await this.log({ userId: task.reporterId, action: 'CREATE', entity: 'Task', entityId: task.id, changes: { title: task.title, projectId: task.projectId, assignedTo: task.assignedTo } });
  }

  @OnEvent('task.updated')
  async onTaskUpdated(payload: { before: any; after: any; actorId?: string }) {
    const changes: Record<string, unknown> = {};
    const trackFields = ['title', 'description', 'status', 'priority', 'assignedTo', 'deadline', 'estimatedHours', 'tags', 'attachments', 'projectId'];
    for (const field of trackFields) {
      if (JSON.stringify(payload.before[field]) !== JSON.stringify(payload.after[field])) {
        changes[field] = { from: payload.before[field], to: payload.after[field] };
      }
    }
    if (Object.keys(changes).length > 0) {
      await this.log({ userId: payload.actorId, action: 'UPDATE', entity: 'Task', entityId: payload.after.id, changes: { ...changes, taskTitle: payload.after.title, projectId: payload.after.projectId } });
    }
  }

  @OnEvent('task.checklist.toggled')
  async onTaskChecklistToggled(payload: { taskId: string; title: string; item: any; userId: string; projectId?: string | null }) {
    await this.log({ 
      userId: payload.userId, 
      action: payload.item.completed ? 'CHECKLIST_COMPLETED' : 'CHECKLIST_UNCOMPLETED', 
      entity: 'Task', 
      entityId: payload.taskId, 
      changes: { itemTitle: payload.item.title, taskTitle: payload.title, projectId: payload.projectId } 
    });
  }

  // ────────── Employee Events ──────────

  @OnEvent('employee.created')
  async onEmployeeCreated(employee: { id: string; userId: string }) {
    await this.log({ userId: employee.userId, action: 'CREATE', entity: 'Employee', entityId: employee.id });
  }

  // ────────── Team Events ──────────

  @OnEvent('team.created')
  async onTeamCreated(team: { id: string; userId: string; name: string }) {
    await this.log({ userId: team.userId, action: 'CREATE', entity: 'Team', entityId: team.id, changes: { name: team.name } });
  }

  @OnEvent('team.updated')
  async onTeamUpdated(payload: { before: any; after: any; actorId?: string }) {
    const changes: Record<string, unknown> = {};
    const trackFields = ['name', 'status', 'description', 'leadId', 'departmentId', 'maxCapacity'];
    for (const field of trackFields) {
      if (JSON.stringify(payload.before[field]) !== JSON.stringify(payload.after[field])) {
        changes[field] = { from: payload.before[field], to: payload.after[field] };
      }
    }
    if (Object.keys(changes).length > 0) {
      await this.log({ action: 'UPDATE', entity: 'Team', entityId: payload.after.id, changes });
    }
  }

  @OnEvent('team.deleted')
  async onTeamDeleted(team: { id: string; name: string }) {
    await this.log({ action: 'DELETE', entity: 'Team', entityId: team.id, changes: { name: team.name } });
  }

  @OnEvent('team.memberAdded')
  async onTeamMemberAdded(payload: { teamId: string; teamName: string; employeeId: string; userId?: string; role: string }) {
    await this.log({ userId: payload.userId, action: 'MEMBER_ADDED', entity: 'Team', entityId: payload.teamId, changes: { employeeId: payload.employeeId, role: payload.role, teamName: payload.teamName } });
  }

  @OnEvent('team.memberRemoved')
  async onTeamMemberRemoved(payload: { teamId: string; employeeId: string }) {
    await this.log({ action: 'MEMBER_REMOVED', entity: 'Team', entityId: payload.teamId, changes: { employeeId: payload.employeeId } });
  }

  @OnEvent('team.projectAssigned')
  async onTeamProjectAssigned(payload: { teamId: string; teamName: string; projectId: string; projectName: string }) {
    await this.log({ action: 'PROJECT_ASSIGNED', entity: 'Team', entityId: payload.teamId, changes: { projectId: payload.projectId, projectName: payload.projectName } });
  }

  @OnEvent('team.projectRemoved')
  async onTeamProjectRemoved(payload: { teamId: string; projectId: string }) {
    await this.log({ action: 'PROJECT_REMOVED', entity: 'Team', entityId: payload.teamId, changes: { projectId: payload.projectId } });
  }

  @OnEvent('team.leadChanged')
  async onTeamLeadChanged(payload: { teamId: string; oldLeadId: string | null; newLeadId: string }) {
    await this.log({ action: 'LEAD_CHANGED', entity: 'Team', entityId: payload.teamId, changes: { oldLeadId: payload.oldLeadId, newLeadId: payload.newLeadId } });
  }
}

