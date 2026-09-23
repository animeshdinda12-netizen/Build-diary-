export type ProjectCategory = 'Work' | 'Side' | 'Learning' | 'Freelance';
export type ProjectStatus = 'Idea' | 'Active' | 'Paused' | 'Done';
export type PriorityLevel = 'P1' | 'P2' | 'P3';

export type TaskStatus = 'todo' | 'doing' | 'done';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: PriorityLevel;
  dueDate: string; // YYYY-MM-DD
  timeSpentMinutes: number;
  milestone?: string;
  createdAt: string;
  completedAt?: string;
}

export type TimelineEntryType = 'log' | 'rich' | 'drawing';
export type TimelineTag = 'Progress' | 'Blocker' | 'Idea' | 'Decision';

export interface TimelineEntry {
  id: string;
  projectId: string;
  title: string;
  content: string; // Markdown or details
  type: TimelineEntryType;
  tag: TimelineTag;
  pinned: boolean;
  drawingThumbnail?: string;
  boardId?: string;
  createdAt: string;
}

export interface AttachmentItem {
  id: string;
  projectId: string;
  name: string;
  type: 'file' | 'link' | 'github' | 'figma';
  url: string;
  size?: string;
  updatedAt: string;
}

// User Flow & Canvas Types
export type CanvasElementType = 
  | 'screen' 
  | 'diamond' 
  | 'action' 
  | 'sticky' 
  | 'text' 
  | 'path' 
  | 'arrow'
  | 'pdf'
  | 'doc'
  | 'image'
  | 'shape';

export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  title?: string;
  content?: string;
  color?: string;
  bgColor?: string;
  points?: { x: number; y: number }[]; // for freehand drawings
  targetElementId?: string; // for arrows / user flow links
  interaction?: 'on_tap' | 'on_hover';
  screenBg?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  pageCount?: number;
  pdfPages?: { pageNumber: number; text: string; highlights?: string[] }[];
  docType?: 'md' | 'docx' | 'txt';
  shapeType?: 'rectangle' | 'circle';
  isHighlighter?: boolean;
  strokeWidth?: number;
  mockupElements?: {
    type: 'nav' | 'header' | 'button' | 'card' | 'input' | 'list';
    label: string;
    targetScreenId?: string;
  }[];
}

export interface FlowConnection {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  trigger: 'on_tap' | 'auto';
}

export interface CanvasBoard {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  elements: CanvasElement[];
  connections: FlowConnection[];
  thumbnail?: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  priority: PriorityLevel;
  deadline: string; // YYYY-MM-DD
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  createdAt: string;
  projectCount?: number;
}

export interface UserProfile {
  name: string;
  focusAreas: string[];
  createdAt: string;
  streakDays: number;
  lastActiveDate: string;
  workspaceId?: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  undoAction?: () => void;
  undoLabel?: string;
  duration?: number;
}

export interface WeeklyReviewData {
  weekId: string; // e.g. "2026-W38"
  notes: string;
  nextWeekFocus: string;
  dailyHours: { day: string; hours: number }[];
  shippedHighlights: string[];
  savedAt: string;
}

export type AppView = 
  | 'dashboard' 
  | 'project-detail' 
  | 'all-boards' 
  | 'files' 
  | 'weekly-review' 
  | 'analytics' 
  | 'settings';


