import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { PrismaService } from '../../database/prisma.service';

describe('RolesController', () => {
  let controller: RolesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
    }).useMocker(() => ({})).compile();

    controller = module.get<RolesController>(RolesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it.each(['findAll', 'findOne'])('allows admin %s without an unseeded role.read permission', async method => {
    const reflector = new Reflector();
    const context = {
      getClass: () => RolesController,
      getHandler: () => RolesController.prototype[method as keyof RolesController],
      switchToHttp: () => ({ getRequest: () => ({ user: { sub: 'admin-1', roles: ['ADMIN'] } }) }),
    } as unknown as ExecutionContext;
    expect(await new RolesGuard(reflector).canActivate(context)).toBe(true);
    expect(await new PermissionsGuard(reflector, {} as PrismaService).canActivate(context)).toBe(true);
  });

  it.each(['findAll', 'findOne', 'create', 'update', 'remove', 'restore', 'assignPermissions'])
    ('restricts %s to admins even when employees have role permissions', async method => {
      const guard = new RolesGuard(new Reflector());
      const request = { user: { sub: 'user-1', roles: ['EMPLOYEE'], permissions: ['role.read', 'role.update', 'role.create', 'role.delete'] } };
      const context = {
        getClass: () => RolesController,
        getHandler: () => RolesController.prototype[method as keyof RolesController],
        switchToHttp: () => ({ getRequest: () => request }),
      } as unknown as ExecutionContext;
      expect(await guard.canActivate(context)).toBe(false);
      request.user.roles = ['MANAGER'];
      expect(await guard.canActivate(context)).toBe(false);
      for (const role of ['ADMIN', 'SUPER_ADMIN']) {
        request.user.roles = [role];
        expect(await guard.canActivate(context)).toBe(true);
      }
    });
});
