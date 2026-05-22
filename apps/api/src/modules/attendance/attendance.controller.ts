import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { AttendanceService } from './attendance.service';
import { CheckInDto } from './dto/check-in.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Attendance')
@ApiBearerAuth('access-token')
@Controller({ path: 'attendance', version: '1' })
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  @ApiOperation({ summary: 'Check in for the day' })
  async checkIn(@CurrentUser('sub') userId: string, @Body() dto: CheckInDto) {
    return this.attendanceService.checkIn(userId, dto);
  }

  @Post('check-out')
  @ApiOperation({ summary: 'Check out for the day' })
  async checkOut(@CurrentUser('sub') userId: string) {
    return this.attendanceService.checkOut(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get attendance records' })
  async findAll(@Query() pagination: PaginationDto) {
    return this.attendanceService.findAll(pagination);
  }
}
