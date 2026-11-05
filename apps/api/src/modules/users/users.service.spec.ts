import { UsersService } from './users.service';
import { PrismaService } from '../../database/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

describe('UsersService access listing', () => {
  it('returns assignment IDs alongside legacy role names and paginates users', async () => {
    const findMany = jest.fn().mockResolvedValue([
      {
        id: 'user-1',
        email: 'user@example.com',
        roles: [{ role: { id: 'role-1', name: 'EMPLOYEE', status: 'ACTIVE' } }],
      },
      { id: 'user-2', email: 'other@example.com', roles: [] },
    ]);
    const service = new UsersService({
      user: { findMany, count: jest.fn().mockResolvedValue(25) },
    } as unknown as PrismaService);
    const pagination = Object.assign(new PaginationDto(), { page: 2, limit: 12 });

    const result = await service.findAll(pagination);

    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 12, take: 12 }));
    expect(result.items[0].roles).toEqual(['EMPLOYEE']);
    expect(result.items[0].roleAssignments).toEqual([
      { id: 'role-1', name: 'EMPLOYEE', status: 'ACTIVE' },
    ]);
    expect(result.items[1].roleAssignments).toEqual([]);
    expect(result.meta).toEqual({
      total: 25,
      page: 2,
      limit: 12,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });
});
