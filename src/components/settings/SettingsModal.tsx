import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Settings, User, Moon, Sun, Cloud, 
  RotateCcw, Download, Upload, Shield, Check, Flame,
  Briefcase, Plus, Trash2, ArrowRight
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { 
    user, 
    updateUser, 
    isDarkMode, 
    toggleTheme, 
    resetApp, 
    openConfirmModal, 
    addToast,
    projects,
    tasks,
    timeline,
    boards,
    workspaces,
    activeWorkspaceId,
    switchWorkspace,
    createWorkspace,
    deleteWorkspace
  } = useApp();

  const [userName, setUserName] = useState(user?.name || '');
  const [streakDays, setStreakDays] = useState(user?.streakDays || 1);
  const [newWsName, setNewWsName] = useState('');
  const [newWsDesc, setNewWsDesc] = useState('');
  const [supabaseUrl, setSupabaseUrl] = useState('https://mock-supabase.builddiary.internal');
  const [supabaseKey, setSupabaseKey] = useState('••••••••••••••••••••••••');
  const [autoSync, setAutoSync] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    updateUser({ name: userName.trim(), streakDays: Number(streakDays) });
    addToast('Profile updated!', 'success');
  };

  const handleExportData = () => {
    const backup = {
      user,
      projects,
      tasks,
      timeline,
      boards,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `build-diary-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    addToast('Backup exported successfully', 'success');
  };

  return (
    <div id="settings-view" className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-neutral-800">
        <span className="p-2 rounded-xl bg-neutral-800 text-neutral-300">
          <Settings className="w-5 h-5" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-white">System Settings & Data Sync</h2>
          <p className="text-xs text-neutral-400">Manage builder profile, sync adapters, appearance, and local storage</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <form onSubmit={handleSaveProfile} className="p-6 bg-neutral-950/70 border border-neutral-800 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            Builder Identity & Greeting
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Your Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Active Streak (Days)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={streakDays}
                  onChange={(e) => setStreakDays(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <Flame className="w-4 h-4 text-amber-400 shrink-0" />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>

        {/* Workspaces Management Card */}
        <div className="p-6 bg-neutral-950/70 border border-neutral-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-400" />
              Workspaces Management
            </h3>
            <span className="text-xs text-neutral-400">
              {workspaces.length} workspace{workspaces.length > 1 ? 's' : ''} available
            </span>
          </div>

          <div className="space-y-2">
            {workspaces.map((ws) => (
              <div 
                key={ws.id}
                className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span 
                    className="w-3 h-3 rounded-full shrink-0" 
                    style={{ backgroundColor: ws.color || '#f59e0b' }} 
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{ws.name}</span>
                      {ws.id === activeWorkspaceId && (
                        <span className="px-1.5 py-0.2 text-[9px] bg-amber-500/20 text-amber-300 rounded font-semibold">
                          Active
                        </span>
                      )}
                    </div>
                    {ws.description && (
                      <p className="text-[11px] text-neutral-400 truncate">{ws.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {ws.id !== activeWorkspaceId && (
                    <button
                      type="button"
                      onClick={() => switchWorkspace(ws.id)}
                      className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                    >
                      Switch
                    </button>
                  )}
                  {workspaces.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        openConfirmModal({
                          title: `Delete workspace "${ws.name}"?`,
                          message: 'Are you sure you want to remove this workspace from your list?',
                          confirmLabel: 'Delete',
                          isDestructive: true,
                          onConfirm: () => deleteWorkspace(ws.id),
                        });
                      }}
                      className="p-1.5 text-neutral-400 hover:text-rose-400 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Delete Workspace"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Create Workspace in Settings */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!newWsName.trim()) return;
              createWorkspace(newWsName.trim(), newWsDesc.trim());
              setNewWsName('');
              setNewWsDesc('');
            }}
            className="pt-2 flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              placeholder="New workspace name..."
              className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs cursor-pointer shadow-sm transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create</span>
            </button>
          </form>
        </div>

        {/* Sync & Persistence Card */}
        <div className="p-6 bg-neutral-950/70 border border-neutral-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cloud className="w-4 h-4 text-blue-400" />
              Offline-First & Cloud Sync
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Active • LocalStorage Primary
            </span>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed">
            Build Diary saves every change instantly in localStorage with zero latency and works 100% offline. Background sync pushes updates when connectivity is verified.
          </p>

          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-300">Background Sync Queue</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-neutral-500 block mb-1">Target Endpoint</span>
                <input
                  type="text"
                  disabled
                  value={supabaseUrl}
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800/80 rounded-lg text-neutral-400 text-xs"
                />
              </div>
              <div>
                <span className="text-[11px] text-neutral-500 block mb-1">API Key / Token</span>
                <input
                  type="password"
                  disabled
                  value={supabaseKey}
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800/80 rounded-lg text-neutral-400 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Appearance & Theme */}
        <div className="p-6 bg-neutral-950/70 border border-neutral-800 rounded-3xl flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {isDarkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
              Appearance Mode
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">Toggle between dark builder theme and daylight high-contrast</p>
          </div>

          <button
            onClick={toggleTheme}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold border border-neutral-800 transition-colors cursor-pointer"
          >
            {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
          </button>
        </div>

        {/* Data Management */}
        <div className="p-6 bg-neutral-950/70 border border-neutral-800 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            Data Management & Export
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold border border-neutral-800 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Full JSON Backup</span>
            </button>

            <button
              onClick={() => {
                openConfirmModal({
                  title: 'Reset Build Diary to Onboarding?',
                  message: 'This will clear all projects, tasks, boards, and notes from localStorage and return to the onboarding flow.',
                  isDestructive: true,
                  confirmLabel: 'Reset Everything',
                  onConfirm: resetApp,
                });
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold border border-rose-500/20 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset State & Onboard Again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
