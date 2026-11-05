import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ProjectsController } from '../../modules/projects/projects.controller';
import { PrismaService } from '../../database/prisma.service';

describe('Custom project role permissions', () => {
  const context = (method: string) => ({
    getClass: () => ProjectsController,
    getHandler: () => ProjectsController.prototype[method as keyof ProjectsController],
    switchToHttp: () => ({ getRequest: () => ({ user: { sub: 'komal', roles: ['HR_ADMIN'] } }) }),
  }) as unknown as ExecutionContext;

  it.each([
    ['create', 'create'], ['update', 'update'], ['archive', 'delete'],
    ['addMember', 'update'], ['removeMember', 'update'],
  ])('%s honors the matching current grant and denies missing/revoked grants', async (method, action) => {
    const findFirst = jest.fn().mockResolvedValue({ roleId: 'hr-admin' });
    const guard = new RolesGuard(new Reflector(), { userRole: { findFirst } } as unknown as PrismaService);
    expect(await guard.canActivate(context(method))).toBe(true);
    expect(findFirst).toHaveBeenCalledWith({
      where: { userId: 'komal', role: { status: 'ACTIVE', deletedAt: null,
        permissions: { some: { permission: { module: 'project', action } } },
      } }, select: { roleId: true },
    });
    findFirst.mockResolvedValue(null);
    expect(await guard.canActivate(context(method))).toBe(false);
  });

  it('does not extend project grants to permanent deletion or comment deletion', async () => {
    const findFirst = jest.fn().mockResolvedValue({ roleId: 'hr-admin' });
    const guard = new RolesGuard(new Reflector(), { userRole: { findFirst } } as unknown as PrismaService);
    expect(await guard.canActivate(context('delete'))).toBe(false);
    expect(await guard.canActivate(context('deleteComment'))).toBe(false);
    expect(findFirst).not.toHaveBeenCalled();
  });
});
