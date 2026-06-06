import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { AnnouncementsController } from './announcements.controller';
import { PreferencesController } from './preferences.controller';

@Module({
  controllers: [NotificationsController, AnnouncementsController, PreferencesController],
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsService],
})
export class NotificationsModule {}
