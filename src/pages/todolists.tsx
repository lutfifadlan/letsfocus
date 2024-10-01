import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSession } from 'next-auth/react';
import { Task } from '@/interfaces';
import Layout from '@/components/layout';
import {
  Plus, Trash, Tag, Folder, PlusCircle, Edit, FileText, Save, X,
  CalendarIcon, SquareCheck, Trash2, ChevronsUp, ChevronUp,
  ChevronDown, Flag, CalendarArrowDown, ArrowDownUp, CopyCheck,
  MinusCircle,
  Rocket,
  CircleMinus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { InputTags } from '@/components/ui/input-tags';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDatePicker } from "@/components/calendar-date-picker";
import { format, isSameDay } from 'date-fns';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import confetti from 'canvas-confetti';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const FormSchema = z.object({
  calendar: z.object({
    from: z.date(),
    to: z.date(),
  }),
  datePicker: z.object({
    from: z.date(),
    to: z.date(),
  }),
});

export default function TodolistsPage() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      calendar: {
        from: new Date(new Date().getFullYear(), 0, 1),
        to: new Date(),
      },
      datePicker: {
        from: new Date(),
        to: new Date(),
      },
    },
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [sortOptions, setSortOptions] = useState({
    createdAt: true,
    priority: false,
    dueDate: false,
    group: false,
    title: false,
  });
  const [sortDirection, setSortDirection] = useState({
    createdAt: 'desc',
    priority: 'desc',
    dueDate: 'desc',
    group: 'desc',
    title: 'desc',
  });
  const [newTask, setNewTask] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [groups, setGroups] = useState<{ _id: string; name: string }[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [isGroupPopoverOpen, setIsGroupPopoverOpen] = useState(false);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [editingTaskDescriptionId, setEditingTaskDescriptionId] = useState<string | null>(null);
  const [editingTaskTitleId, setEditingTaskTitleId] = useState<string | null>(null);
  const [taskDescription, setTaskDescription] = useState<string>('');
  const [isFileTextButtonClicked, setIsFileTextButtonClicked] = useState(false);
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [isCalendarPickerOpen, setIsCalendarPickerOpen] = useState(false);
  const [existingTaskDueDate, setExistingTaskDueDate] = useState<Date | null>(null);
  const [editingTaskDueDateId, setEditingTaskDueDateId] = useState<string | null>(null);
  const [editingTaskTagsId, setEditingTaskTagsId] = useState<string | null>(null);
  const [editingTaskTags, setEditingTaskTags] = useState<string[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [lastDeletedTaskIds, setLastDeletedTaskIds] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isFetchLoading, setIsFetchLoading] = useState(false);
  const [priority, setPriority] = useState('');
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  
  const { status } = useSession();
  const { toast } = useToast();
  const incompleteTasks = tasks.filter((task) => task.status !== 'COMPLETED' && !task.isDeleted && task.status !== 'IGNORED');

  const handleAddTask = (description: string) => {
    addTask(description, dueDate, priority);
    setNewTaskDescription('');
    setIsFileTextButtonClicked(false);
    setDueDate(null);
    setPriority('');
  };

  const sortTasks = (tasks: Task[]) => {
    const sortedTasks = [...tasks];
    const priorityOrder = { High: 1, Medium: 2, Low: 3 }; // Priorities with values
  
    (Object.keys(sortOptions) as Array<keyof typeof sortOptions>).forEach((key) => {
      if (sortOptions[key]) {
        const direction = sortDirection[key] === 'asc' ? 1 : -1;
  
        switch (key) {
          case 'createdAt':
            sortedTasks.sort((a, b) =>
              direction * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            );
            break;
          case 'priority':
            sortedTasks.sort((a, b) => {
              const aPriority = a.priority ? priorityOrder[a.priority as keyof typeof priorityOrder] : null;
              const bPriority = b.priority ? priorityOrder[b.priority as keyof typeof priorityOrder] : null;
  
              // Tasks with priority are prioritized
              if (aPriority !== null && bPriority === null) return -1; // Task with priority first
              if (aPriority === null && bPriority !== null) return 1;  // Task without priority last
  
              // If both tasks have priority, compare them
              if (aPriority !== null && bPriority !== null) {
                return direction * (aPriority - bPriority);
              }
  
              // If neither task has priority, treat them as equal
              return 0;
            });
            break;
          case 'dueDate':
            sortedTasks.sort((a, b) => {
              const aDueDate = a.dueDate ? new Date(a.dueDate).getTime() : null;
              const bDueDate = b.dueDate ? new Date(b.dueDate).getTime() : null;
  
              // Tasks with due dates are prioritized
              if (aDueDate !== null && bDueDate === null) return -1; // Task with due date first
              if (aDueDate === null && bDueDate !== null) return 1;  // Task without due date last
  
              // If both tasks have due dates, compare them
              if (aDueDate !== null && bDueDate !== null) {
                return direction * (aDueDate - bDueDate);
              }
  
              // If neither task has a due date, treat them as equal
              return 0;
            });
            break;
          case 'group':
            sortedTasks.sort((a, b) => {
              const aGroup = a.group ? a.group : null;
              const bGroup = b.group ? b.group : null;
  
              if (aGroup && !bGroup) return -1; // Tasks with groups first
              if (!aGroup && bGroup) return 1;  // Tasks without groups last
  
              if (aGroup && bGroup) {
                return direction * aGroup.localeCompare(bGroup);
              }
  
              return 0;
            });
            break;
          case 'title':
            sortedTasks.sort((a, b) =>
              direction * a.title.localeCompare(b.title)
            );
            break;
          default:
            break;
        }
      }
    });
  
    return sortedTasks;
  };  

  const handleSortChange = (key: keyof typeof sortOptions) => {
    setSortOptions((prev) => {
      const newSortOptions = Object.keys(prev).reduce((acc, currKey) => {
        acc[currKey as keyof typeof sortOptions] = currKey === key ? true : false;
        return acc;
      }, {} as typeof sortOptions);

      return newSortOptions;
    });

    setSortDirection((prev) => ({
      ...prev,
      [key]: prev[key] === 'asc' ? 'desc' : 'asc',
    }));
  };

  const fetchTasksAndGroups = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks-groups');
      const data = await response.json();
      const fetchedTasks = data.tasks?.filter((task: Task) => !task.isDeleted && task.status !== 'COMPLETED') || [];
      setTasks(sortTasks(fetchedTasks) || []);
      setGroups(data.groups || []);
    } catch (error) {
      console.error('Failed to fetch tasks and groups:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tasks and groups.',
        variant: 'destructive',
        duration: 3000,
      });
    }
    setIsLoading(false);
  };

  const createGroup = async (groupName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        body: JSON.stringify({ name: groupName }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const newGroup = await response.json();
      setGroups((prev) => [...prev, newGroup]);
    } catch (error) {
      console.error('Failed to create group', error);
      toast({
        title: 'Error',
        description: 'Failed to create group.',
        variant: 'destructive',
        duration: 3000,
      });
    }
    setIsLoading(false);
  };

  const deleteGroup = async (groupId: string) => {
    setIsLoading(true);
    try {
      await fetch(`/api/groups`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupId }),
      });
      setGroups((prev) => prev.filter((group) => group._id !== groupId));
    } catch (error) {
      console.error('Failed to delete group', error);
      toast({
        title: 'Error',
        description: 'Failed to delete group.',
        variant: 'destructive',
        duration: 3000,
      });
    }
    setIsLoading(false);
  };

  const updateGroup = async (groupId: string, newName: string) => {
    setIsLoading(true);
    try {
      await fetch(`/api/groups`, {
        method: 'PUT',
        body: JSON.stringify({ groupId, newName }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setGroups((prev) => prev.map((group) => group._id === groupId ? { ...group, name: newName } : group));
    } catch (error) {
      console.error('Failed to update group', error);
      toast({
        title: 'Error',
        description: 'Failed to update group.',
        variant: 'destructive',
        duration: 3000,
      });
    }
    setIsLoading(false);
  };

  const addTask = async (description: string, dueDate: Date | null, priority: string) => {
    if (newTask.trim()) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: newTask, tags, group: selectedGroup, description, dueDate, priority }),
        });
        const data = await response.json();

        setTasks((prevTasks) => {
          if (!prevTasks) return [];
          const updatedTasks = [...prevTasks, data];
          const sortedTasks = sortTasks(updatedTasks);
          return sortedTasks ? sortedTasks : updatedTasks;
        });
        setNewTask('');
        setTags([]);

        toast({
          title: 'Task Added',
          description: `Task "${data.title}" has been added.`,
          action: (
            <ToastAction
              altText="Undo"
              onClick={() => {
                undoAdd(data._id);
              }}
            >
              Undo
            </ToastAction>
          ),
          duration: 3000,
        });
      } catch (error) {
        console.error('Failed to add task:', error);
        toast({
          title: 'Error',
          description: 'Failed to add task.',
          variant: 'destructive',
          duration: 3000,
        });
      }
      setIsLoading(false);
    }
  };

  const undoAdd = async (taskId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to undo add');
      }
  
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
  
      toast({
        title: 'Undo Successful',
        description: 'Task addition has been undone.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to undo add:', error);
      toast({
        title: 'Error',
        description: 'Failed to undo add.',
        variant: 'destructive',
        duration: 3000,
      });
    }
    setIsLoading(false);
  };

  const toggleTaskCompletion = async (taskId: string) => {
    setIsLoading(true);
    const taskIndex = tasks.findIndex((task) => task._id === taskId);
    if (taskIndex === -1) return;

    const updatedTask = {
      ...tasks[taskIndex],
      status: tasks[taskIndex].status === 'COMPLETED' ? 'PENDING' : 'COMPLETED',
    };

    setTasks((prevTasks) => {
      const newTasks = [...prevTasks];
      newTasks[taskIndex] = updatedTask;
      return newTasks;
    });

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: updatedTask.status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update task');
      }

      if (updatedTask.status === 'COMPLETED') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      toast({
        title: updatedTask.status === 'COMPLETED'
          ? 'Task Completed'
          : 'Task Uncompleted',
          description: `Task "${updatedTask.title}" has been ${
          updatedTask.status === 'COMPLETED' ? 'completed' : 'marked as incomplete'
        }`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to update task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task.',
        variant: 'destructive',
        duration: 3000,
      });
    }
    setIsLoading(false);
  };
  
  const deleteTask = async (taskId: string) => {
    setIsLoading(true);
    const taskToDelete = tasks.find((task) => task._id === taskId);
    if (!taskToDelete) return;
  
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === taskId ? { ...task, isDeleted: true } : task
      )
    );
  
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete task');
      }
  
      toast({
        title: 'Task Deleted',
        description: 'Task has been deleted.',
        duration: 3000,
          action: (
          <Button
            variant="outline"
            onClick={() => undoDelete(taskToDelete._id)}
          >
            Undo
          </Button>
        ),
      });
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task.',
        variant: 'destructive',
      });
  
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, isDeleted: false } : task
        )
      );
    }
    setIsLoading(false);
    setSelectedTaskIds([]);
    setShowBulkActions(false);
    setLastDeletedTaskIds([]);
  };
  
  const undoDelete = async (taskId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isDeleted: false }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to undo delete');
      }
  
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, isDeleted: false } : task
        )
      );
  
      toast({
        title: 'Undo Successful',
        description: 'Task has been restored.',
      });
    } catch (error) {
      console.error('Failed to undo delete:', error);
      toast({
        title: 'Error',
        description: 'Failed to undo delete.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const deleteSelectedTasks = async () => {
    if (selectedTaskIds.length === 0) return;

    setIsLoading(true);
    const tasksToDelete = tasks.filter((task) =>
      selectedTaskIds.includes(task._id)
    );
    if (tasksToDelete.length === 0) return;

    setLastDeletedTaskIds(selectedTaskIds);

    setTasks((prevTasks) =>
      prevTasks.filter((task) => !selectedTaskIds.includes(task._id))
    );

    try {
      const response = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskIds: selectedTaskIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete tasks');
      }

      setSelectedTaskIds([]);

      toast({
        title: 'Tasks Deleted',
        description: `${tasksToDelete.length} tasks have been deleted.`,
        duration: 5000,
        action: (
          <ToastAction altText="Undo" onClick={() => undoDeleteSelectedTasks()}>
            Undo
          </ToastAction>
        ),
      });
    } catch (error) {
      console.error('Failed to delete tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete tasks.',
        variant: 'destructive',
        duration: 3000,
      });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          selectedTaskIds.includes(task._id)
            ? { ...task, isDeleted: false }
            : task
        )
      );
    }
    setShowBulkActions(false);
    setLastDeletedTaskIds([]);
    setIsLoading(false);
  };

  const undoDeleteSelectedTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskIds: lastDeletedTaskIds, isDeleted: false }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to undo delete');
      }

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          lastDeletedTaskIds.includes(task._id) ? { ...task, isDeleted: false } : task
        )
      );

      setLastDeletedTaskIds([]);

      toast({
        title: 'Undo Successful',
        description: 'Tasks have been restored.',
      });
    } catch (error) {
      console.error('Failed to undo delete:', error);
      toast({
        title: 'Error',
        description: 'Failed to undo delete.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const updateTaskGroup = async (taskId: string, groupName: string | null) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ group: groupName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update task group');
      }

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, group: groupName ?? '' } : task
        )
      );

      toast({
        title: 'Group Updated',
        description: groupName
          ? `Task has been assigned to group "${groupName}".`
          : 'Task has been removed from its group.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to update task group:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task group.',
        variant: 'destructive',
        duration: 3000,
      });
    }
    setIsLoading(false);
  };

  const updateTaskTags = async (taskId: string, newTags: string[]) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags: newTags }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update task tags');
      }

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, tags: newTags } : task
        )
      );

      toast({
        title: 'Tags Updated',
        description: 'Task tags have been updated.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to update task tags:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task tags.',
        variant: 'destructive',
        duration: 3000,
      });
    }
    setIsLoading(false);
  };

  const updateTaskTitle = async (taskId: string, newTitle: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update task title');
      }

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, title: newTitle } : task
        )
      );

      toast({
        title: 'Title Updated',
        description: 'Task title has been updated.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to update task title:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task title.',
        variant: 'destructive',
        duration: 3000,
      });
    }
    setIsLoading(false);
  };

  const updateTaskPriority = async (taskId: string, newPriority: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priority: newPriority }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update task priority');
      }

      setTasks((prevTasks) =>
          prevTasks.map((task) =>
          task._id === taskId ? { ...task, priority: newPriority } : task
        )
      );

      toast({
        title: 'Priority Updated',
        description: `Task priority has been updated to ${newPriority}.`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to update task priority:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task priority.',
        variant: 'destructive',
        duration: 3000,
      });
    }
    setIsLoading(false);
  };

  const updateTaskDescription = async (taskId: string, newDescription: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: newDescription }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update task description');
      }

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, description: newDescription } : task
        )
      );

      toast({
        title: 'Description Updated',
        description: 'Task description has been updated.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to update task description:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task description.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const updateTaskDueDate = async (taskId: string, newDueDate: Date | null) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dueDate: newDueDate }),
      }); 
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update task due date');
      }

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, dueDate: newDueDate } : task
        )
      );

      toast({
        title: 'Due Date Updated',
        description: 'Task due date has been updated.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to update task due date:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task due date.',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setEditingTaskDueDateId(null);
      setIsLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update task status');
      }

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, status } : task
        )
      );

      toast({
        title: 'Task Ignored',
        description: `Task status has been updated to ${status.toLowerCase()}.`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task status.',
        variant: 'destructive',
        duration: 3000,
      });
    }
    setIsLoading(false);
  };

  const bulkAssignGroup = async (groupName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks/bulk', {
        method: 'PUT',
        body: JSON.stringify({ taskIds: selectedTaskIds, group: groupName }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to bulk assign group');
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          selectedTaskIds.includes(task._id) ? { ...task, group: groupName } : task
        )
      );
      setSelectedTaskIds([]);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
    setShowBulkActions(false);
  };

  const bulkAssignTags = async (newTags: string[]) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks/bulk', {
        method: 'PUT',
        body: JSON.stringify({ taskIds: selectedTaskIds, tags: newTags }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to bulk assign tags');
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          selectedTaskIds.includes(task._id) ? { ...task, tags: newTags } : task
        )
      );
      setSelectedTaskIds([]);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
    setShowBulkActions(false);
  };

  const bulkAssignDueDate = async (dueDate: Date | null) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks/bulk', {
        method: 'PUT',
        body: JSON.stringify({ taskIds: selectedTaskIds, dueDate }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to bulk assign due date');
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          selectedTaskIds.includes(task._id) ? { ...task, dueDate } : task
        )
      );
      setSelectedTaskIds([]);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
    setShowBulkActions(false);
  };

  const bulkAssignPriority = async (priority: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks/bulk', {
        method: 'PUT',
        body: JSON.stringify({ taskIds: selectedTaskIds, priority }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to bulk assign priority');
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          selectedTaskIds.includes(task._id) ? { ...task, priority } : task
        )
      );
      setSelectedTaskIds([]);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
    setShowBulkActions(false);
  };

  const bulkMarkAsCompleted = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks/bulk', {
        method: 'PUT',
        body: JSON.stringify({ taskIds: selectedTaskIds, status: 'COMPLETED' }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to bulk complete tasks');
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          selectedTaskIds.includes(task._id) ? { ...task, status: 'COMPLETED' } : task
        )
      );

      const totalTasks =  incompleteTasks.length;
      const completedTasks = selectedTaskIds.length;

      if (completedTasks === totalTasks) {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            confetti({
              particleCount: 400,
              spread: 180,
              startVelocity: 60,
              gravity: 0.5,
              scalar: 1.8,
              ticks: 200,
              origin: { x: Math.random(), y: Math.random() - 0.2 },
              colors: ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f'],
            });
          }, i * 500);
        }
  
        confetti({
          particleCount: 600,
          spread: 360,
          startVelocity: 50,
          gravity: 0.4,
          ticks: 300,
          origin: { y: 0.5 },
          scalar: 2.2,
          shapes: ['circle', 'square'],
        });
  
        confetti({
          particleCount: 800,
          spread: 360,
          startVelocity: 100,
          gravity: 0.6,
          ticks: 400,
          origin: { y: 0.7 },
          scalar: 2,
          colors: ['#ff69b4', '#ff4500', '#32cd32', '#1e90ff'],
        });
      } else if (completedTasks > 0) {
        confetti({
          particleCount: 200,
          spread: 80,
          origin: { y: 0.6 },
          scalar: 1.5,
          angle: 90,
          gravity: 0.6,
          ticks: 200,
        });
      }

      setSelectedTaskIds([]);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
    setShowBulkActions(false);
  };

  const bulkMarkAsIgnored = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks/bulk', {
        method: 'PUT',
        body: JSON.stringify({ taskIds: selectedTaskIds, status: 'IGNORED' }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to bulk ignore tasks');
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          selectedTaskIds.includes(task._id) ? { ...task, status: 'IGNORED' } : task
        )
      );
      setSelectedTaskIds([]);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
    setShowBulkActions(false);
  };

  useEffect(() => {
    if (status === 'authenticated') {
      setIsFetchLoading(true);
      fetchTasksAndGroups();
      setIsFetchLoading(false);
    }
  }, [status]);

  useEffect(() => {
    setTasks((prevTasks) => {
      const sortedTasks = sortTasks(prevTasks);
      return sortedTasks ? sortedTasks : prevTasks;
    });
  }, [sortOptions]);

  if (status === 'loading' || isFetchLoading || isLoading) {
    return (
      <div className="py-16 flex justify-center items-center h-full">
        <div className="animate-spin h-8 w-8 border-4 border-t-transparent dark:border-t-black border-black dark:border-white rounded-full"></div>
      </div>
    );
  }

  return (
    <Layout>
      <Card className="max-w-4xl mx-auto border-none shadow-none">
        <CardHeader>
          <div className="flex justify-between items-center space-x-1">
            <CardTitle className="text-center text-2xl">To-Do Lists</CardTitle>
            <div className="flex justify-center items-center space-x-1 text-sm">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Sort Tasks"
                        >
                          <ArrowDownUp size={16} />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-2 text-sm">
                        <p className="mb-2">Sort By</p>
                        <div className="space-y-2">
                          {Object.entries(sortOptions).map(([key]) => (
                            <div key={key} className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Sort by ${key}`}
                                onClick={() => handleSortChange(key as keyof typeof sortOptions)}
                              >
                                {sortDirection[key as keyof typeof sortDirection] === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                {key === 'createdAt' && <CalendarArrowDown size={16} />}
                                {key === 'priority' && <Flag size={16} />}
                                {key === 'dueDate' && <CalendarIcon size={16} />}
                                {key === 'group' && <Folder size={16} />}
                                {key === 'title' && <FileText size={16} />}
                              </Button>
                              <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sort tasks</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setShowBulkActions(!showBulkActions)}
                      aria-label={showBulkActions ? 'Hide Bulk Actions' : 'Show Bulk Actions'}
                      variant="ghost"
                      size="icon"
                      disabled={incompleteTasks.length === 0}
                    >
                      <CopyCheck size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{showBulkActions ? 'Hide bulk actions' : 'Show bulk actions'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-0 mb-2">
            <div className={`flex flex-row gap-2 ${isFileTextButtonClicked ? 'items-start justify-start' : 'items-center justify-center'}`}>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Complete Task"
                className="hover:bg-transparent hover:cursor-default"
              >
                <Rocket size={16} />
              </Button>
              <div className="flex flex-col gap-2 w-full text-sm">
                <Input
                  placeholder="Add task"
                  className="w-full shadow-none border-none text-sm flex-1"
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTask(newTaskDescription);
                    }
                  }}
                  aria-label="New Task"
                  autoFocus
                />
                {isFileTextButtonClicked && (
                  <Textarea
                    placeholder="Task description"
                    className="w-full shadow-none resize-vertical"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    aria-label="New Task Description"
                    rows={1}
                    style={{ minHeight: '2.5rem', overflow: 'hidden' }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = `${target.scrollHeight}px`;
                    }}
                    autoFocus
                  />
                )}
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setIsFileTextButtonClicked(!isFileTextButtonClicked)}
                      aria-label="Add Description"
                      variant="ghost"
                      size="icon"
                      className="w-auto px-1.5"
                    >
                      <FileText size={16}/>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add description</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Popover open={isGroupPopoverOpen} onOpenChange={setIsGroupPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button aria-label="Select Group" variant="ghost" size="icon" className="w-auto px-1.5">
                          <Folder size={16}/>
                        </Button>
                      </PopoverTrigger>
                      <TooltipContent>
                        <p>Select or create group</p>
                      </TooltipContent>
                      <PopoverContent className="w-64">
                        <div className="space-y-2 text-sm">
                          <p>Select or create a group</p>
                          <Button
                            variant={selectedGroup === null ? "secondary" : "ghost"}
                            className="w-full justify-start text-sm"
                            onClick={() => setSelectedGroup(null)}
                          >
                            No Group
                          </Button>
                          {groups.map((group) => (
                            <div key={group._id} className="flex items-center justify-between text-sm">
                              {editingGroup === group.name ? (
                                <Input
                                  type="text"
                                  value={newGroupName}
                                  onChange={(e) => setNewGroupName(e.target.value)}
                                  onBlur={() => {
                                    if (newGroupName.trim() && newGroupName !== group.name) {
                                      updateGroup(group._id, newGroupName);
                                    }
                                    setEditingGroup(null);
                                    setNewGroupName('');
                                    setIsGroupPopoverOpen(false);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      if (newGroupName.trim() && newGroupName !== group.name) {
                                        updateGroup(group._id, newGroupName);
                                      }
                                      setEditingGroup(null);
                                      setNewGroupName('');
                                      setIsGroupPopoverOpen(false);
                                    }
                                  }}
                                  autoFocus
                                />
                              ) : (
                                <>
                                  <Button
                                    variant={selectedGroup === group.name ? "secondary" : "ghost"}
                                    className="w-full justify-start"
                                    onClick={() => setSelectedGroup(group.name)}
                                  >
                                    {group.name}
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => {
                                      setEditingGroup(group.name);
                                      setNewGroupName(group.name);
                                    }}
                                  >
                                    <Edit size={12} />
                                  </Button>
                                </>
                              )}
                              <Button size="icon" variant="ghost" onClick={() => deleteGroup(group._id)}>
                                <Trash size={12} />
                              </Button>
                            </div>
                          ))}
                          <div className="flex items-center space-x-2 text-sm">
                            <Input
                              type="text"
                              placeholder="New group name"
                              value={newGroupName}
                              onChange={(e) => setNewGroupName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && newGroupName.trim()) {
                                  createGroup(newGroupName);
                                  setNewGroupName('');
                                }
                              }}
                              autoFocus
                            />
                            <Button
                              size="icon"
                              onClick={() => {
                                if (newGroupName.trim()) {
                                  createGroup(newGroupName);
                                  setNewGroupName('');
                                }
                              }}
                            >
                              <PlusCircle size={16} />
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TooltipTrigger>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button aria-label="Add Tags" variant="ghost" size="icon" className="w-auto px-1.5">
                          <Tag size={16}/>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 text-sm">
                        <div className="space-y-2">
                          <div className="font-medium">Add tags</div>
                          <InputTags
                            type="text"
                            value={tags}
                            onChange={(value) => setTags(value as string[])}
                            placeholder="Use enter or comma to add tag"
                            className="w-full text-xs"
                            autoFocus
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add tags</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Popover open={showPriorityDropdown} onOpenChange={setShowPriorityDropdown}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          aria-label="priority"
                          size="icon"
                          onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                          className="w-auto px-1.5"
                        >
                          {priority === 'High' && (
                            <div className="flex items-center">
                              <ChevronsUp size={16} className="text-red-500" />
                            </div>
                          )}
                          {priority === 'Medium' && (
                            <div className="flex items-center">
                              <ChevronUp size={16} />
                            </div>
                          )}
                          {priority === 'Low' && (
                            <div className="flex items-center">
                              <ChevronDown size={16} />
                            </div>
                          )}
                          {!priority && (
                            <div className="flex items-center">
                              <Flag size={16} />
                            </div>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-36 text-sm">
                        <p className="flex justify-start items-center mb-2">Select Priority</p>
                        <div
                          className="flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900"
                          onClick={() => {
                            setPriority('High');
                            setShowPriorityDropdown(false);
                          }}
                        >
                          <ChevronsUp size={16} className="text-red-500" />
                          <span>High</span>
                        </div>
                        <div
                          className="flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900"
                          onClick={() => {
                            setPriority('Medium');
                            setShowPriorityDropdown(false);
                          }}
                        >
                          <ChevronUp size={16} />
                          <span>Medium</span>
                        </div>
                        <div
                          className="flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900"
                          onClick={() => {
                            setPriority('Low');
                            setShowPriorityDropdown(false);
                          }}
                        >
                          <ChevronDown size={16} />
                          <span>Low</span>
                        </div>
                        <div
                          className="flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900"
                          onClick={() => {
                            setPriority('');
                            setShowPriorityDropdown(false);
                          }}
                        >
                          <Flag size={16} />
                          <span>No Priority</span>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Set priority</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Popover open={isCalendarPickerOpen} onOpenChange={setIsCalendarPickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          onClick={() => setIsCalendarPickerOpen(!isCalendarPickerOpen)}
                          aria-label="Add Due Date"
                          variant="ghost"
                          size="icon"
                          className="w-auto px-1"
                        >
                          <CalendarIcon size={16} />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-52 text-sm">
                        <div className="flex flex-col space-y-1">
                          <p className="flex justify-start items-center">Select Due Date</p>
                          <div className="flex items-center justify-center space-x-1">
                            <Form {...form}>
                              <form
                                onSubmit={form.handleSubmit((data) => {
                                  setDueDate(data.datePicker.to);
                                  setIsCalendarPickerOpen(false);
                                })}
                                className="flex flex-col justify-center text-center items-center space-y-2"
                              >
                                <div className="flex justify-center items-center space-x-1">
                                  <CalendarDatePicker
                                    date={{ from: dueDate || new Date(), to: dueDate || new Date() }}
                                    onDateSelect={({ from, to }) => {
                                      form.setValue("datePicker", { from, to });
                                      setDueDate(from);
                                      setIsCalendarPickerOpen(false);
                                    }}
                                    variant="outline"
                                    numberOfMonths={1}
                                    className="min-w-[150px] border rounded-md ml-3 mt-2 justify-center items-center"
                                  />
                                  <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => {
                                      setDueDate(null);
                                      setIsCalendarPickerOpen(false);
                                    }}
                                    className="px-2 py-1 mt-2"
                                  >
                                    <X size={16} />
                                  </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => {
                                      setDueDate(new Date());
                                      setIsCalendarPickerOpen(false);
                                    }}
                                    className="px-2 py-1"
                                  >
                                    Today
                                  </Button>
                                  <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => {
                                      const tomorrow = new Date();
                                      tomorrow.setDate(tomorrow.getDate() + 1);
                                      setDueDate(tomorrow);
                                      setIsCalendarPickerOpen(false);
                                    }}
                                    className="px-2 py-1"
                                  >
                                    Tomorrow
                                  </Button>
                                </div>
                              </form>
                            </Form>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Set due date</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      onClick={() => handleAddTask(newTaskDescription)}
                      aria-label="Add Task"
                      variant="ghost"
                      size="icon"
                      disabled={!newTask.trim()}
                      className="w-auto px-1.5"
                    >
                      <Plus size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add task</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {(selectedGroup || tags.length > 0 || dueDate) && (
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedGroup && (
                  <Badge variant="secondary">
                    <Folder size={12} className="mr-1" />
                    {selectedGroup}
                  </Badge>
                )}
                {tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    <Tag size={12} className="mr-1" />
                    {tag}
                  </Badge>
                ))}
                {dueDate && (
                  <Badge
                    variant="outline"
                    className={
                      dueDate < new Date() && !isSameDay(dueDate, new Date())
                        ? 'bg-red-400 text-black'
                        : isSameDay(dueDate, new Date())
                        ? 'bg-yellow-200 text-black'
                        : 'bg-green-200 text-black'
                    }
                  >
                    <CalendarIcon size={12} className="mr-1" />
                    {isSameDay(dueDate, new Date()) ? 'Today' : isSameDay(dueDate, new Date(new Date().setDate(new Date().getDate() + 1))) ? 'Tomorrow' : format(dueDate, 'PPP')}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {showBulkActions && (
            <div className="flex items-center mb-2 space-x-2 text-sm">
              <div className="flex items-center justify-center text-sm">
                <Checkbox
                  checked={
                    selectedTaskIds.length === incompleteTasks.length && incompleteTasks.length > 0
                      ? true
                      : selectedTaskIds.length === 0
                      ? false
                      : 'indeterminate'
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedTaskIds(incompleteTasks.map((task) => task._id));
                    } else {
                      setSelectedTaskIds([]);
                    }
                  }}
                  aria-label="Select All Tasks"
                  className="mr-1"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete Tasks"
                            disabled={selectedTaskIds.length === 0}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                            <AlertDialogDescription>
                              {`Are you sure you want to delete ${selectedTaskIds.length} selected task(s)? This action cannot be undone.`}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteSelectedTasks()}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete selected tasks</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button aria-label="Bulk Assign Group" variant="ghost" size="icon" disabled={selectedTaskIds.length === 0}>
                            <Folder size={16} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-52">
                          <div className="space-y-2 text-sm">
                            <p>Select a group for selected tasks</p>
                            {groups.map((group) => (
                              <Button
                                key={group._id}
                                variant="ghost"
                                className="w-full justify-start"
                                onClick={() => bulkAssignGroup(group.name)}
                              >
                                {group.name}
                              </Button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Assign group to selected tasks</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button aria-label="Bulk Assign Tags" variant="ghost" size="icon" disabled={selectedTaskIds.length === 0}>
                            <Tag size={16} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-52 text-sm">
                          <InputTags
                            type="text"
                            value={tags}
                            onChange={(newTags) => bulkAssignTags(newTags as string[])}
                            placeholder="Assign tags"
                          />
                        </PopoverContent>
                      </Popover>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Assign tags to selected tasks</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button aria-label="Bulk Assign Due Date" variant="ghost" size="icon" disabled={selectedTaskIds.length === 0}>
                            <CalendarIcon size={16} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-52">
                          <div className="flex flex-col space-y-1 text-sm">
                            <p className="flex justify-start items-center">Select Due Date</p>
                            <div className="flex items-center justify-center space-x-1">
                              <div className="flex flex-col justify-center text-center items-center space-y-2">
                                <div className="flex justify-center items-center space-x-1">
                                  <CalendarDatePicker
                                    date={{
                                      from: dueDate || new Date(),
                                      to: dueDate || new Date(),
                                    }}
                                    onDateSelect={({ from }) => bulkAssignDueDate(from)}
                                    variant="outline"
                                    numberOfMonths={1}
                                    className="min-w-[150px] border rounded-md ml-3 mt-2 justify-center items-center"
                                  />
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      bulkAssignDueDate(null);
                                    }}
                                    className="px-2 py-1 mt-2"
                                  >
                                    <X size={16} />
                                  </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      bulkAssignDueDate(new Date());
                                    }}
                                    className="px-2 py-1"
                                  >
                                    Today
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      const tomorrow = new Date();
                                      tomorrow.setDate(tomorrow.getDate() + 1);
                                      bulkAssignDueDate(tomorrow);
                                    }}
                                    className="px-2 py-1"
                                    >
                                      Tomorrow
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Set due date for selected tasks</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button aria-label="Bulk Assign Priority" variant="ghost" size="icon" disabled={selectedTaskIds.length === 0}>
                              <Flag size={16} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-36 text-sm">
                            <p className="flex justify-start items-center mb-2">Select Priority</p>
                            <div
                              className="flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900"
                              onClick={() => bulkAssignPriority('High')}
                            >
                              <ChevronsUp size={16} className="text-red-500" />
                              <span>High</span>
                            </div>
                            <div
                              className="flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900"
                              onClick={() => bulkAssignPriority('Medium')}
                            >
                              <ChevronUp size={16} />
                              <span>Medium</span>
                            </div>
                            <div
                              className="flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900"
                              onClick={() => bulkAssignPriority('Low')}
                            >
                              <ChevronDown size={16} />
                              <span>Low</span>
                            </div>
                            <div
                              className="flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900"
                              onClick={() => bulkAssignPriority('')}
                            >
                              <Flag size={16} />
                              <span>No Priority</span>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Set priority for selected tasks</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button onClick={() => bulkMarkAsCompleted()} aria-label="Mark as Completed" variant="ghost" size="icon" disabled={selectedTaskIds.length === 0}>
                          <SquareCheck size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Mark selected tasks as completed</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button onClick={() => bulkMarkAsIgnored()} aria-label="Mark as Ignored" variant="ghost" size="icon" disabled={selectedTaskIds.length === 0}>
                              <MinusCircle size={16} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Ignore</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to ignore the selected tasks? This action can be undone later.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => bulkMarkAsIgnored()}>
                                Ignore
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Mark selected tasks as ignored</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            )}
  
          <div className="space-y-2">
            {incompleteTasks.length > 0 ? (
              incompleteTasks.map((task) => (
                <div key={task._id} className="rounded-md text-sm">
                  <div className="flex flex-row gap-2 items-center">
                    {showBulkActions && (
                      <Checkbox
                        checked={selectedTaskIds.includes(task._id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTaskIds([...selectedTaskIds, task._id]);
                          } else {
                            setSelectedTaskIds(selectedTaskIds.filter((id) => id !== task._id));
                          }
                        }}
                      />
                    )}
                    {!showBulkActions && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleTaskCompletion(task._id)}
                              aria-label="Complete Task"
                              className="w-auto px-1"
                            >
                              <SquareCheck size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Mark as completed</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {
                      task.priority && task.priority !== '' ?
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="w-auto px-1">
                                  {task.priority === 'High' && <ChevronsUp size={16} className="text-red-500" />}
                                  {task.priority === 'Medium' && <ChevronUp size={16} />}
                                  {task.priority === 'Low' && <ChevronDown size={16} />}
                                  {!task.priority && <Flag size={16} />}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-36">
                                <div
                                  className="flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 text-sm"
                                  onClick={() => updateTaskPriority(task._id, 'High')}
                                >
                                  <ChevronsUp size={16} />
                                  <span>High</span>
                                </div>
                                <div
                                  className="flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 text-sm"
                                  onClick={() => updateTaskPriority(task._id, 'Medium')}
                                >
                                  <ChevronUp size={16} />
                                  <span>Medium</span>
                                </div>
                                <div
                                  className="flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 text-sm"
                                  onClick={() => updateTaskPriority(task._id, 'Low')}
                                >
                                  <ChevronDown size={16} />
                                  <span>Low</span>
                                </div>
                                <div
                                  className="flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 text-sm"
                                  onClick={() => updateTaskPriority(task._id, '')}
                                >
                                  <Flag size={16} />
                                  <span>No Priority</span>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Set priority</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      : null
                    }

                    <div className="flex flex-col gap-1 w-full">
                      {editingTaskTitleId === task._id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            className="flex-1 border mr-1"
                            type="text"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                if (taskTitle.trim() && taskTitle !== task.title) {
                                  updateTaskTitle(task._id, taskTitle);
                                }
                                setEditingTaskTitleId(null);
                                setTaskTitle('');
                              } else if (e.key === 'Escape') {
                                setEditingTaskTitleId(null);
                                setTaskTitle('');
                              }
                            }}
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (taskTitle.trim() && taskTitle !== task.title) {
                                updateTaskTitle(task._id, taskTitle);
                              }
                              setEditingTaskTitleId(null);
                              setTaskTitle('');
                            }}
                            className="w-auto px-1"
                          >
                            <Save size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingTaskTitleId(null);
                              setTaskTitle('');
                            }}
                            className="w-auto px-1"
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      ) : (
                        <p
                          className="flex-1 font-medium text-sm hover:cursor-text"
                          onClick={() => {
                            setEditingTaskTitleId(task._id);
                            setTaskTitle(task.title);
                          }}
                        >
                          {task.title}
                        </p>
                      )}
                    </div>

                    {
                      !task.priority || (task.priority  && task.priority === '') ?
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="w-auto px-1">
                                  {task.priority === 'High' && <ChevronsUp size={16} className="text-red-500" />}
                                  {task.priority === 'Medium' && <ChevronUp size={16} />}
                                  {task.priority === 'Low' && <ChevronDown size={16} />}
                                  {!task.priority && <Flag size={16} />}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-36">
                                <div
                                  className="flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 text-sm"
                                  onClick={() => updateTaskPriority(task._id, 'High')}
                                >
                                  <ChevronsUp size={16} className="text-red-500" />
                                  <span>High</span>
                                </div>
                                <div
                                  className="flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 text-sm"
                                  onClick={() => updateTaskPriority(task._id, 'Medium')}
                                >
                                  <ChevronUp size={16} />
                                  <span>Medium</span>
                                </div>
                                <div
                                  className="flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 text-sm"
                                  onClick={() => updateTaskPriority(task._id, 'Low')}
                                >
                                  <ChevronDown size={16} />
                                  <span>Low</span>
                                </div>
                                <div
                                  className="flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 text-sm"
                                  onClick={() => updateTaskPriority(task._id, '')}
                                >
                                  <Flag size={16} />
                                  <span>No Priority</span>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Set priority</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    : null}

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingTaskDescriptionId(
                                editingTaskDescriptionId === task._id ? null : task._id
                              );
                              setTaskDescription(editingTaskDescriptionId ? '' : task.description || '');
                            }}
                          >
                            <FileText size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit description</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="w-auto px-1">
                                <Folder size={16} />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48">
                              <div className="space-y-2 text-sm">
                                <p>Change group</p>
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start"
                                  onClick={() => updateTaskGroup(task._id, null)}
                                >
                                  No Group
                                </Button>
                                {groups.map((group) => (
                                  <Button
                                    key={group._id}
                                    variant="ghost"
                                    className="w-full justify-start"
                                    onClick={() => updateTaskGroup(task._id, group.name)}
                                  >
                                    {group.name}
                                  </Button>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Change group</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Popover
                            open={editingTaskTagsId === task._id}
                            onOpenChange={(isOpen) => {
                              if (isOpen) {
                                setEditingTaskTagsId(task._id);
                                setEditingTaskTags(task.tags || []);
                              } else {
                                setEditingTaskTagsId(null);
                                setEditingTaskTags([]);
                              }
                            }}
                          >
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="w-auto px-1">
                                <Tag size={16} />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 text-sm">
                              <div className="space-y-2">
                                <div className="font-medium">Add tags</div>
                                <InputTags
                                  type="text"
                                  value={editingTaskTags}
                                  onChange={(value) => setEditingTaskTags(value as string[])}
                                  placeholder="Use enter or comma to add tag"
                                  className="w-full text-xs"
                                  autoFocus
                                />
                                <div className="flex justify-end mt-2 space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingTaskTagsId(null);
                                      setEditingTaskTags([]);
                                    }}
                                  >
                                    <X size={16} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      updateTaskTags(task._id, editingTaskTags);
                                      setEditingTaskTagsId(null);
                                      setEditingTaskTags([]);
                                    }}
                                  >
                                    <Save size={16} />
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit tags</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                aria-label="Update Task Due Date"
                                size="icon"
                                onClick={() => {
                                  setEditingTaskDueDateId(
                                    editingTaskDueDateId === task._id ? null : task._id
                                  );
                                  setExistingTaskDueDate(
                                    editingTaskDueDateId ? null : task.dueDate || null
                                  );
                                }}
                                className="w-auto px-1"
                              >
                                <CalendarIcon size={16} />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-52 text-sm">
                              <div className="flex flex-col space-y-1">
                                <p className="text-center">Select Due Date</p>
                                <div className="flex items-center justify-center space-x-1">
                                  <div className="flex flex-col justify-center text-center items-center space-y-2">
                                    <div className="flex justify-center items-center space-x-1">
                                      <CalendarDatePicker
                                        date={{
                                          from: existingTaskDueDate
                                            ? new Date(existingTaskDueDate)
                                            : new Date(),
                                          to: existingTaskDueDate
                                            ? new Date(existingTaskDueDate)
                                            : new Date(),
                                        }}
                                        onDateSelect={({ from }) => {
                                          setExistingTaskDueDate(from);
                                          updateTaskDueDate(task._id, from);
                                        }}
                                        variant="outline"
                                        numberOfMonths={1}
                                        className="min-w-[150px] border rounded-md ml-3 mt-2 justify-center items-center"
                                      />
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          setExistingTaskDueDate(null);
                                          updateTaskDueDate(task._id, null);
                                        }}
                                        className="px-2 py-1 mt-2"
                                      >
                                        <X size={16} />
                                      </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          setExistingTaskDueDate(new Date());
                                          updateTaskDueDate(task._id, new Date());
                                        }}
                                        className="px-2 py-1"
                                      >
                                        Today
                                      </Button>
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          const tomorrow = new Date();
                                          tomorrow.setDate(tomorrow.getDate() + 1);
                                          setExistingTaskDueDate(tomorrow);
                                          updateTaskDueDate(task._id, tomorrow);
                                        }}
                                        className="px-2 py-1"
                                      >
                                        Tomorrow
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Set due date</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => updateTaskStatus(task._id, 'IGNORED')}
                                aria-label="Ignore Task"
                                className="w-auto px-1"
                              >
                                <CircleMinus size={16} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Ignore</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to ignore this task? This action can be undone later.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => updateTaskStatus(task._id, 'IGNORED')}
                                >
                                  Ignore
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ignore task</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteTask(task._id)}
                                aria-label="Delete Task"
                                className="w-auto px-1"
                              >
                                <Trash size={16} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this task? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteTask(task._id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete task</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {editingTaskDescriptionId === task._id && (
                    <div className="mt-2">
                      <Textarea
                        placeholder="Update description..."
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        className="w-full resize-vertical"
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = `${target.scrollHeight}px`;
                        }}
                      />
                      <div className="flex flex-row gap-2 mt-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            updateTaskDescription(task._id, taskDescription);
                            setEditingTaskDescriptionId(null);
                            setTaskDescription('');
                          }}
                        >
                          <Save size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingTaskDescriptionId(null);
                            setTaskDescription('');
                          }}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1 mt-1">
                    {task.dueDate && (
                      <Badge
                        variant="outline"
                        className={
                          task.dueDate < new Date() && !isSameDay(task.dueDate, new Date())
                            ? 'bg-red-400 text-black'
                            : isSameDay(task.dueDate, new Date())
                            ? 'bg-yellow-200 text-black'
                            : 'bg-green-200 text-black'
                        }
                      >
                        <CalendarIcon size={12} className="mr-1" />
                        {isSameDay(task.dueDate, new Date()) ? 'Today' : isSameDay(task.dueDate, new Date(new Date().setDate(new Date().getDate() + 1))) ? 'Tomorrow' : format(task.dueDate, 'PPP')}
                      </Badge>
                    )}
                    {task.group && (
                      <Badge variant="secondary">
                        <Folder size={12} className="mr-1" />
                        {task.group}
                      </Badge>
                    )}
                    {task.tags?.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        <Tag size={12} className="mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No tasks yet. Add one to get started!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
  
