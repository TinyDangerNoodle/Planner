export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate?: Date;
  estimatedTime?: number; // in Minuten
  category?: string;
  tags?: string[];
  steps?: TaskStep[];
  createdAt: Date;
  updatedAt: Date;
  visualReminder?: string; // Pfad zu einem Bild oder Icon
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern;
}

export interface TaskStep {
  id: string;
  description: string;
  completed: boolean;
  order: number;
}

export enum TaskPriority {
  LOW = 'niedrig',
  MEDIUM = 'mittel',
  HIGH = 'hoch',
  URGENT = 'dringend'
}

export interface RecurringPattern {
  frequency: 'täglich' | 'wöchentlich' | 'monatlich';
  interval: number; // wie oft wiederholen
  endDate?: Date;
}

export interface TaskCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
}
