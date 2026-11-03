'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search, X } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { ViewTaskModal } from '@/components/tasks/view-task-modal';
import { ViewEmployeeModal } from '@/components/employees/view-employee-modal';
import { cn } from '@/lib/utils';

type SearchResult = {
  type: 'project' | 'task' | 'team' | 'employee';
  id: string;
  title: string;
  subtitle: string;
};

const labels = { project: 'Projects', task: 'Tasks', team: 'Teams', employee: 'Employees' };

export function GlobalSearch() {
  const user = useAuthStore(state => state.user);
  const router = useRouter();
  const pathname = usePathname();
  const listId = useId();
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const query = value.trim();

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setOpen(false);
    setValue('');
    setTaskId(null);
    setEmployeeId(null);
  }, [pathname, user?.id]);

  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, []);

  const search = useQuery({
    queryKey: ['global-search', user?.id, user?.roles, query],
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<{ data: { items: SearchResult[] } }>('/search', {
        params: { q: query }, signal,
      });
      return response.data.data.items;
    },
    enabled: !!user && open && query.length >= 2 && query === debounced,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });

  const loading = query.length >= 2 && (query !== debounced || search.isFetching);
  const items = loading || search.isError ? [] : search.data || [];
  const activeIndex = Math.min(active, Math.max(0, items.length - 1));
  const expanded = open && !!user;

  useEffect(() => {
    if (expanded) root.current?.querySelector(`[data-result-index="${activeIndex}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, expanded]);

  const select = (item: SearchResult) => {
    setOpen(false);
    setValue('');
    if (item.type === 'task') setTaskId(item.id);
    else if (item.type === 'employee') setEmployeeId(item.id);
    else router.push(`/${item.type === 'project' ? 'projects' : 'teams'}/${encodeURIComponent(item.id)}`);
  };

  return (
    <>
      <div ref={root} className="relative" onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}>
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={input}
          type="search"
          role="combobox"
          aria-label="Search projects, tasks, teams and employees"
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={expanded ? listId : undefined}
          aria-activedescendant={expanded && items.length ? `${listId}-${activeIndex}` : undefined}
          autoComplete="off"
          maxLength={100}
          value={value}
          placeholder="Search projects, tasks, people…"
          className="h-10 w-48 rounded-lg border border-input bg-muted/50 pl-10 pr-9 text-sm outline-none transition-colors focus:border-brand-400 focus:bg-background sm:w-72 [&::-webkit-search-cancel-button]:hidden"
          onFocus={() => setOpen(true)}
          onChange={event => { setValue(event.target.value); setOpen(true); setActive(0); }}
          onKeyDown={event => {
            if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              setOpen(true);
              if (items.length) setActive((activeIndex + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length);
            }
            if (event.key === 'Enter') {
              event.preventDefault();
              if (expanded && items[activeIndex]) select(items[activeIndex]);
            }
          }}
        />
        {value && <button type="button" aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground" onClick={() => {
          setValue(''); setActive(0); input.current?.focus();
        }}><X className="h-4 w-4" /></button>}
        {expanded && (
          <div className="absolute left-0 top-full z-50 mt-2 w-[min(28rem,calc(100vw-6rem))] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl">
            <div className="border-b border-border px-3 py-2 text-xs text-muted-foreground">Search your accessible records · Up to 5 per category</div>
            <div role="status" aria-live="polite" className="sr-only">
              {loading ? 'Searching' : search.isError ? 'Search failed' : query.length >= 2 ? `${items.length} results` : 'Type at least 2 characters'}
            </div>
            {query.length < 2 ? <p className="p-4 text-sm text-muted-foreground">Type at least 2 characters to search.</p>
              : loading ? <p className="flex items-center gap-2 p-4 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Searching…</p>
              : search.isError ? <div className="p-4 text-sm"><p>Search is unavailable. Please try again.</p><button type="button" className="mt-2 text-brand-600 underline" onClick={() => search.refetch()}>Retry search</button></div>
              : items.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No results for “{query}”. Try a name, project key or employee code.</p>
              : null}
            <div id={listId} role="listbox" aria-label="Search results" className="max-h-96 overflow-y-auto">
              {items.map((item, index) => (
                <button
                  key={`${item.type}-${item.id}`}
                  id={`${listId}-${index}`}
                  data-result-index={index}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  tabIndex={-1}
                  className={cn('flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm', index === activeIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50')}
                  onMouseEnter={() => setActive(index)}
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => select(item)}
                >
                  <span className="min-w-0"><span className="block truncate font-medium">{item.title}</span><span className="block truncate text-xs text-muted-foreground">{item.subtitle}</span></span>
                  <span className="shrink-0 text-xs text-muted-foreground">{labels[item.type]}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {taskId && <ViewTaskModal isOpen taskId={taskId} onClose={() => { setTaskId(null); input.current?.focus(); }} />}
      {employeeId && <ViewEmployeeModal isOpen employeeId={employeeId} onClose={() => { setEmployeeId(null); input.current?.focus(); }} />}
    </>
  );
}
