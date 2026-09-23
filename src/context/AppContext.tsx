import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { 
  Project, Task, TimelineEntry, CanvasBoard, UserProfile, 
  AttachmentItem, ToastMessage, WeeklyReviewData,
  AppView, Workspace 
} from '../types';
import { 
  INITIAL_USER, INITIAL_PROJECTS, INITIAL_TASKS, 
  INITIAL_TIMELINE, INITIAL_BOARDS, INITIAL_ATTACHMENTS 
} from '../utils/seedData';

// Purge any legacy sample data or agent states from localStorage to ensure a 100% fresh app
if (typeof window !== 'undefined') {
  const isFreshV4 = localStorage.getItem('builddiary_fresh_clean_v4');
  if (!isFreshV4) {
    localStorage.removeItem('pt_projects');
    localStorage.removeItem('pt_tasks');
    localStorage.removeItem('pt_timeline');
    localStorage.removeItem('pt_boards');
    localStorage.removeItem('pt_attachments');
    localStorage.removeItem('pt_weekly_reviews');
    localStorage.removeItem('buildDiary_agent_sessions');
    localStorage.removeItem('buildDiary_agent_settings');
    localStorage.removeItem('pt_agent_endpoints');
    const rawUser = localStorage.getItem('pt_user');
    if (rawUser && (rawUser.includes('Aarav') || rawUser.includes('streakDays":4'))) {
      localStorage.removeItem('pt_user');
    }
    localStorage.setItem('builddiary_fresh_clean_v4', 'true');
  }
}

interface AppContextType {
  // Workspaces
  workspaces: Workspace[];
  activeWorkspaceId: string;
  setActiveWorkspaceId: (id: string) => void;
  createWorkspace: (name: string, description?: string, color?: string) => Workspace;
  switchWorkspace: (id: string) => void;
  deleteWorkspace: (id: string) => void;

  // User & Onboarding
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  resetApp: () => void;

  // Navigation & Views
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  projectTab: 'tasks' | 'workspace' | 'files' | 'analytics';
  setProjectTab: (tab: 'tasks' | 'workspace' | 'files' | 'analytics') => void;
  workspaceSubTab: 'timeline' | 'boards';
  setWorkspaceSubTab: (subTab: 'timeline' | 'boards') => void;
  
  // Theme
  isDarkMode: boolean;
  toggleTheme: () => void;

  // Projects CRUD
  projects: Project[];
  activeProject: Project | null;
  createProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'archived'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  archiveProject: (id: string) => void;

