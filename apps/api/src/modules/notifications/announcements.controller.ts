import { Controller, Post, Get, Body, UseGuards, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller({ path: 'announcements', version: '1' })
@UseGuards(JwtAuthGuard)
export class AnnouncementsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async createAnnouncement(
    @CurrentUser('sub') authorId: string,
    @Body() body: {
      title: string;
      message: string;
      targetAudience: string;
      departmentId?: string;
      teamId?: string;
      priority: string;
      startDate?: string;
      expiryDate?: string;
    }
  ) {
    return this.notificationsService.createAnnouncement({ ...body, authorId });
  }

  @Get()
  async getAnnouncements() {
    return this.notificationsService.getAnnouncements();
  }

  @Get(':id')
  async getAnnouncement(@Param('id') id: string) {
    return this.notificationsService.getAnnouncement(id);
  }
}
