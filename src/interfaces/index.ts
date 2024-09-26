export interface Task {
  _id: string;
  title: string;
  isCompleted: boolean;
  isDeleted: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
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

