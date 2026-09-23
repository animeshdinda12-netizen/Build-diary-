import { Project, Task, TimelineEntry, CanvasBoard, UserProfile, AttachmentItem } from '../types';

export const INITIAL_USER: UserProfile = {
  name: 'Builder',
  focusAreas: ['Web App', 'SaaS', 'Mobile App'],
  createdAt: new Date().toISOString(),
  streakDays: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
};

export const INITIAL_PROJECTS: Project[] = [];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_TIMELINE: TimelineEntry[] = [];

export const INITIAL_BOARDS: CanvasBoard[] = [];

export const INITIAL_ATTACHMENTS: AttachmentItem[] = [];
