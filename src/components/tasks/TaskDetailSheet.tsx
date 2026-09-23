import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, Play, Square, Clock, Calendar, CheckSquare, 
  Trash2, Plus, Flag, Tag, ArrowRight 
} from 'lucide-react';
import { PriorityLevel, TaskStatus } from '../../types';

export const TaskDetailSheet: React.FC = () => {
  const { 
    activeTaskForSheet, 
    setActiveTaskForSheet, 
    updateTask, 
    deleteTask, 
    toggleTaskDone,
    activeTimerTaskId,
    timerSeconds,
    startTaskTimer,
    stopTaskTimer,
    addTimeSpent,
    projects
  } = useApp();

  const [localTitle, setLocalTitle] = useState('');
  const [localDesc, setLocalDesc] = useState('');

  useEffect(() => {
    if (activeTaskForSheet) {
      setLocalTitle(activeTaskForSheet.title);
      setLocalDesc(activeTaskForSheet.description || '');
    }
  }, [activeTaskForSheet]);

  if (!activeTaskForSheet) return null;

  const project = projects.find((p) => p.id === activeTaskForSheet.projectId);
  const isTimerRunning = activeTimerTaskId === activeTaskForSheet.id;

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBlurTitle = () => {
    if (localTitle.trim() && localTitle !== activeTaskForSheet.title) {
      updateTask(activeTaskForSheet.id, { title: localTitle.trim() });
    }
  };

  const handleBlurDesc = () => {
    if (localDesc !== activeTaskForSheet.description) {
      updateTask(activeTaskForSheet.id, { description: localDesc });
    }
  };

  return (
    <div 
      id="task-detail-sheet-backdrop"
      className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
      onClick={() => setActiveTaskForSheet(null)}
    >
      <div 
        id="task-detail-sheet-container"
        className="w-full max-w-md bg-neutral-900 border-l border-neutral-800 h-full p-6 flex flex-col justify-between overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <button
                id="task-sheet-toggle-done-btn"
                type="button"
                onClick={() => toggleTaskDone(activeTaskForSheet.id)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  activeTaskForSheet.status === 'done'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
                }`}
                title={activeTaskForSheet.status === 'done' ? 'Mark as Incomplete' : 'Mark as Done'}
              >
                <CheckSquare className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-neutral-400">
                {project?.name || 'Project Task'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="task-sheet-delete-btn"
                onClick={() => deleteTask(activeTaskForSheet.id)}
                className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                id="task-sheet-close-btn"
                onClick={() => setActiveTaskForSheet(null)}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Title and Status Pills */}
          <div className="space-y-3">
            <input
              id="task-sheet-title-input"
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={handleBlurTitle}
              className="w-full text-lg font-bold text-white bg-transparent border-b border-transparent hover:border-neutral-700 focus:border-amber-500 pb-1 focus:outline-none transition-colors"
            />

            <div className="flex flex-wrap items-center gap-2">
              {/* Status Selector */}
              <div className="flex items-center rounded-lg bg-neutral-950 border border-neutral-800 p-0.5">
                {(['todo', 'doing', 'done'] as TaskStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => updateTask(activeTaskForSheet.id, { status: st })}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer capitalize ${
                      activeTaskForSheet.status === st
                        ? st === 'done'
                          ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                          : st === 'doing'
                          ? 'bg-amber-500/20 text-amber-300 font-semibold'
                          : 'bg-neutral-800 text-neutral-200 font-semibold'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {st === 'todo' ? 'To Do' : st}
                  </button>
                ))}
              </div>

              {/* Priority Selector */}
              <select
                value={activeTaskForSheet.priority}
                onChange={(e) => updateTask(activeTaskForSheet.id, { priority: e.target.value as PriorityLevel })}
                className="px-2 py-1 text-[11px] font-medium rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300 cursor-pointer focus:outline-none"
              >
                <option value="P1">P1 - High</option>
                <option value="P2">P2 - Medium</option>
                <option value="P3">P3 - Low</option>
              </select>

              {/* Milestone pill */}
              {activeTaskForSheet.milestone && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400">
                  <Tag className="w-3 h-3 text-indigo-400" />
                  <span>{activeTaskForSheet.milestone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Time Tracker Section (Requested in Flow 3) */}
          <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Time Tracker & Focus Log</span>
              </div>
              <div className="text-xs font-mono text-neutral-400">
                Total: <span className="text-neutral-200 font-semibold">{activeTaskForSheet.timeSpentMinutes || 0}m</span> logged
              </div>
            </div>

            {/* Timer controls */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/90 border border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${isTimerRunning ? 'bg-amber-400 animate-pulse' : 'bg-neutral-600'}`} />
                <span className="font-mono text-sm font-bold text-white">
                  {isTimerRunning ? formatTimer(timerSeconds) : '00:00'}
                </span>
                <span className="text-[11px] text-neutral-500">
                  {isTimerRunning ? 'Live Session' : 'Idle'}
                </span>
              </div>

              {isTimerRunning ? (
                <button
                  id="task-sheet-stop-timer-btn"
                  onClick={stopTaskTimer}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-rose-400" />
                  <span>Stop & Save</span>
                </button>
              ) : (
                <button
                  id="task-sheet-start-timer-btn"
                  onClick={() => startTaskTimer(activeTaskForSheet.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-neutral-950" />
                  <span>Start Timer</span>
                </button>
              )}
            </div>

            {/* Quick time additions */}
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="text-neutral-500 text-[11px]">Quick add:</span>
              {[15, 30, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => addTimeSpent(activeTaskForSheet.id, mins)}
                  className="px-2 py-0.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 hover:border-neutral-700 text-[11px] font-mono transition-colors cursor-pointer"
                >
                  +{mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Description & Notes */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-neutral-400">
              Description & Implementation Notes
            </label>
            <textarea
              id="task-sheet-desc-textarea"
              rows={4}
              value={localDesc}
              onChange={(e) => setLocalDesc(e.target.value)}
              onBlur={handleBlurDesc}
              placeholder="Add technical details, checklist items, links, or blockers..."
              className="w-full px-3.5 py-2.5 bg-neutral-950/70 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 text-xs leading-relaxed focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          {/* Due date and metadata */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Target Due Date:
              </span>
              <input
                type="date"
                value={activeTaskForSheet.dueDate || ''}
                onChange={(e) => updateTask(activeTaskForSheet.id, { dueDate: e.target.value })}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            {activeTaskForSheet.completedAt && (
              <div className="text-[11px] text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                Completed on {new Date(activeTaskForSheet.completedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-neutral-800 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setActiveTaskForSheet(null)}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
