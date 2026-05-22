'use client';

import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebar.store';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <Header />
      <main
        className={cn(
          'min-h-[calc(100vh-4rem)] p-6 transition-all duration-300',
          isCollapsed ? 'ml-16' : 'ml-64',
        )}
      >
        {children}
      </main>
    </div>
  );
}
