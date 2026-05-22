import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../database/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';

@Injectable()
export class LeaveService {
  constructor(private readonly prisma: PrismaService, private readonly eventEmitter: EventEmitter2) {}

  async findAll(pagination: PaginationDto) {
    const { skip, limit, sortOrder } = pagination;
    const [items, total] = await Promise.all([
      this.prisma.leaveRequest.findMany({
        skip, take: limit, orderBy: { createdAt: sortOrder },
        include: { employee: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } },
      }),
      this.prisma.leaveRequest.count(),
    ]);
    return { items, meta: { total, page: pagination.page, limit, totalPages: Math.ceil(total / limit), hasNextPage: pagination.page * limit < total, hasPreviousPage: pagination.page > 1 } };
  }

  async create(dto: CreateLeaveRequestDto, userId: string) {
    const employee = await this.prisma.employee.findUnique({ where: { userId } });
    if (!employee) throw new NotFoundException('Employee profile not found');

    const leave = await this.prisma.leaveRequest.create({
      data: {
        employeeId: employee.id, leaveType: dto.leaveType as any,
        startDate: new Date(dto.startDate), endDate: new Date(dto.endDate),
        totalDays: dto.totalDays, reason: dto.reason,
      },
    });
    this.eventEmitter.emit('leave.requested', leave);
    return leave;
  }

  async updateStatus(id: string, dto: UpdateLeaveStatusDto, reviewerId: string) {
    const leave = await this.prisma.leaveRequest.findUnique({ where: { id } });
    if (!leave) throw new NotFoundException('Leave request not found');
    if (leave.status !== 'PENDING') throw new BadRequestException('Leave request is not pending');

    const updated = await this.prisma.leaveRequest.update({
      where: { id },
      data: { status: dto.status as any, reviewedBy: reviewerId, reviewedAt: new Date(), reviewNote: dto.reviewNote },
    });

    this.eventEmitter.emit(`leave.${dto.status.toLowerCase()}`, updated);
    return updated;
  }
}
