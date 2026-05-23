import { Controller, Get, Put, Body, UseGuards, Post } from '@nestjs/common';
import { EmployeeProfileService } from './employee-profile.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('employee-profile')
export class EmployeeProfileController {
  constructor(private readonly employeeProfileService: EmployeeProfileService) {}

  @Get('me')
  async getMyProfile(@CurrentUser() user: any) {
    return this.employeeProfileService.getProfile(user.id);
  }

  @Put('me')
  async updateMyProfile(@CurrentUser() user: any, @Body() data: any) {
    // Restrict what an employee can update about themselves
    return this.employeeProfileService.updateProfile(user.id, data);
  }

  @Get('all')
  // Should ideally be protected by @Roles('ADMIN', 'SUPER_ADMIN')
  async getAllEmployees() {
    return this.employeeProfileService.getAllEmployees();
  }

  @Post()
  // Should ideally be protected by @Roles('SUPER_ADMIN')
  async createEmployee(@Body() data: any) {
    return this.employeeProfileService.createEmployee(data);
  }
}
