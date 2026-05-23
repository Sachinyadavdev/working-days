import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SuperAdminService } from './super-admin.service';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Super Admin')
@ApiBearerAuth()
@Roles('SUPER_ADMIN')
@Controller('super-admin')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get global dashboard statistics for Super Admin' })
  getDashboardStats() {
    return this.superAdminService.getDashboardStats();
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Lock or unlock a user account globally' })
  toggleUserStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.superAdminService.toggleUserStatus(id, isActive);
  }
}
