import React, { useState } from 'react';
import { CanvasBoard, CanvasElement } from '../../types';
import { X, RotateCcw, Smartphone, ArrowRight, Play, Sparkles } from 'lucide-react';

interface PrototypePlayerProps {
  board: CanvasBoard;
  onClose: () => void;
}

export const PrototypePlayer: React.FC<PrototypePlayerProps> = ({ board, onClose }) => {
  // Collect all screen frames from this board
  const screens = board.elements.filter((el) => el.type === 'screen');
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');
  const [history, setHistory] = useState<number[]>([0]);

  const currentScreen = screens[currentScreenIndex] || screens[0];

  // If no screens in the board
  if (!currentScreen) {
    return (
      <div 
        id="prototype-player-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center max-w-sm space-y-4">
          <Smartphone className="w-10 h-10 text-neutral-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Screen Frames Found</h3>
          <p className="text-xs text-neutral-400">
            Add at least one "Screen Frame" component in the canvas toolbar to preview an interactive mobile prototype.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const navigateToScreenId = (targetId?: string) => {
    if (!targetId) {
      // If no explicit target, try following connection from this screen
      const outgoing = board.connections.find((c) => c.fromId === currentScreen.id);
      if (outgoing) {
        const idx = screens.findIndex((s) => s.id === outgoing.toId);
        if (idx !== -1) {
          setTransitionDirection('forward');
          setHistory((prev) => [...prev, idx]);
          setCurrentScreenIndex(idx);
          return;
        }
      }
      // Or cycle to next screen
      if (screens.length > 1) {
        const nextIdx = (currentScreenIndex + 1) % screens.length;
        setTransitionDirection('forward');
        setHistory((prev) => [...prev, nextIdx]);
        setCurrentScreenIndex(nextIdx);
      }
      return;
    }

    const targetIdx = screens.findIndex((s) => s.id === targetId);
    if (targetIdx !== -1) {
      setTransitionDirection('forward');
      setHistory((prev) => [...prev, targetIdx]);
      setCurrentScreenIndex(targetIdx);
    }
  };

  const handleBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const prevIdx = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setTransitionDirection('backward');
      setCurrentScreenIndex(prevIdx);
    } else {
      setTransitionDirection('backward');
      setCurrentScreenIndex((prev) => (prev - 1 + screens.length) % screens.length);
    }
  };

  const handleRestart = () => {
    setHistory([0]);
    setTransitionDirection('backward');
    setCurrentScreenIndex(0);
  };

  return (
    <div 
      id="prototype-player-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="prototype-player-modal"
        className="relative flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between gap-4 px-5 py-2.5 bg-neutral-900/90 border border-neutral-800 rounded-full shadow-2xl backdrop-blur-md w-full max-w-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white truncate max-w-[140px]">
              {board.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="proto-restart-btn"
              onClick={handleRestart}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Restart prototype flow"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              id="proto-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Exit prototype mode"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Device Bezel Frame */}
        <div 
          id="prototype-phone-frame"
          className="relative w-[320px] h-[640px] bg-neutral-950 border-[10px] border-neutral-800 rounded-[48px] shadow-2xl overflow-hidden flex flex-col select-none ring-1 ring-neutral-700/50"
        >
          {/* Top Dynamic Island / Speaker Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-neutral-900 rounded-full z-20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-neutral-800 mr-2" />
            <div className="w-12 h-1 bg-neutral-800 rounded-full" />
          </div>

          {/* Screen Content Container with Smooth Slide Animation */}
          <div 
            key={currentScreen.id}
            id={`proto-screen-${currentScreen.id}`}
            className={`flex-1 w-full h-full pt-8 pb-6 px-4 flex flex-col justify-between text-neutral-100 overflow-y-auto ${
              transitionDirection === 'forward' ? 'animate-slide-right' : 'animate-slide-left'
            }`}
            style={{ 
              backgroundColor: currentScreen.screenBg || '#0f172a'
            }}
          >
            {/* Screen Header */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                <span>9:41</span>
                <span className="flex items-center gap-1">5G 100%</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300">Screen View</span>
                <h4 className="text-base font-extrabold text-white mt-0.5">{currentScreen.title || 'Screen Frame'}</h4>
              </div>
            </div>

            {/* Screen Mockup Elements / Interactions */}
            <div className="space-y-3 my-auto py-4">
              {currentScreen.mockupElements && currentScreen.mockupElements.length > 0 ? (
                currentScreen.mockupElements.map((el, i) => {
                  if (el.type === 'button') {
                    return (
                      <button
                        key={i}
                        id={`proto-btn-${i}`}
                        onClick={() => navigateToScreenId(el.targetScreenId)}
                        className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <span>{el.label}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    );
                  }
                  if (el.type === 'card') {
                    return (
                      <div
                        key={i}
                        onClick={() => navigateToScreenId()}
                        className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/40 cursor-pointer transition-colors"
                      >
                        <div className="text-xs font-semibold text-white">{el.label}</div>
                        <div className="text-[10px] text-neutral-400 mt-1">Tap to trigger connected transition</div>
                      </div>
                    );
                  }
                  if (el.type === 'header') {
                    return (
                      <div key={i} className="text-sm font-bold text-neutral-200">
                        {el.label}
                      </div>
                    );
                  }
                  return (
                    <div key={i} className="p-2.5 rounded-xl bg-neutral-800/60 text-xs text-neutral-300">
                      {el.label}
                    </div>
                  );
                })
              ) : (
                <div 
                  onClick={() => navigateToScreenId()}
                  className="p-6 rounded-2xl bg-white/5 border border-dashed border-white/20 text-center cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <p className="text-xs text-neutral-300 font-medium">Tap anywhere on screen</p>
                  <p className="text-[10px] text-neutral-500 mt-1">Simulates next user flow step</p>
                </div>
              )}
            </div>

            {/* Bottom Screen Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1">
                <span>Screen {currentScreenIndex + 1} of {screens.length}</span>
                <span className="text-amber-300 font-medium">Interactive Flow</span>
              </div>
              {/* Home indicator bar */}
              <div 
                onClick={handleBack}
                className="w-24 h-1 bg-white/30 hover:bg-white/60 mx-auto rounded-full cursor-pointer transition-colors"
                title="Tap to go back"
              />
            </div>
          </div>
        </div>

        {/* Bottom Screen Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1.5 bg-neutral-900/90 border border-neutral-800 rounded-full max-w-sm overflow-x-auto">
          {screens.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                setTransitionDirection(idx > currentScreenIndex ? 'forward' : 'backward');
                setCurrentScreenIndex(idx);
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                idx === currentScreenIndex
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {s.title || `Screen ${idx + 1}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
