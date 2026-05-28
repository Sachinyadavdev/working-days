import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceCorrectionsController } from './attendance-corrections.controller';
import { AttendanceCorrectionsService } from './attendance-corrections.service';
import { AttendanceShiftsController } from './attendance-shifts.controller';
import { AttendanceShiftsService } from './attendance-shifts.service';

@Module({
  controllers: [AttendanceController, AttendanceCorrectionsController, AttendanceShiftsController],
  providers: [AttendanceService, AttendanceCorrectionsService, AttendanceShiftsService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
