import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PriorityLevel, TaskStatus } from '../../types';
import { X, CheckSquare } from 'lucide-react';

export const TaskModal: React.FC = () => {
  const { 
    taskModalOpen, 
    setTaskModalOpen, 
    taskToEdit, 
    createTask, 
    updateTask, 
    projects, 
    selectedProjectId,
    openCreateProjectModal
  } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('P2');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [dueDate, setDueDate] = useState('');
  const [milestone, setMilestone] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setProjectId(taskToEdit.projectId);
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setDueDate(taskToEdit.dueDate || '');
      setMilestone(taskToEdit.milestone || '');
    } else {
      setTitle('');
      setDescription('');
      setProjectId(selectedProjectId || projects[0]?.id || '');
      setPriority('P2');
      setStatus('todo');
      setDueDate(new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]);
      setMilestone('');
    }
  }, [taskToEdit, taskModalOpen, selectedProjectId, projects]);

  if (!taskModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId) return;

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title: title.trim(),
        description: description.trim(),
        projectId,
        priority,
        status,
        dueDate,
        milestone: milestone.trim() || undefined,
      });
    } else {
      createTask({
        title: title.trim(),
        description: description.trim(),
        projectId,
        priority,
        status,
        dueDate,
        milestone: milestone.trim() || undefined,
      });
    }

    setTaskModalOpen(false);
  };

  return (
    <div 
      id="task-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => setTaskModalOpen(false)}
    >
      <div 
        id="task-modal-container"
        className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 id="task-modal-title" className="text-lg font-bold text-white">
                {taskToEdit ? 'Edit Task' : 'Add New Task'}
              </h2>
              <p className="text-xs text-neutral-400">Track actionable items, priorities, and deadlines</p>
            </div>
          </div>
          <button
            id="task-modal-close-btn"
            type="button"
            onClick={() => setTaskModalOpen(false)}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {projects.length === 0 && !taskToEdit ? (
          <div className="py-8 text-center space-y-4">
            <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 max-w-sm mx-auto space-y-2">
              <p className="text-xs text-neutral-300 font-medium">No Projects Found</p>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Tasks belong to projects so you can track priorities, milestones, and progress cleanly.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setTaskModalOpen(false);
                openCreateProjectModal();
              }}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              + Create First Project
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Task Title *</label>
            <input
              id="task-title-input"
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement prototype phone simulator"
              className="w-full px-3.5 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Description</label>
            <textarea
              id="task-desc-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional implementation details or acceptance criteria"
              className="w-full px-3.5 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Assign to Project *</label>
              <select
                id="task-project-select"
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950/80 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Initial Status</label>
              <select
                id="task-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 bg-neutral-950/80 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="todo">To Do</option>
                <option value="doing">Doing</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Priority</label>
              <div className="grid grid-cols-3 gap-1 bg-neutral-950/80 p-1 border border-neutral-800 rounded-xl">
                {(['P1', 'P2', 'P3'] as PriorityLevel[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      priority === p
                        ? p === 'P1'
                          ? 'bg-rose-500 text-white shadow-sm'
                          : p === 'P2'
                          ? 'bg-amber-500 text-neutral-950 shadow-sm'
                          : 'bg-blue-500 text-white shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Due Date</label>
              <input
                id="task-due-date-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950/80 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Milestone Tag</label>
              <input
                id="task-milestone-input"
                type="text"
                value={milestone}
                onChange={(e) => setMilestone(e.target.value)}
                placeholder="e.g. MVP, v1.0"
                className="w-full px-3 py-2 bg-neutral-950/80 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              id="task-modal-cancel"
              type="button"
              onClick={() => setTaskModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700/80 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="task-modal-submit-btn"
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-neutral-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};
