import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CorrectionRequestDto } from './dto/correction-request.dto';
import { CorrectionStatus } from '@ems/shared-types';

@Injectable()
export class AttendanceCorrectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async requestCorrection(userId: string, dto: CorrectionRequestDto) {
    const employee = await this.prisma.employee.findUnique({ where: { userId } });
    if (!employee) throw new NotFoundException('Employee not found');

    const attendance = await this.prisma.attendance.findUnique({ where: { id: dto.attendanceId } });
    if (!attendance) throw new NotFoundException('Attendance record not found');

    if (attendance.employeeId !== employee.id) {
      throw new BadRequestException('You can only request corrections for your own attendance');
    }

    return this.prisma.attendanceCorrection.create({
      data: {
        attendanceId: attendance.id,
        employeeId: employee.id,
        type: dto.type as any,
        requestedCheckIn: dto.requestedCheckIn ? new Date(dto.requestedCheckIn) : null,
        requestedCheckOut: dto.requestedCheckOut ? new Date(dto.requestedCheckOut) : null,
        reason: dto.reason,
      },
    });
  }

  async getMyRequests(userId: string) {
    const employee = await this.prisma.employee.findUnique({ where: { userId } });
    if (!employee) throw new NotFoundException('Employee not found');

    return this.prisma.attendanceCorrection.findMany({
      where: { employeeId: employee.id },
      include: { attendance: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllRequests() {
    return this.prisma.attendanceCorrection.findMany({
      include: { 
        employee: { include: { user: { select: { firstName: true, lastName: true } } } },
        attendance: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveRequest(userId: string, correctionId: string) {
    const approver = await this.prisma.user.findUnique({ where: { id: userId } });
    const request = await this.prisma.attendanceCorrection.findUnique({
      where: { id: correctionId },
      include: { attendance: true },
    });

    if (!request) throw new NotFoundException('Correction request not found');
    if (request.status !== CorrectionStatus.PENDING) throw new BadRequestException('Request is not pending');

    // Update Attendance
    const updateData: any = {};
    if (request.requestedCheckIn) updateData.checkInTime = request.requestedCheckIn;
    if (request.requestedCheckOut) updateData.checkOutTime = request.requestedCheckOut;
    
    // Recalculate hours if checkOut is updated (simplistic)
    if (updateData.checkOutTime) {
      const checkIn = updateData.checkInTime || request.attendance.checkInTime;
      const hours = (updateData.checkOutTime.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
      updateData.totalHours = Math.max(0, Math.round(hours * 100) / 100);
    }

    await this.prisma.attendance.update({
      where: { id: request.attendanceId },
      data: updateData,
    });

    return this.prisma.attendanceCorrection.update({
      where: { id: correctionId },
      data: {
        status: CorrectionStatus.APPROVED,
        approverId: approver?.id,
      },
    });
  }

  async rejectRequest(userId: string, correctionId: string) {
    const approver = await this.prisma.user.findUnique({ where: { id: userId } });
    const request = await this.prisma.attendanceCorrection.findUnique({ where: { id: correctionId } });

    if (!request) throw new NotFoundException('Correction request not found');
    if (request.status !== CorrectionStatus.PENDING) throw new BadRequestException('Request is not pending');

    return this.prisma.attendanceCorrection.update({
      where: { id: correctionId },
      data: {
        status: CorrectionStatus.REJECTED,
        approverId: approver?.id,
      },
    });
  }
}
