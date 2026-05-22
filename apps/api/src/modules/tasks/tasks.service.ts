import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { PrismaService } from '../../database/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(pagination: PaginationDto) {
    const { skip, limit, search, sortBy, sortOrder } = pagination;

    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy || 'createdAt']: sortOrder },
        include: {
          project: { select: { id: true, name: true, key: true } },
          assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          reporter: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { subtasks: true, comments: true } },
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      items: tasks,
      meta: {
        total,
        page: pagination.page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: pagination.page * limit < total,
        hasPreviousPage: pagination.page > 1,
      },
    };
  }

  async findById(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, key: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, avatar: true, email: true } },
        reporter: { select: { id: true, firstName: true, lastName: true, email: true } },
        subtasks: true,
        comments: {
          include: {
            author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        parent: { select: { id: true, title: true, taskNumber: true } },
      },
    });

    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async create(dto: CreateTaskDto, reporterId: string) {
    // Auto-increment task number within the project
    const lastTask = await this.prisma.task.findFirst({
      where: { projectId: dto.projectId },
      orderBy: { taskNumber: 'desc' },
      select: { taskNumber: true },
    });

    const taskNumber = (lastTask?.taskNumber ?? 0) + 1;

    const task = await this.prisma.task.create({
      data: {
        taskNumber,
        title: dto.title,
        description: dto.description,
        priority: dto.priority as any,
        type: dto.type as any,
        storyPoints: dto.storyPoints,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        projectId: dto.projectId,
        assigneeId: dto.assigneeId,
        reporterId,
        parentId: dto.parentId,
      },
      include: {
        project: { select: { id: true, name: true, key: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Emit event for notifications
    if (task.assigneeId) {
      this.eventEmitter.emit('task.assigned', task);
    }

    return task;
  }

  async update(id: string, dto: UpdateTaskDto) {
    const existing = await this.prisma.task.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Task not found');

    const updateData: Record<string, unknown> = { ...dto };

    // Track status transitions
    if (dto.status === 'IN_PROGRESS' && !existing.startedAt) {
      updateData.startedAt = new Date();
    }
    if (dto.status === 'DONE' && !existing.completedAt) {
      updateData.completedAt = new Date();
    }

    const task = await this.prisma.task.update({
      where: { id },
      data: updateData,
    });

    this.eventEmitter.emit('task.updated', { before: existing, after: task });
    return task;
  }

  async cancel(id: string) {
    const existing = await this.prisma.task.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Task not found');

    return this.prisma.task.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}
