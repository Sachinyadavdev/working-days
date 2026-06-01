import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LeaveService } from './leave.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';
import { CreateLeaveCategoryDto } from './dto/create-leave-category.dto';
import { UpdateLeaveCategoryDto } from './dto/update-leave-category.dto';
import { AllocateLeaveBalanceDto, AdjustLeaveBalanceDto } from './dto/leave-balance.dto';
import { CreateLeaveCommentDto } from './dto/create-leave-comment.dto';
import { CreateHolidayDto, UpdateHolidayDto } from './dto/holiday.dto';
import { LeaveRequestQueryDto } from './dto/leave-request-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Leave')
@ApiBearerAuth('access-token')
@Controller({ path: 'leave', version: '1' })
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  // ============================
  // LEAVE CATEGORIES
  // ============================

  @Get('categories')
  @ApiOperation({ summary: 'Get all leave categories' })
  async getCategories() {
    return this.leaveService.findAllCategories();
  }

  @Post('categories')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a leave category' })
  async createCategory(@Body() dto: CreateLeaveCategoryDto) {
    return this.leaveService.createCategory(dto);
  }

  @Put('categories/:id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Update a leave category' })
  async updateCategory(@Param('id') id: string, @Body() dto: UpdateLeaveCategoryDto) {
    return this.leaveService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Deactivate a leave category' })
  async deleteCategory(@Param('id') id: string) {
    return this.leaveService.deleteCategory(id);
  }

  // ============================
  // LEAVE BALANCES
  // ============================

  @Get('balances/my')
  @ApiOperation({ summary: 'Get current employee leave balances' })
  @ApiQuery({ name: 'year', required: false })
  async getMyBalances(@CurrentUser('sub') userId: string, @Query('year') year?: string) {
    const employee = await this.leaveService['prisma'].employee.findUnique({ where: { userId } });
    if (!employee) return [];
    return this.leaveService.getBalances(employee.id, year ? parseInt(year) : undefined);
  }

  @Get('balances')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get all employee leave balances' })
  @ApiQuery({ name: 'year', required: false })
  async getAllBalances(@Query('year') year?: string) {
    return this.leaveService.getAllBalances(year ? parseInt(year) : undefined);
  }

  @Get('balances/employee/:employeeId')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get leave balances for a specific employee' })
  @ApiQuery({ name: 'year', required: false })
  async getEmployeeBalances(@Param('employeeId') employeeId: string, @Query('year') year?: string) {
    return this.leaveService.getBalances(employeeId, year ? parseInt(year) : undefined);
  }

  @Post('balances/allocate')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Allocate leave balances (bulk)' })
  async allocateBalances(@Body() dto: AllocateLeaveBalanceDto) {
    return this.leaveService.allocateBalances(dto);
  }

  @Put('balances/:id/adjust')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Adjust a leave balance' })
  async adjustBalance(@Param('id') id: string, @Body() dto: AdjustLeaveBalanceDto) {
    return this.leaveService.adjustBalance(id, dto);
  }

  // ============================
  // LEAVE REQUESTS
  // ============================

  @Get('requests')
  @ApiOperation({ summary: 'Get leave requests' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'year', required: false })
  async findAll(@Query() query: LeaveRequestQueryDto) {
    return this.leaveService.findAll(query, {
      status: query.status,
      employeeId: query.employeeId,
      categoryId: query.categoryId,
      year: query.year,
    });
  }

  @Get('requests/my')
  @ApiOperation({ summary: 'Get my leave requests' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'year', required: false })
  async getMyRequests(
    @CurrentUser('sub') userId: string,
    @Query() query: LeaveRequestQueryDto,
  ) {
    const employee = await this.leaveService['prisma'].employee.findUnique({ where: { userId } });
    if (!employee) return { items: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0, hasNextPage: false, hasPreviousPage: false } };
    return this.leaveService.findAll(query, {
      status: query.status,
      employeeId: employee.id,
      year: query.year,
    });
  }

  @Get('requests/:id')
  @ApiOperation({ summary: 'Get a leave request detail' })
  async findOne(@Param('id') id: string) {
    return this.leaveService.findOne(id);
  }

  @Post('requests')
  @ApiOperation({ summary: 'Apply for leave' })
  async create(@Body() dto: CreateLeaveRequestDto, @CurrentUser('sub') userId: string) {
    return this.leaveService.create(dto, userId);
  }

  @Patch('requests/:id/status')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Approve/reject/cancel a leave request' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateLeaveStatusDto, @CurrentUser('sub') reviewerId: string) {
    return this.leaveService.updateStatus(id, dto, reviewerId);
  }

  @Patch('requests/:id/cancel')
  @ApiOperation({ summary: 'Cancel own leave request' })
  async cancelRequest(@Param('id') id: string, @CurrentUser('sub') userId: string, @Body() dto: { cancellationReason?: string }) {
    return this.leaveService.updateStatus(id, { status: 'CANCELLED', cancellationReason: dto.cancellationReason }, userId);
  }

  // ============================
  // COMMENTS
  // ============================

  @Post('requests/:id/comments')
  @ApiOperation({ summary: 'Add a comment to a leave request' })
  async addComment(@Param('id') id: string, @Body() dto: CreateLeaveCommentDto, @CurrentUser('sub') userId: string) {
    return this.leaveService.addComment(id, dto, userId);
  }

  // ============================
  // HOLIDAYS
  // ============================

  @Get('holidays')
  @ApiOperation({ summary: 'Get holidays' })
  @ApiQuery({ name: 'year', required: false })
  async getHolidays(@Query('year') year?: string) {
    return this.leaveService.findAllHolidays(year ? parseInt(year) : undefined);
  }

  @Post('holidays')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a holiday' })
  async createHoliday(@Body() dto: CreateHolidayDto) {
    return this.leaveService.createHoliday(dto);
  }

  @Put('holidays/:id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Update a holiday' })
  async updateHoliday(@Param('id') id: string, @Body() dto: UpdateHolidayDto) {
    return this.leaveService.updateHoliday(id, dto);
  }

  @Delete('holidays/:id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete a holiday' })
  async deleteHoliday(@Param('id') id: string) {
    return this.leaveService.deleteHoliday(id);
  }

  // ============================
  // DASHBOARDS
  // ============================

  @Get('dashboard/employee')
  @ApiOperation({ summary: 'Get employee leave dashboard' })
  async getEmployeeDashboard(@CurrentUser('sub') userId: string) {
    return this.leaveService.getEmployeeDashboard(userId);
  }

  @Get('dashboard/admin')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get admin leave dashboard' })
  async getAdminDashboard() {
    return this.leaveService.getAdminDashboard();
  }
}
