'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderKanban,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface ProjectStatsProps {
  stats: {
    total: number;
    active: number;
    completed: number;
    delayed: number;
    onHold: number;
    planning: number;
    cancelled: number;
    avgCompletionPercent: number;
    totalTasks: number;
    completedTasks: number;
    totalMembers: number;
  } | null;
  isLoading: boolean;
}

const statCards = [
  { key: 'total', label: 'Total Projects', icon: FolderKanban, gradient: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-500/10' },
  { key: 'active', label: 'Active', icon: TrendingUp, gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500/10' },
  { key: 'completed', label: 'Completed', icon: CheckCircle2, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10' },
  { key: 'delayed', label: 'Delayed', icon: AlertTriangle, gradient: 'from-rose-500 to-rose-600', bg: 'bg-rose-500/10' },
  { key: 'onHold', label: 'On Hold', icon: Clock, gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-500/10' },
  { key: 'totalMembers', label: 'Team Members', icon: Users, gradient: 'from-violet-500 to-violet-600', bg: 'bg-violet-500/10' },
];

function AnimatedCounter({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) { setDisplay(end); return; }
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{display}</span>;
}

export function ProjectStats({ stats, isLoading }: ProjectStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-card border border-border" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      initial="hidden"
      animate="visible"
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
    >
      {statCards.map((card) => {
        const value = (stats as any)[card.key] ?? 0;
        return (
          <motion.div
            key={card.key}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-lg hover:border-brand-500/30"
          >
            {/* Gradient glow */}
            <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${card.gradient} opacity-10 blur-2xl transition-opacity group-hover:opacity-25`} />

            <div className="relative">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${card.gradient} shadow-lg`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>

              <div className="mt-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.label}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                  <AnimatedCounter value={value} />
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Progress Card - spans full width or 2 cols */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        className="sm:col-span-2 lg:col-span-3 xl:col-span-6 rounded-xl border border-border bg-card p-5 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Overall Task Completion</p>
              <p className="text-xs text-muted-foreground">{stats.completedTasks} of {stats.totalTasks} tasks completed</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-brand-500">{stats.avgCompletionPercent}%</span>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
            initial={{ width: 0 }}
            animate={{ width: `${stats.avgCompletionPercent}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
