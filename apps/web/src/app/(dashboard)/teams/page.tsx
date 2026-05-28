'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, MoreHorizontal, Edit, Archive, Trash2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { TeamStats } from '@/components/teams/team-stats';
import { CreateTeamModal } from '@/components/teams/create-team-modal';
import { EditTeamModal } from '@/components/teams/edit-team-modal';

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  INACTIVE: 'bg-amber-100 text-amber-700',
  ARCHIVED: 'bg-gray-100 text-gray-700',
};

export default function TeamsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch stats
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['team-stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/teams/stats');
      return data?.data || data;
    },
  });

  // Fetch teams list
  const { data: teamsData, isLoading: isTeamsLoading } = useQuery({
    queryKey: ['teams', page, debouncedSearch, statusFilter],
    queryFn: async () => {
      const params: any = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      const { data } = await apiClient.get('/teams', { params });
      return data?.data || data;
    },
  });

  // Mutations
  const archiveMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/teams/${id}/archive`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['team-stats'] });
      alert('Team archived successfully');
    },
  });

  const activateMutation = useMutation({
    mutationFn: async (id: string) => apiClient.patch(`/teams/${id}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['team-stats'] });
      alert('Team activated successfully');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/teams/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['team-stats'] });
      alert('Team deleted successfully');
    },
  });

  const handleAction = (e: React.MouseEvent, action: string, team: any) => {
    e.stopPropagation();
    if (action === 'edit') setEditingTeamId(team.id);
    else if (action === 'archive') archiveMutation.mutate(team.id);
    else if (action === 'activate') activateMutation.mutate(team.id);
    else if (action === 'delete') {
      if (confirm(`Are you sure you want to permanently delete the team "${team.name}"?`)) {
        deleteMutation.mutate(team.id);
      }
    }
  };

  const columns = [
    {
      header: 'Team Name',
      accessorKey: 'name',
      cell: (team: any) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 text-white font-bold text-sm shadow">
            {team.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-foreground">{team.name}</p>
            {team.department && (
              <p className="text-xs text-muted-foreground mt-0.5">{team.department.name}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Team Lead',
      cell: (team: any) => (
        team.lead?.user ? (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
              {team.lead.user.firstName[0]}{team.lead.user.lastName[0]}
            </div>
            <span className="text-sm">{team.lead.user.firstName} {team.lead.user.lastName}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground italic">No lead assigned</span>
        )
      ),
    },
    {
      header: 'Members',
      cell: (team: any) => (
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium">{team._count?.members || 0}</span>
          <span className="text-xs text-muted-foreground">/ {team.maxCapacity}</span>
        </div>
      ),
    },
    {
      header: 'Projects',
      cell: (team: any) => (
        <span className="text-sm font-medium">{team._count?.projects || 0}</span>
      ),
    },
    {
      header: 'Status',
      cell: (team: any) => (
        <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${STATUS_BADGE[team.status] || 'bg-gray-100 text-gray-700'}`}>
          {team.status}
        </span>
      ),
    },
    {
      header: '',
      className: 'w-24 text-right',
      cell: (team: any) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit Team" onClick={(e) => handleAction(e, 'edit', team)}>
            <Edit className="h-4 w-4" />
          </Button>
          {team.status === 'ARCHIVED' ? (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Activate" onClick={(e) => handleAction(e, 'activate', team)}>
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Archive" onClick={(e) => handleAction(e, 'archive', team)}>
              <Archive className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" title="Delete" onClick={(e) => handleAction(e, 'delete', team)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Teams</h1>
          <p className="text-sm text-muted-foreground">Manage organizational teams, members, and projects.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Create Team
        </Button>
      </div>

      <TeamStats stats={statsData} isLoading={isStatsLoading} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border bg-card shadow-sm"
      >
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-[150px]"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        <div className="p-4">
          <DataTable
            data={teamsData?.items || []}
            columns={columns}
            keyExtractor={(item) => item.id}
            isLoading={isTeamsLoading}
            onRowClick={(item) => router.push(`/teams/${item.id}`)}
            pagination={
              teamsData?.meta
                ? {
                    page: teamsData.meta.page,
                    limit: teamsData.meta.limit,
                    total: teamsData.meta.total,
                    totalPages: teamsData.meta.totalPages,
                    onPageChange: setPage,
                  }
                : undefined
            }
          />
        </div>
      </motion.div>

      <CreateTeamModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <EditTeamModal isOpen={!!editingTeamId} onClose={() => setEditingTeamId(null)} teamId={editingTeamId} />
    </div>
  );
}
