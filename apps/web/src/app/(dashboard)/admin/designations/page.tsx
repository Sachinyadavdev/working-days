'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Briefcase } from 'lucide-react';


import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { RequirePermission } from '@/components/auth/require-permission';
import { DesignationModal } from './components/designation-modal';

interface Designation {
  id: string;
  name: string;
  level: string | null;
  departmentId: string | null;
  createdAt: string;
  department?: {
    id: string;
    name: string;
  } | null;
}

export default function DesignationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState<Designation | null>(null);

  const { data: designations = [], isLoading, refetch } = useQuery<Designation[]>({
    queryKey: ['designations'],
    queryFn: async () => {
      const response = await apiClient.get('/designation');
      const data = response.data;
      return Array.isArray(data?.data) 
        ? data.data 
        : Array.isArray(data?.items) 
        ? data.items 
        : Array.isArray(data) 
        ? data 
        : [];
    },
  });

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this designation?')) {
      try {
        await apiClient.delete(`/designation/${id}`);
        refetch();
      } catch (error) {
        console.error('Failed to delete designation', error);
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Briefcase className="text-brand-400" /> Designations
          </h1>
          <p className="text-brand-200 mt-1">Manage job titles and hierarchy levels.</p>
        </div>
        <RequirePermission permission="designations:create">
          <Button 
            className="bg-brand-500 hover:bg-brand-400 text-white shadow-lg shadow-brand-500/20"
            onClick={() => {
              setSelectedDesignation(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Designation
          </Button>
        </RequirePermission>
      </div>

      <div className="bg-black/20 rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-brand-300 text-sm">
            <tr>
              <th className="px-6 py-4 font-semibold">Title</th>
              <th className="px-6 py-4 font-semibold">Level</th>
              <th className="px-6 py-4 font-semibold">Department</th>
              <th className="px-6 py-4 font-semibold">Created Date</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-brand-300">
                  Loading designations...
                </td>
              </tr>
            ) : designations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-brand-300">
                  No designations found.
                </td>
              </tr>
            ) : (
              designations.map((desig) => (
                <tr key={desig.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{desig.name}</td>
                  <td className="px-6 py-4 text-brand-200">
                    {desig.level ? (
                      <span className="bg-white/10 text-brand-300 px-2 py-1 rounded text-xs">
                        {desig.level}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-brand-200">
                    {desig.department ? (
                      <span className="bg-brand-500/20 text-brand-300 px-2 py-1 rounded text-xs font-medium border border-brand-500/30">
                        {desig.department.name}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-brand-200">
                    {new Date(desig.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <RequirePermission permission="designations:update">
                        <button 
                          onClick={() => {
                            setSelectedDesignation(desig);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-brand-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                      </RequirePermission>
                      <RequirePermission permission="designations:delete">
                        <button 
                          onClick={() => handleDelete(desig.id)}
                          className="p-2 text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </RequirePermission>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DesignationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        designation={selectedDesignation}
      />
    </div>
  );
}
