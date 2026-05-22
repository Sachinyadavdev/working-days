import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Teams')
@ApiBearerAuth('access-token')
@Controller({ path: 'teams', version: '1' })
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all teams' })
  async findAll(@Query() pagination: PaginationDto) { return this.teamsService.findAll(pagination); }

  @Post()
  @ApiOperation({ summary: 'Create a new team' })
  async create(@Body() dto: CreateTeamDto) { return this.teamsService.create(dto); }

  @Get(':id')
  @ApiOperation({ summary: 'Get team by ID with members' })
  async findOne(@Param('id') id: string) { return this.teamsService.findById(id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update team' })
  async update(@Param('id') id: string, @Body() dto: UpdateTeamDto) { return this.teamsService.update(id, dto); }
}
