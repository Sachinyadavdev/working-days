import { Module } from '@nestjs/common';
import { EodController } from './eod.controller';
import { EodService } from './eod.service';
import { EodCronService } from './eod-cron.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [EodController],
  providers: [EodService, EodCronService],
  exports: [EodService],
})
export class EodModule {}
