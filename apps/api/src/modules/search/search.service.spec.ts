import { ValidationPipe } from '@nestjs/common';
import { SearchController, SearchQueryDto } from './search.controller';
import { SearchService } from './search.service';

describe('Dashboard search', () => {
  const actor = { sub: 'current-user', roles: ['EMPLOYEE'] };
  const makePrisma = () => ({
    project: { findMany: jest.fn().mockResolvedValue([]) },
    task: { findMany: jest.fn().mockResolvedValue([]) },
    team: { findMany: jest.fn().mockResolvedValue([]) },
    employee: { findMany: jest.fn().mockResolvedValue([]) },
  });

  it.each(['', ' ', 'a', ' a '])('does not query the database for short input %p', async query => {
    const prisma = makePrisma();
    expect(await new SearchService(prisma as any).search(query, actor)).toEqual({ items: [] });
    for (const model of Object.values(prisma)) expect(model.findMany).not.toHaveBeenCalled();
  });

  it('returns actionable results with minimal display data across all categories', async () => {
    const prisma = makePrisma();
    prisma.project.findMany.mockResolvedValue([{ id: 'p1', name: 'Website', key: 'WEB' }]);
    prisma.task.findMany.mockResolvedValue([{ id: 't1', title: 'Build website', taskNumber: 12, project: { key: 'WEB' } }]);
    prisma.team.findMany.mockResolvedValue([{ id: 'team1', name: 'Web team' }]);
    prisma.employee.findMany.mockResolvedValue([{ id: 'e1', employeeCode: 'EMP-1', user: { firstName: 'Jane', lastName: 'Webb' } }]);
    expect(await new SearchService(prisma as any).search('web', actor)).toEqual({ items: [
      { type: 'project', id: 'p1', title: 'Website', subtitle: 'WEB' },
      { type: 'task', id: 't1', title: 'Build website', subtitle: 'WEB-12' },
      { type: 'team', id: 'team1', title: 'Web team', subtitle: 'Team' },
      { type: 'employee', id: 'e1', title: 'Jane Webb', subtitle: 'EMP-1' },
    ] });
    for (const model of Object.values(prisma)) {
      const options = model.findMany.mock.calls[0][0];
      expect(options.take).toBe(5);
      expect(options.select).toBeDefined();
      expect(options.include).toBeUndefined();
    }
  });

  it('applies employee visibility separately from text matching in each query', async () => {
    const prisma = makePrisma();
    await new SearchService(prisma as any).search(' private ', actor);
    const projectScope = prisma.project.findMany.mock.calls[0][0].where.AND[0];
    expect(projectScope.OR).toContainEqual({ ownerId: actor.sub });
    expect(projectScope.OR).toContainEqual({ members: { some: { employee: { userId: actor.sub } } } });
    expect(prisma.task.findMany.mock.calls[0][0].where.AND[0]).toEqual({ OR: [
      { assignee: { userId: actor.sub } }, { reporterId: actor.sub }, { project: projectScope },
    ] });
    expect(prisma.team.findMany.mock.calls[0][0].where.AND[0]).toEqual({ members: { some: { employee: { userId: actor.sub } } } });
    expect(prisma.employee.findMany.mock.calls[0][0].where.AND[0]).toEqual({ userId: actor.sub });
    expect(prisma.project.findMany.mock.calls[0][0].where.AND[1].OR[0]).toEqual({ name: { contains: 'private', mode: 'insensitive' } });
  });

  it.each(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])('lets %s search organization records', async role => {
    const prisma = makePrisma();
    await new SearchService(prisma as any).search('web', { sub: 'admin', roles: [role] });
    for (const model of Object.values(prisma)) expect(model.findMany.mock.calls[0][0].where.AND[0]).toEqual({});
  });

  it('does not give project managers employee-administration visibility', async () => {
    const prisma = makePrisma();
    await new SearchService(prisma as any).search('web', { ...actor, roles: ['PROJECT_MANAGER'] });
    expect(prisma.project.findMany.mock.calls[0][0].where.AND[0]).toEqual({});
    expect(prisma.employee.findMany.mock.calls[0][0].where.AND[0]).toEqual({ userId: actor.sub });
  });

  it('matches full names across first and last name without fetching all employees', async () => {
    const prisma = makePrisma();
    await new SearchService(prisma as any).search('Jane   Webb', actor);
    const filters = prisma.employee.findMany.mock.calls[0][0].where.AND;
    expect(filters).toHaveLength(3);
    expect(filters[1].OR).toContainEqual({ user: { firstName: { contains: 'Jane', mode: 'insensitive' } } });
    expect(filters[2].OR).toContainEqual({ user: { lastName: { contains: 'Webb', mode: 'insensitive' } } });
  });

  it('propagates failures so the UI can offer retry instead of a false empty result', async () => {
    const prisma = makePrisma();
    prisma.project.findMany.mockRejectedValue(new Error('Database unavailable'));
    await expect(new SearchService(prisma as any).search('web', actor)).rejects.toThrow('Database unavailable');
  });

  it('validates and trims queries, rejecting oversized or structured input', async () => {
    const pipe = new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true });
    const metadata = { type: 'query' as const, metatype: SearchQueryDto };
    await expect(pipe.transform({ q: '  web  ' }, metadata)).resolves.toEqual({ q: 'web' });
    await expect(pipe.transform({ q: 'x'.repeat(101) }, metadata)).rejects.toThrow();
    await expect(pipe.transform({ q: ['web', 'other'] }, metadata)).rejects.toThrow();
    await expect(pipe.transform({ q: 'web', userId: 'other' }, metadata)).rejects.toThrow();
  });

  it('takes identity only from the authenticated request', async () => {
    const service = { search: jest.fn().mockResolvedValue({ items: [] }) };
    await new SearchController(service as any).search({ q: 'web' }, actor);
    expect(service.search).toHaveBeenCalledWith('web', actor);
  });
});
