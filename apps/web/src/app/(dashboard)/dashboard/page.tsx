'use client';

import { motion } from 'framer-motion';
import {
  Users,
  FolderKanban,
  CheckSquare,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const stats = [
  { name: 'Total Employees', value: '248', change: '+12%', trend: 'up', icon: Users, color: 'from-blue-500 to-blue-600' },
  { name: 'Active Projects', value: '34', change: '+8%', trend: 'up', icon: FolderKanban, color: 'from-purple-500 to-purple-600' },
  { name: 'Tasks In Progress', value: '127', change: '-3%', trend: 'down', icon: CheckSquare, color: 'from-amber-500 to-amber-600' },
  { name: 'Attendance Today', value: '96%', change: '+2%', trend: 'up', icon: Clock, color: 'from-emerald-500 to-emerald-600' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back! Here&apos;s an overview of your workspace.
        </p>
      </div>

      {/* Stats cards */}
      <motion.div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.name}
            variants={itemVariants}
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            {/* Gradient background accent */}
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${stat.color} opacity-10 blur-xl transition-opacity group-hover:opacity-20`} />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  stat.trend === 'up'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-red-50 text-red-600'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {stat.change}
                </span>
              </div>

              <div className="mt-4">
                <p className="text-sm text-muted-foreground">{stat.name}</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Content sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="mt-4 space-y-4">
            {[
              { action: 'New task created', detail: 'EMS-142: Fix login redirect', time: '2m ago', color: 'bg-blue-500' },
              { action: 'Leave approved', detail: 'John Doe - Casual leave (3 days)', time: '1h ago', color: 'bg-emerald-500' },
              { action: 'Project updated', detail: 'Sprint Planning completed', time: '3h ago', color: 'bg-purple-500' },
              { action: 'Employee onboarded', detail: 'Sarah Wilson joined Engineering', time: '5h ago', color: 'bg-amber-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-1 h-2 w-2 rounded-full ${item.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: 'Create Project', icon: FolderKanban, color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
              { label: 'Add Employee', icon: Users, color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
              { label: 'New Task', icon: CheckSquare, color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
              { label: 'Check In', icon: Clock, color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
            ].map((action) => (
              <button
                key={action.label}
                className={`flex items-center gap-3 rounded-xl p-4 text-left transition-colors ${action.color}`}
              >
                <action.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
