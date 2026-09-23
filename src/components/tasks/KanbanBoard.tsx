import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskStatus, PriorityLevel } from '../../types';
import { 
  Plus, CheckSquare, Clock, Calendar, 
  Tag, MoreHorizontal, ArrowRight, ArrowLeft, 
  Kanban, List, CheckCircle2 
} from 'lucide-react';

interface KanbanBoardProps {
  projectId: string;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId }) => {
  const { 
    projectTasks, 
    openCreateTaskModal, 
    openEditTaskModal, 
    toggleTaskDone, 
    moveTaskStatus, 
    setActiveTaskForSheet 
  } = useApp();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const columns: { id: TaskStatus; label: string; color: string; badgeBg: string }[] = [
    { id: 'todo', label: 'To Do', color: 'text-neutral-400', badgeBg: 'bg-neutral-800' },
    { id: 'doing', label: 'Doing', color: 'text-amber-400', badgeBg: 'bg-amber-500/20 text-amber-300' },
    { id: 'done', label: 'Done', color: 'text-emerald-400', badgeBg: 'bg-emerald-500/20 text-emerald-300' },
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      moveTaskStatus(taskId, targetStatus);
    }
    setDraggedTaskId(null);
  };

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
    <div id="project-tasks-view" className="space-y-4">
      {/* Top Bar with Add and View Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-neutral-900 border border-neutral-800">
            <button
              id="kanban-view-btn"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'kanban' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              id="list-view-btn"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>
          <span className="text-xs text-neutral-500 font-mono">
            {projectTasks.length} task{projectTasks.length === 1 ? '' : 's'}
          </span>
        </div>

        <button
          id="add-task-btn"
          type="button"
          onClick={() => openCreateTaskModal(projectId)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700/80 text-white text-xs font-semibold rounded-xl border border-neutral-700/60 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((col) => {
            const tasksInCol = projectTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                id={`kanban-col-${col.id}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className="bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-3.5 flex flex-col min-h-[460px] transition-colors"
              >
                {/* Column header */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-neutral-800/80">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      col.id === 'todo' ? 'bg-neutral-500' : col.id === 'doing' ? 'bg-amber-400' : 'bg-emerald-400'
                    }`} />
                    <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                      {col.label}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold ${col.badgeBg}`}>
                    {tasksInCol.length}
                  </span>
                </div>

                {/* Task list in column */}
                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {tasksInCol.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center border border-dashed border-neutral-800 rounded-xl text-neutral-600 text-xs">
                      Drop tasks here
                    </div>
                  ) : (
                    tasksInCol.map((task) => (
                      <div
                        key={task.id}
                        id={`task-card-${task.id}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => setActiveTaskForSheet(task)}
                        className={`group relative p-3.5 bg-neutral-900/90 hover:bg-neutral-900 border rounded-xl shadow-sm transition-all cursor-pointer ${
                          task.status === 'done' 
                            ? 'border-neutral-800/60 opacity-80' 
                            : 'border-neutral-800 hover:border-neutral-700 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTaskDone(task.id);
                            }}
                            className={`mt-0.5 p-1 rounded-md border transition-colors cursor-pointer ${
                              task.status === 'done'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                : 'bg-neutral-950 text-neutral-500 border-neutral-700 hover:text-white hover:border-neutral-600'
                            }`}
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className={`text-xs font-semibold leading-snug line-clamp-2 ${
                              task.status === 'done' ? 'line-through text-neutral-400' : 'text-neutral-100'
                            }`}>
                              {task.title}
                            </div>

                            {task.description && (
                              <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                                {task.description}
                              </p>
                            )}

                            {/* Meta items */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              {getPriorityBadge(task.priority)}

                              {task.timeSpentMinutes > 0 && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono bg-neutral-950 border border-neutral-800 text-neutral-400 rounded">
                                  <Clock className="w-2.5 h-2.5 text-amber-400" />
                                  {task.timeSpentMinutes}m
                                </span>
                              )}

                              {task.dueDate && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono bg-neutral-950 border border-neutral-800 text-neutral-400 rounded">
                                  <Calendar className="w-2.5 h-2.5 text-neutral-500" />
                                  {task.dueDate.substring(5)}
                                </span>
                              )}

                              {task.milestone && (
                                <span className="px-1.5 py-0.5 text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded truncate max-w-[100px]">
                                  {task.milestone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quick column mover buttons on hover */}
                        <div className="mt-2 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <span>Move:</span>
                          <div className="flex items-center gap-1">
                            {task.status !== 'todo' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveTaskStatus(task.id, task.status === 'done' ? 'doing' : 'todo');
                                }}
                                className="px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px]"
                              >
                                ← Prev
                              </button>
                            )}
                            {task.status !== 'done' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveTaskStatus(task.id, task.status === 'todo' ? 'doing' : 'done');
                                }}
                                className="px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px]"
                              >
                                Next →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-2xl overflow-hidden divide-y divide-neutral-800/60">
          {projectTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500">
              No tasks found for this project. Click "+ Add Task" to begin.
            </div>
          ) : (
            projectTasks.map((task) => (
              <div
                key={task.id}
                id={`task-list-row-${task.id}`}
                onClick={() => setActiveTaskForSheet(task)}
                className="flex items-center justify-between p-3.5 hover:bg-neutral-900/60 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskDone(task.id);
                    }}
                    className={`p-1 rounded-md border transition-colors cursor-pointer ${
                      task.status === 'done'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-neutral-900 text-neutral-500 border-neutral-700 hover:text-white'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                  </button>

                  <div className="min-w-0">
                    <div className={`text-xs font-semibold truncate ${
                      task.status === 'done' ? 'line-through text-neutral-400' : 'text-neutral-100'
                    }`}>
                      {task.title}
                    </div>
                    {task.description && (
                      <div className="text-[11px] text-neutral-400 truncate max-w-md">
                        {task.description}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {getPriorityBadge(task.priority)}

                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    task.status === 'done' 
                      ? 'bg-emerald-500/20 text-emerald-300' 
                      : task.status === 'doing'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {task.status}
                  </span>

                  {task.timeSpentMinutes > 0 && (
                    <span className="text-[11px] font-mono text-neutral-400">
                      {task.timeSpentMinutes}m
                    </span>
                  )}

                  {task.dueDate && (
                    <span className="text-[11px] font-mono text-neutral-500">
                      {task.dueDate}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
