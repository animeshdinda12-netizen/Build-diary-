import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AppView } from '../../types';
import logoImg from '../../assets/ib_exact_transparent.png';
import { 
  Layout, FolderKanban, Layers, FileText, 
  Calendar, BarChart3, Settings, Plus, Flame, 
  Folder, ChevronRight, Sparkles, Briefcase,
  ChevronDown, Check
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    projects, 
    selectedProjectId, 
    setSelectedProjectId, 
    openCreateProjectModal,
    user,
    isDarkMode,
    workspaces,
    activeWorkspaceId,
    switchWorkspace,
    createWorkspace
  } = useApp();

  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [isCreatingInlineWs, setIsCreatingInlineWs] = useState(false);
  const [inlineWsName, setInlineWsName] = useState('');

  const currentWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  const handleCreateInlineWs = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineWsName.trim()) return;
    const newWs = createWorkspace(inlineWsName.trim());
    switchWorkspace(newWs.id);
    setInlineWsName('');
    setIsCreatingInlineWs(false);
    setWorkspaceMenuOpen(false);
  };

  const navItems: { id: AppView; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Layout className="w-4 h-4" /> },
    { id: 'all-boards', label: 'Boards & Flows', icon: <Layers className="w-4 h-4" /> },
    { id: 'files', label: 'Files & Links', icon: <FileText className="w-4 h-4" /> },
    { id: 'weekly-review', label: 'Weekly Review', icon: <Calendar className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const activeProjects = projects.filter((p) => !p.archived);

  return (
    <aside 
      id="main-sidebar"
      className={`w-64 shrink-0 border-r flex flex-col justify-between h-screen sticky top-0 backdrop-blur-md select-none transition-colors ${
        isDarkMode 
          ? 'bg-neutral-950/80 border-neutral-800/80 text-neutral-100' 
          : 'bg-[#f7f7f5] border-neutral-200/80 text-neutral-800'
      }`}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDarkMode ? 'border-neutral-800/80' : 'border-neutral-200/80'
        }`}>
          <div 
            onClick={() => {
              setSelectedProjectId(null);
              setCurrentView('dashboard');
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-700/80 flex items-center justify-center p-1 group-hover:scale-105 group-hover:border-amber-500/50 transition-all shadow-sm">
              <img 
                src={logoImg} 
                alt="Build Diary Logo" 
                className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.2)]" 
              />
            </div>
            <div>
              <div className={`text-sm font-bold tracking-tight flex items-center gap-1.5 ${
                isDarkMode ? 'text-white' : 'text-neutral-900'
              }`}>
                Build Diary
                <span className="text-[10px] font-mono px-1 py-0.2 bg-amber-500/20 text-amber-500 rounded">
                  OS
                </span>
              </div>
              <div className="text-[11px] text-neutral-400 font-medium">Personal Project OS</div>
            </div>
          </div>
        </div>

        {/* Workspace Selector Bar */}
        <div className="relative px-3 pt-3">
          <button
            id="sidebar-workspace-switcher"
            type="button"
            onClick={() => setWorkspaceMenuOpen((prev) => !prev)}
            className={`w-full p-2 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all cursor-pointer ${
              isDarkMode 
                ? 'bg-neutral-900/80 hover:bg-neutral-900 border-neutral-800 text-white' 
                : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-900 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span 
                className="w-2.5 h-2.5 rounded-full shrink-0" 
                style={{ backgroundColor: currentWorkspace?.color || '#f59e0b' }} 
              />
              <span className="truncate">{currentWorkspace?.name || 'Workspace'}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          </button>

          {/* Workspace Dropdown */}
          {workspaceMenuOpen && (
            <div 
              className="absolute left-3 right-3 top-13 z-50 p-2 rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl space-y-1 animate-in fade-in zoom-in-95 duration-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                Workspaces
              </div>
              <div className="max-h-48 overflow-y-auto space-y-0.5">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => {
                      switchWorkspace(ws.id);
                      setWorkspaceMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      ws.id === activeWorkspaceId
                        ? 'bg-amber-500/15 text-amber-300 font-bold'
                        : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span 
                        className="w-2 h-2 rounded-full shrink-0" 
                        style={{ backgroundColor: ws.color || '#f59e0b' }} 
                      />
                      <span className="truncate">{ws.name}</span>
                    </div>
                    {ws.id === activeWorkspaceId && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </button>
                ))}
              </div>

              {/* Quick Add Workspace Inline */}
              <div className="pt-1.5 border-t border-neutral-800">
                {!isCreatingInlineWs ? (
                  <button
                    type="button"
                    onClick={() => setIsCreatingInlineWs(true)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-amber-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Workspace</span>
                  </button>
                ) : (
                  <form onSubmit={handleCreateInlineWs} className="p-1 space-y-1.5">
                    <input
                      type="text"
                      autoFocus
                      required
                      value={inlineWsName}
                      onChange={(e) => setInlineWsName(e.target.value)}
                      placeholder="Workspace name..."
                      className="w-full px-2 py-1 text-xs bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    />
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setIsCreatingInlineWs(false)}
                        className="px-2 py-0.5 text-[10px] text-neutral-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-2 py-0.5 text-[10px] bg-amber-500 text-neutral-950 font-bold rounded"
                      >
                        Add
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Builder Streak & Status */}
        {user && (
          <div className={`mx-3 my-3 p-3 rounded-xl border flex items-center justify-between ${
            isDarkMode ? 'bg-neutral-900/60 border-neutral-800/60' : 'bg-white border-neutral-200 shadow-xs'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold text-amber-500 ${
                isDarkMode ? 'bg-neutral-800 border-neutral-700/60' : 'bg-neutral-100 border-neutral-200'
              }`}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-medium truncate ${isDarkMode ? 'text-neutral-200' : 'text-neutral-900'}`}>{user.name}</div>
                <div className="text-[10px] text-neutral-400 truncate">{user.focusAreas?.[0] || 'Builder'}</div>
              </div>
            </div>

            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold" title="Consecutive Builder Streak">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{user.streakDays || 1}d</span>
            </div>
          </div>
        )}

        {/* Primary Navigation */}
        <div className="px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id && !selectedProjectId;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  setSelectedProjectId(null);
                  setCurrentView(item.id as any);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? isDarkMode 
                      ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                      : 'bg-white text-neutral-900 font-semibold shadow-xs border border-neutral-200/60'
                    : isDarkMode
                    ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50'
                }`}
              >
                <span className={isActive ? 'text-amber-500' : 'text-neutral-400'}>
                  {item.icon}
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Projects Sublist */}
        <div className={`flex-1 overflow-y-auto px-3 py-2 border-t ${
          isDarkMode ? 'border-neutral-800/60' : 'border-neutral-200/80'
        }`}>
          <div className="flex items-center justify-between px-2 pb-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            <span>Active Projects ({activeProjects.length})</span>
            <button
              id="sidebar-new-project-btn"
              onClick={openCreateProjectModal}
              className={`p-1 rounded-md transition-colors ${
                isDarkMode ? 'hover:bg-neutral-800 text-neutral-400 hover:text-amber-400' : 'hover:bg-neutral-200 text-neutral-500 hover:text-amber-600'
              }`}
              title="Add New Project"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            {activeProjects.map((p) => {
              const isSelected = selectedProjectId === p.id && currentView === 'project-detail';
              return (
                <button
                  key={p.id}
                  id={`sidebar-project-${p.id}`}
                  onClick={() => {
                    setSelectedProjectId(p.id);
                    setCurrentView('project-detail');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer group text-left ${
                    isSelected
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30 font-medium'
                      : isDarkMode
                      ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      p.status === 'Active' ? 'bg-emerald-500' : p.status === 'Idea' ? 'bg-indigo-500' : 'bg-neutral-400'
                    }`} />
                    <span className="truncate">{p.name}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                    isSelected ? 'opacity-100 text-amber-500' : 'text-neutral-400'
                  }`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className={`p-3 border-t ${
          isDarkMode ? 'border-neutral-800/80 bg-neutral-950/40' : 'border-neutral-200/80 bg-neutral-100/40'
        }`}>
          <button
            id="sidebar-settings-btn"
            onClick={() => {
              setSelectedProjectId(null);
              setCurrentView('settings');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              currentView === 'settings'
                ? isDarkMode
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'bg-white text-neutral-900 font-semibold shadow-xs'
                : isDarkMode
                ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50'
            }`}
          >
            <Settings className="w-4 h-4 text-neutral-400" />
            <span>Settings & Sync</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
