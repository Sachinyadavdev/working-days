'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  UsersRound,
  Clock,
  CalendarDays,
  Bell,
  Activity,
  Settings,
  ShieldAlert,
  UserCog,
  ChevronLeft,
  LogOut,
  Building2,
  Briefcase,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebar.store';
import { useAuthStore } from '@/stores/auth.store';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Teams', href: '/teams', icon: UsersRound },
  { name: 'Attendance', href: '/attendance', icon: Clock },
  { name: 'Leave', href: '/leave', icon: CalendarDays },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Activity', href: '/activity', icon: Activity },
  { name: 'Roles', href: '/settings/roles', icon: ShieldAlert },
  { name: 'User Access', href: '/settings/users', icon: UserCog },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const adminNavigation = [
  { name: 'Admin Dashboard', href: '/admin', icon: ShieldAlert },
  { name: 'Workspaces', href: '/admin/workspaces', icon: FolderKanban },
  { name: 'Departments', href: '/admin/departments', icon: Building2 },
  { name: 'Designations', href: '/admin/designations', icon: Briefcase },
  { name: 'All Users', href: '/admin/users', icon: Users },
  { name: 'All Roles', href: '/admin/roles', icon: UserCog },
  { name: 'Audit Logs', href: '/admin/audit', icon: Activity },
  { name: 'Sys Settings', href: '/admin/settings', icon: Settings },
];

const employeeNavigation = [
  { name: 'My Profile', href: '/employee/profile', icon: UserCog },
  { name: 'My Projects', href: '/employee/projects', icon: FolderKanban },
  { name: 'My Salary', href: '/employee/salary', icon: Activity },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, toggle } = useSidebarStore();
  const { user, logout } = useAuthStore();
  
  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN') || false;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 shadow-md shadow-brand-500/20">
          <span className="text-lg font-bold text-white">E</span>
        </div>
        {!isCollapsed && (
          <span className="ml-3 text-lg font-bold text-sidebar-foreground">
            EMS
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                isCollapsed && 'justify-center px-0',
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}

        {isSuperAdmin && (
          <>
            <div className="my-4 border-t border-sidebar-border" />
            <div className={cn("px-3 mb-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider", isCollapsed && "hidden")}>
              Super Admin
            </div>
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-brand-600',
                    isActive
                      ? 'bg-brand-50 text-brand-700 shadow-sm'
                      : 'hover:bg-brand-50/50 hover:text-brand-700',
                    isCollapsed && 'justify-center px-0',
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </>
        )}

        <>
          <div className="my-4 border-t border-sidebar-border" />
          <div className={cn("px-3 mb-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider", isCollapsed && "hidden")}>
            Employee Self Service
          </div>
          {employeeNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-sidebar-foreground/70',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                    : 'hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                  isCollapsed && 'justify-center px-0',
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </>
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-3">
        {!isCollapsed && user && (
          <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/50">
                {user.email}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-red-50 hover:text-red-600',
            isCollapsed && 'justify-center px-0',
          )}
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggle}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar shadow-sm transition-colors hover:bg-sidebar-accent"
      >
        <ChevronLeft
          className={cn('h-3.5 w-3.5 text-sidebar-foreground transition-transform', isCollapsed && 'rotate-180')}
        />
      </button>
    </aside>
  );
}
