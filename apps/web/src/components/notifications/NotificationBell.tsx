"use client";

import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'; // Assuming these exist, if not we will stub
import { Button } from '../ui/button';

export function NotificationBell({ userId }: { userId: string }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const newSocket = io('http://localhost:3001/notifications', {
      query: { userId },
    });

    newSocket.on('connect', () => console.log('Connected to notifications gateway'));
    
    newSocket.on('notification', (data) => {
      setNotifications(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    newSocket.on('announcement', (data) => {
      setNotifications(prev => [{ ...data, type: 'ANNOUNCEMENT' }, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    setSocket(newSocket);

    // Initial fetch of unread count and latest notifications could go here
    // fetch('/api/notifications').then(...)

    return () => {
      newSocket.close();
    };
  }, [userId]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 mr-4 mt-2 shadow-xl border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center justify-between">
            Notifications
            {unreadCount > 0 && (
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </h3>
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No new notifications</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.slice(0, 5).map((notif, idx) => (
                <div key={idx} className={`p-3 rounded-lg flex items-start gap-3 transition-colors ${notif.isRead ? 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50' : 'bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}>
                  <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${notif.priority === 'CRITICAL' ? 'bg-red-500' : notif.priority === 'HIGH' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{notif.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-center">
          <a href="/notifications" className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
            View all notifications
          </a>
        </div>
      </PopoverContent>
    </Popover>
  );
}
