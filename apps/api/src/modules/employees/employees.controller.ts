import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AdminCreateEmployeeDto, AdminUpdateEmployeeDto, ChangeRoleDto, ResetPasswordDto, ChangeStatusDto } from './dto/admin-employee.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Employees')
@ApiBearerAuth('access-token')
@Controller({ path: 'employees', version: '1' })
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  async findAll(@Query() pagination: PaginationDto) {
    return this.employeesService.findAll(pagination);
  }

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Create a new employee' })
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  async findOne(@Param('id') id: string) {
    return this.employeesService.findById(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Update employee' })
  async update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Post('admin-create')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Create a full employee profile with User and Role' })
  async createEmployeeAsAdmin(@Body() adminCreateEmployeeDto: AdminCreateEmployeeDto) {
    return this.employeesService.createEmployeeAsAdmin(adminCreateEmployeeDto);
  }

  @Patch(':id/admin-update')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update employee profile as admin' })
  async updateEmployeeAsAdmin(@Param('id') id: string, @Body() adminUpdateEmployeeDto: AdminUpdateEmployeeDto) {
    return this.employeesService.updateEmployeeAsAdmin(id, adminUpdateEmployeeDto);
  }

  @Patch(':id/status')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Change employee status' })
  async changeStatus(@Param('id') id: string, @Body() changeStatusDto: ChangeStatusDto) {
    return this.employeesService.changeStatus(id, changeStatusDto);
  }

  @Post(':id/reset-password')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Reset employee password' })
  async resetPasswordAsAdmin(@Param('id') id: string, @Body() resetPasswordDto: ResetPasswordDto) {
    return this.employeesService.resetPasswordAsAdmin(id, resetPasswordDto);
  }

  @Patch(':id/role')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Change employee roles' })
  async changeRole(@Param('id') id: string, @Body() changeRoleDto: ChangeRoleDto) {
    return this.employeesService.changeRole(id, changeRoleDto);
  }
}
