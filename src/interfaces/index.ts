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
  isCurrentlyFocused?: boolean;
  order: number;
}

export interface UserPlan {
  _id: string;
  userId: string;
  plan: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  text: string;
}

export interface Comment {
  _id: string;
  taskId: string;
  userId: string;
  content: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}