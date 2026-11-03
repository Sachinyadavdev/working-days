import 'reflect-metadata';
import { ExecutionContext, ForbiddenException, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { RolesGuard } from './roles.guard';
import { PermissionsGuard } from './permissions.guard';
import { JwtStrategy } from '../../modules/auth/strategies/jwt.strategy';
import { UsersController } from '../../modules/users/users.controller';
import { TasksController } from '../../modules/tasks/tasks.controller';
import { TasksService } from '../../modules/tasks/tasks.service';
import { ProjectsController } from '../../modules/projects/projects.controller';
import { TeamsController } from '../../modules/teams/teams.controller';
import { AttendanceCorrectionsController } from '../../modules/attendance/attendance-corrections.controller';
import { AttendanceShiftsController } from '../../modules/attendance/attendance-shifts.controller';
import { AttendanceController } from '../../modules/attendance/attendance.controller';
import { AttendanceService } from '../../modules/attendance/attendance.service';
import { EodController } from '../../modules/eod/eod.controller';
import { AnnouncementsController } from '../../modules/notifications/announcements.controller';
import { EmployeeProfileController } from '../../modules/employee-profile/employee-profile.controller';
import { EmployeeProfileService } from '../../modules/employee-profile/employee-profile.service';
import { UpdateProfileDto } from '../../modules/employee-profile/dto/update-profile.dto';
import { WorkspaceController } from '../../modules/workspace/workspace.controller';
import { WorkspaceService } from '../../modules/workspace/workspace.service';
import { LeaveService } from '../../modules/leave/leave.service';

function context(controller: any, method: string, roles: string[]): ExecutionContext {
  return {
    getHandler: () => controller.prototype[method],
    getClass: () => controller,
    switchToHttp: () => ({ getRequest: () => ({ user: { sub: 'user-1', roles } }) }),
  } as unknown as ExecutionContext;
}

describe('Management route authorization', () => {
  const guard = new RolesGuard(new Reflector());
  const routes: [any, string][] = [
    [ProjectsController, 'create'], [ProjectsController, 'update'], [ProjectsController, 'archive'],
    [ProjectsController, 'addMember'], [ProjectsController, 'removeMember'], [ProjectsController, 'delete'],
    [TeamsController, 'create'], [TeamsController, 'update'], [TeamsController, 'archive'],
    [TeamsController, 'activate'], [TeamsController, 'delete'], [TeamsController, 'addMember'],
    [TeamsController, 'removeMember'], [TeamsController, 'updateMemberRole'],
    [TeamsController, 'transferMember'], [TeamsController, 'assignProject'], [TeamsController, 'removeProject'],
    [TasksController, 'create'], [TasksController, 'cancel'],
    [AttendanceCorrectionsController, 'getAllRequests'], [AttendanceCorrectionsController, 'approveRequest'],
    [AttendanceCorrectionsController, 'rejectRequest'], [AttendanceShiftsController, 'createShift'],
    [AttendanceShiftsController, 'updateShift'], [AttendanceShiftsController, 'deleteShift'],
    [AttendanceShiftsController, 'assignShift'], [AttendanceController, 'getAdminStats'],
    [AttendanceController, 'findAll'], [EodController, 'findAll'], [EodController, 'reviewEod'],
    [AnnouncementsController, 'createAnnouncement'], [EmployeeProfileController, 'getAllEmployees'],
    [EmployeeProfileController, 'createEmployee'], [WorkspaceController, 'createWorkspace'],
  ];
  it.each(routes)('%p.%s denies employees and permits super admins', async (controller, method) => {
    expect(await guard.canActivate(context(controller, method, ['EMPLOYEE']))).toBe(false);
    expect(await guard.canActivate(context(controller, method, ['SUPER_ADMIN']))).toBe(true);
  });
  it('keeps manager approvals and employee self-service available', async () => {
    expect(await guard.canActivate(context(EodController, 'reviewEod', ['MANAGER']))).toBe(true);
    expect(await guard.canActivate(context(AttendanceCorrectionsController, 'approveRequest', ['MANAGER']))).toBe(true);
    expect(await guard.canActivate(context(AttendanceController, 'checkIn', ['EMPLOYEE']))).toBe(true);
    expect(await guard.canActivate(context(EodController, 'submitEod', ['EMPLOYEE']))).toBe(true);
    expect(await guard.canActivate(context(ProjectsController, 'delete', ['ADMIN']))).toBe(false);
  });
});

describe('Record ownership and safe profile updates', () => {
  it('allows self/admin user edits and prevents cross-user edits', async () => {
    const service = { update: jest.fn().mockResolvedValue({ id: 'user-1' }) };
    const controller = new UsersController(service as any);
    await expect(controller.update('user-2', {}, { sub: 'user-1', roles: ['EMPLOYEE'] })).rejects.toThrow(ForbiddenException);
    expect(service.update).not.toHaveBeenCalled();
    await controller.update('user-1', {}, { sub: 'user-1', roles: ['EMPLOYEE'] });
    await controller.update('user-2', {}, { sub: 'admin', roles: ['ADMIN'] });
    expect(service.update).toHaveBeenCalledTimes(2);
  });
  it('uses JWT sub for employee profiles', async () => {
    const service = { getProfile: jest.fn(), updateProfile: jest.fn() };
    const controller = new EmployeeProfileController(service as any);
    await controller.getMyProfile({ sub: 'user-1' });
    await controller.updateMyProfile({ sub: 'user-1' }, { phone: '123' });
    expect(service.getProfile).toHaveBeenCalledWith('user-1');
    expect(service.updateProfile).toHaveBeenCalledWith('user-1', { phone: '123' });
  });
  it('rejects employment-field injection through self-service validation', async () => {
    const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true });
    await expect(pipe.transform({ phone: '123', requiredDailyHours: 0 }, { type: 'body', metatype: UpdateProfileDto })).rejects.toThrow();
    await expect(pipe.transform({ phone: '123' }, { type: 'body', metatype: UpdateProfileDto })).resolves.toMatchObject({ phone: '123' });
  });
  it('also allowlists self-service fields at the database write boundary', async () => {
    const prisma = { employee: { findUnique: jest.fn().mockResolvedValue({ id: 'e1' }), update: jest.fn() } };
    await new EmployeeProfileService(prisma as any).updateProfile('user-1', { phone: '123', status: 'TERMINATED' } as any);
    expect(prisma.employee.update).toHaveBeenCalledWith({ where: { id: 'e1' }, data: { phone: '123', address: undefined, emergencyContact: undefined } });
  });
  it('permits assignee progress, denies other employees and reassignment', async () => {
    const prisma = { task: { findUnique: jest.fn().mockResolvedValue({ assignee: { userId: 'user-1' } }) } };
    const service = new TasksService(prisma as any, {} as any);
    await expect(service.assertCanEdit('t1', 'user-1', ['EMPLOYEE'], { status: 'COMPLETED' })).resolves.toBeUndefined();
    await expect(service.assertCanEdit('t1', 'user-2', ['EMPLOYEE'])).rejects.toThrow(ForbiddenException);
    await expect(service.assertCanEdit('t1', 'user-1', ['EMPLOYEE'], { assignedTo: 'e2' })).rejects.toThrow(ForbiddenException);
    await expect(service.assertCanEdit('t1', 'admin', ['ADMIN'], { assignedTo: 'e2' })).resolves.toBeUndefined();
  });
  it('checks authorization before writing a task or checklist', async () => {
    const service = { assertCanEdit: jest.fn().mockRejectedValue(new ForbiddenException()), update: jest.fn(), toggleChecklistItem: jest.fn() };
    const controller = new TasksController(service as any);
    const actor = { sub: 'other', roles: ['EMPLOYEE'] };
    await expect(controller.update('t1', { status: 'COMPLETED' }, actor)).rejects.toThrow(ForbiddenException);
    await expect(controller.toggleChecklistItem('t1', 'item1', actor)).rejects.toThrow(ForbiddenException);
    expect(service.update).not.toHaveBeenCalled();
    expect(service.toggleChecklistItem).not.toHaveBeenCalled();
  });
  it('limits workspace details to owners, members or super admins', async () => {
    const workspace = { ownerId: 'owner', members: [{ employee: { userId: 'member' } }] };
    const service = new WorkspaceService({ workspace: { findUnique: jest.fn().mockResolvedValue(workspace) } } as any);
    await expect(service.getWorkspaceById('w1', 'outsider', ['EMPLOYEE'])).rejects.toThrow(ForbiddenException);
    for (const user of ['owner', 'member']) await expect(service.getWorkspaceById('w1', user, ['EMPLOYEE'])).resolves.toBe(workspace);
    await expect(service.getWorkspaceById('w1', 'admin', ['EMPLOYEE', 'SUPER_ADMIN'])).resolves.toBe(workspace);
  });
  it('preserves all roles and canonical identity in workspace queries', async () => {
    const service = { getWorkspaces: jest.fn() };
    await new WorkspaceController(service as any).getMyWorkspaces({ sub: 'user-1', roles: ['EMPLOYEE', 'SUPER_ADMIN'] });
    expect(service.getWorkspaces).toHaveBeenCalledWith('user-1', ['EMPLOYEE', 'SUPER_ADMIN']);
  });
  it('blocks reading another employee attendance calendar', async () => {
    const prisma = { employee: { findUnique: jest.fn().mockResolvedValue({ id: 'e2', userId: 'user-2', requiredDailyHours: 8 }) }, attendance: { findMany: jest.fn().mockResolvedValue([]) } };
    const service = new AttendanceService(prisma as any);
    await expect(service.getCalendar('user-1', 11, 2026, 'e2', ['EMPLOYEE'])).rejects.toThrow(ForbiddenException);
    expect(prisma.attendance.findMany).not.toHaveBeenCalled();
    await expect(service.getCalendar('admin', 11, 2026, 'e2', ['ADMIN'])).resolves.toEqual([]);
  });
  it('allows own leave cancellation but prevents cancelling someone else leave', async () => {
    const prisma = { leaveRequest: { findUnique: jest.fn().mockResolvedValue({ employee: { userId: 'user-1' } }) } };
    const service = new LeaveService(prisma as any, {} as any, {} as any);
    const update = jest.spyOn(service, 'updateStatus').mockResolvedValue({} as any);
    await expect(service.cancelOwnRequest('l1', 'user-2')).rejects.toThrow(ForbiddenException);
    expect(update).not.toHaveBeenCalled();
    await service.cancelOwnRequest('l1', 'user-1', 'Plans changed');
    expect(update).toHaveBeenCalledWith('l1', { status: 'CANCELLED', cancellationReason: 'Plans changed' }, 'user-1');
  });
});

