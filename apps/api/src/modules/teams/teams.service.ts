import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { PrismaService } from '../../database/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { FilterTeamsDto } from './dto/filter-teams.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { TransferMemberDto } from './dto/transfer-member.dto';
import { AssignProjectDto } from './dto/assign-project.dto';

@Injectable()
export class TeamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ────────────────── LIST WITH FILTERS ──────────────────

  async findAll(filters: FilterTeamsDto) {
    const { skip, limit, search, sortBy, sortOrder, status, departmentId } = filters;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status;
    if (departmentId) where.departmentId = departmentId;

    const [teams, total] = await Promise.all([
      this.prisma.team.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy || 'createdAt']: sortOrder },
        include: {
          department: { select: { id: true, name: true, code: true } },
          _count: { select: { members: true, projects: true } },
        },
      }),
      this.prisma.team.count({ where }),
    ]);

    // Enrich teams with lead info
    const teamIds = teams.map((t) => t.id);
    const leads = teams.filter((t) => t.leadId).map((t) => t.leadId!);
    const leadEmployees = leads.length > 0 ? await this.prisma.employee.findMany({
      where: { id: { in: leads } },
      select: {
        id: true,
        user: { select: { id: true, firstName: true, lastName: true, avatar: true, email: true } },
      },
    }) : [];

    const leadMap = new Map(leadEmployees.map((e) => [e.id, e]));

    const enrichedTeams = teams.map((team) => ({
      ...team,
      lead: team.leadId ? leadMap.get(team.leadId) || null : null,
    }));

    return {
      items: enrichedTeams,
      meta: {
        total,
        page: filters.page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: filters.page * limit < total,
        hasPreviousPage: filters.page > 1,
      },
    };
  }

  // ────────────────── FIND BY ID ──────────────────

  async findById(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        department: { select: { id: true, name: true, code: true } },
        members: {
          include: {
            employee: {
              select: {
                id: true,
                employeeCode: true,
                designationId: true,
                designation: { select: { id: true, name: true } },
                user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        projects: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                key: true,
                status: true,
                priority: true,
                startDate: true,
                endDate: true,
                _count: { select: { tasks: true, members: true } },
              },
            },
          },
        },
        _count: { select: { members: true, projects: true } },
      },
    });

    if (!team) throw new NotFoundException('Team not found');

    // Enrich with lead info
    let lead = null;
    if (team.leadId) {
      lead = await this.prisma.employee.findUnique({
        where: { id: team.leadId },
        select: {
          id: true,
          employeeCode: true,
          user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
        },
      });
    }

    return { ...team, lead };
  }

  // ────────────────── CREATE ──────────────────

  async create(dto: CreateTeamDto, userId: string) {
    const team = await this.prisma.team.create({
      data: {
        name: dto.name,
        description: dto.description,
        leadId: dto.leadId || undefined,
        departmentId: dto.departmentId || undefined,
        status: (dto.status as any) || undefined,
        maxCapacity: dto.maxCapacity || 20,
        tags: dto.tags || [],
      },
    });

    // Add initial members if provided
    if (dto.memberIds && dto.memberIds.length > 0) {
      const memberData = dto.memberIds.map((employeeId) => ({
        teamId: team.id,
        employeeId,
        role: 'MEMBER' as any,
      }));
      await this.prisma.teamMember.createMany({ data: memberData, skipDuplicates: true });
    }

    // If lead is specified and not in members, add as lead
    if (dto.leadId) {
      await this.prisma.teamMember.upsert({
        where: { teamId_employeeId: { teamId: team.id, employeeId: dto.leadId } },
        update: { role: 'TEAM_LEAD' },
        create: { teamId: team.id, employeeId: dto.leadId, role: 'TEAM_LEAD' },
      });
    }

    // Assign initial projects if provided
    if (dto.projectIds && dto.projectIds.length > 0) {
      const projectData = dto.projectIds.map((projectId) => ({
        teamId: team.id,
        projectId,
      }));
      await this.prisma.projectTeam.createMany({ data: projectData, skipDuplicates: true });
    }

    this.eventEmitter.emit('team.created', { ...team, userId });
    return team;
  }

  // ────────────────── UPDATE ──────────────────

  async update(id: string, dto: UpdateTeamDto) {
    const existing = await this.prisma.team.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Team not found');

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.leadId !== undefined) updateData.leadId = dto.leadId || null;
    if (dto.departmentId !== undefined) updateData.departmentId = dto.departmentId || null;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.maxCapacity !== undefined) updateData.maxCapacity = dto.maxCapacity;
    if (dto.tags !== undefined) updateData.tags = dto.tags;

    const team = await this.prisma.team.update({ where: { id }, data: updateData });

    // If lead changed, update the member role
    if (dto.leadId !== undefined && dto.leadId !== existing.leadId) {
      if (dto.leadId) {
        await this.prisma.teamMember.upsert({
          where: { teamId_employeeId: { teamId: id, employeeId: dto.leadId } },
          update: { role: 'TEAM_LEAD' },
          create: { teamId: id, employeeId: dto.leadId, role: 'TEAM_LEAD' },
        });
      }

      // Demote old lead to SENIOR_DEVELOPER if they were lead
      if (existing.leadId) {
        const oldLeadMember = await this.prisma.teamMember.findUnique({
          where: { teamId_employeeId: { teamId: id, employeeId: existing.leadId } },
        });
        if (oldLeadMember && oldLeadMember.role === 'TEAM_LEAD') {
          await this.prisma.teamMember.update({
            where: { teamId_employeeId: { teamId: id, employeeId: existing.leadId } },
            data: { role: 'SENIOR_DEVELOPER' },
          });
        }
      }

      this.eventEmitter.emit('team.leadChanged', { teamId: id, oldLeadId: existing.leadId, newLeadId: dto.leadId || null });
    }

    // Sync memberIds if provided
    if (dto.memberIds !== undefined) {
      // Get current members
      const currentMembers = await this.prisma.teamMember.findMany({ where: { teamId: id } });
      const currentMemberIds = currentMembers.map(m => m.employeeId);
      
      const toAdd = dto.memberIds.filter(id => !currentMemberIds.includes(id));
      const toRemove = currentMemberIds.filter(empId => !dto.memberIds!.includes(empId) && empId !== dto.leadId && empId !== team.leadId);

      if (toAdd.length > 0) {
        await this.prisma.teamMember.createMany({
          data: toAdd.map(employeeId => ({ teamId: id, employeeId, role: 'MEMBER' as any })),
          skipDuplicates: true,
        });
      }
      if (toRemove.length > 0) {
        await this.prisma.teamMember.deleteMany({
          where: { teamId: id, employeeId: { in: toRemove } },
        });
      }
    }

    // Sync projectIds if provided
    if (dto.projectIds !== undefined) {
      // Get current projects
      const currentProjects = await this.prisma.projectTeam.findMany({ where: { teamId: id } });
      const currentProjectIds = currentProjects.map(p => p.projectId);
      
      const toAdd = dto.projectIds.filter(id => !currentProjectIds.includes(id));
      const toRemove = currentProjectIds.filter(projId => !dto.projectIds!.includes(projId));

      if (toAdd.length > 0) {
        await this.prisma.projectTeam.createMany({
          data: toAdd.map(projectId => ({ teamId: id, projectId })),
          skipDuplicates: true,
        });
      }
      if (toRemove.length > 0) {
        await this.prisma.projectTeam.deleteMany({
          where: { teamId: id, projectId: { in: toRemove } },
        });
      }
    }

    this.eventEmitter.emit('team.updated', { before: existing, after: team });
    return team;
  }

  // ────────────────── ARCHIVE ──────────────────

  async archive(id: string) {
    const existing = await this.prisma.team.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Team not found');

    const team = await this.prisma.team.update({ where: { id }, data: { status: 'ARCHIVED' } });
    this.eventEmitter.emit('team.updated', { before: existing, after: team });
    return team;
  }

  // ────────────────── ACTIVATE ──────────────────

  async activate(id: string) {
    const existing = await this.prisma.team.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Team not found');

    const team = await this.prisma.team.update({ where: { id }, data: { status: 'ACTIVE' } });
    this.eventEmitter.emit('team.updated', { before: existing, after: team });
    return team;
  }

  // ────────────────── DELETE ──────────────────

  async delete(id: string) {
    const existing = await this.prisma.team.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Team not found');

    await this.prisma.team.delete({ where: { id } });
    this.eventEmitter.emit('team.deleted', existing);
    return { message: 'Team deleted successfully' };
  }

  // ────────────────── STATS / ANALYTICS ──────────────────

  async getStats() {
    const [total, active, inactive, archived] = await Promise.all([
      this.prisma.team.count(),
      this.prisma.team.count({ where: { status: 'ACTIVE' } }),
      this.prisma.team.count({ where: { status: 'INACTIVE' } }),
      this.prisma.team.count({ where: { status: 'ARCHIVED' } }),
    ]);

    const totalMembers = await this.prisma.teamMember.count();

    // Active projects across all teams
    const activeProjects = await this.prisma.projectTeam.count({
      where: { project: { status: { in: ['ACTIVE', 'PLANNING'] } } },
    });

    // Completed projects
    const completedProjects = await this.prisma.projectTeam.count({
      where: { project: { status: 'COMPLETED' } },
    });

    // Task stats across team projects
    const teamProjectIds = (await this.prisma.projectTeam.findMany({
      select: { projectId: true },
      distinct: ['projectId'],
    })).map((p) => p.projectId);

    const taskStats = await this.prisma.task.groupBy({
      by: ['status'],
      where: { projectId: { in: teamProjectIds } },
      _count: { id: true },
    });

    const totalTasks = taskStats.reduce((sum, s) => sum + s._count.id, 0);
    const completedTasks = taskStats.find((s) => s.status === 'COMPLETED')?._count.id || 0;
    const pendingTasks = taskStats.filter((s) => !['COMPLETED', 'CANCELLED'].includes(s.status)).reduce((sum, s) => sum + s._count.id, 0);
    const avgProductivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      total,
      active,
      inactive,
      archived,
      totalMembers,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      avgProductivity,
    };
  }

  // ────────────────── MEMBERS ──────────────────

  async getMembers(teamId: string) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');

    return this.prisma.teamMember.findMany({
      where: { teamId },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            designation: { select: { id: true, name: true } },
            user: { select: { id: true, firstName: true, lastName: true, avatar: true, email: true } },
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  async addMember(teamId: string, dto: AddTeamMemberDto) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');

    const employee = await this.prisma.employee.findUnique({ where: { id: dto.employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');

    // Check capacity
    const currentCount = await this.prisma.teamMember.count({ where: { teamId } });
    if (currentCount >= team.maxCapacity) {
      throw new BadRequestException(`Team has reached maximum capacity of ${team.maxCapacity} members`);
    }

    // Check if already a member
    const existing = await this.prisma.teamMember.findUnique({
      where: { teamId_employeeId: { teamId, employeeId: dto.employeeId } },
    });
    if (existing) throw new ConflictException('Employee is already a member of this team');

    const member = await this.prisma.teamMember.create({
      data: {
        teamId,
        employeeId: dto.employeeId,
        role: (dto.role as any) || 'MEMBER',
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            user: { select: { id: true, firstName: true, lastName: true, avatar: true, email: true } },
          },
        },
      },
    });

    this.eventEmitter.emit('team.memberAdded', {
      teamId,
      teamName: team.name,
      employeeId: dto.employeeId,
      userId: employee.userId,
      role: dto.role || 'MEMBER',
    });

    return member;
  }

  async removeMember(teamId: string, employeeId: string) {
    const member = await this.prisma.teamMember.findUnique({
      where: { teamId_employeeId: { teamId, employeeId } },
    });
    if (!member) throw new NotFoundException('Member not found in this team');

    await this.prisma.teamMember.delete({
      where: { teamId_employeeId: { teamId, employeeId } },
    });

    // If this was the lead, clear the leadId
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (team && team.leadId === employeeId) {
      await this.prisma.team.update({ where: { id: teamId }, data: { leadId: null } });
    }

    this.eventEmitter.emit('team.memberRemoved', { teamId, employeeId });
    return { message: 'Member removed successfully' };
  }

  async updateMemberRole(teamId: string, employeeId: string, dto: UpdateMemberRoleDto) {
    const member = await this.prisma.teamMember.findUnique({
      where: { teamId_employeeId: { teamId, employeeId } },
    });
    if (!member) throw new NotFoundException('Member not found in this team');

    const updated = await this.prisma.teamMember.update({
      where: { teamId_employeeId: { teamId, employeeId } },
      data: { role: dto.role as any },
      include: {
        employee: {
          select: {
            id: true,
            user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          },
        },
      },
    });

    return updated;
  }

  async transferMember(fromTeamId: string, dto: TransferMemberDto) {
    const { toTeamId, employeeId } = dto;

    // Validate source team
    const fromTeam = await this.prisma.team.findUnique({ where: { id: fromTeamId } });
    if (!fromTeam) throw new NotFoundException('Source team not found');

    // Validate target team
    const toTeam = await this.prisma.team.findUnique({ where: { id: toTeamId } });
    if (!toTeam) throw new NotFoundException('Target team not found');

    // Check member exists in source team
    const member = await this.prisma.teamMember.findUnique({
      where: { teamId_employeeId: { teamId: fromTeamId, employeeId } },
    });
    if (!member) throw new NotFoundException('Member not found in source team');

    // Check not already in target team
    const existingTarget = await this.prisma.teamMember.findUnique({
      where: { teamId_employeeId: { teamId: toTeamId, employeeId } },
    });
    if (existingTarget) throw new ConflictException('Employee is already a member of the target team');

    // Check target team capacity
    const targetCount = await this.prisma.teamMember.count({ where: { teamId: toTeamId } });
    if (targetCount >= toTeam.maxCapacity) {
      throw new BadRequestException(`Target team has reached maximum capacity of ${toTeam.maxCapacity} members`);
    }

    // Transfer: remove from source, add to target
    await this.prisma.$transaction([
      this.prisma.teamMember.delete({ where: { teamId_employeeId: { teamId: fromTeamId, employeeId } } }),
      this.prisma.teamMember.create({ data: { teamId: toTeamId, employeeId, role: 'MEMBER' } }),
    ]);

    // Clear lead if transferred member was lead
    if (fromTeam.leadId === employeeId) {
      await this.prisma.team.update({ where: { id: fromTeamId }, data: { leadId: null } });
    }

    this.eventEmitter.emit('team.memberRemoved', { teamId: fromTeamId, employeeId });
    this.eventEmitter.emit('team.memberAdded', { teamId: toTeamId, teamName: toTeam.name, employeeId, role: 'MEMBER' });

    return { message: `Employee transferred from ${fromTeam.name} to ${toTeam.name}` };
  }

  // ────────────────── PROJECTS ──────────────────

  async getProjects(teamId: string) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');

    return this.prisma.projectTeam.findMany({
      where: { teamId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
            status: true,
            priority: true,
            startDate: true,
            endDate: true,
            _count: { select: { tasks: true, members: true } },
          },
        },
      },
    });
  }

  async assignProject(teamId: string, dto: AssignProjectDto) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');

    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const existing = await this.prisma.projectTeam.findUnique({
      where: { projectId_teamId: { projectId: dto.projectId, teamId } },
    });
    if (existing) throw new ConflictException('Project is already assigned to this team');

    const assignment = await this.prisma.projectTeam.create({
      data: { projectId: dto.projectId, teamId },
      include: {
        project: {
          select: { id: true, name: true, key: true, status: true },
        },
      },
    });

    this.eventEmitter.emit('team.projectAssigned', {
      teamId,
      teamName: team.name,
      projectId: dto.projectId,
      projectName: project.name,
    });

    return assignment;
  }

  async removeProject(teamId: string, projectId: string) {
    const assignment = await this.prisma.projectTeam.findUnique({
      where: { projectId_teamId: { projectId, teamId } },
    });
    if (!assignment) throw new NotFoundException('Project is not assigned to this team');

    await this.prisma.projectTeam.delete({
      where: { projectId_teamId: { projectId, teamId } },
    });

    this.eventEmitter.emit('team.projectRemoved', { teamId, projectId });
    return { message: 'Project removed from team successfully' };
  }

  // ────────────────── KANBAN BOARD ──────────────────

  async getKanbanBoard(teamId: string) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');

    // Get all project IDs for this team
    const teamProjects = await this.prisma.projectTeam.findMany({
      where: { teamId },
      select: { projectId: true },
    });
    const projectIds = teamProjects.map((p) => p.projectId);

    const tasks = await this.prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        project: { select: { id: true, name: true, key: true } },
        assignee: {
          select: {
            id: true,
            user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          },
        },
        _count: { select: { subtasks: true, comments: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const columns = {
      BACKLOG: tasks.filter((t) => t.status === 'BACKLOG'),
      PENDING: tasks.filter((t) => t.status === 'PENDING'),
      IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
      IN_REVIEW: tasks.filter((t) => t.status === 'IN_REVIEW'),
      TESTING: tasks.filter((t) => t.status === 'TESTING'),
      COMPLETED: tasks.filter((t) => t.status === 'COMPLETED'),
      BLOCKED: tasks.filter((t) => t.status === 'BLOCKED'),
    };

    return { team: { id: team.id, name: team.name }, columns };
  }

  // ────────────────── TEAM TASKS ──────────────────

  async getTeamTasks(teamId: string) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');

    const teamProjects = await this.prisma.projectTeam.findMany({
      where: { teamId },
      select: { projectId: true },
    });
    const projectIds = teamProjects.map((p) => p.projectId);

    return this.prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        project: { select: { id: true, name: true, key: true } },
        assignee: {
          select: {
            id: true,
            user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });
  }

  // ────────────────── ANALYTICS ──────────────────

  async getAnalytics(teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { _count: { select: { members: true, projects: true } } },
    });
    if (!team) throw new NotFoundException('Team not found');

    // Get team project IDs
    const teamProjects = await this.prisma.projectTeam.findMany({
      where: { teamId },
      select: { projectId: true },
    });
    const projectIds = teamProjects.map((p) => p.projectId);

    // Task stats
    const taskStats = await this.prisma.task.groupBy({
      by: ['status'],
      where: { projectId: { in: projectIds } },
      _count: { id: true },
    });

    const totalTasks = taskStats.reduce((sum, s) => sum + s._count.id, 0);
    const completedTasks = taskStats.find((s) => s.status === 'COMPLETED')?._count.id || 0;
    const inProgressTasks = taskStats.find((s) => s.status === 'IN_PROGRESS')?._count.id || 0;
    const blockedTasks = taskStats.find((s) => s.status === 'BLOCKED')?._count.id || 0;

    // Delayed tasks (tasks past deadline that aren't completed)
    const now = new Date();
    const delayedTasks = await this.prisma.task.count({
      where: {
        projectId: { in: projectIds },
        deadline: { lt: now },
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
      },
    });

    // Member workload distribution
    const members = await this.prisma.teamMember.findMany({
      where: { teamId },
      include: {
        employee: {
          select: {
            id: true,
            user: { select: { firstName: true, lastName: true, avatar: true } },
          },
        },
      },
    });

    const memberIds = members.map((m) => m.employeeId);
    const memberWorkload = await this.prisma.task.groupBy({
      by: ['assignedTo'],
      where: {
        projectId: { in: projectIds },
        assignedTo: { in: memberIds },
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
      },
      _count: { id: true },
    });

    const memberCompletions = await this.prisma.task.groupBy({
      by: ['assignedTo'],
      where: {
        projectId: { in: projectIds },
        assignedTo: { in: memberIds },
        status: 'COMPLETED',
      },
      _count: { id: true },
    });

    const workloadDistribution = members.map((m) => {
      const active = memberWorkload.find((w) => w.assignedTo === m.employeeId)?._count.id || 0;
      const completed = memberCompletions.find((c) => c.assignedTo === m.employeeId)?._count.id || 0;
      return {
        employeeId: m.employeeId,
        name: `${m.employee.user.firstName} ${m.employee.user.lastName}`,
        avatar: m.employee.user.avatar,
        activeTasks: active,
        completedTasks: completed,
        totalTasks: active + completed,
      };
    });

    // Status distribution for chart
    const statusDistribution = taskStats.map((s) => ({
      status: s.status,
      count: s._count.id,
    }));

    // Productivity score
    const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const onTimeRate = totalTasks > 0 ? Math.round(((completedTasks - delayedTasks) / Math.max(completedTasks, 1)) * 100) : 100;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      delayedTasks,
      productivity,
      onTimeRate,
      totalMembers: team._count.members,
      totalProjects: team._count.projects,
      statusDistribution,
      workloadDistribution,
    };
  }

  // ────────────────── ACTIVITY LOGS ──────────────────

  async getActivityLogs(teamId: string) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');

    return this.prisma.activityLog.findMany({
      where: {
        OR: [
          { entity: 'Team', entityId: teamId },
        ],
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // ────────────────── CALENDAR ──────────────────

  async getCalendar(teamId: string) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');

    // Get team project IDs
    const teamProjects = await this.prisma.projectTeam.findMany({
      where: { teamId },
      select: { projectId: true },
    });
    const projectIds = teamProjects.map((p) => p.projectId);

    // Task deadlines
    const taskDeadlines = await this.prisma.task.findMany({
      where: {
        projectId: { in: projectIds },
        deadline: { not: null },
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        deadline: true,
        project: { select: { id: true, name: true, key: true } },
        assignee: {
          select: {
            id: true,
            user: { select: { firstName: true, lastName: true, avatar: true } },
          },
        },
      },
      orderBy: { deadline: 'asc' },
    });

    // Project milestones (start and end dates)
    const projectMilestones = await this.prisma.project.findMany({
      where: { id: { in: projectIds } },
      select: {
        id: true,
        name: true,
        key: true,
        startDate: true,
        endDate: true,
        status: true,
      },
    });

    // Team member leave requests (next 30 days)
    const memberIds = (await this.prisma.teamMember.findMany({
      where: { teamId },
      select: { employeeId: true },
    })).map((m) => m.employeeId);

    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const leaveRequests = await this.prisma.leaveRequest.findMany({
      where: {
        employeeId: { in: memberIds },
        status: 'APPROVED',
        startDate: { lte: thirtyDaysFromNow },
        endDate: { gte: new Date() },
      },
      include: {
        employee: {
          select: {
            id: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    return {
      taskDeadlines,
      projectMilestones,
      leaveRequests,
    };
  }
}
