import React, { useState } from 'react';
import { CanvasElement } from '../../types';
import { 
  X, ChevronLeft, ChevronRight, PenTool, 
  Highlighter, Sparkles, Download, RotateCcw, 
  ZoomIn, ZoomOut, Check, FileText 
} from 'lucide-react';

interface PdfReaderModalProps {
  element: CanvasElement;
  isDarkMode: boolean;
  onClose: () => void;
  onUpdateElement: (updates: Partial<CanvasElement>) => void;
}

export const PdfReaderModal: React.FC<PdfReaderModalProps> = ({
  element,
  isDarkMode,
  onClose,
  onUpdateElement,
}) => {
  const pages = element.pdfPages || [
    {
      pageNumber: 1,
      text: element.content || 'Product Requirements Document\n\n1. Project Overview & Architecture\nBuild Diary tracks builder projects with unified notes, diagrams, and task kanban.',
      highlights: ['Project Overview', 'unified notes, diagrams'],
    },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeTool, setActiveTool] = useState<'read' | 'highlighter' | 'pen'>('read');
  const [highlights, setHighlights] = useState<string[]>(
    pages[currentPage - 1]?.highlights || []
  );

  const activePageData = pages[currentPage - 1] || pages[0];

  const handleNextPage = () => {
    if (currentPage < pages.length) {
      setCurrentPage((p) => p + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
  };

  const addHighlight = (text: string) => {
    if (!text.trim()) return;
    const updatedHighlights = [...highlights, text];
    setHighlights(updatedHighlights);

    const updatedPages = pages.map((p, idx) =>
      idx === currentPage - 1 ? { ...p, highlights: updatedHighlights } : p
    );

    onUpdateElement({ pdfPages: updatedPages });
  };

  return (
    <div
      id="pdf-reader-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="pdf-reader-modal"
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-colors ${
          isDarkMode
            ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
            : 'bg-white border-neutral-200 text-neutral-900 shadow-neutral-300/40'
        }`}
      >
        {/* Top Control Header */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b select-none ${
            isDarkMode ? 'border-neutral-800 bg-neutral-900/90' : 'border-neutral-200 bg-neutral-50/90'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold truncate max-w-[200px] sm:max-w-xs">
                {element.title || element.fileName || 'Document.pdf'}
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                {element.fileSize || '1.8 MB'} • {pages.length} Pages • Double-click reader
              </p>
            </div>
          </div>

          {/* Tools & Actions */}
          <div className="flex items-center gap-2">
            {/* Highlighter Tool */}
            <button
              onClick={() => setActiveTool(activeTool === 'highlighter' ? 'read' : 'highlighter')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTool === 'highlighter'
                  ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                  : isDarkMode
                  ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
              }`}
              title="Highlight key text in PDF"
            >
              <Highlighter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Highlight</span>
            </button>

            {/* Freehand Pen */}
            <button
              onClick={() => setActiveTool(activeTool === 'pen' ? 'read' : 'pen')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTool === 'pen'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                  : isDarkMode
                  ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
              }`}
              title="Draw annotation on PDF"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pen</span>
            </button>

            <div className={`w-px h-5 mx-1 ${isDarkMode ? 'bg-neutral-800' : 'bg-neutral-200'}`} />

            {/* Zoom Controls */}
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDarkMode ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-600 hover:bg-neutral-200'
              }`}
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-neutral-400 min-w-[36px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDarkMode ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-600 hover:bg-neutral-200'
              }`}
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <div className={`w-px h-5 mx-1 ${isDarkMode ? 'bg-neutral-800' : 'bg-neutral-200'}`} />

            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDarkMode ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF Page Viewing Canvas */}
        <div
          className={`flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center ${
            isDarkMode ? 'bg-neutral-950/60' : 'bg-neutral-100/80'
          }`}
        >
          <div
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
            className={`w-full max-w-2xl min-h-[500px] p-8 sm:p-10 rounded-2xl shadow-xl border transition-transform select-text ${
              isDarkMode
                ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
                : 'bg-white border-neutral-200 text-neutral-900'
            }`}
          >
            {/* Header Document Page Badge */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-700/40 text-xs font-mono text-neutral-400 select-none">
              <span>{element.title || 'PDF DOCUMENT'}</span>
              <span className="px-2 py-0.5 rounded bg-neutral-800/40 border border-neutral-700/30">
                PAGE {currentPage} OF {pages.length}
              </span>
            </div>

            {/* Page Text & Content */}
            <div className="space-y-4 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {activePageData.text.split('\n\n').map((paragraph, pIdx) => {
                // Check if paragraph contains highlights
                const isHighlighted = activePageData.highlights?.some((h) =>
                  paragraph.toLowerCase().includes(h.toLowerCase())
                );

                return (
                  <p
                    key={pIdx}
                    className={`p-2 rounded-xl transition-all ${
                      isHighlighted
                        ? 'bg-amber-400/20 border-l-4 border-amber-400 font-medium'
                        : ''
                    }`}
                  >
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* Highlight helper tool prompt */}
            {activeTool === 'highlighter' && (
              <div className="mt-8 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300 select-none">
                <span>Highlight tool active: select or tap text to pin review highlight</span>
                <button
                  onClick={() => addHighlight('Executive summary architecture spec')}
                  className="px-2.5 py-1 bg-amber-400 text-neutral-950 font-bold rounded-lg text-[11px] cursor-pointer"
                >
                  + Add Key Highlight
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Pagination Bar */}
        <div
          className={`flex items-center justify-between px-6 py-3 border-t select-none ${
            isDarkMode ? 'border-neutral-800 bg-neutral-900/90' : 'border-neutral-200 bg-neutral-50/90'
          }`}
        >
          <div className="text-xs text-neutral-400">
            Press <kbd className="font-mono text-amber-400">Esc</kbd> or click outside to return to board desk
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                currentPage <= 1
                  ? 'opacity-40 cursor-not-allowed'
                  : isDarkMode
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-white'
                  : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-900'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="text-xs font-mono px-2 font-semibold">
              {currentPage} / {pages.length}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= pages.length}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                currentPage >= pages.length
                  ? 'opacity-40 cursor-not-allowed'
                  : isDarkMode
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-white'
                  : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-900'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
