import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { FilterTeamsDto } from './dto/filter-teams.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { TransferMemberDto } from './dto/transfer-member.dto';
import { AssignProjectDto } from './dto/assign-project.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Teams')
@ApiBearerAuth('access-token')
@Controller({ path: 'teams', version: '1' })
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  // ────────────────── STATS ──────────────────

  @Get('stats')
  @ApiOperation({ summary: 'Get teams dashboard analytics' })
  async getStats() {
    return this.teamsService.getStats();
  }

  // ────────────────── CRUD ──────────────────

  @Get()
  @ApiOperation({ summary: 'Get all teams with filters and pagination' })
  async findAll(@Query() filters: FilterTeamsDto) {
    return this.teamsService.findAll(filters);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new team' })
  async create(
    @Body() dto: CreateTeamDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.teamsService.create(dto, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get team by ID with full details' })
  async findOne(@Param('id') id: string) {
    return this.teamsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update team' })
  async update(@Param('id') id: string, @Body() dto: UpdateTeamDto) {
    return this.teamsService.update(id, dto);
  }

  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive team (soft delete)' })
  async archive(@Param('id') id: string) {
    return this.teamsService.archive(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate an inactive/archived team' })
  async activate(@Param('id') id: string) {
    return this.teamsService.activate(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Permanently delete team (Super Admin only)' })
  async delete(@Param('id') id: string) {
    return this.teamsService.delete(id);
  }

  // ────────────────── MEMBERS ──────────────────

  @Get(':id/members')
  @ApiOperation({ summary: 'Get team members' })
  async getMembers(@Param('id') id: string) {
    return this.teamsService.getMembers(id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to team' })
  async addMember(@Param('id') id: string, @Body() dto: AddTeamMemberDto) {
    return this.teamsService.addMember(id, dto);
  }

  @Delete(':id/members/:employeeId')
  @ApiOperation({ summary: 'Remove member from team' })
  async removeMember(
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.teamsService.removeMember(id, employeeId);
  }

  @Patch(':id/members/:employeeId')
  @ApiOperation({ summary: 'Update team member role' })
  async updateMemberRole(
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.teamsService.updateMemberRole(id, employeeId, dto);
  }

  @Post(':id/members/transfer')
  @ApiOperation({ summary: 'Transfer member to another team' })
  async transferMember(@Param('id') id: string, @Body() dto: TransferMemberDto) {
    return this.teamsService.transferMember(id, dto);
  }

  // ────────────────── PROJECTS ──────────────────

  @Get(':id/projects')
  @ApiOperation({ summary: 'Get projects assigned to team' })
  async getProjects(@Param('id') id: string) {
    return this.teamsService.getProjects(id);
  }

  @Post(':id/projects')
  @ApiOperation({ summary: 'Assign project to team' })
  async assignProject(@Param('id') id: string, @Body() dto: AssignProjectDto) {
    return this.teamsService.assignProject(id, dto);
  }

  @Delete(':id/projects/:projectId')
  @ApiOperation({ summary: 'Remove project from team' })
  async removeProject(
    @Param('id') id: string,
    @Param('projectId') projectId: string,
  ) {
    return this.teamsService.removeProject(id, projectId);
  }

  // ────────────────── TASKS & KANBAN ──────────────────

  @Get(':id/tasks')
  @ApiOperation({ summary: 'Get all tasks from team projects' })
  async getTeamTasks(@Param('id') id: string) {
    return this.teamsService.getTeamTasks(id);
  }

  @Get(':id/kanban')
  @ApiOperation({ summary: 'Get Kanban board for team' })
  async getKanbanBoard(@Param('id') id: string) {
    return this.teamsService.getKanbanBoard(id);
  }

  // ────────────────── ANALYTICS ──────────────────

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get team analytics and performance metrics' })
  async getAnalytics(@Param('id') id: string) {
    return this.teamsService.getAnalytics(id);
  }

  // ────────────────── ACTIVITY LOGS ──────────────────

  @Get(':id/activity')
  @ApiOperation({ summary: 'Get activity logs for team' })
  async getActivityLogs(@Param('id') id: string) {
    return this.teamsService.getActivityLogs(id);
  }

  // ────────────────── CALENDAR ──────────────────

  @Get(':id/calendar')
  @ApiOperation({ summary: 'Get team calendar data (deadlines, milestones, leaves)' })
  async getCalendar(@Param('id') id: string) {
    return this.teamsService.getCalendar(id);
  }
}
