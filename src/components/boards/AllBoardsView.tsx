import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CanvasBoard } from '../../types';
import { 
  Layers, Plus, Search, Filter, Play, 
  Trash2, ExternalLink, Smartphone, 
  FileText, StickyNote, FileUp, Sparkles 
} from 'lucide-react';

export const AllBoardsView: React.FC = () => {
  const { 
    boards, 
    projects, 
    openBoardModal, 
    deleteBoard, 
    createBoard, 
    openConfirmModal, 
    isDarkMode 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');
  const [targetProjectId, setTargetProjectId] = useState<string>(projects[0]?.id || 'standalone');

  const filteredBoards = useMemo(() => {
    return boards.filter((b) => {
      const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesProject = selectedProjectId === 'all' || b.projectId === selectedProjectId;
      return matchesSearch && matchesProject;
    });
  }, [boards, searchQuery, selectedProjectId]);

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    const projId = targetProjectId || projects[0]?.id || 'p-default';
    const newBoard = createBoard(projId, newBoardName.trim(), newBoardDesc.trim());
    setCreateModalOpen(false);
    setNewBoardName('');
    setNewBoardDesc('');
    openBoardModal(newBoard);
  };

  return (
    <div id="all-boards-view" className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                Boards & User Flows
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Universal infinite desks for PRDs, sticky notes, editable documents, screen mockups, and clickable prototypes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="all-boards-create-btn"
            onClick={() => {
              if (projects.length > 0) setTargetProjectId(projects[0].id);
              setCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/10 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Canvas Board</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className={`p-2.5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
        isDarkMode ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200 shadow-xs'
      }`}>
        <div className="flex items-center gap-2 w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 shrink-0 ml-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all boards, notes, specs..."
            className={`w-full bg-transparent text-xs focus:outline-none ${
              isDarkMode ? 'text-white placeholder-neutral-500' : 'text-neutral-900 placeholder-neutral-400'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-xs text-neutral-400">Project:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className={`px-3 py-1.5 rounded-xl border text-xs focus:outline-none cursor-pointer ${
              isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-900'
            }`}
          >
            <option value="all">All Projects ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Boards Grid */}
      {filteredBoards.length === 0 ? (
        <div className={`p-12 rounded-3xl border text-center space-y-3 ${
          isDarkMode ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-neutral-200'
        }`}>
          <Layers className="w-10 h-10 text-neutral-500 mx-auto" />
          <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>No Boards Found</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            {searchQuery ? 'No boards match your search query.' : 'Create your first universal canvas board to drop PDFs, stickies, and mobile user flows.'}
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-amber-500 text-neutral-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition-colors cursor-pointer"
          >
            + Create Canvas Board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBoards.map((board) => {
            const project = projects.find((p) => p.id === board.projectId);
            const screensCount = board.elements.filter((e) => e.type === 'screen').length;
            const pdfsCount = board.elements.filter((e) => e.type === 'pdf').length;
            const stickiesCount = board.elements.filter((e) => e.type === 'sticky').length;
            const docsCount = board.elements.filter((e) => e.type === 'doc').length;
            const connectionsCount = board.connections.length;

            return (
              <div
                key={board.id}
                id={`all-boards-card-${board.id}`}
                onClick={() => openBoardModal(board)}
                className={`group relative border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between ${
                  isDarkMode 
                    ? 'bg-neutral-900/70 hover:bg-neutral-900 border-neutral-800 hover:border-neutral-700' 
                    : 'bg-white hover:bg-neutral-50/80 border-neutral-200 hover:border-neutral-300'
                }`}
              >
                {/* Thumbnail Canvas Mock Visual */}
                <div className={`h-44 border-b relative flex items-center justify-center overflow-hidden ${
                  isDarkMode 
                    ? 'bg-neutral-950 border-neutral-800 canvas-dot-grid-dark' 
                    : 'bg-neutral-100 border-neutral-200 canvas-dot-grid-light'
                }`}>
                  <div className="flex items-center gap-3 transform scale-60 group-hover:scale-65 transition-transform duration-300">
                    {/* Miniature PDF preview */}
                    {pdfsCount > 0 && (
                      <div className="w-28 h-36 rounded-xl border-2 border-rose-500/60 bg-neutral-900 p-2 shadow-lg flex flex-col justify-between">
                        <div className="flex items-center gap-1">
                          <span className="p-0.5 rounded bg-rose-500 text-[8px] font-bold text-white">PDF</span>
                          <span className="text-[9px] font-bold text-white truncate">PRD.pdf</span>
                        </div>
                        <div className="space-y-1">
                          <div className="w-full h-1 bg-neutral-700 rounded" />
                          <div className="w-4/5 h-1 bg-neutral-700 rounded" />
                          <div className="w-3/5 h-1 bg-amber-400/80 rounded" />
                        </div>
                        <span className="text-[7px] font-mono text-neutral-400">Double-click read</span>
                      </div>
                    )}

                    {/* Miniature Stickies */}
                    {stickiesCount > 0 && (
                      <div className="w-24 h-24 rounded-xl bg-amber-300 text-neutral-950 p-2 shadow-md flex flex-col justify-between">
                        <span className="text-[9px] font-bold">Fix this</span>
                        <div className="space-y-0.5">
                          <div className="w-full h-1 bg-neutral-900/30 rounded" />
                          <div className="w-3/4 h-1 bg-neutral-900/30 rounded" />
                        </div>
                        <span className="text-[7px] text-right font-mono opacity-60">Sticky</span>
                      </div>
                    )}

                    {/* Miniature Doc */}
                    {docsCount > 0 && (
                      <div className="w-28 h-36 rounded-xl border-2 border-blue-500/60 bg-neutral-900 p-2 shadow-lg flex flex-col justify-between">
                        <div className="flex items-center gap-1">
                          <span className="p-0.5 rounded bg-blue-500 text-[8px] font-bold text-white">DOCX</span>
                          <span className="text-[9px] font-bold text-white truncate">requirements</span>
                        </div>
                        <div className="space-y-1">
                          <div className="w-full h-1 bg-neutral-700 rounded" />
                          <div className="w-full h-1 bg-neutral-700 rounded" />
                          <div className="w-1/2 h-1 bg-neutral-700 rounded" />
                        </div>
                        <span className="text-[7px] font-mono text-blue-300">Editable block</span>
                      </div>
                    )}

                    {/* Miniature Screen Frames */}
                    {screensCount > 0 && pdfsCount === 0 && (
                      board.elements.filter((e) => e.type === 'screen').slice(0, 2).map((screen, idx) => (
                        <div
                          key={idx}
                          className="w-28 h-40 rounded-2xl border-2 border-neutral-700 bg-neutral-900 p-2 shadow-lg flex flex-col justify-between"
                        >
                          <div className="w-6 h-1 bg-white/30 rounded-full mx-auto" />
                          <div className="text-[9px] font-bold text-neutral-300 truncate text-center">
                            {screen.title || 'Screen'}
                          </div>
                          <div className="w-full py-1 bg-amber-500/80 text-[8px] font-bold text-neutral-950 rounded text-center">
                            Tap CTA
                          </div>
                        </div>
                      ))
                    )}

                    {board.elements.length === 0 && (
                      <div className="flex flex-col items-center gap-1.5 text-neutral-500">
                        <Layers className="w-8 h-8" />
                        <span className="text-[11px]">Blank Board</span>
                      </div>
                    )}
                  </div>

                  {/* Hover Play Pill */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="px-4 py-2 bg-amber-500 text-neutral-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2">
                      <Play className="w-3.5 h-3.5 fill-neutral-950" />
                      <span>Open Canvas & Flow</span>
                    </div>
                  </div>
                </div>

                {/* Board Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-bold group-hover:text-amber-500 transition-colors ${
                          isDarkMode ? 'text-white' : 'text-neutral-900'
                        }`}>
                          {board.name}
                        </h4>
                        {project && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            isDarkMode ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-600'
                          }`}>
                            {project.name}
                          </span>
                        )}
                      </div>
                      {board.description && (
                        <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                          {board.description}
                        </p>
                      )}
                    </div>

                    <button
                      id={`delete-all-board-btn-${board.id}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openConfirmModal({
                          title: `Delete Board "${board.name}"?`,
                          message: 'This will permanently remove this visual canvas and all connected user flows.',
                          isDestructive: true,
                          confirmLabel: 'Delete Board',
                          onConfirm: () => deleteBoard(board.id),
                        });
                      }}
                      className="p-1 text-neutral-500 hover:text-rose-400 rounded-lg hover:bg-neutral-800/40 transition-colors cursor-pointer"
                      title="Delete board"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className={`flex items-center justify-between text-[11px] pt-2 border-t font-mono ${
                    isDarkMode ? 'border-neutral-800 text-neutral-500' : 'border-neutral-200 text-neutral-500'
                  }`}>
                    <span className="flex items-center gap-1.5">
                      {pdfsCount > 0 && <span className="text-rose-400 font-semibold">{pdfsCount} PDF</span>}
                      {stickiesCount > 0 && <span className="text-amber-400 font-semibold">{stickiesCount} Stickies</span>}
                      {docsCount > 0 && <span className="text-blue-400 font-semibold">{docsCount} Docs</span>}
                      {screensCount > 0 && <span>{screensCount} Screens</span>}
                    </span>
                    <span>{board.elements.length} elements</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Board Modal */}
      {createModalOpen && (
        <div 
          id="all-boards-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setCreateModalOpen(false)}
        >
          <div 
            id="all-boards-modal-container"
            className={`w-full max-w-md border rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 ${
              isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold">Create New Canvas Board</h3>
            <p className="text-xs text-neutral-400">
              Start a new universal container board for PDFs, Word docs, stickies, diagrams, or screen prototypes.
            </p>

            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Board Name *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="e.g. Research & PRD Desk, User Flow, Ideas"
                  className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-amber-500 ${
                    isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Assign to Project</label>
                <select
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-amber-500 ${
                    isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                  }`}
                >
                  {projects.length === 0 && (
                    <option value="standalone">Standalone Canvas</option>
                  )}
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={newBoardDesc}
                  onChange={(e) => setNewBoardDesc(e.target.value)}
                  placeholder="Brief note about the purpose of this flow"
                  className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-amber-500 ${
                    isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-neutral-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Create & Launch Canvas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
