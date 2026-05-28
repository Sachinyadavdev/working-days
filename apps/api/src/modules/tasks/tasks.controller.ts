import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Tasks')
@ApiBearerAuth('access-token')
@Controller({ path: 'tasks', version: '1' })
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tasks (supports filtering by project, status, assignee)' })
  async findAll(@Query() pagination: PaginationDto) {
    return this.tasksService.findAll(pagination, pagination.projectId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  async create(@Body() dto: CreateTaskDto, @CurrentUser('sub') userId: string) {
    return this.tasksService.create(dto, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  async findOne(@Param('id') id: string) {
    return this.tasksService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task' })
  async update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel task' })
  async cancel(@Param('id') id: string) {
    return this.tasksService.cancel(id);
  }

  @Patch(':id/checklist/:itemId/toggle')
  @ApiOperation({ summary: 'Toggle a checklist item in a task' })
  async toggleChecklistItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.tasksService.toggleChecklistItem(id, itemId, userId);
  }
}
