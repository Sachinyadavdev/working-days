import { ActivityLogsService } from './activity-logs.service';
import { ProjectsService } from '../projects/projects.service';
import { TasksService } from '../tasks/tasks.service';

describe('Project activity history', () => {
  const create = jest.fn().mockResolvedValue({ id: 'log' });
  const logs = new ActivityLogsService({ activityLog: { create } } as any);
  beforeEach(() => jest.clearAllMocks());

  it('records the editor and changed fields without copying credentials or docs', async () => {
    await logs.onProjectUpdated({ actorId: 'editor', before: { name: 'Old', credentials: 'secret-old', readme: 'private-old' }, after: { id: 'p1', ownerId: 'owner', name: 'New', credentials: 'secret-new', readme: 'private-new' } });
    expect(create).toHaveBeenCalledWith({ data: expect.objectContaining({ userId: 'editor', changes: { name: { from: 'Old', to: 'New' }, credentials: 'Updated', readme: 'Updated' } }) });
    expect(JSON.stringify(create.mock.calls)).not.toContain('secret-');
    expect(JSON.stringify(create.mock.calls)).not.toContain('private-');
  });

  it('does not create activity for unchanged project fields', async () => {
    const project = { id: 'p1', tags: ['one'], status: 'ACTIVE' };
    await logs.onProjectUpdated({ before: project, after: { ...project }, actorId: 'editor' });
    expect(create).not.toHaveBeenCalled();
  });

  it('records unassigned task creation with its creator and project', async () => {
    await logs.onTaskCreated({ id: 't1', reporterId: 'creator', title: 'Plan release', projectId: 'p1', assignedTo: null });
    expect(create).toHaveBeenCalledWith({ data: expect.objectContaining({ userId: 'creator', action: 'CREATE', entity: 'Task', changes: expect.objectContaining({ title: 'Plan release', projectId: 'p1' }) }) });
  });

  it('records cancellation under the actor rather than the reporter', async () => {
    await logs.onTaskUpdated({ actorId: 'editor', before: { status: 'OPEN' }, after: { id: 't1', title: 'Task', reporterId: 'reporter', projectId: 'p1', status: 'CANCELLED' } });
    expect(create).toHaveBeenCalledWith({ data: expect.objectContaining({ userId: 'editor', changes: expect.objectContaining({ status: { from: 'OPEN', to: 'CANCELLED' } }) }) });
  });

  it('records comment actions without duplicating comment content', async () => {
    await logs.onCommentAdded({ actorId: 'author', projectId: 'p1', commentId: 'c1' });
    expect(create).toHaveBeenCalledWith({ data: { userId: 'author', action: 'COMMENT_ADDED', entity: 'Project', entityId: 'p1', changes: { commentId: 'c1' } } });
  });

  it('waits for cancellation activity and passes the acting user', async () => {
    const before = { id: 't1', status: 'OPEN' };
    const after = { ...before, status: 'CANCELLED' };
    const emitAsync = jest.fn().mockResolvedValue([]);
    const service = new TasksService({ task: { findUnique: jest.fn().mockResolvedValue(before), update: jest.fn().mockResolvedValue(after) } } as any, { emitAsync } as any);
    await service.cancel('t1', 'editor');
    expect(emitAsync).toHaveBeenCalledWith('task.updated', { before, after, actorId: 'editor' });
  });

  it('paginates within the project and rejects invalid offsets', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const service = new ProjectsService({ project: { findUnique: jest.fn().mockResolvedValue({ id: 'p1' }) }, task: { findMany: jest.fn().mockResolvedValue([{ id: 't1' }]) }, activityLog: { findMany } } as any, {} as any);
    await service.getActivityLogs('p1', 50);
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 50, take: 50, where: { OR: [ { entity: 'Project', entityId: 'p1' }, { entity: 'Task', entityId: { in: ['t1'] } }, { entity: 'Task', changes: { path: ['projectId'], equals: 'p1' } } ] } }));
    await expect(service.getActivityLogs('p1', -1)).rejects.toThrow('Invalid activity offset');
  });
});
