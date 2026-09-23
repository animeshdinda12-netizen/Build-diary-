import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ProjectCategory, ProjectStatus, PriorityLevel } from '../../types';
import logoImg from '../../assets/ib_exact_transparent.png';
import { 
  FolderKanban, Plus, Clock, CheckSquare, 
  Calendar, Layers, Sparkles, AlertCircle, 
  ArrowRight, MoreVertical, Flame, FolderPlus 
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    projects, 
    tasks, 
    setSelectedProjectId, 
    setCurrentView, 
    openCreateProjectModal,
    openEditProjectModal,
    getProjectProgress,
    setActiveTaskForSheet
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('Active');

  const todayStr = new Date().toISOString().split('T')[0];

  // Stats calculation
  const activeProjects = projects.filter((p) => !p.archived);
  const inProgressTasks = tasks.filter((t) => t.status === 'doing');
  const doneTasks = tasks.filter((t) => t.status === 'done');
  const overdueTasks = tasks.filter((t) => t.status !== 'done' && t.dueDate && t.dueDate < todayStr);

  // Due this week tasks (between today and +7 days)
  const nextWeekStr = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const dueThisWeekTasks = tasks.filter(
    (t) => t.status !== 'done' && t.dueDate && t.dueDate >= todayStr && t.dueDate <= nextWeekStr
  );

  const filteredProjects = activeProjects.filter((p) => {
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesCat && matchesStatus;
  });

  const getPriorityBadge = (p: PriorityLevel) => {
    switch (p) {
      case 'P1':
        return <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded">P1</span>;
      case 'P2':
        return <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded">P2</span>;
      case 'P3':
        return <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 rounded">P3</span>;
    }
  };

  return (
    <div id="builder-dashboard" className="space-y-8 max-w-7xl mx-auto">
      {/* Top Builder Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-neutral-950/70 border border-neutral-800/80 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
            <span>Active Projects</span>
            <FolderKanban className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{activeProjects.length}</div>
          <div className="text-[11px] text-neutral-500">Tracked in personal OS</div>
        </div>

        <div className="p-4 bg-neutral-950/70 border border-neutral-800/80 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
            <span>Tasks In Flight</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">{inProgressTasks.length}</div>
          <div className="text-[11px] text-neutral-500">Currently in 'Doing' column</div>
        </div>

        <div className="p-4 bg-neutral-950/70 border border-neutral-800/80 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
            <span>Shipped Deliverables</span>
            <CheckSquare className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-blue-400 font-mono">{doneTasks.length}</div>
          <div className="text-[11px] text-neutral-500">Tasks marked complete</div>
        </div>

        <div className="p-4 bg-neutral-950/70 border border-neutral-800/80 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
            <span>Deadlines This Week</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-400 font-mono">{dueThisWeekTasks.length}</div>
          <div className="text-[11px] text-neutral-500">Due in the next 7 days</div>
        </div>
      </div>

      {/* Overdue Attention Banner if any (Requested in Flow 6) */}
      {overdueTasks.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-200">
                {overdueTasks.length} task{overdueTasks.length === 1 ? '' : 's'} past deadline
              </div>
              <div className="text-[11px] text-rose-300/80">
                Tap on any overdue task below to open its project and finish or adjust.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto max-w-md">
            {overdueTasks.slice(0, 2).map((ot) => (
              <button
                key={ot.id}
                onClick={() => {
                  setSelectedProjectId(ot.projectId);
                  setCurrentView('project-detail');
                  setActiveTaskForSheet(ot);
                }}
                className="px-3 py-1.5 bg-neutral-900/90 hover:bg-neutral-800 border border-rose-500/30 text-rose-200 rounded-xl text-xs font-medium truncate max-w-[160px] cursor-pointer"
              >
                {ot.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Projects Grid Header & Filters */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Active Builder Projects
            </h3>
            <p className="text-xs text-neutral-400">
              Personal project log — click any card to inspect tasks, drawings, and flows.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Filter Pills */}
            <div className="flex items-center p-1 rounded-xl bg-neutral-950 border border-neutral-800">
              {['All', 'Work', 'Side', 'Learning', 'Freelance'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-neutral-800 text-white font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Idea">Idea</option>
              <option value="Paused">Paused</option>
              <option value="Done">Done</option>
            </select>
          </div>
        </div>

        {/* Projects Grid or Empty State */}
        {filteredProjects.length === 0 ? (
          /* Empty state specified in Flow 1 & Edge cases */
          <div 
            id="dashboard-empty-state"
            className="p-16 border-2 border-dashed border-neutral-800 rounded-3xl text-center flex flex-col items-center justify-center space-y-5 bg-neutral-950/40 relative overflow-hidden"
          >
            <div className="absolute w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative w-20 h-20 rounded-2xl bg-neutral-900 border border-neutral-700/80 p-2.5 shadow-xl shadow-amber-500/10 flex items-center justify-center">
              <img 
                src={logoImg} 
                alt="Build Diary Logo" 
                className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(245,158,11,0.25)]" 
              />
            </div>

            <div className="space-y-1.5 max-w-sm relative z-10">
              <h4 className="text-base font-bold text-white tracking-tight">No projects in your Build Diary yet</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Ready to start something new? Create your first project to track tasks, user flows, and logs in one place.
              </p>
            </div>

            <button
              id="empty-create-project-btn"
              type="button"
              onClick={openCreateProjectModal}
              className="relative z-10 flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Project</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => {
              const progress = getProjectProgress(project.id);
              const pTasks = tasks.filter((t) => t.projectId === project.id);
              const doneCount = pTasks.filter((t) => t.status === 'done').length;

              return (
                <div
                  key={project.id}
                  id={`project-card-${project.id}`}
                  onClick={() => {
                    setSelectedProjectId(project.id);
                    setCurrentView('project-detail');
                  }}
                  className="group relative bg-neutral-950/70 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header tags */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-neutral-900 border border-neutral-800 text-neutral-400">
                          {project.category}
                        </span>
                        {getPriorityBadge(project.priority)}
                      </div>

                      <span className={`w-2 h-2 rounded-full ${
                        project.status === 'Active' ? 'bg-emerald-400' :
                        project.status === 'Idea' ? 'bg-indigo-400' :
                        project.status === 'Done' ? 'bg-blue-400' : 'bg-neutral-500'
                      }`} />
                    </div>

                    {/* Title and description */}
                    <div>
                      <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                        {project.name}
                      </h4>
                      {project.description && (
                        <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Progress Bar & Details */}
                  <div className="pt-4 border-t border-neutral-800/80 mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400 text-[11px]">
                        {doneCount} of {pTasks.length} tasks
                      </span>
                      <span className="font-mono font-bold text-amber-400 text-[11px]">
                        {progress}%
                      </span>
                    </div>

                    <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 font-mono">
                      <span>Target: {project.deadline || 'Ongoing'}</span>
                      <span className="flex items-center gap-1 text-neutral-400 group-hover:text-white transition-colors">
                        Open <ArrowRight className="w-3 h-3 text-amber-400" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Due This Week Section */}
      {dueThisWeekTasks.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-neutral-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Due This Week ({dueThisWeekTasks.length})
            </h3>
            <span className="text-xs font-mono text-neutral-400">Target Milestones</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {dueThisWeekTasks.map((t) => {
              const project = projects.find((p) => p.id === t.projectId);
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedProjectId(t.projectId);
                    setCurrentView('project-detail');
                    setActiveTaskForSheet(t);
                  }}
                  className="p-3.5 bg-neutral-950/60 hover:bg-neutral-900 border border-neutral-800 rounded-2xl cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-semibold text-white truncate">{t.title}</div>
                    <div className="text-[11px] text-neutral-500 truncate">{project?.name || 'Project'}</div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-amber-300 shrink-0">
                    {t.dueDate}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