  // Tasks CRUD
  tasks: Task[];
  projectTasks: Task[];
  createTask: (data: Omit<Task, 'id' | 'createdAt' | 'timeSpentMinutes'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskDone: (id: string) => void;
  moveTaskStatus: (id: string, newStatus: Task['status']) => void;
  addTimeSpent: (id: string, minutes: number) => void;

  // Active Task Detail Sheet & Live Timer
  activeTaskForSheet: Task | null;
  setActiveTaskForSheet: (task: Task | null) => void;
  activeTimerTaskId: string | null;
  timerSeconds: number;
  startTaskTimer: (taskId: string) => void;
  stopTaskTimer: () => void;

  // Timeline / Notes
  timeline: TimelineEntry[];
  projectTimeline: TimelineEntry[];
  createTimelineEntry: (entry: Omit<TimelineEntry, 'id' | 'createdAt'>) => TimelineEntry;
  deleteTimelineEntry: (id: string) => void;
  togglePinTimelineEntry: (id: string) => void;

  // Boards & Canvas
  boards: CanvasBoard[];
  projectBoards: CanvasBoard[];
  activeBoard: CanvasBoard | null;
  openBoardModal: (board: CanvasBoard) => void;
  closeBoardModal: () => void;
  createBoard: (projectId: string, name: string, description?: string) => CanvasBoard;
  updateBoard: (id: string, updates: Partial<CanvasBoard>) => void;
  deleteBoard: (id: string) => void;

  // Attachments
  attachments: AttachmentItem[];
  projectAttachments: AttachmentItem[];
  addAttachment: (projectId: string, name: string, type: AttachmentItem['type'], url: string, size?: string) => void;
  deleteAttachment: (id: string) => void;

  // Weekly Review
  weeklyReviews: Record<string, WeeklyReviewData>;
  saveWeeklyReview: (data: WeeklyReviewData) => void;

  // Modals & Panels
  projectModalOpen: boolean;
  setProjectModalOpen: (open: boolean) => void;
  projectToEdit: Project | null;
  openCreateProjectModal: () => void;
  openEditProjectModal: (project: Project) => void;

  taskModalOpen: boolean;
  setTaskModalOpen: (open: boolean) => void;
  taskToEdit: Task | null;
  openCreateTaskModal: (projectId?: string) => void;
  openEditTaskModal: (task: Task) => void;

  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  confirmModal: {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  } | null;
  openConfirmModal: (config: {
    title: string;
    message: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }) => void;
  closeConfirmModal: () => void;

  // Toast System with Undo
  toasts: ToastMessage[];
  addToast: (msg: string, type?: ToastMessage['type'], undoAction?: () => void, undoLabel?: string) => void;
  dismissToast: (id: string) => void;

  // Helpers
  getProjectProgress: (projectId: string) => number;
  syncStatus: 'synced' | 'syncing' | 'offline';
  triggerConfetti: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Workspaces state
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('pt_workspaces');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'ws-default',
        name: 'Default Workspace',
        description: 'Primary project & build hub',
        color: '#f59e0b',
        icon: 'briefcase',
        createdAt: new Date().toISOString(),
      },
    ];
  });

  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string>(() => {
    if (typeof window === 'undefined') return 'ws-default';
    return localStorage.getItem('pt_active_workspace') || 'ws-default';
  });

  // Load User profile
  const [user, setUserState] = useState<UserProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('pt_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Return null so onboarding flow triggers, but we can also offer 1-click sample load
    return null;
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('pt_theme');
    return saved ? saved === 'dark' : true;
  });

  // Projects state
  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('pt_projects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PROJECTS;
  });

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('pt_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TASKS;
  });

  // Timeline / Notes state
  const [timeline, setTimeline] = useState<TimelineEntry[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('pt_timeline');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TIMELINE;
  });

  // Boards state
  const [boards, setBoards] = useState<CanvasBoard[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('pt_boards');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_BOARDS;
  });

  // Attachments state
  const [attachments, setAttachments] = useState<AttachmentItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('pt_attachments');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_ATTACHMENTS;
  });

  // Weekly review state
  const [weeklyReviews, setWeeklyReviews] = useState<Record<string, WeeklyReviewData>>(() => {
    if (typeof window === 'undefined') return {};
    const saved = localStorage.getItem('pt_weekly_reviews');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {};
  });

  // Navigation & View state
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectTab, setProjectTab] = useState<'tasks' | 'workspace' | 'files' | 'analytics'>('tasks');
  const [workspaceSubTab, setWorkspaceSubTab] = useState<'timeline' | 'boards'>('timeline');

  // Active Modals & Overlays
  const [activeBoard, setActiveBoard] = useState<CanvasBoard | null>(null);
  const [activeTaskForSheet, setActiveTaskForSheet] = useState<Task | null>(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // Live Task Timer
  const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');

  // Save to localStorage when state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('pt_user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('pt_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('pt_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('pt_timeline', JSON.stringify(timeline));
  }, [timeline]);

  useEffect(() => {
    localStorage.setItem('pt_boards', JSON.stringify(boards));
  }, [boards]);

  useEffect(() => {
    localStorage.setItem('pt_attachments', JSON.stringify(attachments));
  }, [attachments]);

  useEffect(() => {
    localStorage.setItem('pt_weekly_reviews', JSON.stringify(weeklyReviews));
  }, [weeklyReviews]);

  useEffect(() => {
    localStorage.setItem('pt_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Timer Interval
  useEffect(() => {
    let interval: any = null;
    if (activeTimerTaskId) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimerTaskId]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#3b82f6'],
      });
    } catch (e) {
      console.log('Confetti triggered');
    }
  };

  const addToast = (
    message: string, 
    type: ToastMessage['type'] = 'success', 
    undoAction?: () => void,
    undoLabel = 'Undo'
  ) => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = {
      id,
      message,
      type,
      undoAction,
      undoLabel,
      duration: 5000,
    };
    setToasts((prev) => [...prev, newToast]);

    // Background simulated sync indicator
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('synced');
    }, 600);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setActiveWorkspaceId = (id: string) => {
    setActiveWorkspaceIdState(id);
    localStorage.setItem('pt_active_workspace', id);
  };

  const createWorkspace = (name: string, description?: string, color = '#f59e0b') => {
    const id = 'ws-' + Math.random().toString(36).substring(2, 9);
    const newWs: Workspace = {
      id,
      name: name.trim() || 'New Workspace',
      description: description?.trim() || '',
      color,
      createdAt: new Date().toISOString(),
    };
    const updated = [...workspaces, newWs];
    setWorkspaces(updated);
    localStorage.setItem('pt_workspaces', JSON.stringify(updated));
    setActiveWorkspaceId(id);
    addToast(`Workspace "${newWs.name}" created`, 'success');
    return newWs;
  };

  const switchWorkspace = (id: string) => {
    const target = workspaces.find((w) => w.id === id);
    if (!target) return;
    setActiveWorkspaceId(id);
    setSelectedProjectId(null);
    setCurrentView('dashboard');
    addToast(`Switched to workspace: ${target.name}`, 'info');
  };

  const deleteWorkspace = (id: string) => {
    if (workspaces.length <= 1) {
      addToast('Cannot delete the only workspace', 'warning');
      return;
    }
    const filtered = workspaces.filter((w) => w.id !== id);
    setWorkspaces(filtered);
    localStorage.setItem('pt_workspaces', JSON.stringify(filtered));
    if (activeWorkspaceId === id) {
      setActiveWorkspaceId(filtered[0].id);
    }
    addToast('Workspace deleted', 'info');
  };

  const setUser = (newUser: UserProfile) => {
    setUserState(newUser);
    localStorage.setItem('pt_user', JSON.stringify(newUser));
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUserState(updated);
    localStorage.setItem('pt_user', JSON.stringify(updated));
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const resetApp = () => {
    localStorage.removeItem('pt_user');
    localStorage.removeItem('pt_projects');
    localStorage.removeItem('pt_tasks');
    localStorage.removeItem('pt_timeline');
    localStorage.removeItem('pt_boards');
    localStorage.removeItem('pt_attachments');
    localStorage.removeItem('pt_weekly_reviews');
    localStorage.removeItem('buildDiary_agent_sessions');
    localStorage.removeItem('buildDiary_agent_settings');
    setUserState(null);
    setProjects([]);
    setTasks([]);
    setTimeline([]);
    setBoards([]);
    setAttachments([]);
    setWeeklyReviews({});
    setCurrentView('dashboard');
    setSelectedProjectId(null);
    addToast('Build Diary reset to a completely fresh state.', 'info');
  };

  // Active Project
  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  const projectTasks = useMemo(() => {
    if (!selectedProjectId) return [];
    return tasks.filter((t) => t.projectId === selectedProjectId);
  }, [tasks, selectedProjectId]);

  const projectTimeline = useMemo(() => {
    if (!selectedProjectId) return [];
    return timeline
      .filter((entry) => entry.projectId === selectedProjectId)
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [timeline, selectedProjectId]);

  const projectBoards = useMemo(() => {
    if (!selectedProjectId) return [];
    return boards.filter((b) => b.projectId === selectedProjectId);
  }, [boards, selectedProjectId]);

  const projectAttachments = useMemo(() => {
    if (!selectedProjectId) return [];
    return attachments.filter((a) => a.projectId === selectedProjectId);
  }, [attachments, selectedProjectId]);

  // Project Progress Calculation
  const getProjectProgress = (projId: string) => {
    const projTasks = tasks.filter((t) => t.projectId === projId);
    if (projTasks.length === 0) return 0;
    const doneTasks = projTasks.filter((t) => t.status === 'done').length;
    return Math.round((doneTasks / projTasks.length) * 100);
  };

  // Project CRUD
  const createProject = (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'archived'>) => {
    const newProj: Project = {
      ...data,
      id: 'proj-' + Date.now().toString(36),
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProj, ...prev]);
    addToast(`Project "${newProj.name}" created!`, 'success');
    return newProj;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
    addToast('Project updated', 'info');
  };

  const deleteProject = (id: string) => {
    const target = projects.find((p) => p.id === id);
    if (!target) return;

    // Snapshot for Undo
    const deletedProject = { ...target };
    const relatedTasks = tasks.filter((t) => t.projectId === id);
    const relatedNotes = timeline.filter((n) => n.projectId === id);
    const relatedBoards = boards.filter((b) => b.projectId === id);

    // Remove optimistic
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setTasks((prev) => prev.filter((t) => t.projectId !== id));
    setTimeline((prev) => prev.filter((n) => n.projectId !== id));
    setBoards((prev) => prev.filter((b) => b.projectId !== id));

    if (selectedProjectId === id) {
      setSelectedProjectId(null);
      setCurrentView('dashboard');
    }

    addToast(
      `Project "${target.name}" deleted`,
      'warning',
      () => {
        // Undo function
        setProjects((prev) => [deletedProject, ...prev]);
        setTasks((prev) => [...relatedTasks, ...prev]);
        setTimeline((prev) => [...relatedNotes, ...prev]);
        setBoards((prev) => [...relatedBoards, ...prev]);
        addToast(`Restored "${deletedProject.name}"`, 'success');
      },
      'Undo'
    );
  };

  const archiveProject = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, archived: !p.archived } : p))
    );
    addToast('Project status updated', 'info');
  };

  // Task CRUD
  const createTask = (data: Omit<Task, 'id' | 'createdAt' | 'timeSpentMinutes'>) => {
    const newTask: Task = {
      ...data,
      id: 'task-' + Date.now().toString(36),
      timeSpentMinutes: 0,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
    addToast(`Task "${newTask.title}" added`, 'success');
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    if (activeTaskForSheet && activeTaskForSheet.id === id) {
      setActiveTaskForSheet((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deleteTask = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    const snap = { ...target };

    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (activeTaskForSheet && activeTaskForSheet.id === id) {
      setActiveTaskForSheet(null);
    }

    addToast(
      `Task "${target.title}" deleted`,
      'warning',
      () => {
        setTasks((prev) => [...prev, snap]);
        addToast(`Task restored`, 'success');
      },
      'Undo'
    );
  };

  const toggleTaskDone = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    const newStatus = target.status === 'done' ? 'todo' : 'done';
    const completedAt = newStatus === 'done' ? new Date().toISOString() : undefined;

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus, completedAt } : t))
    );

    if (activeTaskForSheet && activeTaskForSheet.id === id) {
      setActiveTaskForSheet((prev) => (prev ? { ...prev, status: newStatus, completedAt } : null));
    }

    if (newStatus === 'done') {
      triggerConfetti();
      addToast(
        `Task completed! Great progress.`,
        'success',
        () => {
          setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status: 'todo', completedAt: undefined } : t))
          );
        },
        'Undo'
      );
    } else {
      addToast(`Task marked as To Do`, 'info');
    }
  };

  const moveTaskStatus = (id: string, newStatus: Task['status']) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    const completedAt = newStatus === 'done' ? new Date().toISOString() : undefined;

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus, completedAt } : t))
    );

    if (newStatus === 'done') {
      triggerConfetti();
      addToast(
        `Task moved to Done`,
        'success',
        () => {
          setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status: target.status } : t))
          );
        },
        'Undo'
      );
    }
  };

  const addTimeSpent = (id: string, minutes: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, timeSpentMinutes: t.timeSpentMinutes + minutes } : t))
    );
    if (activeTaskForSheet && activeTaskForSheet.id === id) {
      setActiveTaskForSheet((prev) =>
        prev ? { ...prev, timeSpentMinutes: prev.timeSpentMinutes + minutes } : null
      );
    }
    addToast(`Logged +${minutes} minutes focus time`, 'info');
  };

  const startTaskTimer = (taskId: string) => {
    if (activeTimerTaskId && activeTimerTaskId !== taskId) {
      stopTaskTimer();
    }
    setActiveTimerTaskId(taskId);
    setTimerSeconds(0);
    const target = tasks.find((t) => t.id === taskId);
    addToast(`Focus timer started for "${target?.title || 'task'}"`, 'info');
  };

  const stopTaskTimer = () => {
    if (!activeTimerTaskId) return;
    const minutes = Math.max(1, Math.round(timerSeconds / 60));
    addTimeSpent(activeTimerTaskId, minutes);
    setActiveTimerTaskId(null);
    setTimerSeconds(0);
  };

  // Timeline / Notes CRUD
  const createTimelineEntry = (entry: Omit<TimelineEntry, 'id' | 'createdAt'>) => {
    const newEntry: TimelineEntry = {
      ...entry,
      id: 'note-' + Date.now().toString(36),
      createdAt: new Date().toISOString(),
    };
    setTimeline((prev) => [newEntry, ...prev]);
    addToast(`Added new ${entry.type === 'drawing' ? 'drawing' : 'log'} entry`, 'success');
    return newEntry;
  };

  const deleteTimelineEntry = (id: string) => {
    const target = timeline.find((t) => t.id === id);
    if (!target) return;
    const snap = { ...target };

    setTimeline((prev) => prev.filter((t) => t.id !== id));
    addToast('Note deleted', 'info', () => {
      setTimeline((prev) => [snap, ...prev]);
    });
  };

  const togglePinTimelineEntry = (id: string) => {
    setTimeline((prev) =>
      prev.map((e) => (e.id === id ? { ...e, pinned: !e.pinned } : e))
    );
  };

  // Canvas / Boards CRUD
  const openBoardModal = (board: CanvasBoard) => {
    setActiveBoard(board);
  };

  const closeBoardModal = () => {
    setActiveBoard(null);
  };

  const createBoard = (projectId: string, name: string, description?: string) => {
    const newBoard: CanvasBoard = {
      id: 'board-' + Date.now().toString(36),
      projectId,
      name,
      description,
      elements: [
        {
          id: 'screen-' + Math.random().toString(36).substring(2, 6),
          type: 'screen',
          x: 100,
          y: 100,
          width: 240,
          height: 380,
          title: 'Start Screen',
          screenBg: '#1e293b',
          mockupElements: [
            { type: 'header', label: 'Welcome to App' },
            { type: 'button', label: 'Continue' },
          ],
        },
      ],
      connections: [],
      updatedAt: new Date().toISOString(),
    };

    setBoards((prev) => [newBoard, ...prev]);
    addToast(`Board "${name}" created`, 'success');
    return newBoard;
  };

  const updateBoard = (id: string, updates: Partial<CanvasBoard>) => {
    setBoards((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b))
    );
    if (activeBoard && activeBoard.id === id) {
      setActiveBoard((prev) => (prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null));
    }
  };

  const deleteBoard = (id: string) => {
    const target = boards.find((b) => b.id === id);
    if (!target) return;
    const snap = { ...target };

    setBoards((prev) => prev.filter((b) => b.id !== id));
    if (activeBoard && activeBoard.id === id) {
      setActiveBoard(null);
    }

    addToast(`Board "${target.name}" deleted`, 'warning', () => {
      setBoards((prev) => [...prev, snap]);
    });
  };

  // Attachments CRUD
  const addAttachment = (projectId: string, name: string, type: AttachmentItem['type'], url: string, size?: string) => {
    const newAtt: AttachmentItem = {
      id: 'att-' + Date.now().toString(36),
      projectId,
      name,
      type,
      url,
      size,
      updatedAt: new Date().toISOString(),
    };
    setAttachments((prev) => [newAtt, ...prev]);
    addToast(`Attachment "${name}" added`, 'success');
  };

  const deleteAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    addToast('Attachment removed', 'info');
  };

  // Weekly review
  const saveWeeklyReview = (data: WeeklyReviewData) => {
    setWeeklyReviews((prev) => ({
      ...prev,
      [data.weekId]: data,
    }));
    addToast('Weekly review saved!', 'success');
  };

  // Modals & Confirmation
  const openCreateProjectModal = () => {
    setProjectToEdit(null);
    setProjectModalOpen(true);
  };

  const openEditProjectModal = (proj: Project) => {
    setProjectToEdit(proj);
    setProjectModalOpen(true);
  };

  const openCreateTaskModal = (projectId?: string) => {
    if (projectId) {
      setSelectedProjectId(projectId);
    }
    setTaskToEdit(null);
    setTaskModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setTaskToEdit(task);
    setTaskModalOpen(true);
  };

  const openConfirmModal = (config: {
    title: string;
    message: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }) => {
    setConfirmModal({
      isOpen: true,
      ...config,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal(null);
  };

  return (
    <AppContext.Provider
      value={{
        workspaces,
        activeWorkspaceId,
        setActiveWorkspaceId,
        createWorkspace,
        switchWorkspace,
        deleteWorkspace,
        user,
        setUser,
        updateUser,
        resetApp,
        currentView,
        setCurrentView,
        selectedProjectId,
        setSelectedProjectId,
        projectTab,
        setProjectTab,
        workspaceSubTab,
        setWorkspaceSubTab,
        isDarkMode,
        toggleTheme,
        projects,
        activeProject,
        createProject,
        updateProject,
        deleteProject,
        archiveProject,
        tasks,
        projectTasks,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskDone,
        moveTaskStatus,
        addTimeSpent,
        activeTaskForSheet,
        setActiveTaskForSheet,
        activeTimerTaskId,
        timerSeconds,
        startTaskTimer,
        stopTaskTimer,
        timeline,
        projectTimeline,
        createTimelineEntry,
        deleteTimelineEntry,
        togglePinTimelineEntry,
        boards,
        projectBoards,
        activeBoard,
        openBoardModal,
        closeBoardModal,
        createBoard,
        updateBoard,
        deleteBoard,
        attachments,
        projectAttachments,
        addAttachment,
        deleteAttachment,
        weeklyReviews,
        saveWeeklyReview,
        projectModalOpen,
        setProjectModalOpen,
        projectToEdit,
        openCreateProjectModal,
        openEditProjectModal,
        taskModalOpen,
        setTaskModalOpen,
        taskToEdit,
        openCreateTaskModal,
        openEditTaskModal,
        commandPaletteOpen,
        setCommandPaletteOpen,
        confirmModal,
        openConfirmModal,
        closeConfirmModal,
        toasts,
        addToast,
        dismissToast,
        getProjectProgress,
        syncStatus,
        triggerConfetti,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
