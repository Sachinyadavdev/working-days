'use client';

import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebar.store';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const userId = useAuthStore((s) => s.user?.id);
  const setAccess = useAuthStore((s) => s.setAccess);
  const { data: profile } = useQuery({
    queryKey: ['current-access', userId],
    enabled: !!userId,
    queryFn: async () => (await apiClient.get('/users/me')).data.data as { id: string; roles: string[]; permissions: string[] },
    refetchInterval: 30000,
    refetchOnWindowFocus: 'always',
  });
  useEffect(() => {
    if (profile) setAccess(profile.id, profile.roles, profile.permissions);
  }, [profile, setAccess]);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <Header />
      <main
        className={cn(
          'min-h-[calc(100vh-4rem)] p-6 transition-all duration-300',
          isCollapsed ? 'ml-16' : 'ml-56',
        )}
      >
        {children}
      </main>
    </div>
  );
}
