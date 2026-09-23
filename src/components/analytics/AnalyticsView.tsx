import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart3, TrendingUp, CheckCircle, Clock, PieChart, Activity, ShieldCheck } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { projects, tasks } = useApp();

  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === 'Active').length;
    const completedProjects = projects.filter((p) => p.status === 'Done').length;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'done').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const totalMinutes = tasks.reduce((sum, t) => sum + (t.timeSpentMinutes || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    // Categories
    const categoriesCount: Record<string, number> = {
      Work: projects.filter((p) => p.category === 'Work').length,
      Side: projects.filter((p) => p.category === 'Side').length,
      Learning: projects.filter((p) => p.category === 'Learning').length,
      Freelance: projects.filter((p) => p.category === 'Freelance').length,
    };

    // Priorities
    const priorityCount: Record<string, number> = {
      P1: tasks.filter((t) => t.priority === 'P1').length,
      P2: tasks.filter((t) => t.priority === 'P2').length,
      P3: tasks.filter((t) => t.priority === 'P3').length,
    };

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      completionRate,
      totalHours,
      categoriesCount,
      priorityCount,
    };
  }, [projects, tasks]);

  return (
    <div id="builder-analytics-view" className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white">Builder Analytics & Velocity</h2>
              <p className="text-xs text-neutral-400">Holistic performance metrics across projects, tasks, and logged hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-neutral-950/70 border border-neutral-800 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold">Active Projects</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{stats.activeProjects}</div>
          <div className="text-[11px] text-neutral-500">out of {stats.totalProjects} total projects</div>
        </div>

        <div className="p-5 bg-neutral-950/70 border border-neutral-800 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold">Task Velocity</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">{stats.completionRate}%</div>
          <div className="text-[11px] text-neutral-500">{stats.completedTasks} of {stats.totalTasks} tasks completed</div>
        </div>

        <div className="p-5 bg-neutral-950/70 border border-neutral-800 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold">Focus Logged</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">{stats.totalHours}h</div>
          <div className="text-[11px] text-neutral-500">across active timer sessions</div>
        </div>

        <div className="p-5 bg-neutral-950/70 border border-neutral-800 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold">Shipped Releases</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-400 font-mono">{stats.completedProjects}</div>
          <div className="text-[11px] text-neutral-500">fully shipped products</div>
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-6 bg-neutral-950/70 border border-neutral-800 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-amber-400" />
            Project Distribution by Domain
          </h3>

          <div className="space-y-3 pt-2">
            {Object.entries(stats.categoriesCount).map(([cat, count]) => {
              const pct = stats.totalProjects > 0 ? Math.round((count / stats.totalProjects) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-300">{cat}</span>
                    <span className="font-mono text-neutral-400">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Priorities Breakdown */}
        <div className="p-6 bg-neutral-950/70 border border-neutral-800 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Task Priorities in Flight
          </h3>

          <div className="space-y-3 pt-2">
            {Object.entries(stats.priorityCount).map(([pri, count]) => {
              const pct = stats.totalTasks > 0 ? Math.round((count / stats.totalTasks) * 100) : 0;
              const color = pri === 'P1' ? 'bg-rose-500' : pri === 'P2' ? 'bg-amber-500' : 'bg-blue-500';
              return (
                <div key={pri} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-300">
                      {pri === 'P1' ? 'P1 - High / Critical' : pri === 'P2' ? 'P2 - Medium' : 'P3 - Low'}
                    </span>
                    <span className="font-mono text-neutral-400">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                    <div
                      className={`${color} h-full rounded-full transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
