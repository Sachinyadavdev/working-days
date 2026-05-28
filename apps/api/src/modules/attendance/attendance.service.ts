import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CheckInDto } from './dto/check-in.dto';
import { StartBreakDto } from './dto/start-break.dto';
import { BreakType, AttendanceStatus } from '@ems/shared-types';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  private async getEmployeeByUserId(userId: string) {
    return this.prisma.employee.findUnique({ where: { userId } });
  }

  private async getEmployeeByUserIdOrThrow(userId: string) {
    const employee = await this.getEmployeeByUserId(userId);
    if (!employee) throw new NotFoundException('Employee profile not found');
    return employee;
  }

  private getToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  async checkIn(userId: string, dto: CheckInDto) {
    const employee = await this.getEmployeeByUserIdOrThrow(userId);
    const today = this.getToday();

    // Check if already checked in today
    const existing = await this.prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId: employee.id, date: today } },
    });
    if (existing) throw new BadRequestException('Already checked in today');

    return this.prisma.attendance.create({
      data: {
        employeeId: employee.id,
        date: today,
        checkInTime: new Date(),
        status: (dto.status || 'PRESENT') as any,
        notes: dto.notes,
        ipAddress: dto.ipAddress,
        deviceInfo: dto.deviceInfo,
        location: dto.location,
        shiftId: employee.shiftId,
      },
    });
  }

  async checkOut(userId: string) {
    const employee = await this.getEmployeeByUserIdOrThrow(userId);
    const today = this.getToday();

    const attendance = await this.prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId: employee.id, date: today } },
      include: { breaks: true },
    });
    if (!attendance) throw new BadRequestException('No check-in found for today');
    if (attendance.checkOutTime) throw new BadRequestException('Already checked out');

    // Check for open breaks
    const openBreak = attendance.breaks.find((b) => !b.endTime);
    if (openBreak) throw new BadRequestException('Cannot check out with an active break. End the break first.');

    const checkOutTime = new Date();
    
    // Subtract break times
    const breakMinutes = attendance.breaks.reduce((acc, b) => {
      if (b.durationMin) return acc + b.durationMin;
      return acc;
    }, 0);
    
    let totalMinutes = Math.round((checkOutTime.getTime() - attendance.checkInTime.getTime()) / (1000 * 60));
    totalMinutes -= breakMinutes;
    totalMinutes = Math.max(0, totalMinutes);
    const finalTotalHours = totalMinutes / 60;

    return this.prisma.attendance.update({
      where: { id: attendance.id },
      data: { checkOutTime, totalMinutes, totalHours: Math.round(finalTotalHours * 100) / 100 },
    });
  }

  async startBreak(userId: string, dto: StartBreakDto) {
    const employee = await this.getEmployeeByUserIdOrThrow(userId);
    const today = this.getToday();

    const attendance = await this.prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId: employee.id, date: today } },
      include: { breaks: true },
    });

    if (!attendance) throw new BadRequestException('Must check in before starting a break');
    if (attendance.checkOutTime) throw new BadRequestException('Already checked out');

    const openBreak = attendance.breaks.find((b) => !b.endTime);
    if (openBreak) throw new BadRequestException('Already on a break');

    return this.prisma.attendanceBreak.create({
      data: {
        attendanceId: attendance.id,
        startTime: new Date(),
        type: dto.type as any,
      },
    });
  }

  async endBreak(userId: string) {
    const employee = await this.getEmployeeByUserIdOrThrow(userId);
    const today = this.getToday();

    const attendance = await this.prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId: employee.id, date: today } },
      include: { breaks: true },
    });

    if (!attendance) throw new BadRequestException('No attendance record found');

    const openBreak = attendance.breaks.find((b) => !b.endTime);
    if (!openBreak) throw new BadRequestException('Not currently on a break');

    const endTime = new Date();
    const durationMin = Math.round((endTime.getTime() - openBreak.startTime.getTime()) / (1000 * 60));

    return this.prisma.attendanceBreak.update({
      where: { id: openBreak.id },
      data: {
        endTime,
        durationMin,
      },
    });
  }

  async getEmployeeStats(userId: string) {
    const employee = await this.getEmployeeByUserId(userId);
    if (!employee) return null;

    const today = this.getToday();

    const todayAttendance = await this.prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId: employee.id, date: today } },
      include: { breaks: true },
    });

    // Calculate weekly stats
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    
    const weeklyAttendances = await this.prisma.attendance.findMany({
      where: {
        employeeId: employee.id,
        date: { gte: startOfWeek, lte: today },
      },
      include: { breaks: true },
    });

    const weeklyMinutes = weeklyAttendances.reduce((acc, a) => {
      let mins = a.totalMinutes || (a.totalHours ? Number(a.totalHours) * 60 : 0);
      
      // Include live ongoing time for today's active session
      if (a.id === todayAttendance?.id && !a.checkOutTime) {
        const now = new Date();
        let elapsedMins = Math.round((now.getTime() - a.checkInTime.getTime()) / (1000 * 60));
        
        const breakMins = a.breaks?.reduce((bAcc, b) => {
          if (b.durationMin) return bAcc + b.durationMin;
          if (!b.endTime) return bAcc + Math.round((now.getTime() - b.startTime.getTime()) / (1000 * 60));
          return bAcc;
        }, 0) || 0;
        
        elapsedMins -= breakMins;
        mins = Math.max(0, elapsedMins);
      }
      return acc + mins;
    }, 0);

    const weeklyHours = Math.floor(weeklyMinutes / 60);
    const weeklyRemainingMinutes = Math.round(weeklyMinutes % 60);
    
    const presentDays = weeklyAttendances.filter(a => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.WORK_FROM_HOME).length;
    const lateDays = weeklyAttendances.filter(a => a.status === AttendanceStatus.LATE).length;

    return {
      today: todayAttendance,
      weeklyStats: {
        hours: weeklyHours,
        minutes: weeklyRemainingMinutes,
        totalHoursFormatted: `${weeklyHours}h ${weeklyRemainingMinutes}m`,
        presentDays,
        lateDays,
      }
    };
  }

  async getAdminStats() {
    const today = this.getToday();
    
    const attendances = await this.prisma.attendance.findMany({
      where: { date: today },
      include: {
        employee: {
          include: { user: { select: { firstName: true, lastName: true, avatar: true } } }
        },
        breaks: true,
      }
    });

    const totalEmployees = await this.prisma.employee.count({ where: { status: 'ACTIVE' } });
    const present = attendances.filter(a => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.WORK_FROM_HOME || a.status === AttendanceStatus.LATE);
    const late = attendances.filter(a => a.status === AttendanceStatus.LATE);
    
    const activeBreaks = attendances.filter(a => !a.checkOutTime && a.breaks.some(b => !b.endTime));
    const online = present.filter(a => !a.checkOutTime && !a.breaks.some(b => !b.endTime));
    const offline = present.filter(a => !!a.checkOutTime);
    
    return {
      totalEmployees,
      presentCount: present.length,
      absentCount: totalEmployees - present.length,
      lateCount: late.length,
      liveStatus: {
        online: online.length,
        onBreak: activeBreaks.length,
        offline: offline.length,
      },
      recentCheckIns: present.slice(0, 10), // basic recent list
    };
  }

  async getCalendar(userId: string, month: number, year: number) {
    const employee = await this.getEmployeeByUserId(userId);
    if (!employee) return [];

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendances = await this.prisma.attendance.findMany({
      where: {
        employeeId: employee.id,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });

    return attendances;
  }

  async findAll(pagination: PaginationDto) {
    const { skip, limit, sortOrder } = pagination;
    const [items, total] = await Promise.all([
      this.prisma.attendance.findMany({
        skip, take: limit, orderBy: { date: sortOrder },
        include: { employee: { include: { user: { select: { firstName: true, lastName: true } } } } },
      }),
      this.prisma.attendance.count(),
    ]);
    return { items, meta: { total, page: pagination.page, limit, totalPages: Math.ceil(total / limit), hasNextPage: pagination.page * limit < total, hasPreviousPage: pagination.page > 1 } };
  }
}
