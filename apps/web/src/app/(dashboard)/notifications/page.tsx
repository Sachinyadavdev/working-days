"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Filter, CheckCircle2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

export default function NotificationCenter() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/notifications?limit=50');
      if (data && data.data && data.data.items) {
        setNotifications(data.data.items);
      } else if (data && data.items) {
        setNotifications(data.items);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'UNREAD') return !notif.isRead;
    return notif.type?.startsWith(activeFilter);
  });

  const filters = ['ALL', 'UNREAD', 'LEAVE', 'TASK', 'ANNOUNCEMENT', 'SYSTEM'];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-600" />
            Notification Center
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your alerts and stay updated.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={markAllAsRead}>
            <CheckCircle2 className="w-4 h-4" /> Mark all as read
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200">
            <Trash2 className="w-4 h-4" /> Clear read
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeFilter === filter 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading notifications...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No notifications found</div>
        ) : (
          filteredNotifications.map((notif) => (
            <div key={notif.id} className={`p-5 flex gap-4 border-b border-gray-100 dark:border-gray-700/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors ${!notif.isRead ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                notif.type?.includes('LEAVE') ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                notif.type?.includes('TASK') ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                notif.priority === 'CRITICAL' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 mb-1">
                  <h3 className={`text-base font-semibold truncate ${notif.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(notif.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{notif.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

