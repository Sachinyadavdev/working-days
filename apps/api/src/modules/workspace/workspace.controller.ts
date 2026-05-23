import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  async createWorkspace(@CurrentUser() user: any, @Body() data: { name: string; description?: string }) {
    // Ideally use roles guard to allow only ADMIN / SUPER_ADMIN
    return this.workspaceService.createWorkspace(user.id, data);
  }

  @Get()
  async getMyWorkspaces(@CurrentUser() user: any) {
    return this.workspaceService.getWorkspaces(user.id, user.roles?.[0]);
  }

  @Get(':id')
  async getWorkspaceDetails(@Param('id') id: string) {
    return this.workspaceService.getWorkspaceById(id);
  }
}