describe('Current account roles and canonical permissions', () => {
  it('does not accept password-reset tokens as API access tokens', async () => {
    const prisma = { user: { findUnique: jest.fn() } };
    const strategy = new JwtStrategy({ get: () => 'test-secret' } as unknown as ConfigService, prisma as any);
    await expect(strategy.validate({ sub: 'user-1', email: 'a@example.test', roles: [], isResetToken: true })).rejects.toThrow('Invalid token payload');
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });
  it('rejects disabled accounts and uses current roles instead of token roles', async () => {
    const prisma = { user: { findUnique: jest.fn().mockResolvedValue({ isActive: false, roles: [] }) } };
    const strategy = new JwtStrategy({ get: () => 'test-secret' } as unknown as ConfigService, prisma as any);
    const payload = { sub: 'user-1', email: 'a@example.test', roles: ['SUPER_ADMIN'] };
    await expect(strategy.validate(payload)).rejects.toThrow('Account is inactive');
    prisma.user.findUnique.mockResolvedValue({ isActive: true, roles: [] });
    await expect(strategy.validate(payload)).resolves.toMatchObject({ sub: 'user-1', roles: [] });
    expect(prisma.user.findUnique.mock.calls[0][0].select.roles.where.role).toEqual({ deletedAt: null, status: 'ACTIVE' });
  });
  it('checks canonical module/action permissions and immediately observes revocation', async () => {
    const reflector = { getAllAndOverride: () => ['role.update'] };
    const prisma = { userRole: { findMany: jest.fn().mockResolvedValue([{ role: { name: 'CUSTOM', permissions: [{ permission: { name: 'role:update', module: 'role', action: 'update' } }] } }]) } };
    const guard = new PermissionsGuard(reflector as any, prisma as any);
    const ctx = context(UsersController, 'update', ['CUSTOM']);
    expect(await guard.canActivate(ctx)).toBe(true);
    prisma.userRole.findMany.mockResolvedValue([]);
    expect(await guard.canActivate(ctx)).toBe(false);
    expect(prisma.userRole.findMany.mock.calls[0][0].where.role).toEqual({ deletedAt: null, status: 'ACTIVE' });
  });
  it('permits an active super admin even when the permission catalog is incomplete', async () => {
    const guard = new PermissionsGuard({ getAllAndOverride: () => ['role.assign'] } as any,
      { userRole: { findMany: jest.fn().mockResolvedValue([{ role: { name: 'SUPER_ADMIN', permissions: [] } }]) } } as any);
    expect(await guard.canActivate(context(UsersController, 'update', ['SUPER_ADMIN']))).toBe(true);
  });
});
