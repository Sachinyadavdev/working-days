import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: string, user: { sub: string; roles: string[] }) {
    const q = query.trim();
    if (q.length < 2) return { items: [] };
    const words = q.split(/\s+/);
    const contains = (word: string) => ({ contains: word, mode: 'insensitive' as const });
    const manageWork = user.roles.some(role => ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'PROJECT_MANAGER'].includes(role));
    const manageEmployees = user.roles.some(role => ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR_ADMIN'].includes(role));
    // Apply visibility in the database query, before limiting or returning results.
    const projectScope: Prisma.ProjectWhereInput = manageWork ? {} : {
      OR: [
        { ownerId: user.sub },
        { projectManager: { userId: user.sub } },
        { members: { some: { employee: { userId: user.sub } } } },
        { teams: { some: { team: { members: { some: { employee: { userId: user.sub } } } } } } },
        { workspace: { ownerId: user.sub } },
        { workspace: { members: { some: { employee: { userId: user.sub } } } } },
      ],
    };
    const [projects, tasks, teams, employees] = await Promise.all([
      this.prisma.project.findMany({
        where: { AND: [projectScope, ...words.map(word => ({ OR: [
          { name: contains(word) }, { key: contains(word) }, { clientName: contains(word) },
        ] }))] },
        select: { id: true, name: true, key: true },
        orderBy: [{ name: 'asc' }, { id: 'asc' }], take: 5,
      }),
      this.prisma.task.findMany({
        where: { AND: [
          manageWork ? {} : { OR: [
            { assignee: { userId: user.sub } }, { reporterId: user.sub }, { project: projectScope },
          ] },
          ...words.map(word => ({ OR: [{ title: contains(word) }, { project: { key: contains(word) } }] })),
        ] },
        select: { id: true, title: true, taskNumber: true, project: { select: { key: true } } },
        orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }], take: 5,
      }),
      this.prisma.team.findMany({
        where: { AND: [
          manageWork ? {} : { members: { some: { employee: { userId: user.sub } } } },
          ...words.map(word => ({ name: contains(word) })),
        ] },
        select: { id: true, name: true },
        orderBy: [{ name: 'asc' }, { id: 'asc' }], take: 5,
      }),
      this.prisma.employee.findMany({
        where: { AND: [
          manageEmployees ? {} : { userId: user.sub },
          ...words.map(word => ({ OR: [
            { employeeCode: contains(word) }, { user: { firstName: contains(word) } },
            { user: { lastName: contains(word) } }, { user: { email: contains(word) } },
          ] })),
        ] },
        select: { id: true, employeeCode: true, user: { select: { firstName: true, lastName: true } } },
        orderBy: [{ employeeCode: 'asc' }, { id: 'asc' }], take: 5,
      }),
    ]);

    return { items: [
      ...projects.map(project => ({ type: 'project' as const, id: project.id, title: project.name, subtitle: project.key })),
      ...tasks.map(task => ({ type: 'task' as const, id: task.id, title: task.title, subtitle: `${task.project?.key || 'TASK'}-${task.taskNumber}` })),
      ...teams.map(team => ({ type: 'team' as const, id: team.id, title: team.name, subtitle: 'Team' })),
      ...employees.map(employee => ({ type: 'employee' as const, id: employee.id, title: `${employee.user.firstName} ${employee.user.lastName}`, subtitle: employee.employeeCode })),
    ] };
  }
}
