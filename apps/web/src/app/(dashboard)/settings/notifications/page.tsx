"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

const DEFAULT_PREFERENCES = [
  { type: 'LEAVE', title: 'Leave Notifications', desc: 'Updates on your leave requests and approvals.', channels: { inApp: true, email: true, push: false } },
  { type: 'TASK', title: 'Task Assignments', desc: 'When you are assigned a new task or a deadline changes.', channels: { inApp: true, email: true, push: false } },
  { type: 'PROJECT', title: 'Project Updates', desc: 'Milestones, risk alerts, and project completions.', channels: { inApp: true, email: false, push: false } },
  { type: 'ANNOUNCEMENT', title: 'Company Announcements', desc: 'Townhalls, holidays, and policy changes.', channels: { inApp: true, email: true, push: false } },
];

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/notifications/preferences');
      if (data && Array.isArray(data) && data.length > 0) {
        // Map database records to our UI state
        const updated = [...DEFAULT_PREFERENCES];
        data.forEach((dbPref: any) => {
          const idx = updated.findIndex(p => p.type === dbPref.type);
          if (idx !== -1) {
            // parse channels json if necessary
            const channelsArr = typeof dbPref.channels === 'string' ? JSON.parse(dbPref.channels) : dbPref.channels;
            updated[idx].channels = {
              inApp: channelsArr.includes('IN_APP'),
              email: channelsArr.includes('EMAIL'),
              push: channelsArr.includes('PUSH'),
            };
          }
        });
        setPreferences(updated);
      }
    } catch (error) {
      console.error('Failed to fetch preferences', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const payload = preferences.map(p => {
        const channels = [];
        if (p.channels.inApp) channels.push('IN_APP');
        if (p.channels.email) channels.push('EMAIL');
        if (p.channels.push) channels.push('PUSH');
        return {
          type: p.type,
          channels,
          isEnabled: true,
        };
      });
      await apiClient.put('/notifications/preferences', payload);
      alert('Preferences saved successfully!');
    } catch (error) {
      console.error('Failed to save preferences', error);
      alert('Failed to save preferences.');
    }
  };

  const toggleChannel = (idx: number, channel: 'inApp' | 'email' | 'push') => {
    const updated = [...preferences];
    updated[idx].channels[channel] = !updated[idx].channels[channel];
    setPreferences(updated);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <Bell className="w-8 h-8 text-blue-600" />
          Notification Preferences
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Control how and when you want to be notified.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/50 text-sm font-medium text-gray-500 dark:text-gray-400">
          <div className="col-span-6">Notification Type</div>
          <div className="col-span-2 text-center flex justify-center items-center gap-2"><Monitor className="w-4 h-4"/> In-App</div>
          <div className="col-span-2 text-center flex justify-center items-center gap-2"><Mail className="w-4 h-4"/> Email</div>
          <div className="col-span-2 text-center flex justify-center items-center gap-2"><Smartphone className="w-4 h-4"/> Push</div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading preferences...</div>
          ) : preferences.map((pref, idx) => (
            <div key={pref.type} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 items-center hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
              <div className="col-span-1 md:col-span-6">
                <p className="font-semibold text-gray-900 dark:text-white">{pref.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{pref.desc}</p>
              </div>
              
              <div className="col-span-1 md:col-span-6 grid grid-cols-3 gap-4">
                <div className="flex justify-center">
                  <button 
                    onClick={() => toggleChannel(idx, 'inApp')}
                    className={`w-10 h-6 rounded-full transition-colors relative ${pref.channels.inApp ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                  >
                    <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${pref.channels.inApp ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex justify-center">
                  <button 
                    onClick={() => toggleChannel(idx, 'email')}
                    className={`w-10 h-6 rounded-full transition-colors relative ${pref.channels.email ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                  >
                    <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${pref.channels.email ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex justify-center">
                  <button 
                    onClick={() => toggleChannel(idx, 'push')}
                    className={`w-10 h-6 rounded-full transition-colors relative ${pref.channels.push ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                  >
                    <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${pref.channels.push ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => setPreferences(DEFAULT_PREFERENCES)}>Reset to Defaults</Button>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-none">
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
