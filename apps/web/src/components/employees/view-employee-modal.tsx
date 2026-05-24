'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Mail, Phone, MapPin, Building2, Calendar, User as UserIcon, Briefcase, Activity } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';

interface ViewEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string | null;
}

export function ViewEmployeeModal({ isOpen, onClose, employeeId }: ViewEmployeeModalProps) {
  const { data: employeeData, isLoading } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: async () => {
      if (!employeeId) return null;
      const response = await apiClient.get(`/employees/${employeeId}`);
      return response.data?.data || response.data;
    },
    enabled: !!employeeId && isOpen,
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const employee = employeeData;
  const user = employee?.user;
  const department = employee?.department;
  const designation = employee?.designation;
  const roles = user?.roles?.map((r: any) => r.role?.name || r) || [];
  const isActive = employee?.status === 'ACTIVE' || user?.isActive;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-brand-900 border-white/10 text-white max-h-[90vh] overflow-y-auto p-0">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-brand-500 rounded-full border-t-transparent"></div>
          </div>
        ) : !employee ? (
          <div className="flex justify-center items-center h-64 text-brand-300">
            Employee not found.
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Header section with avatar */}
            <div className="bg-brand-800/50 p-8 pb-6 border-b border-white/5 relative">
              <div className="absolute top-6 right-6">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${
                    isActive
                      ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}
                >
                  {isActive ? 'Active' : 'Suspended'}
                </span>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-500 text-white text-3xl font-bold shadow-xl border-4 border-brand-900">
                  {user?.firstName?.[0] || 'U'}
                  {user?.lastName?.[0] || ''}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-brand-300 font-medium flex items-center gap-2 mb-2">
                    <Briefcase size={16} /> 
                    {designation?.name || 'No Designation'} • {department?.name || 'No Department'}
                  </p>
                  <div className="flex gap-2">
                    {roles.length > 0 ? roles.map((r: any) => (
                      <span key={r} className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-brand-700/50 text-brand-200 border border-brand-500/30">
                        {r.replace('_', ' ')}
                      </span>
                    )) : <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/5 text-brand-400">No Roles</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Details section */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider border-b border-white/5 pb-2">Contact Information</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="text-brand-300 mt-0.5" />
                    <div>
                      <div className="text-xs text-brand-300/70 mb-0.5">Email Address</div>
                      <div className="text-sm text-white">{user?.email || 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Phone size={18} className="text-brand-300 mt-0.5" />
                    <div>
                      <div className="text-xs text-brand-300/70 mb-0.5">Phone Number</div>
                      <div className="text-sm text-white">{employee.phone || 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-brand-300 mt-0.5" />
                    <div>
                      <div className="text-xs text-brand-300/70 mb-0.5">Address</div>
                      <div className="text-sm text-white">{employee.address || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider border-b border-white/5 pb-2">Professional Details</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Building2 size={18} className="text-brand-300 mt-0.5" />
                    <div>
                      <div className="text-xs text-brand-300/70 mb-0.5">Employee ID / Type</div>
                      <div className="text-sm text-white">{employee.employeeCode || 'N/A'} • {employee.employeeType?.replace('_', ' ') || 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Calendar size={18} className="text-brand-300 mt-0.5" />
                    <div>
                      <div className="text-xs text-brand-300/70 mb-0.5">Date of Joining</div>
                      <div className="text-sm text-white">{formatDate(employee.dateOfJoining)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <UserIcon size={18} className="text-brand-300 mt-0.5" />
                    <div>
                      <div className="text-xs text-brand-300/70 mb-0.5">Gender / DOB</div>
                      <div className="text-sm text-white">
                        {employee.gender || 'N/A'} {employee.dateOfBirth ? `• ${formatDate(employee.dateOfBirth)}` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Emergency Contact */}
              {employee.emergencyContact && (
                <div className="space-y-4 col-span-1 md:col-span-2 mt-2">
                  <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider border-b border-white/5 pb-2">Emergency Contact</h3>
                  <div className="flex items-start gap-3 bg-red-500/5 p-4 rounded-lg border border-red-500/10">
                    <Activity size={18} className="text-red-400 mt-0.5" />
                    <div className="text-sm text-white whitespace-pre-wrap">{employee.emergencyContact}</div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-white/5 bg-black/20 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors font-medium text-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
