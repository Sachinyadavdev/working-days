'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckSquare, Clock, CalendarDays, MoreVertical, Edit, Eye, Trash, Search, Filter } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { CreateTaskModal } from '@/components/tasks/create-task-modal';
import { EditTaskModal } from '@/components/tasks/edit-task-modal';
import { ViewTaskModal } from '@/components/tasks/view-task-modal';

export default function TasksPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.roles?.includes('SUPER_ADMIN') || user?.roles?.includes('ADMIN') || user?.roles?.includes('PROJECT_MANAGER');

  const queryClient = useQueryClient();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; taskId: string | null }>({ isOpen: false, taskId: null });
  const [editModal, setEditModal] = useState<{ isOpen: boolean; taskId: string | null }>({ isOpen: false, taskId: null });
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  // Fetch all projects for the filter
  const { data: projectsResponse } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await apiClient.get('/projects');
      return data;
    },
  });

  let projects: any[] = [];
  if (Array.isArray(projectsResponse)) {
    projects = projectsResponse;
  } else if (projectsResponse?.data?.items && Array.isArray(projectsResponse.data.items)) {
    projects = projectsResponse.data.items;
  } else if (projectsResponse?.items && Array.isArray(projectsResponse.items)) {
    projects = projectsResponse.items;
  } else if (projectsResponse?.data && Array.isArray(projectsResponse.data)) {
    projects = projectsResponse.data;
  }

  // Fetch all tasks
  const { data: tasksResponse, isLoading } = useQuery({
    queryKey: ['tasks', searchQuery, selectedProjectId],
    queryFn: async () => {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedProjectId) params.projectId = selectedProjectId;
      
      const { data } = await apiClient.get('/tasks', { params });
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteMutation.mutate(id);
    }
  };

  let tasks: any[] = [];
  if (Array.isArray(tasksResponse)) {
    tasks = tasksResponse;
  } else if (tasksResponse?.data?.items && Array.isArray(tasksResponse.data.items)) {
    tasks = tasksResponse.data.items;
  } else if (tasksResponse?.items && Array.isArray(tasksResponse.items)) {
    tasks = tasksResponse.items;
  } else if (tasksResponse?.data && Array.isArray(tasksResponse.data)) {
    tasks = tasksResponse.data;
  }

  const columns = [
    {
      header: 'Task',
      accessorKey: 'title',
      cell: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400">
            <CheckSquare size={20} />
          </div>
          <div>
            <div className="font-semibold text-white">{item.title}</div>
            <div className="text-xs text-brand-300">{item.project?.name || 'No Project'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (item: any) => {
        const getStatusColor = (status: string) => {
          switch (status) {
            case 'COMPLETED': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'IN_REVIEW': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'TESTING': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'BLOCKED': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
          }
        };
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getStatusColor(item.status)}`}>
            {item.status?.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      header: 'Priority',
      accessorKey: 'priority',
      cell: (item: any) => {
        const getPriorityColor = (priority: string) => {
          switch (priority) {
            case 'CRITICAL': return 'text-red-400';
            case 'HIGH': return 'text-orange-400';
            case 'MEDIUM': return 'text-yellow-400';
            default: return 'text-brand-300';
          }
        };
        return (
          <span className={`text-xs font-bold ${getPriorityColor(item.priority)}`}>
            {item.priority}
          </span>
        );
      },
    },
    {
      header: 'Assignee',
      accessorKey: 'assignee',
      cell: (item: any) => (
        <div className="flex items-center gap-2">
          {item.assignee?.user ? (
            <>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                {item.assignee.user.firstName?.[0] || 'U'}
              </div>
              <span className="text-sm text-brand-100">{item.assignee.user.firstName} {item.assignee.user.lastName}</span>
            </>
          ) : (
            <span className="text-sm text-brand-400">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      header: 'Deadline',
      accessorKey: 'deadline',
      cell: (item: any) => (
        <div className="flex items-center gap-2 text-sm text-brand-300">
          <CalendarDays size={14} />
          {item.deadline ? new Date(item.deadline).toLocaleDateString() : 'No deadline'}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: (item: any) => {
        const isMenuOpen = openMenuId === item.id;
        return (
          <DropdownMenu.Root open={isMenuOpen} onOpenChange={(open) => setOpenMenuId(open ? item.id : null)}>
            <DropdownMenu.Trigger asChild>
              <button className="p-1 rounded-md hover:bg-white/10 text-brand-300 transition-colors outline-none">
                <MoreVertical size={18} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content align="end" className="z-[100] w-48 rounded-md bg-brand-800 border border-white/10 shadow-xl overflow-hidden">
                <DropdownMenu.Item 
                  onSelect={() => {
                    setViewModal({ isOpen: true, taskId: item.id });
                    setOpenMenuId(null);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-brand-100 hover:bg-white/5 flex items-center gap-2 transition-colors outline-none cursor-pointer"
                >
                  <Eye size={14} /> View Task
                </DropdownMenu.Item>
                <DropdownMenu.Item 
                  onSelect={() => {
                    setEditModal({ isOpen: true, taskId: item.id });
                    setOpenMenuId(null);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-brand-100 hover:bg-white/5 flex items-center gap-2 transition-colors border-t border-white/5 outline-none cursor-pointer"
                >
                  <Edit size={14} /> Edit Task
                </DropdownMenu.Item>
                <DropdownMenu.Item 
                  onSelect={() => {
                    handleDelete(item.id);
                    setOpenMenuId(null);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors border-t border-white/5 outline-none cursor-pointer"
                >
                  <Trash size={14} /> Delete
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        );
      },
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Tasks</h2>
          <p className="text-brand-300">Manage tasks, deadlines, and assignments.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white px-4 py-2 rounded-lg font-semibold shadow-lg shadow-brand-500/25 transition-all"
          >
            <Plus size={18} /> Create Task
          </button>
        )}
      </div>

      {/* Analytics Dashboard Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
        <Card className="bg-brand-900 border-white/5 shadow-lg flex flex-col justify-center">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-brand-500/20 text-brand-400 rounded-lg">
              <CheckSquare size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-brand-300">Total Tasks</p>
              <h3 className="text-xl font-bold text-white">{tasks.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-900 border-white/5 shadow-lg flex flex-col justify-center">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-gray-500/20 text-gray-400 rounded-lg">
              <CalendarDays size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-brand-300">Pending</p>
              <h3 className="text-xl font-bold text-white">
                {tasks.filter((t: any) => t.status === 'PENDING').length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-900 border-white/5 shadow-lg flex flex-col justify-center">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-lg">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-brand-300">In Progress</p>
              <h3 className="text-xl font-bold text-white">
                {tasks.filter((t: any) => t.status === 'IN_PROGRESS').length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-900 border-white/5 shadow-lg flex flex-col justify-center">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-lg">
              <Eye size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-brand-300">In Review</p>
              <h3 className="text-xl font-bold text-white">
                {tasks.filter((t: any) => t.status === 'IN_REVIEW').length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-900 border-white/5 shadow-lg flex flex-col justify-center">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-yellow-500/20 text-yellow-400 rounded-lg">
              <CheckSquare size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-brand-300">Testing</p>
              <h3 className="text-xl font-bold text-white">
                {tasks.filter((t: any) => t.status === 'TESTING').length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-900 border-white/5 shadow-lg flex flex-col justify-center">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-red-500/20 text-red-400 rounded-lg">
              <Edit size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-brand-300">Blocked</p>
              <h3 className="text-xl font-bold text-white">
                {tasks.filter((t: any) => t.status === 'BLOCKED').length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-900 border-white/5 shadow-lg flex flex-col justify-center">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-green-500/20 text-green-400 rounded-lg">
              <CheckSquare size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-brand-300">Completed</p>
              <h3 className="text-xl font-bold text-white">
                {tasks.filter((t: any) => t.status === 'COMPLETED').length}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-brand-900 border-white/5 shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-white/5 bg-black/20 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-xl text-white">All Tasks</CardTitle>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Task Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" size={16} />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white placeholder:text-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
              </div>

              {/* Project Filter */}
              <div className="relative w-full sm:w-48">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" size={16} />
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">All Projects</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={tasks}
            columns={columns}
            keyExtractor={(item: any) => item.id}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <CreateTaskModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      
      <ViewTaskModal 
        isOpen={viewModal.isOpen} 
        onClose={() => setViewModal({ isOpen: false, taskId: null })}
        taskId={viewModal.taskId}
      />
      
      <EditTaskModal 
        isOpen={editModal.isOpen} 
        onClose={() => setEditModal({ isOpen: false, taskId: null })}
        taskId={editModal.taskId}
      />
    </div>
  );
}
