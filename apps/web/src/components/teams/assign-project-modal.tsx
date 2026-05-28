'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, FolderKanban } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';

const STATUS_BADGE: Record<string, string> = {
  PLANNING: 'bg-slate-100 text-slate-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  ON_HOLD: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
  ARCHIVED: 'bg-gray-100 text-gray-700',
};

interface AssignProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  existingProjectIds: string[];
}

export function AssignProjectModal({ isOpen, onClose, teamId, existingProjectIds }: AssignProjectModalProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: projectsData } = useQuery({
    queryKey: ['projects-for-team-assign'],
    queryFn: async () => {
      const { data } = await apiClient.get('/projects', { params: { limit: '100' } });
      const items = data?.data?.items || data?.items || data?.data || [];
      return Array.isArray(items) ? items : [];
    },
    enabled: isOpen,
  });

  const allProjects = projectsData || [];
  const availableProjects = allProjects.filter(
    (p: any) => !existingProjectIds.includes(p.id) && p.status !== 'ARCHIVED' && p.status !== 'CANCELLED'
  );

  const filteredProjects = availableProjects.filter((p: any) => {
    if (!search) return true;
    return p.name.toLowerCase().includes(search.toLowerCase()) || p.key?.toLowerCase().includes(search.toLowerCase());
  });

  const assignMutation = useMutation({
    mutationFn: async (projectId: string) => {
      await apiClient.post(`/teams/${teamId}/projects`, { projectId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      queryClient.invalidateQueries({ queryKey: ['team-stats'] });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { setSearch(''); onClose(); } }}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-brand-500" /> Assign Project
          </DialogTitle>
          <DialogDescription>Search and assign projects to this team.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          <div className="space-y-2 max-h-[350px] overflow-y-auto">
            {filteredProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No available projects found</p>
            ) : (
              filteredProjects.map((project: any) => (
                <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-brand-500/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 text-white font-bold text-xs shadow">
                      {project.key?.substring(0, 2) || 'P'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{project.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-mono text-muted-foreground">{project.key}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${STATUS_BADGE[project.status] || 'bg-gray-100 text-gray-700'}`}>
                          {project.status?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => assignMutation.mutate(project.id)} disabled={assignMutation.isPending} className="text-xs">
                    Assign
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
