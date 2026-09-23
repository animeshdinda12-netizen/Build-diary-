import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CanvasBoard } from '../../types';
import { 
  Plus, Layers, Play, ExternalLink, 
  Trash2, Smartphone, Sparkles, Clock, FileText, 
  StickyNote, FileUp 
} from 'lucide-react';

interface BoardsGalleryProps {
  projectId: string;
}

export const BoardsGallery: React.FC<BoardsGalleryProps> = ({ projectId }) => {
  const { 
    projectBoards, 
    createBoard, 
    openBoardModal, 
    deleteBoard, 
    openConfirmModal,
    isDarkMode 
  } = useApp();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [boardDesc, setBoardDesc] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardName.trim()) return;

    const newBoard = createBoard(projectId, boardName.trim(), boardDesc.trim());
    setCreateModalOpen(false);
    setBoardName('');
    setBoardDesc('');
    openBoardModal(newBoard);
  };

  return (
    <div id="project-boards-gallery" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            <Layers className="w-4 h-4 text-teal-400" />
            Universal Canvases & User Flows
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Universal containers for PDFs, Word docs, Markdown, Stickies, Drawings, and Mobile Screen Prototypes.
          </p>
        </div>

        <button
          id="new-board-btn"
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold border border-neutral-700/60 transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-teal-400" />
          <span>New Board</span>
        </button>
      </div>

      {/* Grid of Board Thumbnails */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {projectBoards.map((board) => {
          const screensCount = board.elements.filter((e) => e.type === 'screen').length;
          const pdfsCount = board.elements.filter((e) => e.type === 'pdf').length;
          const stickiesCount = board.elements.filter((e) => e.type === 'sticky').length;
          const docsCount = board.elements.filter((e) => e.type === 'doc').length;
          const connectionsCount = board.connections.length;

          return (
            <div
              key={board.id}
              id={`board-card-${board.id}`}
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
                {/* Visual miniature representation of elements */}
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
                    <span>Open Desk & Flow</span>
                  </div>
                </div>
              </div>

              {/* Board Details */}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className={`text-sm font-bold group-hover:text-amber-500 transition-colors ${
                      isDarkMode ? 'text-white' : 'text-neutral-900'
                    }`}>
                      {board.name}
                    </h4>
                    {board.description && (
                      <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                        {board.description}
                      </p>
                    )}
                  </div>

                  <button
                    id={`delete-board-btn-${board.id}`}
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

      {/* New Board Modal */}
      {createModalOpen && (
        <div 
          id="new-board-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setCreateModalOpen(false)}
        >
          <div 
            id="new-board-modal-container"
            className={`w-full max-w-md border rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 ${
              isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold">Create New Canvas Board</h3>
            <p className="text-xs text-neutral-400">
              Start a new universal container board for PDFs, Word docs, stickies, diagrams, or screen prototypes.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Board Name *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  placeholder="e.g. Research & PRD Desk, User Flow, Ideas"
                  className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-amber-500 ${
                    isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={boardDesc}
                  onChange={(e) => setBoardDesc(e.target.value)}
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
