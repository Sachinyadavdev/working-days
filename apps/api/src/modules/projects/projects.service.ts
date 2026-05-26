import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { PrismaService } from '../../database/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { FilterProjectsDto } from './dto/filter-projects.dto';
import { AddMemberDto } from './dto/add-member.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ────────────────── LIST WITH FILTERS ──────────────────

  async findAll(filters: FilterProjectsDto) {
    const { skip, limit, search, sortBy, sortOrder, status, priority, projectManagerId, deadlineBefore, deadlineAfter } = filters;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { key: { contains: search, mode: 'insensitive' } },
        { clientName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (projectManagerId) where.projectManagerId = projectManagerId;

    if (deadlineBefore || deadlineAfter) {
      const endDateFilter: Record<string, Date> = {};
      if (deadlineBefore) endDateFilter.lte = new Date(deadlineBefore);
      if (deadlineAfter) endDateFilter.gte = new Date(deadlineAfter);
      where.endDate = endDateFilter;
    }

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy || 'createdAt']: sortOrder },
        include: {
          projectManager: {
            select: {
              id: true,
              user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
            },
          },
          _count: { select: { tasks: true, members: true } },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      items: projects,
      meta: {
        total,
        page: filters.page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: filters.page * limit < total,
        hasPreviousPage: filters.page > 1,
      },
    };
  }

  // ────────────────── FIND BY ID ──────────────────

  async findById(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        projectManager: {
          select: {
            id: true,
            user: { select: { id: true, firstName: true, lastName: true, avatar: true, email: true } },
          },
        },
        members: {
          include: {
            employee: {
              select: {
                id: true,
                employeeCode: true,
                user: { select: { id: true, firstName: true, lastName: true, avatar: true, email: true } },
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            assignee: {
              select: {
                id: true,
                user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
              },
            },
          },
        },
        teams: { include: { team: true } },
        _count: { select: { tasks: true, members: true } },
      },
    });

    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  // ────────────────── CREATE ──────────────────

  async create(dto: CreateProjectDto, ownerId: string) {
    const existing = await this.prisma.project.findUnique({
      where: { key: dto.key.toUpperCase() },
    });
    if (existing) throw new ConflictException('Project key already exists');

    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        key: dto.key.toUpperCase(),
        description: dto.description,
        clientName: dto.clientName,
        estimatedBudget: dto.estimatedBudget,
        priority: dto.priority as any,
        status: (dto.status as any) || undefined,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        projectManagerId: dto.projectManagerId || undefined,
        tags: dto.tags || [],
        attachments: dto.attachments || [],
        ownerId,
      },
    });

    this.eventEmitter.emit('project.created', project);
    return project;
  }

  // ────────────────── UPDATE ──────────────────

  async update(id: string, dto: UpdateProjectDto) {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Project not found');

    const updateData: Record<string, unknown> = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.clientName !== undefined) updateData.clientName = dto.clientName;
    if (dto.estimatedBudget !== undefined) updateData.estimatedBudget = dto.estimatedBudget;
    if (dto.priority !== undefined) updateData.priority = dto.priority;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.startDate !== undefined) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) updateData.endDate = new Date(dto.endDate);
    if (dto.projectManagerId !== undefined) updateData.projectManagerId = dto.projectManagerId || null;
    if (dto.tags !== undefined) updateData.tags = dto.tags;
    if (dto.attachments !== undefined) updateData.attachments = dto.attachments;

    const project = await this.prisma.project.update({
      where: { id },
      data: updateData,
    });

    this.eventEmitter.emit('project.updated', { before: existing, after: project });
    return project;
  }

  // ────────────────── ARCHIVE ──────────────────

  async archive(id: string) {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Project not found');

    const project = await this.prisma.project.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    this.eventEmitter.emit('project.updated', { before: existing, after: project });
    return project;
  }

  // ────────────────── DELETE ──────────────────

  async delete(id: string) {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Project not found');

    await this.prisma.project.delete({ where: { id } });
    this.eventEmitter.emit('project.deleted', existing);
    return { message: 'Project deleted successfully' };
  }

  // ────────────────── STATS / ANALYTICS ──────────────────

  async getStats() {
    const now = new Date();

    const [total, active, completed, onHold, planning, cancelled] = await Promise.all([
      this.prisma.project.count(),
      this.prisma.project.count({ where: { status: 'ACTIVE' } }),
      this.prisma.project.count({ where: { status: 'COMPLETED' } }),
      this.prisma.project.count({ where: { status: 'ON_HOLD' } }),
      this.prisma.project.count({ where: { status: 'PLANNING' } }),
      this.prisma.project.count({ where: { status: 'CANCELLED' } }),
    ]);

    // Delayed = active projects past end date
    const delayed = await this.prisma.project.count({
      where: {
        status: { in: ['ACTIVE', 'PLANNING'] },
        endDate: { lt: now },
      },
    });

    // Upcoming deadlines (next 7 days)
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingDeadlines = await this.prisma.project.findMany({
      where: {
        status: { in: ['ACTIVE', 'PLANNING'] },
        endDate: { gte: now, lte: nextWeek },
      },
      select: { id: true, name: true, key: true, endDate: true, priority: true },
      orderBy: { endDate: 'asc' },
      take: 10,
    });

    // Task completion stats
    const taskStats = await this.prisma.task.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const totalTasks = taskStats.reduce((sum, s) => sum + s._count.id, 0);
    const completedTasks = taskStats.find((s) => s.status === 'COMPLETED')?._count.id || 0;
    const avgCompletionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Team member count across active projects
    const totalMembers = await this.prisma.projectMember.count({
      where: { project: { status: { in: ['ACTIVE', 'PLANNING'] } } },
    });

    return {
      total,
      active,
      completed,
      onHold,
      planning,
      cancelled,
      delayed,
      avgCompletionPercent,
      totalTasks,
      completedTasks,
      totalMembers,
      upcomingDeadlines,
    };
  }

  // ────────────────── MEMBERS ──────────────────

  async getMembers(projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    return this.prisma.projectMember.findMany({
      where: { projectId },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            user: { select: { id: true, firstName: true, lastName: true, avatar: true, email: true } },
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  async addMember(projectId: string, dto: AddMemberDto) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const employee = await this.prisma.employee.findUnique({ where: { id: dto.employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');

    // Check if already a member
    const existing = await this.prisma.projectMember.findUnique({
      where: { projectId_employeeId: { projectId, employeeId: dto.employeeId } },
    });
    if (existing) throw new ConflictException('Employee is already a member of this project');

    const member = await this.prisma.projectMember.create({
      data: {
        projectId,
        employeeId: dto.employeeId,
        role: dto.role || 'MEMBER',
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            user: { select: { id: true, firstName: true, lastName: true, avatar: true, email: true } },
          },
        },
      },
    });

    this.eventEmitter.emit('project.memberAdded', {
      projectId,
      projectName: project.name,
      employeeId: dto.employeeId,
      userId: employee.userId,
      role: dto.role || 'MEMBER',
    });

    return member;
  }

  async removeMember(projectId: string, employeeId: string) {
    const member = await this.prisma.projectMember.findUnique({
      where: { projectId_employeeId: { projectId, employeeId } },
    });
    if (!member) throw new NotFoundException('Member not found in this project');

    await this.prisma.projectMember.delete({
      where: { projectId_employeeId: { projectId, employeeId } },
    });

    this.eventEmitter.emit('project.memberRemoved', { projectId, employeeId });
    return { message: 'Member removed successfully' };
  }

  // ────────────────── KANBAN ──────────────────

  async getKanbanBoard(projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const tasks = await this.prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: {
          select: {
            id: true,
            user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          },
        },
        _count: { select: { subtasks: true, comments: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Group tasks by status
    const columns = {
      BACKLOG: tasks.filter((t) => t.status === 'BACKLOG'),
      PENDING: tasks.filter((t) => t.status === 'PENDING'),
      IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
      IN_REVIEW: tasks.filter((t) => t.status === 'IN_REVIEW'),
      TESTING: tasks.filter((t) => t.status === 'TESTING'),
      COMPLETED: tasks.filter((t) => t.status === 'COMPLETED'),
    };

    return { project: { id: project.id, name: project.name, key: project.key }, columns };
  }

  // ────────────────── TIMELINE ──────────────────

  async getTimeline(projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const tasks = await this.prisma.task.findMany({
      where: { projectId },
      select: {
        id: true,
        taskNumber: true,
        title: true,
        status: true,
        priority: true,
        startedAt: true,
        completedAt: true,
        deadline: true,
        createdAt: true,
        assignee: {
          select: {
            id: true,
            user: { select: { firstName: true, lastName: true, avatar: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      project: {
        id: project.id,
        name: project.name,
        key: project.key,
        startDate: project.startDate,
        endDate: project.endDate,
      },
      tasks,
    };
  }

  // ────────────────── ACTIVITY LOGS ──────────────────

  async getActivityLogs(projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    return this.prisma.activityLog.findMany({
      where: {
        OR: [
          { entity: 'Project', entityId: projectId },
          { entity: 'Task', entityId: { in: await this.getProjectTaskIds(projectId) } },
        ],
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  private async getProjectTaskIds(projectId: string): Promise<string[]> {
    const tasks = await this.prisma.task.findMany({
      where: { projectId },
      select: { id: true },
    });
    return tasks.map((t) => t.id);
  }
}
