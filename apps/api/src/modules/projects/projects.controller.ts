import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { FilterProjectsDto } from './dto/filter-projects.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Projects')
@ApiBearerAuth('access-token')
@Controller({ path: 'projects', version: '1' })
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // ────────────────── STATS ──────────────────

  @Get('stats')
  @ApiOperation({ summary: 'Get project dashboard analytics' })
  async getStats() {
    return this.projectsService.getStats();
  }

  // ────────────────── CRUD ──────────────────

  @Get()
  @ApiOperation({ summary: 'Get all projects with filters' })
  async findAll(@Query() filters: FilterProjectsDto) {
    return this.projectsService.findAll(filters);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  async create(
    @Body() dto: CreateProjectDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.projectsService.create(dto, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID with full details' })
  async findOne(@Param('id') id: string) {
    return this.projectsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project' })
  async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id/archive')
  @ApiOperation({ summary: 'Archive project (soft delete)' })
  async archive(@Param('id') id: string) {
    return this.projectsService.archive(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Permanently delete project (Super Admin only)' })
  async delete(@Param('id') id: string) {
    return this.projectsService.delete(id);
  }

  // ────────────────── MEMBERS ──────────────────

  @Get(':id/members')
  @ApiOperation({ summary: 'Get project members' })
  async getMembers(@Param('id') id: string) {
    return this.projectsService.getMembers(id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to project' })
  async addMember(@Param('id') id: string, @Body() dto: AddMemberDto) {
    return this.projectsService.addMember(id, dto);
  }

  @Delete(':id/members/:employeeId')
  @ApiOperation({ summary: 'Remove member from project' })
  async removeMember(
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.projectsService.removeMember(id, employeeId);
  }

  // ────────────────── KANBAN ──────────────────

  @Get(':id/kanban')
  @ApiOperation({ summary: 'Get Kanban board for a project' })
  async getKanbanBoard(@Param('id') id: string) {
    return this.projectsService.getKanbanBoard(id);
  }

  // ────────────────── TIMELINE ──────────────────

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get project timeline data' })
  async getTimeline(@Param('id') id: string) {
    return this.projectsService.getTimeline(id);
  }

  // ────────────────── ACTIVITY ──────────────────

  @Get(':id/activity')
  @ApiOperation({ summary: 'Get activity logs for a project' })
  async getActivityLogs(@Param('id') id: string) {
    return this.projectsService.getActivityLogs(id);
  }
}
