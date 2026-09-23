import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, CheckCircle2, Clock, Sparkles, Send, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { WeeklyReviewData } from '../../types';

export const WeeklyReviewView: React.FC = () => {
  const { tasks, projects, weeklyReviews, saveWeeklyReview, addToast } = useApp();

  const currentWeekId = '2026-W38';
  const savedData = weeklyReviews[currentWeekId];

  const [notes, setNotes] = useState(savedData?.notes || '');
  const [nextWeekFocus, setNextWeekFocus] = useState(savedData?.nextWeekFocus || '');

  // Shipped tasks
  const shippedTasks = useMemo(() => {
    return tasks.filter((t) => t.status === 'done');
  }, [tasks]);

  // Daily hours breakdown (Mon - Sun)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dailyHours = useMemo(() => {
    if (savedData?.dailyHours) return savedData.dailyHours;
    return daysOfWeek.map((day) => ({ day, hours: 0 }));
  }, [savedData]);

  const maxHours = Math.max(...dailyHours.map((d) => d.hours), 8);
  const totalWeeklyHours = dailyHours.reduce((sum, d) => sum + d.hours, 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const data: WeeklyReviewData = {
      weekId: currentWeekId,
      notes,
      nextWeekFocus,
      dailyHours,
      shippedHighlights: shippedTasks.map((t) => t.title),
      savedAt: new Date().toISOString(),
    };
    saveWeeklyReview(data);
  };

  return (
    <div id="weekly-review-view" className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white">Builder Weekly Review</h2>
              <p className="text-xs text-neutral-400">Reflect on shipments, focus velocity, and map out next week</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300">
          <span>Week 38 (Sep 15 – Sep 22, 2026)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Hours Chart & Shipped Highlights */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hours Chart Card */}
          <div className="p-6 bg-neutral-950/70 border border-neutral-800 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Focus Time Breakdown
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">Hours logged across active builder sessions</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-amber-400 font-mono">
                  {totalWeeklyHours.toFixed(1)}h
                </span>
                <span className="text-[11px] text-neutral-500 block">Total logged</span>
              </div>
            </div>

            {/* Custom Interactive Bar Chart */}
            <div className="pt-6 pb-2">
              <div className="h-44 flex items-end justify-between gap-3 px-2">
                {dailyHours.map((item) => {
                  const heightPercent = (item.hours / maxHours) * 100;
                  return (
                    <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="text-[11px] font-mono text-amber-300 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.hours}h
                      </div>
                      <div className="w-full bg-neutral-900 rounded-t-xl overflow-hidden h-36 flex items-end">
                        <div
                          className="w-full bg-gradient-to-t from-amber-600 to-amber-400 group-hover:from-amber-500 group-hover:to-amber-300 rounded-t-xl transition-all duration-300"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-neutral-400 group-hover:text-white transition-colors">
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Shipped Highlights Card */}
          <div className="p-6 bg-neutral-950/70 border border-neutral-800 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                What Shipped This Week ({shippedTasks.length})
              </h3>
              <span className="text-xs font-mono text-emerald-400 font-semibold">100% Verified</span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {shippedTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-2xl">
                  No shipped tasks logged yet this week. Check off tasks in your Kanban to celebrate!
                </div>
              ) : (
                shippedTasks.map((t) => {
                  const proj = projects.find((p) => p.id === t.projectId);
                  return (
                    <div
                      key={t.id}
                      className="p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        <span className="text-xs font-medium text-neutral-200 truncate">{t.title}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-950 text-neutral-400 shrink-0">
                        {proj?.name || 'Project'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Planner & Reflection */}
        <div className="space-y-6">
          <form onSubmit={handleSave} className="p-6 bg-neutral-950/70 border border-neutral-800 rounded-3xl space-y-5">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Focus & Strategy</h3>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-300">
                Weekly Reflection & Takeaways
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What worked? What blocked momentum? Key architecture decisions..."
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 transition-colors resize-none leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-300">
                Next Week Top Focus Items
              </label>
              <textarea
                rows={4}
                value={nextWeekFocus}
                onChange={(e) => setNextWeekFocus(e.target.value)}
                placeholder="Top 3 outcomes to ship next week..."
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 transition-colors resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-2xl text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Save Weekly Review</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
