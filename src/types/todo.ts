export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  parentId: string | null;
  order: number;
  createdAt: number;
  updatedAt: number;
  promptMode?: 'full-code' | 'code-changes' | 'notes';
  technologies?: string[];
  notes?: string;
  fontSize?: number;
  url?: string;
}

export interface Workspace {
  id: string;
  name: string;
  todos: Todo[];
  createdAt: number;
  updatedAt: number;
  description?: string;
  color?: string;
}

export interface ContextMenuPosition {
  x: number;
  y: number;
}

export interface SavedTask {
  id: string;
  text: string;
  usageCount: number;
}

export interface ArchivedTask {
  id: string;
  mainTask: Todo;
  subTasks: Todo[];
  archivedAt: number;
  archivedBy: string; // يمكن أن يكون اسم المستخدم أو معرف
  reason?: string; // سبب الأرشفة
}

export interface ArchivePage {
  tasks: ArchivedTask[];
  currentPage: number;
  totalPages: number;
  totalTasks: number;
}