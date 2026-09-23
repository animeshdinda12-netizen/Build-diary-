import React from 'react';
import { useApp } from '../../context/AppContext';
import { KanbanBoard } from '../tasks/KanbanBoard';
import { WorkspaceTimeline } from '../workspace/WorkspaceTimeline';
import { BoardsGallery } from '../workspace/BoardsGallery';
import { FilesView } from '../files/FilesView';
import { 
  ArrowLeft, CheckSquare, Layers, FileText, 
  BarChart3, Edit3, Trash2, Archive, Calendar, 
  Clock, Tag, Sparkles, AlertTriangle 
} from 'lucide-react';
import { PriorityLevel } from '../../types';

export const ProjectDetailView: React.FC = () => {
  const { 
    activeProject, 
    setSelectedProjectId, 
    setCurrentView,
    projectTab,
    setProjectTab,
    workspaceSubTab,
    setWorkspaceSubTab,
    openEditProjectModal,
    archiveProject,
    deleteProject,
    openConfirmModal,
    getProjectProgress,
    projectTasks,
    projectBoards,
    projectTimeline
  } = useApp();

  if (!activeProject) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-neutral-400">Project not found or was removed.</p>
        <button
          onClick={() => {
            setSelectedProjectId(null);
            setCurrentView('dashboard');
          }}
          className="px-4 py-2 bg-amber-500 text-neutral-950 font-bold rounded-xl text-xs"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const progress = getProjectProgress(activeProject.id);

  const getPriorityBadge = (p: PriorityLevel) => {
    switch (p) {
      case 'P1':
        return <span className="px-2 py-0.5 text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded-lg">P1</span>;
      case 'P2':
        return <span className="px-2 py-0.5 text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-lg">P2</span>;
      case 'P3':
        return <span className="px-2 py-0.5 text-xs font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 rounded-lg">P3</span>;
    }
  };

  const handleDelete = () => {
    openConfirmModal({
      title: `Delete '${activeProject.name}'?`,
      message: `This will delete ${projectTasks.length} tasks, ${projectTimeline.length} notes, and ${projectBoards.length} boards. Can't be undone.`,
      isDestructive: true,
      confirmLabel: 'Delete Project',
      onConfirm: () => deleteProject(activeProject.id),
    });
  };

  return (
    <div id="project-detail-view" className="space-y-6">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <button
            id="project-back-btn"
            onClick={() => {
              setSelectedProjectId(null);
              setCurrentView('dashboard');
            }}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 id="project-detail-title" className="text-xl font-extrabold text-white">
                {activeProject.name}
              </h1>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                activeProject.status === 'Active' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                activeProject.status === 'Idea' ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30' :
                activeProject.status === 'Done' ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30' :
                'bg-neutral-800 text-neutral-400'
              }`}>
                {activeProject.status}
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-400">
                {activeProject.category}
              </span>
              {getPriorityBadge(activeProject.priority)}
            </div>

            {activeProject.description && (
              <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
                {activeProject.description}
              </p>
            )}
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2">
          {/* Progress Ring / Percentage Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800">
            <div className="w-6 h-6 rounded-full border-2 border-neutral-700 flex items-center justify-center relative overflow-hidden">
              <div 
                className="absolute inset-0 bg-amber-500/20"
                style={{ height: `${progress}%`, bottom: 0 }}
              />
              <span className="text-[10px] font-mono font-bold text-amber-400 z-10">{progress}%</span>
            </div>
            <span className="text-xs text-neutral-300 font-medium">Progress</span>
          </div>

          <button
            id="project-edit-btn"
            onClick={() => openEditProjectModal(activeProject)}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
            title="Edit Project"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            id="project-archive-btn"
            onClick={() => archiveProject(activeProject.id)}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
            title={activeProject.archived ? 'Unarchive' : 'Archive'}
          >
            <Archive className="w-4 h-4" />
          </button>

          <button
            id="project-delete-btn"
            onClick={handleDelete}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-neutral-800 hover:border-rose-500/30 transition-colors cursor-pointer"
            title="Delete Project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-2">
        <div className="flex items-center gap-1.5">
          <button
            id="tab-tasks-btn"
            onClick={() => setProjectTab('tasks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              projectTab === 'tasks'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span>Tasks ({projectTasks.length})</span>
          </button>

          <button
            id="tab-workspace-btn"
            onClick={() => setProjectTab('workspace')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              projectTab === 'workspace'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Layers className="w-4 h-4 text-teal-400" />
            <span>Workspace & Flows</span>
          </button>

          <button
            id="tab-files-btn"
            onClick={() => setProjectTab('files')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              projectTab === 'files'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Files & Links</span>
          </button>
        </div>

        {/* Workspace Sub-tabs when workspace tab is active */}
        {projectTab === 'workspace' && (
          <div className="flex items-center p-1 rounded-xl bg-neutral-950 border border-neutral-800">
            <button
              id="subtab-timeline-btn"
              onClick={() => setWorkspaceSubTab('timeline')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                workspaceSubTab === 'timeline'
                  ? 'bg-neutral-800 text-amber-300 font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Notes Timeline
            </button>
            <button
              id="subtab-boards-btn"
              onClick={() => setWorkspaceSubTab('boards')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                workspaceSubTab === 'boards'
                  ? 'bg-neutral-800 text-teal-300 font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Boards ({projectBoards.length})
            </button>
          </div>
        )}
      </div>

      {/* Tab Content Display */}
      {projectTab === 'tasks' && <KanbanBoard projectId={activeProject.id} />}

      {projectTab === 'workspace' && (
        workspaceSubTab === 'timeline' ? (
          <WorkspaceTimeline projectId={activeProject.id} />
        ) : (
          <BoardsGallery projectId={activeProject.id} />
        )
      )}

      {projectTab === 'files' && <FilesView projectId={activeProject.id} />}
    </div>
  );
};
