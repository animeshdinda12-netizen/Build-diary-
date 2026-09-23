import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, FolderPlus, CheckSquare, Layout, 
  Calendar, Layers, FileText, BarChart3, Settings, 
  ArrowRight, Sparkles 
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  category: string;
  description?: string;
  icon: React.ReactNode;
  run: () => void;
}

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    projects,
    tasks,
    setSelectedProjectId,
    setCurrentView,
    openCreateProjectModal,
    openCreateTaskModal,
    openBoardModal,
    boards,
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  // Filter actions, projects, boards, tasks
  const quickActions: CommandItem[] = [
    {
      id: 'act-new-proj',
      label: 'Create New Project',
      category: 'Actions',
      icon: <FolderPlus className="w-4 h-4 text-amber-400" />,
      run: () => {
        setCommandPaletteOpen(false);
        openCreateProjectModal();
      },
    },
    {
      id: 'act-new-task',
      label: 'Quick Add Task',
      category: 'Actions',
      icon: <CheckSquare className="w-4 h-4 text-emerald-400" />,
      run: () => {
        setCommandPaletteOpen(false);
        openCreateTaskModal();
      },
    },
    {
      id: 'nav-dashboard',
      label: 'Go to Dashboard',
      category: 'Navigation',
      icon: <Layout className="w-4 h-4 text-blue-400" />,
      run: () => {
        setCommandPaletteOpen(false);
        setSelectedProjectId(null);
        setCurrentView('dashboard');
      },
    },
    {
      id: 'nav-boards',
      label: 'Go to Visual Boards',
      category: 'Navigation',
      icon: <Layers className="w-4 h-4 text-purple-400" />,
      run: () => {
        setCommandPaletteOpen(false);
        setCurrentView('all-boards');
      },
    },
    {
      id: 'nav-review',
      label: 'Open Weekly Review',
      category: 'Navigation',
      icon: <Calendar className="w-4 h-4 text-rose-400" />,
      run: () => {
        setCommandPaletteOpen(false);
        setCurrentView('weekly-review');
      },
    },
    {
      id: 'nav-analytics',
      label: 'Open Analytics & Velocity',
      category: 'Navigation',
      icon: <BarChart3 className="w-4 h-4 text-cyan-400" />,
      run: () => {
        setCommandPaletteOpen(false);
        setCurrentView('analytics');
      },
    },
    {
      id: 'nav-files',
      label: 'Open Files & Links',
      category: 'Navigation',
      icon: <FileText className="w-4 h-4 text-indigo-400" />,
      run: () => {
        setCommandPaletteOpen(false);
        setCurrentView('files');
      },
    },
    {
      id: 'nav-settings',
      label: 'Open Settings',
      category: 'Navigation',
      icon: <Settings className="w-4 h-4 text-neutral-400" />,
      run: () => {
        setCommandPaletteOpen(false);
        setCurrentView('settings');
      },
    },
  ];

  const projectItems = projects.map((p) => ({
    id: `proj-${p.id}`,
    label: p.name,
    category: 'Projects',
    description: `${p.category} • ${p.status} • Priority ${p.priority}`,
    icon: <Sparkles className="w-4 h-4 text-amber-500" />,
    run: () => {
      setCommandPaletteOpen(false);
      setSelectedProjectId(p.id);
      setCurrentView('project-detail');
    },
  }));

  const boardItems = boards.map((b) => ({
    id: `board-${b.id}`,
    label: b.name,
    category: 'Boards & User Flows',
    description: `Canvas board with ${b.elements.length} elements`,
    icon: <Layers className="w-4 h-4 text-teal-400" />,
    run: () => {
      setCommandPaletteOpen(false);
      setSelectedProjectId(b.projectId);
      setCurrentView('project-detail');
      openBoardModal(b);
    },
  }));

  const taskItems = tasks.slice(0, 10).map((t) => ({
    id: `task-${t.id}`,
    label: t.title,
    category: 'Tasks',
    description: `Status: ${t.status} • Due ${t.dueDate || 'none'}`,
    icon: <CheckSquare className="w-4 h-4 text-emerald-400" />,
    run: () => {
      setCommandPaletteOpen(false);
      setSelectedProjectId(t.projectId);
      setCurrentView('project-detail');
    },
  }));

  const allItems = [...quickActions, ...projectItems, ...boardItems, ...taskItems];

  const filteredItems = query.trim() === ''
    ? allItems.slice(0, 9)
    : allItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(query.toLowerCase())) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].run();
      }
    }
  };

  return (
    <div 
      id="command-palette-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div 
        id="command-palette-modal"
        className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-800 bg-neutral-900/90">
          <Search className="w-5 h-5 text-neutral-400" />
          <input
            ref={inputRef}
            id="command-palette-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, project name, or task..."
            className="w-full bg-transparent text-neutral-100 placeholder:text-neutral-500 text-sm focus:outline-none"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono text-neutral-400 bg-neutral-800 border border-neutral-700 rounded">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-neutral-800/40">
          {filteredItems.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-neutral-500">
              No results found for "{query}"
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  id={`command-item-${item.id}`}
                  onClick={() => item.run()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-neutral-800/90 text-white' : 'text-neutral-300 hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-lg bg-neutral-950/70 border border-neutral-800">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-neutral-400 truncate">{item.description}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-xs text-neutral-500 font-mono">
                    <span>{item.category}</span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between text-[11px] text-neutral-500">
          <span>Navigate with <kbd className="text-neutral-400 font-mono">↑</kbd> <kbd className="text-neutral-400 font-mono">↓</kbd></span>
          <span>Select <kbd className="text-neutral-400 font-mono">↵</kbd></span>
          <span>Close <kbd className="text-neutral-400 font-mono">Esc</kbd></span>
        </div>
      </div>
    </div>
  );
};
