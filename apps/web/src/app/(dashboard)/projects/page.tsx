'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Plus,
  FolderKanban,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  Archive,
  CalendarDays,
  Users,
  ChevronDown,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { ProjectStats } from '@/components/projects/project-stats';
import { CreateProjectModal } from '@/components/projects/create-project-modal';
import { EditProjectModal } from '@/components/projects/edit-project-modal';

const selectClass = 'h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring';

const STATUS_BADGE: Record<string, string> = {
  PLANNING: 'bg-slate-100 text-slate-700 border-slate-200',
  ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  ON_HOLD: 'bg-amber-100 text-amber-700 border-amber-200',
  COMPLETED: 'bg-blue-100 text-blue-700 border-blue-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
  ARCHIVED: 'bg-gray-100 text-gray-700 border-gray-200',
};

const PRIORITY_BADGE: Record<string, string> = {
  LOW: 'text-blue-500',
  MEDIUM: 'text-yellow-500',
  HIGH: 'text-orange-500',
  CRITICAL: 'text-red-500',
};

export default function ProjectsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isAdmin = user?.roles?.includes('SUPER_ADMIN') || user?.roles?.includes('ADMIN') || user?.roles?.includes('PROJECT_MANAGER');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editModal, setEditModal] = useState<{ isOpen: boolean; projectId: string | null }>({ isOpen: false, projectId: null });
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['project-stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/projects/stats');
      return data?.data || data;
    },
  });

  // Fetch projects
  const { data: projectsResponse, isLoading } = useQuery({
    queryKey: ['projects', searchTerm, statusFilter, priorityFilter],
    queryFn: async () => {
      const params: Record<string, string> = { limit: '50' };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const { data } = await apiClient.get('/projects', { params });
      return data;
    },
  });

  let projects: any[] = [];
  if (Array.isArray(projectsResponse)) projects = projectsResponse;
  else if (projectsResponse?.data?.items) projects = projectsResponse.data.items;
  else if (projectsResponse?.items) projects = projectsResponse.items;
  else if (projectsResponse?.data && Array.isArray(projectsResponse.data)) projects = projectsResponse.data;

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiClient.delete(`/projects/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-stats'] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => { await apiClient.delete(`/projects/${id}/archive`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-stats'] });
    },
  });

  const columns = [
    {
      header: 'Project',
      accessorKey: 'name',
      cell: (item: any) => (
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/projects/${item.id}`)}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 text-white font-bold text-sm shadow-md">
            {item.key?.substring(0, 2) || 'P'}
          </div>
          <div>
            <div className="font-semibold text-foreground hover:text-brand-500 transition-colors">{item.name}</div>
            <div className="text-xs text-muted-foreground font-mono">{item.key}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (item: any) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${STATUS_BADGE[item.status] || 'bg-gray-100 text-gray-700'}`}>
          {item.status?.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Priority',
      accessorKey: 'priority',
      cell: (item: any) => (
        <span className={`text-xs font-bold ${PRIORITY_BADGE[item.priority] || 'text-muted-foreground'}`}>
          ● {item.priority}
        </span>
      ),
    },
    {
      header: 'Manager',
      accessorKey: 'projectManager',
      cell: (item: any) => (
        <div className="flex items-center gap-2">
          {item.projectManager?.user ? (
            <>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700">
                {item.projectManager.user.firstName[0]}{item.projectManager.user.lastName[0]}
              </div>
              <span className="text-sm text-foreground">{item.projectManager.user.firstName} {item.projectManager.user.lastName}</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      header: 'Deadline',
      accessorKey: 'endDate',
      cell: (item: any) => {
        if (!item.endDate) return <span className="text-sm text-muted-foreground">No deadline</span>;
        const isOverdue = new Date(item.endDate) < new Date() && item.status !== 'COMPLETED' && item.status !== 'ARCHIVED';
        return (
          <div className={`flex items-center gap-1.5 text-sm ${isOverdue ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
            <CalendarDays className="h-3.5 w-3.5" />
            {new Date(item.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        );
      },
    },
    {
      header: 'Tasks',
      accessorKey: '_count',
      cell: (item: any) => (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{item._count?.tasks ?? 0}</span> tasks
          <span>·</span>
          <span><Users className="inline h-3.5 w-3.5 mr-1" />{item._count?.members ?? 0}</span>
        </div>
      ),
    },
    {
      header: '',
      accessorKey: 'actions',
      cell: (item: any) => (
        <DropdownMenu.Root open={openMenuId === item.id} onOpenChange={(open) => setOpenMenuId(open ? item.id : null)}>
          <DropdownMenu.Trigger asChild>
            <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors outline-none">
              <MoreVertical size={16} />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content align="end" className="z-[100] w-48 rounded-lg bg-popover border border-border shadow-xl overflow-hidden">
              <DropdownMenu.Item
                onSelect={() => { router.push(`/projects/${item.id}`); setOpenMenuId(null); }}
                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2 transition-colors outline-none cursor-pointer"
              >
                <Eye size={14} /> View Details
              </DropdownMenu.Item>
              {isAdmin && (
                <>
                  <DropdownMenu.Item
                    onSelect={() => { setEditModal({ isOpen: true, projectId: item.id }); setOpenMenuId(null); }}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2 transition-colors border-t border-border outline-none cursor-pointer"
                  >
                    <Edit size={14} /> Edit
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={() => { if (window.confirm('Archive this project?')) archiveMutation.mutate(item.id); setOpenMenuId(null); }}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2 transition-colors border-t border-border outline-none cursor-pointer"
                  >
                    <Archive size={14} /> Archive
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={() => { if (window.confirm('Permanently delete this project? This cannot be undone.')) deleteMutation.mutate(item.id); setOpenMenuId(null); }}
                    className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-border outline-none cursor-pointer"
                  >
                    <Trash2 size={14} /> Delete
                  </DropdownMenu.Item>
                </>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      ),
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage and track all projects across your organization.</p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 shadow-lg"
          >
            <Plus size={18} /> New Project
          </Button>
        )}
      </div>

      {/* Stats Dashboard */}
      <ProjectStats stats={statsData} isLoading={statsLoading} />

      {/* Filters + Table */}
      <Card>
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-lg">All Projects</CardTitle>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-60"
                />
              </div>
              {/* Filter toggle */}
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1.5">
                <Filter className="h-4 w-4" />
                Filters
                <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Expandable filters */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex items-center gap-3 mt-4 flex-wrap"
            >
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
                <option value="">All Statuses</option>
                <option value="PLANNING">Planning</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="ARCHIVED">Archived</option>
              </select>

              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className={selectClass}>
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>

              {(statusFilter || priorityFilter) && (
                <Button variant="ghost" size="sm" onClick={() => { setStatusFilter(''); setPriorityFilter(''); }}>
                  Clear Filters
                </Button>
              )}
            </motion.div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={projects}
            columns={columns}
            keyExtractor={(item: any) => item.id}
            isLoading={isLoading}
            onRowClick={(item: any) => router.push(`/projects/${item.id}`)}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateProjectModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <EditProjectModal isOpen={editModal.isOpen} onClose={() => setEditModal({ isOpen: false, projectId: null })} projectId={editModal.projectId} />
    </div>
  );
}
