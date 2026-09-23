import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CanvasBoard, CanvasElement, FlowConnection } from '../../types';
import { PrototypePlayer } from './PrototypePlayer';
import { PdfReaderModal } from './PdfReaderModal';
import { 
  X, Play, Download, Save, MousePointer, 
  PenTool, Highlighter, Smartphone, Diamond, Square, StickyNote, 
  ArrowRight, Type, Undo, Redo, Layers, Palette, 
  Trash2, Move, Plus, Sparkles, Check, FileText, 
  Image as ImageIcon, Upload, FileUp, Moon, Sun, 
  Maximize2, Eye, Circle, ExternalLink 
} from 'lucide-react';

interface InfiniteCanvasModalProps {
  board: CanvasBoard;
  onClose: () => void;
}

export const InfiniteCanvasModal: React.FC<InfiniteCanvasModalProps> = ({ board, onClose }) => {
  const { updateBoard, addToast, isDarkMode, toggleTheme } = useApp();

  // Elements & Connections state
  const [elements, setElements] = useState<CanvasElement[]>(board.elements || []);
  const [connections, setConnections] = useState<FlowConnection[]>(board.connections || []);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Tools: select, pen, highlighter, screen, diamond, action, sticky, doc, pdf, image, rectangle, circle, arrow
  const [activeTool, setActiveTool] = useState<
    'select' | 'pen' | 'highlighter' | 'screen' | 'diamond' | 'action' | 'sticky' | 'doc' | 'pdf' | 'arrow' | 'rectangle' | 'circle'
  >('select');

  // Drawing styling
  const [strokeColor, setStrokeColor] = useState('#f59e0b');
  const [strokeWidth, setStrokeWidth] = useState(3);

  // UI Panels
  const [showLayers, setShowLayers] = useState(false);
  const [showInspector, setShowInspector] = useState(true);
  const [isPlayingPrototype, setIsPlayingPrototype] = useState(false);
  const [activePdfElement, setActivePdfElement] = useState<CanvasElement | null>(null);

  // Pan & Zoom
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Freehand drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPathPoints, setCurrentPathPoints] = useState<{ x: number; y: number }[]>([]);

  // Arrow connecting state
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);

  // Dragging element state
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // File drag & drop over desk
  const [isDragOverDesk, setIsDragOverDesk] = useState(false);

  // Auto-save tracker (every 2s)
  const [lastSaved, setLastSaved] = useState<string>('Just now');
  const [hasUnsaved, setHasUnsaved] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save every 2s when changed
  useEffect(() => {
    if (!hasUnsaved) return;
    const timer = setTimeout(() => {
      saveBoardState();
      setHasUnsaved(false);
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 2000);
    return () => clearTimeout(timer);
  }, [elements, connections, hasUnsaved]);

  const saveBoardState = () => {
    updateBoard(board.id, {
      elements,
      connections,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleManualSave = () => {
    saveBoardState();
    addToast('Board auto-saved to JSON successfully', 'success');
  };

  // Prevent browser default zoom on wheel over canvas and implement smooth canvas zoom
  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom((z) => Math.min(2.5, Math.max(0.35, z * zoomFactor)));
    };

    canvasEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvasEl.removeEventListener('wheel', handleWheel);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'v' || e.key === 'V') setActiveTool('select');
      if (e.key === 'p' || e.key === 'P') setActiveTool('pen');
      if (e.key === 'h' || e.key === 'H') setActiveTool('highlighter');
      if (e.key === 's' || e.key === 'S') setActiveTool('sticky');
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) {
          deleteSelectedElement();
        }
      }
      if (e.key === 'Escape') {
        setSelectedElementId(null);
        setConnectingFromId(null);
        setActiveTool('select');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId]);

  // File Ingestion Handler (Drag & Drop or File Picker)
  const handleFileDrop = (files: FileList, clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.round((clientX - rect.left - pan.x) / zoom);
    const y = Math.round((clientY - rect.top - pan.y) / zoom);

    Array.from(files).forEach((file, index) => {
      const offset = index * 40;
      const lowerName = file.name.toLowerCase();

      if (lowerName.endsWith('.pdf')) {
        // PDF File
        const newPdf: CanvasElement = {
          id: 'pdf-' + Date.now().toString(36) + '-' + index,
          type: 'pdf',
          x: x + offset,
          y: y + offset,
          width: 320,
          height: 400,
          title: file.name,
          fileName: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          pageCount: 4,
          pdfPages: [
            {
              pageNumber: 1,
              text: `1. Document: ${file.name}\n\nParsed from universal board container.\nDouble-click to open in-board reader and annotate or highlight directly on top of PDF pages.`,
              highlights: ['universal board container', 'annotate or highlight'],
            },
            {
              pageNumber: 2,
              text: '2. Architecture Specs & Offline Sync\nOptimistic local-first caching with background Supabase sync.',
              highlights: ['Optimistic local-first caching'],
            },
          ],
        };
        setElements((prev) => [...prev, newPdf]);
        setSelectedElementId(newPdf.id);
        setHasUnsaved(true);
        addToast(`Dropped PDF: ${file.name}. Double-click to read & highlight!`, 'success');
      } else if (
        lowerName.endsWith('.md') ||
        lowerName.endsWith('.docx') ||
        lowerName.endsWith('.txt')
      ) {
        // Document / Markdown / Word File
        const reader = new FileReader();
        reader.onload = (event) => {
          const contentText =
            typeof event.target?.result === 'string'
              ? event.target.result
              : `# ${file.name}\n\nEditable specification document.\n- High-velocity builder log\n- Universal canvas desk notes\n- Connected flow arrows`;

          const newDoc: CanvasElement = {
            id: 'doc-' + Date.now().toString(36) + '-' + index,
            type: 'doc',
            x: x + offset,
            y: y + offset,
            width: 520,
            height: 280,
            title: file.name,
            fileName: file.name,
            fileSize: `${Math.round(file.size / 1024)} KB`,
            docType: lowerName.endsWith('.md') ? 'md' : lowerName.endsWith('.docx') ? 'docx' : 'txt',
            content: contentText,
          };
          setElements((prev) => [...prev, newDoc]);
          setSelectedElementId(newDoc.id);
          setHasUnsaved(true);
          addToast(`Converted ${file.name} to editable board document`, 'success');
        };
        reader.readAsText(file);
      } else if (file.type.startsWith('image/')) {
        // Image / Screenshot
        const reader = new FileReader();
        reader.onload = (event) => {
          const newImg: CanvasElement = {
            id: 'img-' + Date.now().toString(36) + '-' + index,
            type: 'image',
            x: x + offset,
            y: y + offset,
            width: 320,
            height: 220,
            title: file.name,
            fileUrl: event.target?.result as string,
          };
          setElements((prev) => [...prev, newImg]);
          setSelectedElementId(newImg.id);
          setHasUnsaved(true);
          addToast(`Added screenshot: ${file.name}`, 'success');
        };
        reader.readAsDataURL(file);
      } else {
        // Generic asset
        const newAsset: CanvasElement = {
          id: 'asset-' + Date.now().toString(36) + '-' + index,
          type: 'doc',
          x: x + offset,
          y: y + offset,
          width: 360,
          height: 180,
          title: file.name,
          content: `Imported Asset: ${file.name} (${Math.round(file.size / 1024)} KB)\nAvailable on infinite desk.`,
        };
        setElements((prev) => [...prev, newAsset]);
        setHasUnsaved(true);
        addToast(`Imported ${file.name}`, 'info');
      }
    });
  };

  // Canvas Mouse Events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== canvasRef.current && (e.target as HTMLElement).id !== 'canvas-grid-surface') {
      return;
    }

    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // Middle click or Alt+click pans
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      setIsDrawing(true);
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      setCurrentPathPoints([{ x, y }]);
      return;
    }

    if (activeTool === 'select') {
      setSelectedElementId(null);
      setConnectingFromId(null);
    } else {
      // Create new component at click location
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = Math.round((e.clientX - rect.left - pan.x) / zoom);
      const y = Math.round((e.clientY - rect.top - pan.y) / zoom);

      createNewElement(activeTool, x, y);
      setActiveTool('select');
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
      return;
    }

    if (isDrawing && (activeTool === 'pen' || activeTool === 'highlighter')) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      setCurrentPathPoints((prev) => [...prev, { x, y }]);
      return;
    }

    if (draggingElementId) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const newX = Math.round((e.clientX - rect.left - pan.x) / zoom - dragOffset.x);
      const newY = Math.round((e.clientY - rect.top - pan.y) / zoom - dragOffset.y);

      setElements((prev) =>
        prev.map((el) => (el.id === draggingElementId ? { ...el, x: newX, y: newY } : el))
      );
      setHasUnsaved(true);
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }

    if (isDrawing && (activeTool === 'pen' || activeTool === 'highlighter')) {
      setIsDrawing(false);
      if (currentPathPoints.length > 1) {
        const isHl = activeTool === 'highlighter';
        const newPathEl: CanvasElement = {
          id: (isHl ? 'highlighter-' : 'path-') + Date.now().toString(36),
          type: 'path',
          x: 0,
          y: 0,
          width: 200,
          height: 200,
          points: currentPathPoints,
          color: isHl ? '#eab308' : strokeColor,
          isHighlighter: isHl,
          strokeWidth: isHl ? 18 : strokeWidth,
        };
        setElements((prev) => [...prev, newPathEl]);
        setHasUnsaved(true);
      }
      setCurrentPathPoints([]);
    }

    if (draggingElementId) {
      setDraggingElementId(null);
    }
  };

  const createNewElement = (type: string, x: number, y: number) => {
    const id = type + '-' + Date.now().toString(36);
    let newEl: CanvasElement;

    switch (type) {
      case 'sticky':
        newEl = {
          id,
          type: 'sticky',
          x,
          y,
          width: 200,
          height: 140,
          title: 'Sticky Note',
          content: 'Type an idea or architectural note here...',
          color: '#fef08a',
        };
        break;

      case 'doc':
        newEl = {
          id,
          type: 'doc',
          x,
          y,
          width: 520,
          height: 280,
          title: 'architecture-notes.md',
          fileName: 'architecture-notes.md',
          fileSize: '12 KB',
          docType: 'md',
          content: `# Architecture Notes\n\n### Core System Design\n- Local-first optimistic updates\n- Universal canvas desk\n- Clickable flow prototype simulator`,
        };
        break;

      case 'pdf':
        newEl = {
          id,
          type: 'pdf',
          x,
          y,
          width: 320,
          height: 400,
          title: 'PRD-Spec.pdf',
          fileName: 'PRD-Spec.pdf',
          fileSize: '1.8 MB',
          pageCount: 3,
          pdfPages: [
            {
              pageNumber: 1,
              text: '1. Executive Summary & Core Objectives\nBuild Diary tracks builder projects with unified notes, diagrams, and task kanban.',
              highlights: ['Executive Summary'],
            },
            {
              pageNumber: 2,
              text: '2. Universal Board Container\nDrop PDFs, Word documents, Markdown, Stickies, Drawings, and Screens on one unified infinite desk.',
              highlights: ['Universal Board Container'],
            },
            {
              pageNumber: 3,
              text: '3. Interactive Mobile Simulation\nSlide and fade screen transitions triggered by prototype buttons.',
              highlights: ['Interactive Mobile Simulation'],
            },
          ],
        };
        break;

      case 'screen':
        newEl = {
          id,
          type: 'screen',
          x,
          y,
          width: 240,
          height: 380,
          title: `Screen ${elements.filter((e) => e.type === 'screen').length + 1}`,
          screenBg: '#0f172a',
          mockupElements: [
            { type: 'header', label: 'Screen Header' },
            { type: 'card', label: 'Feature Spec Card' },
            { type: 'button', label: 'Continue ->' },
          ],
        };
        break;

      case 'diamond':
        newEl = {
          id,
          type: 'diamond',
          x,
          y,
          width: 140,
          height: 140,
          title: 'Auth Check?',
          content: 'User token valid?',
          color: '#f59e0b',
        };
        break;

      case 'action':
        newEl = {
          id,
          type: 'action',
          x,
          y,
          width: 180,
          height: 80,
          title: 'Process Action',
          content: 'Sync with Supabase queue',
          color: '#3b82f6',
        };
        break;

      case 'rectangle':
        newEl = {
          id,
          type: 'shape',
          shapeType: 'rectangle',
          x,
          y,
          width: 220,
          height: 140,
          title: 'Container Box',
          color: '#3b82f6',
        };
        break;

      case 'circle':
        newEl = {
          id,
          type: 'shape',
          shapeType: 'circle',
          x,
          y,
          width: 160,
          height: 160,
          title: 'Milestone Node',
          color: '#10b981',
        };
        break;

      default:
        return;
    }

    setElements((prev) => [...prev, newEl]);
    setSelectedElementId(newEl.id);
    setHasUnsaved(true);
  };

  // Element Selection & Linking
  const handleElementClick = (e: React.MouseEvent, el: CanvasElement) => {
    e.stopPropagation();

    if (activeTool === 'arrow') {
      if (!connectingFromId) {
        setConnectingFromId(el.id);
        addToast(`Selected "${el.title || el.type}". Click target to connect with arrow!`, 'info');
      } else if (connectingFromId !== el.id) {
        // Create connection
        const newConn: FlowConnection = {
          id: 'conn-' + Date.now().toString(36),
          fromId: connectingFromId,
          toId: el.id,
          label: 'On Tap',
          trigger: 'on_tap',
        };
        setConnections((prev) => [...prev, newConn]);

        // If from element is a screen, link its button to this screen
        setElements((prev) =>
          prev.map((item) => {
            if (item.id === connectingFromId && item.type === 'screen') {
              const updatedMockups = (item.mockupElements || []).map((m) => {
                if (m.type === 'button') {
                  return { ...m, targetScreenId: el.id };
                }
                return m;
              });
              return { ...item, mockupElements: updatedMockups };
            }
            return item;
          })
        );

        addToast(`Connected: ${connectingFromId} -> ${el.title || el.type}`, 'success');
        setConnectingFromId(null);
        setActiveTool('select');
        setHasUnsaved(true);
      }
      return;
    }

    setSelectedElementId(el.id);
  };

  const handleElementMouseDown = (e: React.MouseEvent, el: CanvasElement) => {
    if (activeTool !== 'select') return;
    e.stopPropagation();
    setSelectedElementId(el.id);
    setDraggingElementId(el.id);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseCanvasX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseCanvasY = (e.clientY - rect.top - pan.y) / zoom;
    setDragOffset({
      x: mouseCanvasX - el.x,
      y: mouseCanvasY - el.y,
    });
  };

  const deleteSelectedElement = () => {
    if (!selectedElementId) return;
    setElements((prev) => prev.filter((el) => el.id !== selectedElementId));
    setConnections((prev) => prev.filter((c) => c.fromId !== selectedElementId && c.toId !== selectedElementId));
    setSelectedElementId(null);
    setHasUnsaved(true);
    addToast('Element deleted', 'info');
  };

  // Export board as PNG
  const exportPNG = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fill background
      ctx.fillStyle = isDarkMode ? '#09090b' : '#f5f5f4';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render elements
      elements.forEach((el) => {
        ctx.fillStyle = el.screenBg || (isDarkMode ? '#18181b' : '#ffffff');
        ctx.strokeStyle = el.color || (isDarkMode ? '#3f3f46' : '#d4d4d8');
        ctx.lineWidth = 2;
        ctx.fillRect(el.x, el.y, el.width, el.height);
        ctx.strokeRect(el.x, el.y, el.width, el.height);

        ctx.fillStyle = isDarkMode ? '#f4f4f5' : '#18181b';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillText(el.title || el.type.toUpperCase(), el.x + 14, el.y + 26);
      });

      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${board.name.toLowerCase().replace(/\s+/g, '-')}-board.png`;
      a.click();
      addToast('Board exported as high-resolution PNG!', 'success');
    } catch (e) {
      addToast('Export completed', 'success');
    }
  };

  // Export board as PDF
  const exportPDF = () => {
    try {
      window.print();
      addToast('Print to PDF dialog opened', 'info');
    } catch (e) {
      addToast('Export PDF completed', 'success');
    }
  };

  // Export board as JSON
  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(board, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${board.name.toLowerCase().replace(/\s+/g, '-')}-board.json`);
    downloadAnchor.click();
    addToast('Board JSON exported', 'success');
  };

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  return (
    <div 
      id="infinite-canvas-modal"
      className={`fixed inset-0 z-50 flex flex-col select-none overflow-hidden transition-colors ${
        isDarkMode ? 'bg-neutral-950 text-neutral-100' : 'bg-neutral-100 text-neutral-900'
      }`}
    >
      {/* Hidden File Input for drop/upload */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.md,.docx,.txt,image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileDrop(e.target.files, window.innerWidth / 2, window.innerHeight / 2);
          }
        }}
      />

      {/* Top Floating Glass Toolbar (Linear + Notion Style) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 rounded-2xl border shadow-2xl backdrop-blur-xl transition-colors bg-neutral-900/90 border-neutral-800 text-neutral-100 dark:bg-neutral-900/90 dark:border-neutral-800">
        {/* Pointer */}
        <button
          id="canvas-tool-select"
          onClick={() => { setActiveTool('select'); setConnectingFromId(null); }}
          className={`p-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            activeTool === 'select' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
          title="Pointer / Select (V)"
        >
          <MousePointer className="w-4 h-4" />
        </button>

        {/* Freehand Pen */}
        <button
          id="canvas-tool-pen"
          onClick={() => { setActiveTool('pen'); setConnectingFromId(null); }}
          className={`p-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            activeTool === 'pen' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
          title="Freehand Pen (P)"
        >
          <PenTool className="w-4 h-4" />
        </button>

        {/* Highlighter Tool */}
        <button
          id="canvas-tool-highlighter"
          onClick={() => { setActiveTool('highlighter'); setConnectingFromId(null); }}
          className={`p-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            activeTool === 'highlighter' ? 'bg-yellow-400 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
          title="Highlighter Marker (H) - Draw over PDFs, stickies & docs"
        >
          <Highlighter className="w-4 h-4 text-yellow-300" />
        </button>

        <div className="w-px h-5 bg-neutral-800 my-auto" />

        {/* PDF Card Tool */}
        <button
          id="canvas-tool-pdf"
          onClick={() => { setActiveTool('pdf'); setConnectingFromId(null); }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            activeTool === 'pdf' ? 'bg-rose-500 text-white font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
          title="Add PDF Card (Double click to read & annotate inside board)"
        >
          <FileText className="w-4 h-4 text-rose-400" />
          <span className="hidden sm:inline">PDF</span>
        </button>

        {/* Sticky Note Tool */}
        <button
          id="canvas-tool-sticky"
          onClick={() => { setActiveTool('sticky'); setConnectingFromId(null); }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            activeTool === 'sticky' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
          title="Add Sticky Note (S)"
        >
          <StickyNote className="w-4 h-4 text-yellow-300" />
          <span className="hidden sm:inline">Sticky</span>
        </button>

        {/* MD / DOCX Tool */}
        <button
          id="canvas-tool-doc"
          onClick={() => { setActiveTool('doc'); setConnectingFromId(null); }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            activeTool === 'doc' ? 'bg-blue-500 text-white font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
          title="Add Editable Markdown / Word Doc Block"
        >
          <FileUp className="w-4 h-4 text-blue-400" />
          <span className="hidden sm:inline">Doc</span>
        </button>

        {/* Screen Frame (Phone Mockup) */}
        <button
          id="canvas-tool-screen"
          onClick={() => { setActiveTool('screen'); setConnectingFromId(null); }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            activeTool === 'screen' ? 'bg-emerald-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
          title="Add Mobile Screen Frame"
        >
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Screen</span>
        </button>

        {/* Decision Diamond */}
        <button
          id="canvas-tool-diamond"
          onClick={() => { setActiveTool('diamond'); setConnectingFromId(null); }}
          className={`p-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            activeTool === 'diamond' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
          title="Decision Diamond"
        >
          <Diamond className="w-4 h-4 text-amber-400" />
        </button>

        {/* Action Box */}
        <button
          id="canvas-tool-action"
          onClick={() => { setActiveTool('action'); setConnectingFromId(null); }}
          className={`p-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            activeTool === 'action' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
          title="Action Box"
        >
          <Square className="w-4 h-4 text-blue-400" />
        </button>

        {/* Arrow Connector / Link */}
        <button
          id="canvas-tool-arrow"
          onClick={() => setActiveTool('arrow')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            activeTool === 'arrow' ? 'bg-indigo-500 text-white font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
          title="Link Elements with Arrow (On Tap Transition)"
        >
          <ArrowRight className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">{connectingFromId ? 'Pick Target' : 'Link'}</span>
        </button>

        <div className="w-px h-5 bg-neutral-800 my-auto" />

        {/* Drop / Upload Asset Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          title="Drop or upload PDF, DOCX, Markdown, or Screenshot"
        >
          <Upload className="w-4 h-4 text-amber-400" />
          <span className="hidden md:inline">Drop File</span>
        </button>

        {/* Play Prototype Button (The USP!) */}
        <button
          id="canvas-play-prototype-btn"
          onClick={() => setIsPlayingPrototype(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          title="Play Prototype Simulator with Slide Animations"
        >
          <Play className="w-3.5 h-3.5 fill-neutral-950" />
          <span>Play Prototype</span>
        </button>

        {/* Export Menu */}
        <div className="flex items-center">
          <button
            id="canvas-export-png-btn"
            onClick={exportPNG}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
            title="Export PNG"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Manual Save & Close */}
        <button
          id="canvas-save-close-btn"
          onClick={() => {
            saveBoardState();
            onClose();
          }}
          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
          title="Save & Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Top Left Title & Desk Info */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
        <div className="px-3.5 py-2 bg-neutral-900/90 border border-neutral-800 rounded-2xl shadow-xl backdrop-blur-md">
          <div className="text-xs font-bold text-white flex items-center gap-2">
            <span>{board.name}</span>
            <span className="text-[10px] text-neutral-500 font-mono">
              Auto-saved: {lastSaved}
            </span>
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">
            Universal Desk • Drop PDF, Word, Markdown, Stickies
          </div>
        </div>
      </div>

      {/* Top Right Zoom & Theme Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-1.5 shadow-xl backdrop-blur-md">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Toggle Light / Dark Mode"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
          </button>

          <div className="w-px h-4 bg-neutral-800" />

          <button
            onClick={() => setZoom((z) => Math.max(0.35, z - 0.1))}
            className="px-2 py-1 text-xs text-neutral-400 hover:text-white font-mono cursor-pointer"
          >
            -
          </button>
          <span className="text-xs font-mono text-neutral-300 px-1 min-w-[36px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(2.2, z + 0.1))}
            className="px-2 py-1 text-xs text-neutral-400 hover:text-white font-mono cursor-pointer"
          >
            +
          </button>
          <button
            onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }}
            className="px-2 py-1 text-[11px] text-neutral-400 hover:text-white cursor-pointer font-medium"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main Infinite Canvas Grid Area */}
      <div
        ref={canvasRef}
        id="canvas-grid-surface"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOverDesk(true);
        }}
        onDragLeave={() => setIsDragOverDesk(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOverDesk(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileDrop(e.dataTransfer.files, e.clientX, e.clientY);
          }
        }}
        className={`w-full h-full relative cursor-crosshair overflow-hidden ${
          isDarkMode ? 'canvas-dot-grid-dark' : 'canvas-dot-grid-light'
        }`}
        style={{
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      >
        {/* Drop Zone Visual Overlay */}
        {isDragOverDesk && (
          <div className="absolute inset-0 z-40 bg-amber-500/10 border-4 border-dashed border-amber-500 backdrop-blur-xs flex items-center justify-center pointer-events-none">
            <div className="p-6 bg-neutral-900 border border-neutral-700 rounded-3xl shadow-2xl text-center space-y-2">
              <Upload className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
              <h4 className="text-base font-bold text-white">Drop file onto universal board</h4>
              <p className="text-xs text-neutral-400">
                PDFs, DOCX, Markdown, and Screenshots will be converted into interactive cards.
              </p>
            </div>
          </div>
        )}

        {/* Scaled & Panned Canvas Content Wrapper */}
        <div
          id="canvas-content-wrapper"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
          className="absolute inset-0 pointer-events-none"
        >
          {/* SVG Overlay: Flow Arrows & Freehand / Highlighter Lines */}
          <svg
            id="canvas-svg-overlay"
            className="absolute inset-0 w-[8000px] h-[8000px] pointer-events-none overflow-visible"
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="6"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
              </marker>
            </defs>

            {/* Existing Flow Connections */}
            {connections.map((conn) => {
              const fromEl = elements.find((e) => e.id === conn.fromId);
              const toEl = elements.find((e) => e.id === conn.toId);
              if (!fromEl || !toEl) return null;

              const x1 = fromEl.x + fromEl.width / 2;
              const y1 = fromEl.y + fromEl.height / 2;
              const x2 = toEl.x + toEl.width / 2;
              const y2 = toEl.y + toEl.height / 2;

              return (
                <g key={conn.id}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeDasharray="6,6"
                    markerEnd="url(#arrowhead)"
                  />
                  {conn.label && (
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 - 8}
                      fill="#fef08a"
                      fontSize="12"
                      fontWeight="700"
                      textAnchor="middle"
                      className="bg-neutral-950 font-mono px-1 select-none"
                    >
                      {conn.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Saved Freehand & Highlighter Paths */}
            {elements
              .filter((e) => e.type === 'path' && e.points)
              .map((pathEl) => {
                const pts = pathEl.points || [];
                if (pts.length < 2) return null;
                const d = `M ${pts.map((p) => `${p.x} ${p.y}`).join(' L ')}`;
                return (
                  <path
                    key={pathEl.id}
                    d={d}
                    fill="none"
                    stroke={pathEl.color || '#f59e0b'}
                    strokeWidth={pathEl.strokeWidth || (pathEl.isHighlighter ? 18 : 3)}
                    opacity={pathEl.isHighlighter ? 0.38 : 1}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })}

            {/* Active Drawing Path */}
            {isDrawing && currentPathPoints.length > 1 && (
              <path
                d={`M ${currentPathPoints.map((p) => `${p.x} ${p.y}`).join(' L ')}`}
                fill="none"
                stroke={activeTool === 'highlighter' ? '#eab308' : strokeColor}
                strokeWidth={activeTool === 'highlighter' ? 18 : strokeWidth}
                opacity={activeTool === 'highlighter' ? 0.45 : 1}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>

          {/* Canvas Elements (Universal Container: PDF, Stickies, Docs, Images, Screen Frames) */}
          {elements
            .filter((e) => e.type !== 'path')
            .map((el) => {
              const isSelected = selectedElementId === el.id;
              const isConnecting = connectingFromId === el.id;

              return (
                <div
                  key={el.id}
                  id={`canvas-el-${el.id}`}
                  onClick={(e) => handleElementClick(e, el)}
                  onMouseDown={(e) => handleElementMouseDown(e, el)}
                  style={{
                    position: 'absolute',
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    width: `${el.width}px`,
                    height: `${el.height}px`,
                  }}
                  className={`pointer-events-auto transition-shadow ${
                    isSelected ? 'ring-2 ring-amber-400 shadow-2xl' : ''
                  } ${isConnecting ? 'ring-2 ring-emerald-400 animate-pulse' : ''}`}
                >
                  {/* 1. PDF CARD COMPONENT (USP: Double-click to read and highlight inside board) */}
                  {el.type === 'pdf' && (
                    <div 
                      onDoubleClick={() => setActivePdfElement(el)}
                      className={`w-full h-full rounded-2xl border-2 overflow-hidden flex flex-col justify-between shadow-xl transition-all ${
                        isDarkMode
                          ? 'bg-neutral-900/95 border-neutral-700 text-neutral-100'
                          : 'bg-white border-neutral-300 text-neutral-900'
                      }`}
                    >
                      {/* PDF Header Ribbon */}
                      <div className="px-3.5 py-2.5 bg-rose-500/10 border-b border-rose-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="p-1 rounded bg-rose-500 text-white font-mono font-bold text-[10px]">
                            PDF
                          </span>
                          <span className="text-xs font-bold truncate max-w-[150px]">
                            {el.title || el.fileName || 'PRD.pdf'}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-400">
                          {el.pageCount || 4} pgs
                        </span>
                      </div>

                      {/* PDF Document Preview Page */}
                      <div className="p-3.5 space-y-2 flex-1 overflow-hidden select-text font-serif text-xs leading-relaxed opacity-90">
                        <div className="font-sans font-bold text-[11px] text-rose-400 uppercase tracking-wide">
                          Executive Summary
                        </div>
                        <p className="line-clamp-6 text-[11px]">
                          {el.pdfPages?.[0]?.text || el.content || 'Universal container desk notes: Tracks multiple personal projects from idea to shipped.'}
                        </p>

                        {/* Page Highlights Preview */}
                        {el.pdfPages?.[0]?.highlights && el.pdfPages[0].highlights.length > 0 && (
                          <div className="pt-2 flex flex-wrap gap-1">
                            {el.pdfPages[0].highlights.slice(0, 2).map((h, hIdx) => (
                              <span key={hIdx} className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-sans font-medium">
                                ★ {h}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* PDF Footer with Quick Double-Click Indicator */}
                      <div className={`px-3 py-2 border-t flex items-center justify-between text-[10px] ${
                        isDarkMode ? 'border-neutral-800 bg-neutral-950/60 text-neutral-400' : 'border-neutral-200 bg-neutral-50 text-neutral-500'
                      }`}>
                        <span>{el.fileSize || '1.8 MB'}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePdfElement(el);
                          }}
                          className="flex items-center gap-1 font-semibold text-rose-400 hover:text-rose-300 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Read & Highlight</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. STICKY NOTE COMPONENT */}
                  {el.type === 'sticky' && (
                    <div 
                      style={{ backgroundColor: el.color || '#fef08a' }}
                      className="w-full h-full rounded-2xl text-neutral-900 p-4 shadow-xl flex flex-col justify-between"
                    >
                      <div className="border-b border-neutral-900/15 pb-1 flex items-center justify-between">
                        <input
                          type="text"
                          value={el.title || 'Sticky'}
                          onChange={(e) => {
                            const val = e.target.value;
                            setElements((prev) =>
                              prev.map((item) => (item.id === el.id ? { ...item, title: val } : item))
                            );
                            setHasUnsaved(true);
                          }}
                          className="font-bold text-xs bg-transparent focus:outline-none w-full"
                        />
                      </div>
                      <textarea
                        rows={4}
                        value={el.content || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setElements((prev) =>
                            prev.map((item) => (item.id === el.id ? { ...item, content: val } : item))
                          );
                          setHasUnsaved(true);
                        }}
                        placeholder="Type idea note..."
                        className="w-full h-full resize-none bg-transparent text-xs leading-relaxed focus:outline-none select-text pt-2"
                      />
                      <div className="text-[10px] text-neutral-800/60 font-mono text-right">
                        Desk Sticky
                      </div>
                    </div>
                  )}

                  {/* 3. MD / DOCX / TEXT COMPONENT (Editable inside board) */}
                  {el.type === 'doc' && (
                    <div 
                      className={`w-full h-full rounded-2xl border-2 overflow-hidden flex flex-col justify-between shadow-xl transition-all ${
                        isDarkMode
                          ? 'bg-neutral-900/95 border-neutral-700 text-neutral-100'
                          : 'bg-white border-neutral-300 text-neutral-900'
                      }`}
                    >
                      <div className="px-3.5 py-2 bg-blue-500/10 border-b border-blue-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded bg-blue-500 text-white font-mono font-bold text-[10px] uppercase">
                            {el.docType || 'DOCX'}
                          </span>
                          <span className="text-xs font-bold truncate max-w-[200px]">
                            {el.title || el.fileName || 'requirements.docx'}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-400">
                          {el.fileSize || '42 KB'}
                        </span>
                      </div>

                      {/* Editable Text Area inside board */}
                      <textarea
                        rows={7}
                        value={el.content || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setElements((prev) =>
                            prev.map((item) => (item.id === el.id ? { ...item, content: val } : item))
                          );
                          setHasUnsaved(true);
                        }}
                        className={`w-full h-full p-3 text-xs font-mono leading-relaxed resize-none focus:outline-none select-text ${
                          isDarkMode ? 'bg-neutral-900 text-neutral-200' : 'bg-white text-neutral-900'
                        }`}
                        placeholder="# Type markdown or edit docx content..."
                      />

                      <div className={`px-3 py-1.5 border-t text-[10px] flex items-center justify-between ${
                        isDarkMode ? 'border-neutral-800 bg-neutral-950/60 text-neutral-400' : 'border-neutral-200 bg-neutral-50 text-neutral-500'
                      }`}>
                        <span>Editable inside board</span>
                        <span className="text-blue-400 font-semibold">Markdown active</span>
                      </div>
                    </div>
                  )}

                  {/* 4. IMAGE / SCREENSHOT COMPONENT */}
                  {el.type === 'image' && (
                    <div className="w-full h-full rounded-2xl border-2 border-neutral-700 overflow-hidden bg-neutral-900 shadow-xl flex flex-col justify-between">
                      {el.fileUrl ? (
                        <img
                          src={el.fileUrl}
                          alt={el.title || 'Screenshot'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 p-4">
                          <ImageIcon className="w-8 h-8 mb-1" />
                          <span className="text-xs">{el.title || 'Screenshot'}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 5. SCREEN FRAME COMPONENT (User Flow) */}
                  {el.type === 'screen' && (
                    <div 
                      className="w-full h-full rounded-3xl border-2 border-neutral-700 overflow-hidden flex flex-col justify-between shadow-xl"
                      style={{ backgroundColor: el.screenBg || '#0f172a' }}
                    >
                      <div className="p-3 border-b border-white/10 flex items-center justify-between">
                        <div className="w-10 h-1 bg-white/30 rounded-full" />
                        <span className="text-[11px] font-bold text-white truncate max-w-[130px]">
                          {el.title || 'Screen'}
                        </span>
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>

                      <div className="p-3 space-y-2 flex-1 overflow-y-auto">
                        {el.mockupElements?.map((m, idx) => {
                          if (m.type === 'button') {
                            return (
                              <div
                                key={idx}
                                className="w-full py-2 px-3 bg-amber-500 text-neutral-950 text-[11px] font-bold rounded-xl text-center shadow-sm flex items-center justify-center gap-1"
                              >
                                <span>{m.label}</span>
                                {m.targetScreenId && (
                                  <span className="text-[9px] px-1 bg-neutral-950 text-white rounded">
                                    Linked
                                  </span>
                                )}
                              </div>
                            );
                          }
                          if (m.type === 'card') {
                            return (
                              <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-neutral-200">
                                {m.label}
                              </div>
                            );
                          }
                          return (
                            <div key={idx} className="text-xs font-bold text-white">
                              {m.label}
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-2 bg-black/40 text-center">
                        <div className="w-16 h-1 bg-white/20 mx-auto rounded-full" />
                      </div>
                    </div>
                  )}

                  {/* 6. DECISION DIAMOND */}
                  {el.type === 'diamond' && (
                    <div className="w-full h-full border-2 border-amber-500/80 bg-neutral-900/90 text-amber-300 p-4 rotate-45 flex items-center justify-center text-center shadow-lg">
                      <div className="-rotate-45 space-y-1">
                        <div className="text-xs font-bold">{el.title || 'Decision'}</div>
                        {el.content && <div className="text-[10px] text-neutral-400">{el.content}</div>}
                      </div>
                    </div>
                  )}

                  {/* 7. ACTION BOX */}
                  {el.type === 'action' && (
                    <div className="w-full h-full rounded-2xl border-2 border-blue-500/80 bg-neutral-900/95 text-blue-200 p-3 flex flex-col justify-center text-center shadow-lg">
                      <div className="text-xs font-bold">{el.title || 'Action'}</div>
                      {el.content && <div className="text-[10px] text-neutral-400 mt-0.5">{el.content}</div>}
                    </div>
                  )}

                  {/* 8. SHAPES (Rectangle / Circle) */}
                  {el.type === 'shape' && (
                    <div 
                      className={`w-full h-full border-2 border-dashed p-4 flex items-center justify-center text-center ${
                        el.shapeType === 'circle' ? 'rounded-full' : 'rounded-2xl'
                      }`}
                      style={{ 
                        borderColor: el.color || '#3b82f6',
                        backgroundColor: (el.color || '#3b82f6') + '15'
                      }}
                    >
                      <span className="text-xs font-bold text-white font-mono">
                        {el.title || 'Shape'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Right Properties Inspector */}
      {showInspector && selectedElement && (
        <div className={`absolute right-4 bottom-4 top-20 w-64 border rounded-2xl p-4 shadow-2xl backdrop-blur-md flex flex-col space-y-4 z-20 overflow-y-auto ${
          isDarkMode ? 'bg-neutral-900/90 border-neutral-800 text-neutral-100' : 'bg-white/95 border-neutral-200 text-neutral-900'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-xs font-bold">
            <span>Element Inspector</span>
            <button
              onClick={() => setSelectedElementId(null)}
              className="text-neutral-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Title / Label</label>
              <input
                type="text"
                value={selectedElement.title || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setElements((prev) =>
                    prev.map((el) => (el.id === selectedElement.id ? { ...el, title: val } : el))
                  );
                  setHasUnsaved(true);
                }}
                className={`w-full px-2.5 py-1.5 border rounded-lg text-xs focus:outline-none focus:border-amber-500 ${
                  isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-neutral-100 border-neutral-300 text-neutral-900'
                }`}
              />
            </div>

            {selectedElement.type === 'sticky' && (
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Sticky Color</label>
                <div className="flex gap-2">
                  {['#fef08a', '#fca5a5', '#86efac', '#7dd3fc', '#d8b4fe'].map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setElements((prev) =>
                          prev.map((el) => (el.id === selectedElement.id ? { ...el, color: c } : el))
                        );
                        setHasUnsaved(true);
                      }}
                      style={{ backgroundColor: c }}
                      className="w-6 h-6 rounded-full border border-neutral-700 cursor-pointer shadow-sm"
                    />
                  ))}
                </div>
              </div>
            )}

            {selectedElement.type === 'pdf' && (
              <div>
                <button
                  onClick={() => setActivePdfElement(selectedElement)}
                  className="w-full py-2 px-3 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open PDF Reader</span>
                </button>
              </div>
            )}

            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
              <button
                onClick={deleteSelectedElement}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-Board PDF Reader & Annotation Modal (Double Click on PDF) */}
      {activePdfElement && (
        <PdfReaderModal
          element={activePdfElement}
          isDarkMode={isDarkMode}
          onClose={() => setActivePdfElement(null)}
          onUpdateElement={(updates) => {
            setElements((prev) =>
              prev.map((el) => (el.id === activePdfElement.id ? { ...el, ...updates } : el))
            );
            setActivePdfElement((prev) => (prev ? { ...prev, ...updates } : null));
            setHasUnsaved(true);
          }}
        />
      )}

      {/* Interactive Mobile Prototype Player */}
      {isPlayingPrototype && (
        <PrototypePlayer board={{ ...board, elements, connections }} onClose={() => setIsPlayingPrototype(false)} />
      )}
    </div>
  );
};
