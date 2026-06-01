import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../database/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';
import { CreateLeaveCategoryDto } from './dto/create-leave-category.dto';
import { UpdateLeaveCategoryDto } from './dto/update-leave-category.dto';
import { AllocateLeaveBalanceDto, AdjustLeaveBalanceDto } from './dto/leave-balance.dto';
import { CreateLeaveCommentDto } from './dto/create-leave-comment.dto';
import { CreateHolidayDto, UpdateHolidayDto } from './dto/holiday.dto';

@Injectable()
export class LeaveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ============================
  // LEAVE CATEGORIES
  // ============================

  async findAllCategories() {
    return this.prisma.leaveCategory.findMany({ orderBy: { name: 'asc' } });
  }

  async createCategory(dto: CreateLeaveCategoryDto) {
    return this.prisma.leaveCategory.create({ data: dto });
  }

  async updateCategory(id: string, dto: UpdateLeaveCategoryDto) {
    const existing = await this.prisma.leaveCategory.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Leave category not found');
    return this.prisma.leaveCategory.update({ where: { id }, data: dto });
  }

  async deleteCategory(id: string) {
    const existing = await this.prisma.leaveCategory.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Leave category not found');
    // Soft delete - just deactivate
    return this.prisma.leaveCategory.update({ where: { id }, data: { isActive: false } });
  }

  // ============================
  // LEAVE BALANCES
  // ============================

  async getBalances(employeeId: string, year?: number) {
    const targetYear = year || new Date().getFullYear();
    return this.prisma.leaveBalance.findMany({
      where: { employeeId, year: targetYear },
      include: { category: true },
      orderBy: { category: { name: 'asc' } },
    });
  }

  async getAllBalances(year?: number) {
    const targetYear = year || new Date().getFullYear();
    return this.prisma.leaveBalance.findMany({
      where: { year: targetYear },
      include: {
        category: true,
        employee: { include: { user: { select: { firstName: true, lastName: true, email: true } }, department: true } },
      },
      orderBy: { employee: { user: { firstName: 'asc' } } },
    });
  }

  async allocateBalances(dto: AllocateLeaveBalanceDto) {
    const results = [];
    for (const alloc of dto.allocations) {
      const result = await this.prisma.leaveBalance.upsert({
        where: {
          employeeId_categoryId_year: {
            employeeId: alloc.employeeId,
            categoryId: alloc.categoryId,
            year: dto.year,
          },
        },
        update: { allocated: alloc.allocated, remarks: alloc.remarks },
        create: {
          employeeId: alloc.employeeId,
          categoryId: alloc.categoryId,
          year: dto.year,
          allocated: alloc.allocated,
          remarks: alloc.remarks,
        },
      });
      results.push(result);
    }
    return results;
  }

  async adjustBalance(id: string, dto: AdjustLeaveBalanceDto) {
    const balance = await this.prisma.leaveBalance.findUnique({ where: { id } });
    if (!balance) throw new NotFoundException('Leave balance not found');
    return this.prisma.leaveBalance.update({
      where: { id },
      data: { allocated: dto.allocated, remarks: dto.remarks },
    });
  }

  // ============================
  // LEAVE REQUESTS
  // ============================

  async findAll(pagination: PaginationDto, filters?: { status?: string; employeeId?: string; categoryId?: string; year?: number }) {
    const { skip, limit, sortOrder } = pagination;
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.employeeId) where.employeeId = filters.employeeId;
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.year) {
      const yearStart = new Date(filters.year, 0, 1);
      const yearEnd = new Date(filters.year, 11, 31);
      where.startDate = { gte: yearStart, lte: yearEnd };
    }

    const [items, total] = await Promise.all([
      this.prisma.leaveRequest.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: sortOrder },
        include: {
          employee: { include: { user: { select: { firstName: true, lastName: true, email: true, avatar: true } }, department: true } },
          category: true,
          comments: {
            include: { author: { select: { firstName: true, lastName: true, avatar: true } } },
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
      this.prisma.leaveRequest.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page: pagination.page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: pagination.page * limit < total,
        hasPreviousPage: pagination.page > 1,
      },
    };
  }

  async findOne(id: string) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        employee: { include: { user: { select: { firstName: true, lastName: true, email: true, avatar: true } }, department: true } },
        category: true,
        comments: {
          include: { author: { select: { firstName: true, lastName: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!leave) throw new NotFoundException('Leave request not found');
    return leave;
  }

  async create(dto: CreateLeaveRequestDto, userId: string) {
    const employee = await this.prisma.employee.findUnique({ where: { userId } });
    if (!employee) throw new NotFoundException('Employee profile not found');

    // Validate category exists
    const category = await this.prisma.leaveCategory.findUnique({ where: { id: dto.categoryId } });
    if (!category) throw new NotFoundException('Leave category not found');
    if (!category.isActive) throw new BadRequestException('This leave type is not active');

    // Check for overlapping leave requests
    const overlapping = await this.prisma.leaveRequest.findFirst({
      where: {
        employeeId: employee.id,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          { startDate: { lte: new Date(dto.endDate) }, endDate: { gte: new Date(dto.startDate) } },
        ],
      },
    });
    if (overlapping) throw new ConflictException('You already have an overlapping leave request for these dates');

    // Check leave balance
    const currentYear = new Date(dto.startDate).getFullYear();
    const balance = await this.prisma.leaveBalance.findUnique({
      where: {
        employeeId_categoryId_year: {
          employeeId: employee.id,
          categoryId: dto.categoryId,
          year: currentYear,
        },
      },
    });

    const available = balance ? Number(balance.allocated) + Number(balance.carryForward) - Number(balance.used) - Number(balance.pending) : 0;
    if (available < dto.totalDays) {
      throw new BadRequestException(`Insufficient leave balance. Available: ${available} days, Requested: ${dto.totalDays} days`);
    }

    // Create leave request
    const leave = await this.prisma.leaveRequest.create({
      data: {
        employeeId: employee.id,
        categoryId: dto.categoryId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        totalDays: dto.totalDays,
        halfDay: dto.halfDay || false,
        halfDayPeriod: dto.halfDayPeriod,
        reason: dto.reason,
        emergencyLeave: dto.emergencyLeave || false,
        attachmentUrl: dto.attachmentUrl,
        contactDuringLeave: dto.contactDuringLeave,
        backupEmployeeId: dto.backupEmployeeId,
        status: 'PENDING',
      },
      include: { category: true },
    });

    // Update pending balance
    if (balance) {
      await this.prisma.leaveBalance.update({
        where: { id: balance.id },
        data: { pending: { increment: dto.totalDays } },
      });
    }

    this.eventEmitter.emit('leave.requested', leave);
    return leave;
  }

  async updateStatus(id: string, dto: UpdateLeaveStatusDto, reviewerId: string) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!leave) throw new NotFoundException('Leave request not found');

    if (dto.status === 'CANCELLED') {
      if (!['PENDING', 'APPROVED', 'DRAFT'].includes(leave.status)) {
        throw new BadRequestException('Only pending, approved, or draft leave requests can be cancelled');
      }
    } else {
      if (leave.status !== 'PENDING') throw new BadRequestException('Only pending leave requests can be approved/rejected');
    }

    const updateData: any = {
      status: dto.status as any,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      reviewNote: dto.reviewNote,
    };

    if (dto.status === 'CANCELLED') {
      updateData.cancelledAt = new Date();
      updateData.cancellationReason = dto.cancellationReason;
    }

    const updated = await this.prisma.leaveRequest.update({
      where: { id },
      data: updateData,
    });

    // Update balance on status change
    const currentYear = new Date(leave.startDate).getFullYear();
    const balance = await this.prisma.leaveBalance.findUnique({
      where: {
        employeeId_categoryId_year: {
          employeeId: leave.employeeId,
          categoryId: leave.categoryId,
          year: currentYear,
        },
      },
    });

    if (balance) {
      if (dto.status === 'APPROVED') {
        await this.prisma.leaveBalance.update({
          where: { id: balance.id },
          data: {
            pending: { decrement: Number(leave.totalDays) },
            used: { increment: Number(leave.totalDays) },
          },
        });
      } else if (dto.status === 'REJECTED') {
        await this.prisma.leaveBalance.update({
          where: { id: balance.id },
          data: { pending: { decrement: Number(leave.totalDays) } },
        });
      } else if (dto.status === 'CANCELLED') {
        if (leave.status === 'PENDING') {
          await this.prisma.leaveBalance.update({
            where: { id: balance.id },
            data: { pending: { decrement: Number(leave.totalDays) } },
          });
        } else if (leave.status === 'APPROVED') {
          await this.prisma.leaveBalance.update({
            where: { id: balance.id },
            data: { used: { decrement: Number(leave.totalDays) } },
          });
        }
      }
    }

    this.eventEmitter.emit(`leave.${dto.status.toLowerCase()}`, updated);
    return updated;
  }

  // ============================
  // COMMENTS
  // ============================

  async addComment(leaveRequestId: string, dto: CreateLeaveCommentDto, userId: string) {
    const leave = await this.prisma.leaveRequest.findUnique({ where: { id: leaveRequestId } });
    if (!leave) throw new NotFoundException('Leave request not found');

    return this.prisma.leaveComment.create({
      data: {
        leaveRequestId,
        authorId: userId,
        content: dto.content,
      },
      include: { author: { select: { firstName: true, lastName: true, avatar: true } } },
    });
  }

  // ============================
  // HOLIDAYS
  // ============================

  async findAllHolidays(year?: number) {
    const where: any = {};
    if (year) {
      where.date = {
        gte: new Date(year, 0, 1),
        lte: new Date(year, 11, 31),
      };
    }
    return this.prisma.holiday.findMany({ where, orderBy: { date: 'asc' } });
  }

  async createHoliday(dto: CreateHolidayDto) {
    return this.prisma.holiday.create({
      data: {
        name: dto.name,
        date: new Date(dto.date),
        type: dto.type as any,
        region: dto.region,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateHoliday(id: string, dto: UpdateHolidayDto) {
    const existing = await this.prisma.holiday.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Holiday not found');
    const data: any = { ...dto };
    if (dto.date) data.date = new Date(dto.date);
    return this.prisma.holiday.update({ where: { id }, data });
  }

  async deleteHoliday(id: string) {
    const existing = await this.prisma.holiday.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Holiday not found');
    return this.prisma.holiday.delete({ where: { id } });
  }

  // ============================
  // DASHBOARD STATS
  // ============================

  async getEmployeeDashboard(userId: string) {
    const employee = await this.prisma.employee.findUnique({ where: { userId } });
    const currentYear = new Date().getFullYear();

    if (!employee) {
      // Return empty dashboard for admins without employee profiles
      const holidays = await this.prisma.holiday.findMany({
        where: {
          isActive: true,
          date: { gte: new Date(currentYear, 0, 1), lte: new Date(currentYear, 11, 31) },
        },
        orderBy: { date: 'asc' },
      });
      return {
        employeeId: '',
        balances: [],
        summary: { totalAllocated: 0, totalUsed: 0, totalPending: 0, totalAvailable: 0, pendingRequests: 0, approvedLeaves: 0, rejectedLeaves: 0 },
        recentRequests: [],
        holidays,
      };
    }

    const [balances, pendingCount, approvedCount, rejectedCount, recentRequests, holidays] = await Promise.all([
      this.prisma.leaveBalance.findMany({
        where: { employeeId: employee.id, year: currentYear },
        include: { category: true },
      }),
      this.prisma.leaveRequest.count({ where: { employeeId: employee.id, status: 'PENDING' } }),
      this.prisma.leaveRequest.count({ where: { employeeId: employee.id, status: 'APPROVED' } }),
      this.prisma.leaveRequest.count({ where: { employeeId: employee.id, status: 'REJECTED' } }),
      this.prisma.leaveRequest.findMany({
        where: { employeeId: employee.id },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.holiday.findMany({
        where: {
          isActive: true,
          date: { gte: new Date(currentYear, 0, 1), lte: new Date(currentYear, 11, 31) },
        },
        orderBy: { date: 'asc' },
      }),
    ]);

    // Calculate totals
    const totalAllocated = balances.reduce((sum, b) => sum + Number(b.allocated) + Number(b.carryForward), 0);
    const totalUsed = balances.reduce((sum, b) => sum + Number(b.used), 0);
    const totalPending = balances.reduce((sum, b) => sum + Number(b.pending), 0);
    const totalAvailable = totalAllocated - totalUsed - totalPending;

    return {
      employeeId: employee.id,
      balances,
      summary: {
        totalAllocated,
        totalUsed,
        totalPending,
        totalAvailable,
        pendingRequests: pendingCount,
        approvedLeaves: approvedCount,
        rejectedLeaves: rejectedCount,
      },
      recentRequests,
      holidays,
    };
  }

  async getAdminDashboard() {
    const currentYear = new Date().getFullYear();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalEmployees,
      onLeaveToday,
      pendingRequests,
      approvedThisYear,
      rejectedThisYear,
      leavesByCategory,
      monthlyTrends,
      departmentUsage,
    ] = await Promise.all([
      this.prisma.employee.count({ where: { status: 'ACTIVE' } }),
      this.prisma.leaveRequest.count({
        where: {
          status: 'APPROVED',
          startDate: { lte: today },
          endDate: { gte: today },
        },
      }),
      this.prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.leaveRequest.count({
        where: {
          status: 'APPROVED',
          startDate: { gte: new Date(currentYear, 0, 1) },
        },
      }),
      this.prisma.leaveRequest.count({
        where: {
          status: 'REJECTED',
          createdAt: { gte: new Date(currentYear, 0, 1) },
        },
      }),
      this.prisma.leaveRequest.groupBy({
        by: ['categoryId'],
        where: { status: 'APPROVED', startDate: { gte: new Date(currentYear, 0, 1) } },
        _count: true,
        _sum: { totalDays: true },
      }),
      // Monthly trends for current year
      this.prisma.$queryRaw`
        SELECT
          EXTRACT(MONTH FROM start_date) as month,
          COUNT(*)::int as count,
          SUM(total_days)::float as total_days
        FROM leave_requests
        WHERE status = 'APPROVED'
          AND start_date >= ${new Date(currentYear, 0, 1)}
          AND start_date <= ${new Date(currentYear, 11, 31)}
        GROUP BY EXTRACT(MONTH FROM start_date)
        ORDER BY month
      ` as Promise<any[]>,
      // Department usage
      this.prisma.$queryRaw`
        SELECT
          d.name as department,
          COUNT(lr.id)::int as leave_count,
          SUM(lr.total_days)::float as total_days
        FROM leave_requests lr
        JOIN employees e ON lr.employee_id = e.id
        JOIN departments d ON e.department_id = d.id
        WHERE lr.status = 'APPROVED'
          AND lr.start_date >= ${new Date(currentYear, 0, 1)}
        GROUP BY d.name
        ORDER BY leave_count DESC
      ` as Promise<any[]>,
    ]);

    // Resolve category names for leave type distribution
    const categories = await this.prisma.leaveCategory.findMany();
    const categoryMap = new Map(categories.map(c => [c.id, c]));

    const leaveTypeDistribution = leavesByCategory.map(item => ({
      categoryId: item.categoryId,
      categoryName: categoryMap.get(item.categoryId)?.name || 'Unknown',
      categoryCode: categoryMap.get(item.categoryId)?.code || '??',
      count: item._count,
      totalDays: Number(item._sum.totalDays) || 0,
    }));

    return {
      statistics: {
        totalEmployees,
        onLeaveToday,
        pendingRequests,
        approvedThisYear,
        rejectedThisYear,
      },
      charts: {
        monthlyTrends,
        leaveTypeDistribution,
        departmentUsage,
      },
    };
  }
}
