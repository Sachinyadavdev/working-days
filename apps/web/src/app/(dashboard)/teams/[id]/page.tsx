'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  FolderKanban,
  KanbanSquare,
  BarChart3,
  Activity,
  CalendarDays,
  Shield,
  Trash2,
  Mail,
  UserCircle,
  MoreVertical,
  Settings,
  Target,
} from 'lucide-react';

import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { AddTeamMemberModal } from '@/components/teams/add-team-member-modal';
import { AssignProjectModal } from '@/components/teams/assign-project-modal';
import { TeamKanban } from '@/components/teams/team-kanban';
import { TeamAnalytics } from '@/components/teams/team-analytics';
import { TeamActivityFeed } from '@/components/teams/team-activity-feed';
import { TeamCalendar } from '@/components/teams/team-calendar';
import { EditTeamModal } from '@/components/teams/edit-team-modal';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Shield },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'tasks', label: 'Tasks', icon: KanbanSquare },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'activity', label: 'Activity Feed', icon: Activity },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
];

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  INACTIVE: 'bg-amber-100 text-amber-700',
  ARCHIVED: 'bg-gray-100 text-gray-700',
};

const ROLE_BADGE: Record<string, string> = {
  TEAM_LEAD: 'bg-indigo-100 text-indigo-700',
  SENIOR_DEVELOPER: 'bg-blue-100 text-blue-700',
  DEVELOPER: 'bg-sky-100 text-sky-700',
  QA_ENGINEER: 'bg-purple-100 text-purple-700',
  UI_UX_DESIGNER: 'bg-pink-100 text-pink-700',
  DEVOPS_ENGINEER: 'bg-orange-100 text-orange-700',
  INTERN: 'bg-teal-100 text-teal-700',
  MEMBER: 'bg-gray-100 text-gray-700',
};

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.id as string;
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('overview');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAssignProjectOpen, setIsAssignProjectOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Queries
  const { data: team, isLoading: isTeamLoading } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/teams/${teamId}`);
      return data?.data || data;
    },
  });

  const { data: kanbanData } = useQuery({
    queryKey: ['team-kanban', teamId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/teams/${teamId}/kanban`);
      return data?.data || data;
    },
    enabled: activeTab === 'tasks',
  });

  const { data: analyticsData, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['team-analytics', teamId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/teams/${teamId}/analytics`);
      return data?.data || data;
    },
    enabled: activeTab === 'analytics' || activeTab === 'overview',
  });

  const { data: activityData, isLoading: isActivityLoading } = useQuery({
    queryKey: ['team-activity', teamId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/teams/${teamId}/activity`);
      return data?.data || data;
    },
    enabled: activeTab === 'activity' || activeTab === 'overview',
  });

  const { data: calendarData, isLoading: isCalendarLoading } = useQuery({
    queryKey: ['team-calendar', teamId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/teams/${teamId}/calendar`);
      return data?.data || data;
    },
    enabled: activeTab === 'calendar',
  });

  // Mutations
  const removeMemberMutation = useMutation({
    mutationFn: async (employeeId: string) => apiClient.delete(`/teams/${teamId}/members/${employeeId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team', teamId] }),
  });

  const removeProjectMutation = useMutation({
    mutationFn: async (projectId: string) => apiClient.delete(`/teams/${teamId}/projects/${projectId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team', teamId] }),
  });

  if (isTeamLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-xl bg-card border border-border" />
        <div className="h-[500px] animate-pulse rounded-xl bg-card border border-border" />
      </div>
    );
  }

  if (!team) return <div>Team not found</div>;

  return (
    <div className="space-y-6 pb-20">
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-brand-500/20 to-brand-600/5 blur-3xl" />
        
        <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white font-bold text-2xl shadow-lg">
              {team.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{team.name}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_BADGE[team.status] || 'bg-gray-100'}`}>
                  {team.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{team.description || 'No description provided.'}</p>
              
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {team.department && (
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    {team.department.name}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {team._count?.members || 0} / {team.maxCapacity} Members
                </div>
                <div className="flex items-center gap-1.5">
                  <FolderKanban className="h-4 w-4" />
                  {team._count?.projects || 0} Projects
                </div>
              </div>

              {team.tags && team.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {team.tags.map((tag: string) => (
                    <span key={tag} className="text-[10px] px-2 py-1 rounded-md bg-muted text-muted-foreground font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(true)} className="gap-2">
              <Settings className="h-4 w-4" /> Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1 shadow-sm hide-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-brand-50 text-brand-700 shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-brand-600' : ''}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-6 md:col-span-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-4">Team Productivity</h3>
                    <div className="flex items-end justify-between">
                      <span className="text-4xl font-bold text-foreground">{analyticsData?.productivity || 0}%</span>
                      <BarChart3 className="h-8 w-8 text-brand-500 opacity-20" />
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-4">On-Time Delivery</h3>
                    <div className="flex items-end justify-between">
                      <span className="text-4xl font-bold text-foreground">{analyticsData?.onTimeRate || 0}%</span>
                      <Target className="h-8 w-8 text-emerald-500 opacity-20" />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <h3 className="text-base font-semibold text-foreground mb-4">Recent Activity</h3>
                  <div className="max-h-[400px] overflow-y-auto pr-2">
                    <TeamActivityFeed logs={activityData?.slice(0, 10) || []} isLoading={isActivityLoading} />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Team Lead Card */}
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4">Team Lead</h3>
                  {team.lead ? (
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold text-lg shadow-sm">
                        {team.lead.user.firstName[0]}{team.lead.user.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{team.lead.user.firstName} {team.lead.user.lastName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{team.lead.employeeCode}</p>
                        <a href={`mailto:${team.lead.user.email}`} className="text-xs text-brand-600 hover:underline mt-1 inline-flex items-center gap-1">
                          <Mail className="h-3 w-3" /> Contact
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No team lead assigned.</p>
                  )}
                </div>

                {/* Quick Members List */}
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">Members ({team.members?.length || 0})</h3>
                    <Button variant="link" size="sm" onClick={() => setActiveTab('members')} className="h-auto p-0 text-brand-600">View All</Button>
                  </div>
                  <div className="space-y-3">
                    {team.members?.slice(0, 5).map((m: any) => (
                      <div key={m.employeeId} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold">
                          {m.employee.user.firstName[0]}{m.employee.user.lastName[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{m.employee.user.firstName} {m.employee.user.lastName}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{m.role.replace('_', ' ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MEMBERS TAB */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              <div className="flex items-center justify-end">
                <Button onClick={() => setIsAddMemberOpen(true)} className="gap-2">
                  <Users className="h-4 w-4" /> Add Member
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {team.members?.map((m: any) => (
                  <div key={m.employeeId} className="relative rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-brand-500/30">
                    <div className="absolute right-3 top-3">
                      <Button variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" title="Remove Member" onClick={() => removeMemberMutation.mutate(m.employeeId)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-col items-center text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-200 text-brand-700 font-bold text-xl shadow-inner mb-3">
                        {m.employee.user.firstName[0]}{m.employee.user.lastName[0]}
                      </div>
                      <h4 className="text-sm font-bold text-foreground">{m.employee.user.firstName} {m.employee.user.lastName}</h4>
                      <p className="text-xs text-muted-foreground mb-3">{m.employee.designation?.name || 'Employee'}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${ROLE_BADGE[m.role] || 'bg-gray-100'}`}>
                        {m.role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
                {(!team.members || team.members.length === 0) && (
                  <div className="col-span-full py-12 text-center text-muted-foreground">
                    <UserCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No members added to this team yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-end">
                <Button onClick={() => setIsAssignProjectOpen(true)} className="gap-2">
                  <FolderKanban className="h-4 w-4" /> Assign Project
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {team.projects?.map((p: any) => (
                  <div key={p.project.id} className="group relative rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-brand-500/30">
                    <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" title="Unassign Project" onClick={() => removeProjectMutation.mutate(p.project.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs">
                        {p.project.key}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground line-clamp-1">{p.project.name}</h4>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${STATUS_BADGE[p.project.status] || 'bg-gray-100'}`}>
                          {p.project.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Tasks</p>
                        <p className="font-medium">{p.project._count?.tasks || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Members</p>
                        <p className="font-medium">{p.project._count?.members || 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {(!team.projects || team.projects.length === 0) && (
                  <div className="col-span-full py-12 text-center text-muted-foreground">
                    <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No projects assigned to this team yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TASKS / KANBAN TAB */}
          {activeTab === 'tasks' && (
            <div className="pt-2">
              <TeamKanban columns={kanbanData?.columns || {}} />
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="pt-2">
              <TeamAnalytics analytics={analyticsData} isLoading={isAnalyticsLoading} />
            </div>
          )}

          {/* ACTIVITY TAB */}
          {activeTab === 'activity' && (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm max-w-4xl mx-auto">
              <TeamActivityFeed logs={activityData || []} isLoading={isActivityLoading} />
            </div>
          )}

          {/* CALENDAR TAB */}
          {activeTab === 'calendar' && (
            <div className="pt-2">
              <TeamCalendar 
                taskDeadlines={calendarData?.taskDeadlines || []}
                projectMilestones={calendarData?.projectMilestones || []}
                leaveRequests={calendarData?.leaveRequests || []}
                isLoading={isCalendarLoading}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      <AddTeamMemberModal 
        isOpen={isAddMemberOpen} 
        onClose={() => setIsAddMemberOpen(false)} 
        teamId={teamId}
        existingMemberIds={team.members?.map((m: any) => m.employeeId) || []}
      />
      <AssignProjectModal
        isOpen={isAssignProjectOpen}
        onClose={() => setIsAssignProjectOpen(false)}
        teamId={teamId}
        existingProjectIds={team.projects?.map((p: any) => p.project.id) || []}
      />
      <EditTeamModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        teamId={teamId} 
      />
    </div>
  );
}
