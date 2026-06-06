import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EodService } from './eod.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('EOD')
@ApiBearerAuth('access-token')
@Controller({ path: 'eod', version: '1' })
export class EodController {
  constructor(private readonly eodService: EodService) {}

  @Get()
  @ApiOperation({ summary: 'Get all EOD reports (Admin/Manager)' })
  async findAll(@Query() pagination: PaginationDto) {
    return this.eodService.findAll(pagination);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user EOD reports' })
  async findMyEods(@CurrentUser('sub') userId: string, @Query() pagination: PaginationDto) {
    return this.eodService.findByEmployee(userId, pagination);
  }

  @Get('today')
  @ApiOperation({ summary: 'Check if current user has submitted EOD today' })
  async checkTodaySubmission(@CurrentUser('sub') userId: string) {
    return this.eodService.checkTodaySubmission(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Submit manual EOD report' })
  async submitEod(
    @CurrentUser('sub') userId: string,
    @Body() data: any, // Using any for simplicity in Phase 1, ideally a CreateEodDto
  ) {
    return this.eodService.submitManualEod(userId, data);
  }

  @Patch(':id/review')
  @ApiOperation({ summary: 'Review an EOD report (Approve/Reject)' })
  async reviewEod(
    @Param('id') id: string,
    @CurrentUser('sub') managerUserId: string,
    @Body() data: { status: string; comments?: string },
  ) {
    return this.eodService.reviewEod(id, managerUserId, data.status, data.comments);
  }
}
