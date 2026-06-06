import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationsGateway,
  ) {}

  async findByUser(userId: string, pagination: PaginationDto) {
    const { skip, limit } = pagination;
    const where = { userId, isArchived: false };
    const [items, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false, isArchived: false } }),
    ]);
    return {
      items, unreadCount,
      meta: { total, page: pagination.page, limit, totalPages: Math.ceil(total / limit), hasNextPage: pagination.page * limit < total, hasPreviousPage: pagination.page > 1 },
    };
  }

  async create(data: { userId: string; title: string; message: string; type: string; priority?: string; metadata?: Record<string, unknown> }) {
    const notification = await this.prisma.notification.create({ 
      data: { ...data, metadata: data.metadata as any, priority: (data.priority as any) || 'MEDIUM', type: data.type as any } 
    });
    
    // Push real-time notification
    this.gateway.sendToUser(data.userId, notification);
    return notification;
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
    return { message: 'All notifications marked as read' };
  }

  // --- Preferences ---
  async getPreferences(userId: string) {
    return this.prisma.notificationPreference.findMany({ where: { userId } });
  }

  async updatePreferences(userId: string, preferences: { type: string; channels: string[]; isEnabled: boolean }[]) {
    // We can upsert them
    const updates = preferences.map(pref => 
      this.prisma.notificationPreference.upsert({
        where: { userId_type: { userId, type: pref.type } },
        update: { channels: pref.channels, isEnabled: pref.isEnabled },
        create: { userId, type: pref.type, channels: pref.channels, isEnabled: pref.isEnabled }
      })
    );
    await this.prisma.$transaction(updates);
    return { message: 'Preferences updated successfully' };
  }

  // --- Announcements ---
  async createAnnouncement(data: {
    title: string;
    message: string;
    targetAudience: string;
    departmentId?: string;
    teamId?: string;
    priority: string;
    startDate?: string;
    expiryDate?: string;
    authorId: string;
  }) {
    const announcement = await this.prisma.announcement.create({
      data: {
        title: data.title,
        message: data.message,
        targetAudience: data.targetAudience as any,
        departmentId: data.departmentId,
        teamId: data.teamId,
        priority: data.priority as any,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        authorId: data.authorId,
      }
    });

    // Handle distribution based on targetAudience in background
    // (In a real app, use a queue like BullMQ. For now, do it inline or as a separate service call)
    this.distributeAnnouncement(announcement.id);
    return announcement;
  }

  async getAnnouncements() {
    return this.prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getAnnouncement(id: string) {
    return this.prisma.announcement.findUnique({ where: { id } });
  }

  private async distributeAnnouncement(announcementId: string) {
    const announcement = await this.prisma.announcement.findUnique({ where: { id: announcementId } });
    if (!announcement) return;

    let userIds: string[] = [];
    if (announcement.targetAudience === 'ALL') {
      const users = await this.prisma.user.findMany({ select: { id: true } });
      userIds = users.map(u => u.id);
    } else if (announcement.targetAudience === 'DEPARTMENT' && announcement.departmentId) {
      const employees = await this.prisma.employee.findMany({
        where: { departmentId: announcement.departmentId },
        select: { userId: true }
      });
      userIds = employees.map(e => e.userId);
    } else if (announcement.targetAudience === 'TEAM' && announcement.teamId) {
      const teamMembers = await this.prisma.teamMember.findMany({
        where: { teamId: announcement.teamId },
        include: { employee: true }
      });
      userIds = teamMembers.map(tm => tm.employee.userId);
    }

    if (userIds.length > 0) {
      const notifications = userIds.map(userId => ({
        userId,
        title: announcement.title,
        message: announcement.message,
        type: 'ANNOUNCEMENT' as any,
        priority: announcement.priority,
        announcementId: announcement.id,
      }));
      await this.prisma.notification.createMany({ data: notifications });
      
      // Notify connected users via Gateway
      this.gateway.broadcast('announcement', {
        title: announcement.title,
        message: announcement.message,
        priority: announcement.priority,
      });
    }
  }
}
