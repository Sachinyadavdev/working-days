import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SecurityService } from './security.service';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Security')
@ApiBearerAuth()
@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Roles('SUPER_ADMIN')
  @Get('devices/:userId')
  @ApiOperation({ summary: 'Get device history for a user (Super Admin)' })
  getUserDeviceHistory(@Param('userId') userId: string) {
    return this.securityService.getDeviceHistory(userId);
  }
}
