import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller({ path: 'notifications/preferences', version: '1' })
@UseGuards(JwtAuthGuard)
export class PreferencesController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getPreferences(@CurrentUser('sub') userId: string) {
    return this.notificationsService.getPreferences(userId);
  }

  @Put()
  async updatePreferences(
    @CurrentUser('sub') userId: string,
    @Body() body: { type: string; channels: string[]; isEnabled: boolean }[]
  ) {
    return this.notificationsService.updatePreferences(userId, body);
  }
}
