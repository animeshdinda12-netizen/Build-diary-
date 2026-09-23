import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ProjectCategory, ProjectStatus, PriorityLevel } from '../../types';
import { X, FolderPlus, Sparkles } from 'lucide-react';

export const ProjectModal: React.FC = () => {
  const { 
    projectModalOpen, 
    setProjectModalOpen, 
    projectToEdit, 
    createProject, 
    updateProject 
  } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Side');
  const [status, setStatus] = useState<ProjectStatus>('Active');
  const [priority, setPriority] = useState<PriorityLevel>('P1');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description);
      setCategory(projectToEdit.category);
      setStatus(projectToEdit.status);
      setPriority(projectToEdit.priority);
      setDeadline(projectToEdit.deadline);
    } else {
      setName('');
      setDescription('');
      setCategory('Side');
      setStatus('Active');
      setPriority('P1');
      // Default deadline: 14 days from now
      setDeadline(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
    }
  }, [projectToEdit, projectModalOpen]);

  if (!projectModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (projectToEdit) {
      updateProject(projectToEdit.id, {
        name: name.trim(),
        description: description.trim(),
        category,
        status,
        priority,
        deadline,
      });
    } else {
      createProject({
        name: name.trim(),
        description: description.trim(),
        category,
        status,
        priority,
        deadline,
      });
    }

    setProjectModalOpen(false);
  };

  return (
    <div 
      id="project-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => setProjectModalOpen(false)}
    >
      <div 
        id="project-modal-container"
        className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 id="project-modal-title" className="text-lg font-bold text-white">
                {projectToEdit ? 'Edit Project' : 'New Project'}
              </h2>
              <p className="text-xs text-neutral-400">Define your project parameters & target timeline</p>
            </div>
          </div>
          <button
            id="project-modal-close-btn"
            type="button"
            onClick={() => setProjectModalOpen(false)}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Project Name *</label>
            <input
              id="project-name-input"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. HyperFocus AI, Design System v2"
              className="w-full px-3.5 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Description / Builder Tagline</label>
            <textarea
              id="project-desc-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you building and why?"
              className="w-full px-3.5 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Category</label>
              <select
                id="project-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                className="w-full px-3 py-2 bg-neutral-950/80 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="Work">Work</option>
                <option value="Side">Side</option>
                <option value="Learning">Learning</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Status</label>
              <select
                id="project-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2 bg-neutral-950/80 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="Idea">Idea</option>
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Target Deadline</label>
              <input
                id="project-deadline-input"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950/80 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              id="project-modal-cancel"
              type="button"
              onClick={() => setProjectModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700/80 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="project-modal-submit-btn"
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-neutral-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              {projectToEdit ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
