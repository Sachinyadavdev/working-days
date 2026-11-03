import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  async createWorkspace(@CurrentUser() user: any, @Body() data: { name: string; description?: string }) {
    return this.workspaceService.createWorkspace(user.sub, data);
  }

  @Get()
  async getMyWorkspaces(@CurrentUser() user: any) {
    return this.workspaceService.getWorkspaces(user.sub, user.roles);
  }

  @Get(':id')
  async getWorkspaceDetails(@Param('id') id: string, @CurrentUser() user: { sub: string; roles: string[] }) {
    return this.workspaceService.getWorkspaceById(id, user.sub, user.roles);
  }
}
