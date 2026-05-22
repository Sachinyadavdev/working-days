'use client';

import { Bell, Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebar.store';
import { useAuthStore } from '@/stores/auth.store';

export function Header() {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const user = useAuthStore((s) => s.user);

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md transition-all duration-300',
        isCollapsed ? 'ml-16' : 'ml-64',
      )}
    >
      {/* Search bar */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search anything..."
            className="h-10 w-72 rounded-lg border border-input bg-muted/50 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand-400 focus:bg-background"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
            3
          </span>
        </button>

        {user && (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-semibold text-white shadow-md shadow-brand-500/20">
              {user.firstName[0]}{user.lastName[0]}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
