import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ActivityLogsService } from './activity-logs.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Activity Logs')
@ApiBearerAuth('access-token')
@Controller({ path: 'activity-logs', version: '1' })
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get activity logs (Admin only)' })
  async findAll(@Query() pagination: PaginationDto) { return this.activityLogsService.findAll(pagination); }
}
