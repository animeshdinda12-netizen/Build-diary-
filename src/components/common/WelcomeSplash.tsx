import React, { useState, useEffect } from 'react';
import logoImg from '../../assets/ib_exact_transparent.png';
import { useApp } from '../../context/AppContext';
import { 
  Plus, Check, ArrowRight, Briefcase, 
  Trash2, Layers, FolderKanban, Sparkles, User, Palette, Settings
} from 'lucide-react';

interface WelcomeSplashProps {
  onFinish?: () => void;
}

export const WelcomeSplash: React.FC<WelcomeSplashProps> = ({ onFinish }) => {
  const { 
    workspaces, 
    activeWorkspaceId, 
    switchWorkspace, 
    createWorkspace, 
    deleteWorkspace,
    user,
    setUser,
    projects,
    setCurrentView
  } = useApp();

  // Intro animation states:
  // 'enter' -> logo scales in
  // 'typing' -> "Build Diary" types out
  // 'hold' -> small shimmer moment
  // 'menu' -> logo fades out, text moves smoothly upward, revealing workspaces & menu cards
  // 'new-setup' -> welcome setup flow for fresh workspace/user
  // 'exit' -> smoothly finishes and unlocks the app
  const [phase, setPhase] = useState<'enter' | 'typing' | 'hold' | 'menu' | 'new-setup' | 'exit'>('enter');
  const [typedText, setTypedText] = useState('');
  const fullText = 'Build Diary';

  // Workspace creation inside menu modal
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsDesc, setNewWsDesc] = useState('');
  const [newWsColor, setNewWsColor] = useState('#f59e0b');

  // Welcome setup for fresh builder / new workspace
  const [setupStep, setSetupStep] = useState<1 | 2>(1);
  const [builderName, setBuilderName] = useState(user?.name || '');
  const [selectedFocus, setSelectedFocus] = useState<string[]>(['SaaS App', 'AI / LLM Tool']);

  const FOCUS_OPTIONS = [
    'SaaS App',
    'Mobile App',
    'AI / LLM Tool',
    'Portfolio & Personal Site',
    'Open Source Library',
    'Hardware & IoT',
    'Game Dev',
    'Learning & Research',
  ];

  const COLOR_OPTIONS = ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#06b6d4', '#f97316'];

  // Typewriter step 1: enter logo
  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase('typing');
    }, 400);
    return () => clearTimeout(t1);
  }, []);

  // Typewriter step 2: type out Build Diary
  useEffect(() => {
    if (phase !== 'typing') return;

    let index = 0;
    const interval = setInterval(() => {
      index++;
      setTypedText(fullText.slice(0, index));
      if (index >= fullText.length) {
        clearInterval(interval);
        setTimeout(() => setPhase('hold'), 300);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [phase]);

  // Typewriter step 3: hold briefly, then logo disappears/fades and text smoothly goes upwards revealing workspace menu cards
  useEffect(() => {
    if (phase !== 'hold') return;

    const t2 = setTimeout(() => {
      setPhase('menu');
    }, 450);

    return () => clearTimeout(t2);
  }, [phase]);

  // When clicking an existing workspace: direct launch without welcome setup!
  const handleSelectExistingWorkspace = (wsId: string) => {
    switchWorkspace(wsId);
    // If the user already has a profile, go straight in!
    if (user && user.name) {
      setPhase('exit');
      setTimeout(() => {
        onFinish?.();
      }, 350);
    } else {
      // If no builder profile exists yet, create default user and proceed directly
      const defaultUser = {
        name: 'Builder',
        focusAreas: ['Side Projects'],
        createdAt: new Date().toISOString(),
        streakDays: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
      };
      setUser(defaultUser);
      setPhase('exit');
      setTimeout(() => {
        onFinish?.();
      }, 350);
    }
  };

  // Continue to create new workspace -> leads to Welcome Setup
  const handleStartCreateNewWorkspace = () => {
    setIsCreatingNew(true);
    setNewWsName('');
    setNewWsDesc('');
  };

  const handleConfirmCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    const created = createWorkspace(newWsName.trim(), newWsDesc.trim(), newWsColor);
    switchWorkspace(created.id);
    setIsCreatingNew(false);

    // Prompt requested: "shows then continue with welcome setup existing workspaces does not have any welcome"
    // Now launch into the welcome setup for this new workspace
    setPhase('new-setup');
    setSetupStep(1);
  };

  // Finish the Welcome Setup for the new workspace
  const handleCompleteWelcomeSetup = () => {
    const finalName = builderName.trim() || 'Builder';
    const newUser = {
      name: finalName,
      focusAreas: selectedFocus.length > 0 ? selectedFocus : ['Side Projects'],
      createdAt: new Date().toISOString(),
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
    };

    setUser(newUser);
    setPhase('exit');
    setTimeout(() => {
      onFinish?.();
    }, 400);
  };

  const toggleFocusItem = (item: string) => {
    if (selectedFocus.includes(item)) {
      setSelectedFocus(selectedFocus.filter((f) => f !== item));
    } else {
      if (selectedFocus.length < 3) {
        setSelectedFocus([...selectedFocus, item]);
      }
    }
  };

  const activeWs = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  return (
    <div
      id="welcome-intro-splash"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#09090b] text-white transition-all duration-500 overflow-y-auto px-4 py-8 ${
        phase === 'exit' ? 'opacity-0 pointer-events-none scale-102' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background ambient lighting */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none animate-pulse" />

      {/* Main Container that smoothly animates upward */}
      <div 
        className={`relative z-10 w-full max-w-xl flex flex-col items-center select-none transition-all duration-700 ease-out ${
          phase === 'menu' || phase === 'new-setup' 
            ? '-translate-y-4' 
            : 'translate-y-0'
        }`}
      >
        {/* Animated Big Logo:
            Appears prominently during intro, then disspears fade when intro is done */}
        <div
          className={`relative transform transition-all duration-700 ease-in-out ${
            phase === 'enter'
              ? 'scale-75 opacity-0 blur-sm translate-y-4'
              : phase === 'typing' || phase === 'hold'
              ? 'scale-100 opacity-100 blur-0 translate-y-0 h-36 mb-6'
              : 'scale-75 opacity-0 -translate-y-6 h-0 mb-0 overflow-hidden pointer-events-none'
          }`}
        >
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-neutral-900/90 p-4 border border-neutral-700/80 shadow-[0_20px_50px_rgba(245,158,11,0.25)] flex items-center justify-center backdrop-blur-xl">
            <img
              src={logoImg}
              alt="Build Diary Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(245,158,11,0.3)] animate-pulse"
            />
          </div>
        </div>

        {/* Typed "Build Diary" Title:
            Smoothly transitions and floats upward to become the header banner revealing the workspace menu cards */}
        <div 
          className={`flex flex-col items-center transition-all duration-700 ease-out ${
            phase === 'menu' || phase === 'new-setup'
              ? 'transform -translate-y-2 mb-6'
              : 'mb-4'
          }`}
        >
          <div className="flex items-center text-3xl sm:text-5xl font-black tracking-tight font-sans">
            <span className="bg-gradient-to-r from-white via-neutral-100 to-amber-200 bg-clip-text text-transparent drop-shadow-sm">
              {typedText}
            </span>
            {(phase === 'enter' || phase === 'typing') && (
              <span className="inline-block w-1.5 h-8 sm:h-10 bg-amber-400 ml-2 animate-pulse rounded-full" />
            )}
          </div>

          <div
            className={`mt-2 flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-neutral-400 transition-all duration-500 ${
              typedText.length > 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Personal Project OS</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PHASE: MENU CARDS REVEAL (List of Workspaces, New, Settings) */}
        {/* ======================================================== */}
        {phase === 'menu' && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-600 ease-out space-y-4">
            
            {/* Header / Subtitle */}
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-white tracking-tight">Select or Create Workspace</h2>
              <p className="text-xs text-neutral-400">
                Choose an existing workspace to jump straight in, or create a new workspace with setup.
              </p>
            </div>

            {/* List of Existing Workspaces */}
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {workspaces.map((ws) => {
                const isSelected = ws.id === activeWorkspaceId;
                const wsProjectCount = projects.length; // Active count
                return (
                  <div
                    key={ws.id}
                    id={`workspace-card-${ws.id}`}
                    onClick={() => handleSelectExistingWorkspace(ws.id)}
                    className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-neutral-900 border-amber-500/50 shadow-lg shadow-amber-500/5'
                        : 'bg-neutral-900/60 hover:bg-neutral-900 border-neutral-800/80 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-inner"
                        style={{ backgroundColor: ws.color || '#f59e0b' }}
                      >
                        <Briefcase className="w-5 h-5 drop-shadow" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                            {ws.name}
                          </span>
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 truncate mt-0.5">
                          {ws.description || 'Personal workspace with notes, tasks and flows'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {workspaces.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteWorkspace(ws.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 text-neutral-500 hover:text-rose-400 rounded-lg hover:bg-neutral-800 transition-all cursor-pointer"
                          title="Delete Workspace"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <div className="p-2 rounded-xl bg-neutral-800/80 group-hover:bg-amber-500 group-hover:text-neutral-950 text-neutral-400 transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Create New Workspace Action */}
            {!isCreatingNew ? (
              <button
                id="create-new-workspace-btn"
                type="button"
                onClick={handleStartCreateNewWorkspace}
                className="w-full flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border border-dashed border-neutral-700 hover:border-amber-500/80 bg-neutral-950/40 hover:bg-neutral-900/50 text-neutral-300 hover:text-white text-xs font-bold transition-all cursor-pointer group"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <span>Create New Workspace</span>
              </button>
            ) : (
              /* Inline Create Workspace Form */
              <form 
                onSubmit={handleConfirmCreateWorkspace}
                className="p-5 rounded-2xl bg-neutral-900 border border-neutral-700/80 space-y-4 animate-in fade-in duration-200"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    New Workspace Details
                  </h4>
                  <button 
                    type="button" 
                    onClick={() => setIsCreatingNew(false)}
                    className="text-xs text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      Workspace Name *
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={newWsName}
                      onChange={(e) => setNewWsName(e.target.value)}
                      placeholder="e.g. Startup Lab, Client Projects, AI Experiments"
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      Purpose / Description
                    </label>
                    <input
                      type="text"
                      value={newWsDesc}
                      onChange={(e) => setNewWsDesc(e.target.value)}
                      placeholder="e.g. Private ideas and rapid prototype sprints"
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      Theme Color
                    </label>
                    <div className="flex items-center gap-2">
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewWsColor(c)}
                          className={`w-6 h-6 rounded-lg transition-transform ${
                            newWsColor === c ? 'scale-110 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="px-3.5 py-2 text-xs text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    <span>Continue to Welcome Setup</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* Quick direct entry or workspace settings */}
            <div className="pt-2 flex items-center justify-between text-xs text-neutral-400">
              <button
                type="button"
                onClick={() => {
                  setCurrentView('settings');
                  handleSelectExistingWorkspace(activeWs.id);
                }}
                className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-neutral-500" />
                <span>Existing Workspace Settings</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectExistingWorkspace(activeWs.id)}
                className="text-neutral-400 hover:text-amber-400 transition-colors underline cursor-pointer"
              >
                Continue with "{activeWs.name}" directly →
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PHASE: WELCOME SETUP (Only for New Workspace / Fresh User) */}
        {/* ======================================================== */}
        {phase === 'new-setup' && (
          <div className="w-full animate-in fade-in zoom-in-95 duration-300 space-y-6 bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            {setupStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
                  <span>WORKSPACE WELCOME SETUP</span>
                  <span>STEP 1 OF 2</span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">What should we call you?</h3>
                  <p className="text-xs text-neutral-400">
                    We'll personalize your daily greetings, builder streak, and weekly review logs.
                  </p>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    autoFocus
                    value={builderName}
                    onChange={(e) => setBuilderName(e.target.value)}
                    placeholder="e.g. Jordan, Alex, Maya"
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-2xl text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[11px] text-neutral-500">Leave blank for 'Builder'</p>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setPhase('menu')}
                    className="text-xs text-neutral-400 hover:text-white"
                  >
                    ← Back to Workspaces
                  </button>
                  <button
                    type="button"
                    onClick={() => setSetupStep(2)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-amber-500/20"
                  >
                    <span>Next: Select Focus</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {setupStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
                  <span>WORKSPACE WELCOME SETUP</span>
                  <span>STEP 2 OF 2</span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">What are you building here?</h3>
                  <p className="text-xs text-neutral-400">
                    Select up to 3 focus areas to categorize your projects and templates.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {FOCUS_OPTIONS.map((item) => {
                    const isSelected = selectedFocus.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleFocusItem(item)}
                        className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                            : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                        }`}
                      >
                        <span className="truncate">{item}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setSetupStep(1)}
                    className="text-xs text-neutral-400 hover:text-white"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleCompleteWelcomeSetup}
                    className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-amber-500/25"
                  >
                    <span>Launch Workspace</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
