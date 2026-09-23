import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ArrowRight, Layers, Check, Rocket } from 'lucide-react';

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

export const OnboardingModal: React.FC = () => {
  const { user, setUser, addToast } = useApp();
  const [screen, setScreen] = useState<'welcome' | 'step1' | 'step2'>('welcome');
  const [name, setName] = useState('');
  const [selectedFocus, setSelectedFocus] = useState<string[]>(['SaaS App', 'AI / LLM Tool']);

  // If user already exists in localStorage, don't show onboarding
  if (user) return null;

  const toggleFocus = (item: string) => {
    if (selectedFocus.includes(item)) {
      setSelectedFocus(selectedFocus.filter((f) => f !== item));
    } else {
      if (selectedFocus.length < 3) {
        setSelectedFocus([...selectedFocus, item]);
      }
    }
  };

  const handleFinish = () => {
    const finalName = name.trim() || 'Builder';
    const newUser = {
      name: finalName,
      focusAreas: selectedFocus.length > 0 ? selectedFocus : ['Side Projects'],
      createdAt: new Date().toISOString(),
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
    };

    localStorage.setItem('pt_projects', JSON.stringify([]));
    localStorage.setItem('pt_tasks', JSON.stringify([]));
    localStorage.setItem('pt_timeline', JSON.stringify([]));
    localStorage.setItem('pt_boards', JSON.stringify([]));
    localStorage.setItem('pt_attachments', JSON.stringify([]));

    setUser(newUser);
    addToast(`Welcome, ${finalName}. Your fresh workspace is ready.`, 'success');
  };

  return (
    <div 
      id="onboarding-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950 overflow-y-auto"
    >
      {/* Dynamic ambient mesh background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        {screen === 'welcome' && (
          <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                Welcome to <span className="text-amber-400">Build Diary</span>
              </h1>
              <p className="text-sm text-neutral-400 max-w-sm mx-auto leading-relaxed">
                Your personal project OS. Track multiple projects from idea to shipped with notes, tasks, drawings, and interactive user flows.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left pt-2">
              <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
                <div className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Not a Todo App
                </div>
                <div className="text-[11px] text-neutral-400">
                  Track holistic velocity, time logged, and builder milestones.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
                <div className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Interactive Canvas
                </div>
                <div className="text-[11px] text-neutral-400">
                  Design user flows & play clickable prototypes inside a phone frame.
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                id="onboarding-get-started-btn"
                type="button"
                onClick={() => setScreen('step1')}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {screen === 'step1' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
              <span>STEP 1 OF 2</span>
              <span>PERSONALIZATION</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">What should we call you?</h2>
              <p className="text-xs text-neutral-400">
                We'll personalize your daily builder greeting, streak, and weekly review logs.
              </p>
            </div>

            <div className="space-y-3">
              <input
                id="onboarding-name-input"
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aarav, Maya, Jordan"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setScreen('step2');
                }}
                className="w-full px-4 py-3.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 text-base focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setScreen('welcome')}
                className="px-4 py-2.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                id="onboarding-next-btn"
                type="button"
                onClick={() => setScreen('step2')}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {screen === 'step2' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
              <span>STEP 2 OF 2</span>
              <span>FOCUS DOMAINS</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">What are you working on?</h2>
              <p className="text-xs text-neutral-400">
                Select 1–3 categories that describe your active builder focus.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {FOCUS_OPTIONS.map((opt) => {
                const isSelected = selectedFocus.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleFocus(opt)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                    }`}
                  >
                    <span className="truncate">{opt}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setScreen('step1')}
                className="px-4 py-2.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                id="onboarding-finish-btn"
                type="button"
                onClick={handleFinish}
                className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Rocket className="w-4 h-4" />
                <span>Start Building</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
