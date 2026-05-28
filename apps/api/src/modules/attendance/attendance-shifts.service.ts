import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AttendanceShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  async createShift(data: any) {
    return this.prisma.shift.create({ data });
  }

  async getAllShifts() {
    return this.prisma.shift.findMany();
  }

  async getShiftById(id: string) {
    const shift = await this.prisma.shift.findUnique({ where: { id } });
    if (!shift) throw new NotFoundException('Shift not found');
    return shift;
  }

  async updateShift(id: string, data: any) {
    return this.prisma.shift.update({ where: { id }, data });
  }

  async deleteShift(id: string) {
    return this.prisma.shift.delete({ where: { id } });
  }

  async assignShiftToEmployee(employeeId: string, shiftId: string) {
    return this.prisma.employee.update({
      where: { id: employeeId },
      data: { shiftId },
    });
  }
}
