'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import * as Tabs from '@radix-ui/react-tabs';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Target,
  Kanban,
  GanttChart,
  Activity,
  Paperclip,
  CheckSquare,
  Edit,
  UserPlus,
  Trash2,
  CalendarDays,
  AlertCircle,
  FileText,
  ExternalLink,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { ProjectKanban } from '@/components/projects/project-kanban';
import { ProjectTimeline } from '@/components/projects/project-timeline';
import { ProjectActivityFeed } from '@/components/projects/project-activity-feed';
import { AddMemberModal } from '@/components/projects/add-member-modal';
import { EditProjectModal } from '@/components/projects/edit-project-modal';
import { CreateTaskModal } from '@/components/tasks/create-task-modal';
import { ViewTaskModal } from '@/components/tasks/view-task-modal';

const STATUS_BADGE: Record<string, string> = {
  PLANNING: 'bg-slate-100 text-slate-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  ON_HOLD: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
  ARCHIVED: 'bg-gray-100 text-gray-700',
};

const PRIORITY_BADGE: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const TASK_STATUS_COLOR: Record<string, string> = {
  BACKLOG: 'bg-slate-400',
  PENDING: 'bg-amber-400',
  IN_PROGRESS: 'bg-blue-500',
  IN_REVIEW: 'bg-purple-500',
  TESTING: 'bg-orange-500',
  COMPLETED: 'bg-emerald-500',
  BLOCKED: 'bg-red-500',
  CANCELLED: 'bg-gray-400',
};

