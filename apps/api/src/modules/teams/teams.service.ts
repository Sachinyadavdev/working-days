import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(pagination: PaginationDto) {
    const { skip, limit, sortBy, sortOrder } = pagination;
    const [teams, total] = await Promise.all([
      this.prisma.team.findMany({
        skip, take: limit,
        orderBy: { [sortBy || 'createdAt']: sortOrder },
        include: { _count: { select: { members: true, projects: true } } },
      }),
      this.prisma.team.count(),
    ]);
    return { items: teams, meta: { total, page: pagination.page, limit, totalPages: Math.ceil(total / limit), hasNextPage: pagination.page * limit < total, hasPreviousPage: pagination.page > 1 } };
  }

  async findById(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        members: { include: { employee: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } } } } } },
        projects: { include: { project: { select: { id: true, name: true, key: true, status: true } } } },
      },
    });
    if (!team) throw new NotFoundException('Team not found');
    return team;
  }

  async create(dto: CreateTeamDto) {
    return this.prisma.team.create({ data: { name: dto.name, description: dto.description, leadId: dto.leadId } });
  }

  async update(id: string, dto: UpdateTeamDto) {
    const existing = await this.prisma.team.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Team not found');
    return this.prisma.team.update({ where: { id }, data: dto });
  }
}
