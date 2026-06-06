"use client";

import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Send, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('ALL');
  
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/announcements');
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Failed to fetch announcements', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!title || !message) return;
    try {
      await apiClient.post('/announcements', {
        title,
        message,
        targetAudience,
        priority: 'HIGH',
      });
      setTitle('');
      setMessage('');
      fetchAnnouncements();
    } catch (error) {
      console.error('Failed to create announcement', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-indigo-600" />
            Announcement Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create and manage company-wide announcements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creation Form */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">Quick Create</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} type="text" className="w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Announcement Title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} className="w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="Type your message here..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Audience</label>
                <select value={targetAudience} onChange={e => setTargetAudience(e.target.value)} className="w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="ALL">All Employees</option>
                  <option value="DEPARTMENT">Specific Department</option>
                  <option value="TEAM">Specific Team</option>
                </select>
              </div>
              <Button onClick={handleCreate} className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                <Send className="w-4 h-4" /> Publish Now
              </Button>
            </div>
          </div>
        </div>

        {/* Existing Announcements */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Recent Announcements</h3>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Title</th>
                  <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Target</th>
                  <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Date</th>
                  <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {loading ? (
                  <tr><td colSpan={4} className="p-4 text-center text-gray-500">Loading...</td></tr>
                ) : announcements.length === 0 ? (
                  <tr><td colSpan={4} className="p-4 text-center text-gray-500">No announcements found.</td></tr>
                ) : announcements.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{a.title}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                        <Users className="w-3.5 h-3.5" /> {a.targetAudience}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Published
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
