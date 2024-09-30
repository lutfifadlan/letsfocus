export interface Task {
  _id: string;
  title: string;
  description: string;
  isDeleted: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  group: string;
  status: string;
  completedAt: Date | null;
  deletedAt: Date | null;
  dueDate: Date | null;
  ignoredAt: Date | null;
  completionStatus?: string;
  priority?: string;
}

export interface Habit {
  _id: string;
  title: string;
  completed: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FocusTime {
  _id: string;
  duration: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  text: string;
}