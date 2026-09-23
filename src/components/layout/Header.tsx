import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, Plus, Sun, Moon, Cloud, 
  CloudCheck, AlertCircle, Sparkles, FolderPlus, Clock
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    user, 
    tasks, 
    projects, 
    isDarkMode, 
    toggleTheme, 
    setCommandPaletteOpen, 
    openCreateProjectModal, 
    syncStatus,
    activeTimerTaskId,
    timerSeconds,
    stopTaskTimer
  } = useApp();

  // Dynamic context-aware greeting
  const greetingData = useMemo(() => {
    const hour = new Date().getHours();
    let timeGreeting = 'Good morning';
    if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';
    else if (hour >= 17) timeGreeting = 'Good evening';

    const userName = user?.name || 'Builder';
    const activeProjects = projects.filter((p) => !p.archived);

    // Overdue tasks
    const today = new Date().toISOString().split('T')[0];
    const overdueTasks = tasks.filter((t) => t.status !== 'done' && t.dueDate && t.dueDate < today);

    if (activeProjects.length === 0) {
      return {
        title: `${timeGreeting}, ${userName}.`,
        subtitle: 'Ready to start something new? Create your first project log below.',
        hasOverdue: false,
      };
    }

    if (overdueTasks.length > 0) {
      return {
        title: `${timeGreeting}, ${userName}.`,
        subtitle: `You have ${overdueTasks.length} task${overdueTasks.length > 1 ? 's' : ''} overdue from previous deadlines.`,
        hasOverdue: true,
        overdueCount: overdueTasks.length,
      };
    }

    const inProgressCount = tasks.filter((t) => t.status === 'doing').length;
    return {
      title: `${timeGreeting}, ${userName}.`,
      subtitle: inProgressCount > 0 
        ? `${inProgressCount} active task${inProgressCount > 1 ? 's' : ''} in flight today across ${activeProjects.length} projects.`
        : `All clear! You have ${activeProjects.length} active project${activeProjects.length > 1 ? 's' : ''} in your build log.`,
      hasOverdue: false,
    };
  }, [user, tasks, projects]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header 
      id="main-app-header"
      className={`sticky top-0 z-30 px-6 py-3 border-b backdrop-blur-md flex items-center justify-between gap-4 transition-colors ${
        isDarkMode 
          ? 'bg-neutral-950/80 border-neutral-800/80 text-white' 
          : 'bg-white/80 border-neutral-200 text-neutral-900 shadow-xs'
      }`}
    >
      {/* Contextual Greeting & Status */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2">
          <h2 id="header-greeting-title" className={`text-base font-bold truncate ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            {greetingData.title}
          </h2>
          {greetingData.hasOverdue && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-500 border border-rose-500/30">
              <AlertCircle className="w-3 h-3" />
              {greetingData.overdueCount} overdue
            </span>
          )}
        </div>
        <p id="header-greeting-subtitle" className="text-xs text-neutral-400 truncate max-w-xl">
          {greetingData.subtitle}
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Active Timer Pill if running */}
        {activeTimerTaskId && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-mono font-semibold">{formatTimer(timerSeconds)}</span>
            <button
              id="header-stop-timer-btn"
              onClick={stopTaskTimer}
              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/30 hover:bg-amber-500/50 text-amber-600 dark:text-amber-200 transition-colors"
            >
              Stop & Log
            </button>
          </div>
        )}

        {/* Search / Cmd+K button */}
        <button
          id="header-search-btn"
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-colors cursor-pointer ${
            isDarkMode
              ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200'
              : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300 text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search & Actions</span>
          <kbd className={`px-1.5 py-0.5 text-[10px] font-mono border rounded ${
            isDarkMode ? 'bg-neutral-950 border-neutral-800 text-neutral-400' : 'bg-white border-neutral-200 text-neutral-500'
          }`}>
            ⌘K
          </kbd>
        </button>

        {/* Sync status indicator */}
        <div 
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] ${
            isDarkMode ? 'bg-neutral-900/80 border-neutral-800/80 text-neutral-400' : 'bg-neutral-100 border-neutral-200 text-neutral-600'
          }`}
          title="Instant optimistic local cache + Supabase background sync"
        >
          <span className={`w-2 h-2 rounded-full ${syncStatus === 'syncing' ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'}`} />
          <span>{syncStatus === 'syncing' ? 'Syncing...' : 'Synced'}</span>
        </div>

        {/* Theme Toggle */}
        <button
          id="header-theme-toggle"
          type="button"
          onClick={toggleTheme}
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
            isDarkMode
              ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border-neutral-800'
              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 border-neutral-200'
          }`}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
        </button>

        {/* Quick New Project Button */}
        <button
          id="header-new-project-btn"
          type="button"
          onClick={openCreateProjectModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-xl text-xs shadow-md shadow-amber-500/10 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Project</span>
        </button>
      </div>
    </header>
  );
};
