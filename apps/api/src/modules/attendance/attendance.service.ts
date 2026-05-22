import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CheckInDto } from './dto/check-in.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async checkIn(userId: string, dto: CheckInDto) {
    const employee = await this.prisma.employee.findUnique({ where: { userId } });
    if (!employee) throw new NotFoundException('Employee profile not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
      },
    });
  }

  async checkOut(userId: string) {
    const employee = await this.prisma.employee.findUnique({ where: { userId } });
    if (!employee) throw new NotFoundException('Employee profile not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await this.prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId: employee.id, date: today } },
    });
    if (!attendance) throw new BadRequestException('No check-in found for today');
    if (attendance.checkOutTime) throw new BadRequestException('Already checked out');

    const checkOutTime = new Date();
    const totalHours = (checkOutTime.getTime() - attendance.checkInTime.getTime()) / (1000 * 60 * 60);

    return this.prisma.attendance.update({
      where: { id: attendance.id },
      data: { checkOutTime, totalHours: Math.round(totalHours * 100) / 100 },
    });
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
