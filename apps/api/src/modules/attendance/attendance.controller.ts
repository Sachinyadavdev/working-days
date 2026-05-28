import { Controller, Get, Post, Body, Query, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { AttendanceService } from './attendance.service';
import { CheckInDto } from './dto/check-in.dto';
import { StartBreakDto } from './dto/start-break.dto';
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

  @Post('break/start')
  @ApiOperation({ summary: 'Start a break' })
  async startBreak(@CurrentUser('sub') userId: string, @Body() dto: StartBreakDto) {
    return this.attendanceService.startBreak(userId, dto);
  }

  @Post('break/end')
  @ApiOperation({ summary: 'End a break' })
  async endBreak(@CurrentUser('sub') userId: string) {
    return this.attendanceService.endBreak(userId);
  }

  @Get('stats/employee')
  @ApiOperation({ summary: 'Get dashboard stats for current employee' })
  async getEmployeeStats(@CurrentUser('sub') userId: string) {
    return this.attendanceService.getEmployeeStats(userId);
  }

  @Get('stats/admin')
  @ApiOperation({ summary: 'Get dashboard stats for admin view' })
  async getAdminStats() {
    return this.attendanceService.getAdminStats();
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get attendance calendar for a month' })
  async getCalendar(
    @CurrentUser('sub') userId: string,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.attendanceService.getCalendar(userId, month, year);
  }

  @Get()
  @ApiOperation({ summary: 'Get attendance records' })
  async findAll(@Query() pagination: PaginationDto) {
    return this.attendanceService.findAll(pagination);
  }
}
