import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LeaveService } from './leave.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Leave')
@ApiBearerAuth('access-token')
@Controller({ path: 'leave-requests', version: '1' })
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Get()
  @ApiOperation({ summary: 'Get leave requests' })
  async findAll(@Query() pagination: PaginationDto) { return this.leaveService.findAll(pagination); }

  @Post()
  @ApiOperation({ summary: 'Submit a leave request' })
  async create(@Body() dto: CreateLeaveRequestDto, @CurrentUser('sub') userId: string) { return this.leaveService.create(dto, userId); }

  @Patch(':id/status')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Approve/reject a leave request' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateLeaveStatusDto, @CurrentUser('sub') reviewerId: string) {
    return this.leaveService.updateStatus(id, dto, reviewerId);
  }
}