const tabClass = 'px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:text-brand-600 data-[state=active]:border-b-2 data-[state=active]:border-brand-500 outline-none cursor-pointer';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const projectId = params.id as string;
  const isAdmin = user?.roles?.includes('SUPER_ADMIN') || user?.roles?.includes('ADMIN') || user?.roles?.includes('PROJECT_MANAGER');

  const [activeTab, setActiveTab] = useState('overview');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [viewTaskId, setViewTaskId] = useState<string | null>(null);

  // Fetch project details
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/projects/${projectId}`);
      return data?.data || data;
    },
    enabled: !!projectId,
  });

  // Fetch Kanban data
  const { data: kanbanData } = useQuery({
    queryKey: ['project-kanban', projectId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/projects/${projectId}/kanban`);
      return data?.data || data;
    },
    enabled: !!projectId && activeTab === 'kanban',
  });

  // Fetch timeline data
  const { data: timelineData } = useQuery({
    queryKey: ['project-timeline', projectId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/projects/${projectId}/timeline`);
      return data?.data || data;
    },
    enabled: !!projectId && activeTab === 'timeline',
  });

  // Fetch activity logs
  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['project-activity', projectId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/projects/${projectId}/activity`);
      return data?.data || data;
    },
    enabled: !!projectId && activeTab === 'activity',
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      await apiClient.delete(`/projects/${projectId}/members/${employeeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p className="text-lg font-medium">Project not found</p>
        <Button variant="outline" onClick={() => router.push('/projects')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Projects
        </Button>
      </div>
    );
  }

  // Compute task stats
  const tasks = project.tasks || [];
  const completedTasks = tasks.filter((t: any) => t.status === 'COMPLETED').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const members = project.members || [];
  const existingMemberIds = members.map((m: any) => m.employeeId || m.employee?.id);

  // Days remaining
  const daysRemaining = project.endDate
    ? Math.ceil((new Date(project.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-[1400px] mx-auto">
      {/* Back + Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button onClick={() => router.push('/projects')} className="mt-1 p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white font-bold text-lg shadow-lg">
                {project.key?.substring(0, 2)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{project.key}</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[project.status]}`}>{project.status?.replace('_', ' ')}</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${PRIORITY_BADGE[project.priority]}`}>{project.priority}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
              <Edit className="h-4 w-4 mr-1.5" /> Edit
            </Button>
          </div>
        )}
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <CheckSquare className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{completedTasks}/{tasks.length}</p>
            <p className="text-xs text-muted-foreground">Tasks Done</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Target className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{progressPercent}%</p>
            <p className="text-xs text-muted-foreground">Progress</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center">
            <Users className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{members.length}</p>
            <p className="text-xs text-muted-foreground">Members</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${daysRemaining !== null && daysRemaining < 0 ? 'bg-red-100' : 'bg-amber-100'}`}>
            <Clock className={`h-5 w-5 ${daysRemaining !== null && daysRemaining < 0 ? 'text-red-600' : 'text-amber-600'}`} />
          </div>
          <div>
            <p className={`text-2xl font-bold ${daysRemaining !== null && daysRemaining < 0 ? 'text-red-500' : 'text-foreground'}`}>
              {daysRemaining !== null ? (daysRemaining >= 0 ? daysRemaining : `${Math.abs(daysRemaining)} overdue`) : '—'}
            </p>
            <p className="text-xs text-muted-foreground">{daysRemaining !== null && daysRemaining >= 0 ? 'Days Left' : daysRemaining !== null ? '' : 'No Deadline'}</p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-400"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      {/* Tabs */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex border-b border-border overflow-x-auto">
          <Tabs.Trigger value="overview" className={tabClass}>
            <FileText className="inline h-4 w-4 mr-1.5" />Overview
          </Tabs.Trigger>
          <Tabs.Trigger value="tasks" className={tabClass}>
            <CheckSquare className="inline h-4 w-4 mr-1.5" />Tasks
          </Tabs.Trigger>
          <Tabs.Trigger value="kanban" className={tabClass}>
            <Kanban className="inline h-4 w-4 mr-1.5" />Kanban
          </Tabs.Trigger>
          <Tabs.Trigger value="timeline" className={tabClass}>
            <GanttChart className="inline h-4 w-4 mr-1.5" />Timeline
          </Tabs.Trigger>
          <Tabs.Trigger value="team" className={tabClass}>
            <Users className="inline h-4 w-4 mr-1.5" />Team ({members.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="activity" className={tabClass}>
            <Activity className="inline h-4 w-4 mr-1.5" />Activity
          </Tabs.Trigger>
          <Tabs.Trigger value="files" className={tabClass}>
            <Paperclip className="inline h-4 w-4 mr-1.5" />Files
          </Tabs.Trigger>
        </Tabs.List>

        {/* ─── OVERVIEW TAB ─── */}
        <Tabs.Content value="overview" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left: Project Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {project.description || 'No description provided.'}
                  </p>
                </CardContent>
              </Card>

              {/* Recent Tasks */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Tasks</CardTitle>
                  {isAdmin && (
                    <Button size="sm" variant="outline" onClick={() => setIsCreateTaskOpen(true)}>
                      <CheckSquare className="h-4 w-4 mr-1.5" /> Add Task
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No tasks yet. Create your first task!</p>
                  ) : (
                    <div className="space-y-2">
                      {tasks.slice(0, 10).map((task: any) => (
                        <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setViewTaskId(task.id)}>
                          <div className={`h-2.5 w-2.5 rounded-full ${TASK_STATUS_COLOR[task.status] || 'bg-gray-400'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                          </div>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${PRIORITY_BADGE[task.priority]}`}>{task.priority}</span>
                          {task.assignee?.user && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700" title={`${task.assignee.user.firstName} ${task.assignee.user.lastName}`}>
                              {task.assignee.user.firstName[0]}{task.assignee.user.lastName[0]}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Project Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Client', value: project.clientName || '—' },
                    { label: 'Budget', value: project.estimatedBudget ? `₹${Number(project.estimatedBudget).toLocaleString()}` : '—' },
                    { label: 'Start Date', value: project.startDate ? new Date(project.startDate).toLocaleDateString() : '—' },
                    { label: 'End Date', value: project.endDate ? new Date(project.endDate).toLocaleDateString() : '—' },
                    { label: 'Created', value: new Date(project.createdAt).toLocaleDateString() },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium text-foreground">{item.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Project Manager */}
              <Card>
                <CardHeader><CardTitle>Project Manager</CardTitle></CardHeader>
                <CardContent>
                  {project.projectManager?.user ? (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                        {project.projectManager.user.firstName[0]}{project.projectManager.user.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{project.projectManager.user.firstName} {project.projectManager.user.lastName}</p>
                        <p className="text-xs text-muted-foreground">{project.projectManager.user.email}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No manager assigned</p>
                  )}
                </CardContent>
              </Card>

              {/* Tags */}
              {project.tags?.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag: string) => (
                        <span key={tag} className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 border border-brand-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Team Preview */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Team</CardTitle>
                  <button onClick={() => setActiveTab('team')} className="text-xs text-brand-500 hover:text-brand-600">View all</button>
                </CardHeader>
                <CardContent>
                  <div className="flex -space-x-2">
                    {members.slice(0, 6).map((m: any) => (
                      <div key={m.id} className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700 border-2 border-card" title={`${m.employee?.user?.firstName} ${m.employee?.user?.lastName}`}>
                        {m.employee?.user?.firstName?.[0]}{m.employee?.user?.lastName?.[0]}
                      </div>
                    ))}
                    {members.length > 6 && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground border-2 border-card">
                        +{members.length - 6}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Tabs.Content>

        {/* ─── TASKS TAB ─── */}
        <Tabs.Content value="tasks" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Tasks ({tasks.length})</CardTitle>
              {isAdmin && (
                <Button size="sm" onClick={() => setIsCreateTaskOpen(true)}>
                  <CheckSquare className="h-4 w-4 mr-1.5" /> Create Task
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CheckSquare className="h-10 w-10 mb-3" />
                  <p>No tasks created yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task: any) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setViewTaskId(task.id)}>
                      <div className={`h-3 w-3 rounded-full shrink-0 ${TASK_STATUS_COLOR[task.status]}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{task.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{project.key}-{task.taskNumber} · {task.status?.replace('_', ' ')}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_BADGE[task.priority]}`}>{task.priority}</span>
                      {task.assignee?.user && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700">
                          {task.assignee.user.firstName[0]}{task.assignee.user.lastName[0]}
                        </div>
                      )}
                      {task.deadline && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* ─── KANBAN TAB ─── */}
        <Tabs.Content value="kanban" className="mt-6">
          {kanbanData?.columns ? (
            <ProjectKanban columns={kanbanData.columns} projectKey={project.key} projectId={projectId} onTaskClick={setViewTaskId} />
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mr-3" />
              Loading Kanban board...
            </div>
          )}
        </Tabs.Content>

        {/* ─── TIMELINE TAB ─── */}
        <Tabs.Content value="timeline" className="mt-6">
          {timelineData?.tasks ? (
            <ProjectTimeline
              projectStartDate={timelineData.project?.startDate}
              projectEndDate={timelineData.project?.endDate}
              projectKey={project.key}
              tasks={timelineData.tasks}
              onTaskClick={setViewTaskId}
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mr-3" />
              Loading timeline...
            </div>
          )}
        </Tabs.Content>

        {/* ─── TEAM TAB ─── */}
        <Tabs.Content value="team" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Team Members ({members.length})</CardTitle>
              {isAdmin && (
                <Button size="sm" onClick={() => setIsAddMemberOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-1.5" /> Add Member
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Users className="h-10 w-10 mb-3" />
                  <p>No team members yet</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {members.map((member: any) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-brand-500/30 hover:shadow-sm transition-all group"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white text-sm font-bold shadow-md">
                        {member.employee?.user?.firstName?.[0]}{member.employee?.user?.lastName?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {member.employee?.user?.firstName} {member.employee?.user?.lastName}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{member.employee?.employeeCode}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">{member.role}</span>
                        </div>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => { if (window.confirm(`Remove ${member.employee?.user?.firstName} from this project?`)) removeMemberMutation.mutate(member.employeeId || member.employee?.id); }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-50 text-red-400 hover:text-red-600 transition-all"
                          title="Remove member"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* ─── ACTIVITY TAB ─── */}
        <Tabs.Content value="activity" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Activity Log</CardTitle></CardHeader>
            <CardContent>
              <ProjectActivityFeed logs={activityData || []} isLoading={activityLoading} />
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* ─── FILES TAB ─── */}
        <Tabs.Content value="files" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Attachments</CardTitle></CardHeader>
            <CardContent>
              {(!project.attachments || project.attachments.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Paperclip className="h-10 w-10 mb-3" />
                  <p>No files attached</p>
                  <p className="text-xs mt-1">Add file URLs when editing the project</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {project.attachments.map((url: string, i: number) => {
                    const fileName = url.split('/').pop() || `File ${i + 1}`;
                    return (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                      >
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <Paperclip className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
                          <p className="text-xs text-muted-foreground truncate">{url}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs.Content>
      </Tabs.Root>

      {/* Modals */}
      <EditProjectModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} projectId={projectId} />
      <AddMemberModal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} projectId={projectId} existingMemberIds={existingMemberIds} />
      <CreateTaskModal isOpen={isCreateTaskOpen} onClose={() => setIsCreateTaskOpen(false)} />
      <ViewTaskModal isOpen={!!viewTaskId} onClose={() => setViewTaskId(null)} taskId={viewTaskId} />
    </div>
  );
}
