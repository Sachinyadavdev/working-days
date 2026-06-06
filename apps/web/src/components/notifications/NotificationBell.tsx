"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useNotificationStore } from '@/stores/notification.store';

function getActionUrl(notif: any): string {
  if (notif.metadata?.actionUrl) return notif.metadata.actionUrl;
  const type = notif.type || '';
  if (type.startsWith('LEAVE')) return '/leave';
  if (type.startsWith('TASK')) return '/tasks';
  if (type.startsWith('PROJECT')) return '/projects';
  if (type.startsWith('ATTENDANCE')) return '/attendance';
  if (type.startsWith('TEAM')) return '/teams';
  if (type === 'ANNOUNCEMENT') return '/notifications';
  return '/notifications';
}

export function NotificationBell({ userId }: { userId: string }) {
  const { unreadCount, setUnreadCount, decrement } = useNotificationStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/notifications?limit=5');
      const items = data?.data?.items || data?.items || [];
      const count = data?.data?.unreadCount ?? items.filter((n: any) => !n.isRead).length;
      setNotifications(items);
      setUnreadCount(count);
    } catch (err) {
      console.error('NotificationBell: fetch failed', err);
    }
  }, [setUnreadCount]);

  // Fetch on mount + poll every 30 seconds for new notifications
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Re-fetch when dropdown opens
  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead && notif.id) {
      apiClient.patch(`/notifications/${notif.id}/read`).catch(() => {});
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      decrement();
    }
    setIsOpen(false);
    router.push(getActionUrl(notif));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white shadow-sm shadow-brand-500/30">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-background shadow-xl overflow-hidden z-50">
          <div className="p-4 border-b border-border bg-muted/50">
            <h3 className="font-semibold text-foreground flex items-center justify-between">
              Notifications
              {unreadCount > 0 && (
                <span className="text-xs font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </h3>
          </div>
          <div className="max-h-96 overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.slice(0, 5).map((notif, idx) => (
                  <div
                    key={notif.id || idx}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3 rounded-lg flex items-start gap-3 transition-colors cursor-pointer ${notif.isRead ? 'hover:bg-muted' : 'bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-100/50 dark:hover:bg-blue-900/20'}`}
                  >
                    <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${notif.priority === 'CRITICAL' ? 'bg-red-500' : notif.priority === 'HIGH' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                    </div>
                    <svg className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-3 border-t border-border bg-muted/50 text-center">
            <button
              onClick={() => { setIsOpen(false); router.push('/notifications'); }}
              className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
