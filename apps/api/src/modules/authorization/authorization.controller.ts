import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { IsString, IsNotEmpty } from 'class-validator';

export class AssignRoleDto {
  @IsString()
  @IsNotEmpty()
  roleId: string;
}

@ApiTags('Authorization')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('users')
export class AuthorizationController {
  constructor(private readonly authorizationService: AuthorizationService) {}

  @Post(':userId/roles')
  @RequirePermissions('role.assign')
  @ApiOperation({ summary: 'Assign a role to a user' })
  assignRole(@Param('userId') userId: string, @Body() assignRoleDto: AssignRoleDto) {
    return this.authorizationService.assignRole(userId, assignRoleDto.roleId);
  }

  @Delete(':userId/roles/:roleId')
  @RequirePermissions('role.assign')
  @ApiOperation({ summary: 'Remove a role from a user' })
  removeRole(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.authorizationService.removeRole(userId, roleId);
  }

  @Get(':userId/roles')
  @RequirePermissions('role.read')
  @ApiOperation({ summary: 'Get all roles of a user' })
  getUserRoles(@Param('userId') userId: string) {
    return this.authorizationService.getUserRoles(userId);
  }

  @Get(':userId/permissions')
  @RequirePermissions('role.read')
  @ApiOperation({ summary: 'Get effective permissions for a user' })
  getUserPermissions(@Param('userId') userId: string) {
    return this.authorizationService.getUserEffectivePermissions(userId);
  }
}
