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
import { Task, Comment } from '@/interfaces';
import Layout from '@/components/layout';
import {
  Plus, Trash, Tag, Folder, PlusCircle, Edit, FileText, Save, X,
  CalendarClock, SquareCheck, Trash2, ChevronsUp, ChevronUp,
  ChevronDown, Flag, CalendarPlus, ArrowDownUp, CopyCheck,
  MinusCircle, Rocket, CircleMinus, Sparkles, XSquare, Filter, Search,
  AlertCircle, Clock, CheckCircle, Settings, Check, Crown, GripVertical,
  MessageCircle
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TaskInputPlaceholder from '@/components/task-input-placeholder';
import AiInputPlaceholder from '@/components/ai-input-placeholder';
import SearchInputPlaceholder from '@/components/search-input-placeholder';

const MAXIMUM_COMMENT_CHARS_LENGTH = 10000;

interface GeneratedTasksApprovalProps {
  tasks: Task[];
  onApprove: (task: Task) => void;
  onReject: (task: Task) => void;
  onApproveAll: () => void;
  onRejectAll: () => void;
}

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

const GeneratedTasksApproval: React.FC<GeneratedTasksApprovalProps> = ({ 
  tasks, 
  onApprove,
  onReject, 
  onApproveAll, 
  onRejectAll 
}) => {
  return (
    <Card className="mb-4 text-sm mt-4">
      <CardHeader className="p-2 text-center m-0">
        <CardTitle className="text-sm font-semibold">Generated Tasks</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <div className="text-sm">
          {tasks.map((task) => (
            <div key={task._id} className="flex items-center justify-between border-b">
              <span className="flex-grow text-sm">{task.title}</span>
              <div className="flex">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => onApprove(task)}
                        variant="ghost"
                        size="icon"
                        className="w-auto px-1.5"
                      >
                        <Plus size={16}/>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add task</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => onReject(task)}
                        variant="ghost"
                        size="icon"
                        className="w-auto px-1.5"
                      >
                        <X size={16}/>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reject task</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={onApproveAll} variant="ghost" size="icon">
                  <CopyCheck size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add all tasks</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={onRejectAll} variant="ghost" size="icon">
                  <XSquare size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reject all tasks</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}

const CurrentDateTime: React.FC = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-sm text-gray-500 flex justify-center items-center">
      {format(dateTime, 'PPPP')} - {format(dateTime, 'HH:mm:ss')}
    </div>
  );
};

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
  const [sortOptions, setSortOptions] = useState(() => {
    const savedSortOptions = typeof window !== 'undefined' ? localStorage.getItem('sortOptions') : null;
    return savedSortOptions ? JSON.parse(savedSortOptions) : {
      manualOrder: true,
      createdAt: false,
      priority: false,
      dueDate: false,
      group: false,
      title: false,
      focus: false,
    };
  });
  const [sortDirection, setSortDirection] = useState(() => {
    const savedSortDirection = typeof window !== 'undefined' ? localStorage.getItem('sortDirection') : null;
    return savedSortDirection ? JSON.parse(savedSortDirection) : {
      createdAt: 'desc',
      priority: 'desc',
      dueDate: 'desc',
      group: 'desc',
      title: 'desc',
      focus: 'desc',
    };
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
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isFetchLoading, setIsFetchLoading] = useState(false);
  const [priority, setPriority] = useState('');
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [isCurrentlyFocused, setIsCurrentlyFocused] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [generatedTasks, setGeneratedTasks] = useState<Task[]>([]);
  const [taskStats, setTaskStats] = useState({ completedToday: 0, dueToday: 0, overdue: 0 });
  const [currentFilter, setCurrentFilter] = useState<{ type: 'group' | 'tag' | null, value: string | null }>({ type: null, value: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [aiModel, setAiModel] = useState('llama-3.2-3b-instruct');
  const [userPlan, setUserPlan] = useState('');
  const [manualOrderingEnabled, setManualOrderingEnabled] = useState(true);
  const [activeSortOption, setActiveSortOption] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeSortOption') || 'manualOrder';
    }
    return 'manualOrder';
  });
  const [showResetConfirmDialog, setShowResetConfirmDialog] = useState(false);
  const [isAddingTaskInputFocused, setIsAddingTaskInputFocused] = useState(true);
  const [isAiInputFocused, setIsAiInputFocused] = useState(true);
  const [isSearchInputFocused, setIsSearchInputFocused] = useState(true);
  const [commentContent, setCommentContent] = useState<string>('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [taskComments, setTaskComments] = useState<Comment[]>([]);

  const { status } = useSession();
  const { toast } = useToast();

  const incompleteTasks = tasks.filter((task) => {
    const baseCondition = task.status !== 'COMPLETED' && !task.isDeleted && task.status !== 'IGNORED';
    const filterCondition = 
      currentFilter.type === null ? true :
      currentFilter.type === 'group' ? task.group === currentFilter.value :
      currentFilter.type === 'tag' ? task.tags?.includes(currentFilter.value as string) : true;
    const searchCondition = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return baseCondition && filterCondition && searchCondition;
  });

  const updateTaskStats = (updatedTask: Task, action: 'complete' | 'uncomplete' | 'duedate', previousDueDate: Date | null = null) => {
    setTaskStats((prevStats) => {
      const newStats = { ...prevStats };
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const updateDueDateStats = (date: Date | null, increment: boolean) => {
        if (date) {
          if (isSameDay(new Date(date), today)) {
            newStats.dueToday += increment ? 1 : -1;
          } else if (new Date(date) < today) {
            newStats.overdue += increment ? 1 : -1;
          }
        }
      };
  
      if (action === 'complete') {
        if (isSameDay(new Date(updatedTask.updatedAt), today)) {
          newStats.completedToday++;
        }
        updateDueDateStats(updatedTask.dueDate, false);
      } else if (action === 'uncomplete') {
        if (isSameDay(new Date(updatedTask.updatedAt), today)) {
          newStats.completedToday--;
        }
        updateDueDateStats(updatedTask.dueDate, true);
      } else if (action === 'duedate') {
        updateDueDateStats(previousDueDate, false);
        updateDueDateStats(updatedTask.dueDate, true);
      }
  
      return newStats;
    });
  };

  const handleGenerateTodoListsWithAI = async () => {
    if (!aiInput.trim()) return;
  
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ todolistsInput: aiInput, modelType: aiModel }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate tasks');
      }
  
      const data = await response.json();
      const generatedTasksData = data.tasks.map((title: string) => ({
        title,
        status: 'PENDING',
        isDeleted: false,
        isCurrentlyFocused: false,
        priority: '',
        dueDate: null,
        group: null,
        tags: [],
        description: '',
      }));
  
      setGeneratedTasks(generatedTasksData);
      setAiInput('');
      setShowAiInput(false);
    } catch (error) {
      console.error('Failed to generate tasks:', error);
      toast({
        title: 'Error',
        description: `${(error as Error).message}`,
        variant: 'destructive',
        duration: 3000,
      });
    }
    setIsLoading(false);
  };

  const handleApproveTask = async (taskTitle: string) => {
    const newTask = await addTaskFromGeneratedTasks(taskTitle);
    if (newTask) {
      setTasks(prevTasks => [...prevTasks, newTask]);
      setGeneratedTasks(prevTasks => prevTasks.filter(task => task.title !== taskTitle));
      toast({
        title: 'Task Approved',
        description: `Task "${taskTitle}" has been added.`,
        duration: 3000,
      });
    }
  };

  const handleRejectTask = (taskTitle: string) => {
    setGeneratedTasks(prevTasks => prevTasks.filter(task => task.title !== taskTitle));
    toast({
      title: 'Task Rejected',
      description: 'The task has been removed from the list.',
      duration: 3000,
    });
  };

  const handleApproveAllTasks = async () => {
    await bulkAddTasks(generatedTasks);
    setGeneratedTasks([]);
    toast({
      title: 'Success',
      description: 'All generated tasks have been approved and added.',
      duration: 3000,
    });
  };

  const handleRejectAllTasks = () => {
    setGeneratedTasks([]);
    toast({
      title: 'Rejected',
      description: 'All generated tasks have been rejected.',
      duration: 3000,
    });
  };

  const handleAddTask = (description: string) => {
    addTask(description, dueDate, priority);
    setNewTaskDescription('');
    setIsFileTextButtonClicked(false);
    setDueDate(null);
    setPriority('');
  };

  const sortTasks = (tasks: Task[]) => {
    if (sortOptions.manualOrder) {
      return tasks.sort((a, b) => a.order - b.order);
    }

    const sortedTasks = [...tasks];
    const priorityOrder = { High: 1, Medium: 2, Low: 3 };
  
    if (activeSortOption) {
      const direction = sortDirection[activeSortOption] === 'asc' ? 1 : -1;
  
      switch (activeSortOption) {
        case 'createdAt':
          sortedTasks.sort((a, b) =>
            direction * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          );
          break;
        case 'priority':
          sortedTasks.sort((a, b) => {
            const aPriority = a.priority ? priorityOrder[a.priority as keyof typeof priorityOrder] : null;
            const bPriority = b.priority ? priorityOrder[b.priority as keyof typeof priorityOrder] : null;
  
            if (aPriority !== null && bPriority === null) return -1;
            if (aPriority === null && bPriority !== null) return 1;
  
            if (aPriority !== null && bPriority !== null) {
              return direction * (aPriority - bPriority);
            }
  
            return 0;
          });
          break;
        case 'dueDate':
          sortedTasks.sort((a, b) => {
            const aDueDate = a.dueDate ? new Date(a.dueDate).getTime() : null;
            const bDueDate = b.dueDate ? new Date(b.dueDate).getTime() : null;
  
            if (aDueDate !== null && bDueDate === null) return -1;
            if (aDueDate === null && bDueDate !== null) return 1;
  
            if (aDueDate !== null && bDueDate !== null) {
              return direction * (aDueDate - bDueDate);
            }
  
            return 0;
          });
          break;
        case 'group':
          sortedTasks.sort((a, b) => {
            const aGroup = a.group ? a.group : null;
            const bGroup = b.group ? b.group : null;
  
            if (aGroup && !bGroup) return -1;
            if (!aGroup && bGroup) return 1;
  
            if (aGroup && bGroup) {
              return direction * aGroup.localeCompare(bGroup);
            }
  
            return 0;
          });
          break;
        case 'focus':
          sortedTasks.sort((a, b) => {
            if (a.isCurrentlyFocused && !b.isCurrentlyFocused) return -direction;
            if (!a.isCurrentlyFocused && b.isCurrentlyFocused) return direction;
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
  
    return sortedTasks;
  };

  const handleSortChange = (key: keyof typeof sortOptions) => {
    setSortOptions((prev: typeof sortOptions) => {
      const newSortOptions = Object.fromEntries(
        Object.keys(prev).map(k => [k, k === key])
      ) as typeof sortOptions;
      localStorage.setItem('sortOptions', JSON.stringify(newSortOptions));
      return newSortOptions;
    });
  
    setSortDirection((prev: Record<string, string>) => {
      const newSortDirection = {
        ...prev,
        [key]: prev[key as string] === 'asc' ? 'desc' : 'asc',
      };
      localStorage.setItem('sortDirection', JSON.stringify(newSortDirection));
      return newSortDirection;
    });
  
    setManualOrderingEnabled(key === 'manualOrder');
    setActiveSortOption(key as string);
    localStorage.setItem('activeSortOption', key as string);

    // Immediately apply manual ordering if selected
    if (key === 'manualOrder') {
      setTasks(prevTasks => {
        const sortedTasks = [...prevTasks].sort((a, b) => a.order - b.order);
        return sortedTasks;
      });
    } else {
      setTasks(prevTasks => {
        const sortedTasks = sortTasks(prevTasks);
        return sortedTasks ? sortedTasks : prevTasks;
      });
    }
  };  

  const handleFilterChange = (type: 'group' | 'tag' | null, value: string | null) => {
    const newFilter = { type, value };
    setCurrentFilter(newFilter);
    localStorage.setItem('currentFilter', JSON.stringify(newFilter));
    if (type !== null) {
      setManualOrderingEnabled(false);
    } else {
      setManualOrderingEnabled(true);
    }
  };

  const fetchTasksAndGroups = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks-groups');
      const data = await response.json();
      const fetchedTasks = data.tasks?.filter((task: Task) => !task.isDeleted && task.status !== 'COMPLETED') || [];
      
      // Check if manual ordering is disabled (i.e., sorting is active)
      if (!manualOrderingEnabled) {
        const sortedTasks = sortTasks(fetchedTasks);
        setTasks(sortedTasks || []);
      } else {
        // If manual ordering is enabled, sort by the saved order
        const sortedTasks = fetchedTasks.sort((a: Task, b: Task) => a.order - b.order);
        setTasks(sortedTasks || []);
      }
      
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

      toast({
        title: 'Group Created',
        description: `Group "${groupName}" has been created.`,
        duration: 3000,
      });
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
      toast({
        title: 'Group Deleted',
        description: `Group has been deleted.`,
        duration: 3000,
      });
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
      toast({
        title: 'Group Updated',
        description: `Group "name has been updated.`,
        duration: 3000,
      });
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

  const addTaskFromGeneratedTasks = async (taskTitle: string) => {
    if (taskTitle.trim()) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: taskTitle,
            tags: [],
            group: null,
            description: '',
            dueDate: null,
            priority: '',
            isCurrentlyFocused: false,
          }),
        });
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Failed to add task:', error);
        toast({
          title: 'Error',
          description: 'Failed to add task.',
          variant: 'destructive',
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    }
    return null;
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
          body: JSON.stringify({
            title: newTask,
            tags,
            group: selectedGroup,
            description,
            dueDate,
            priority,
            isCurrentlyFocused,
          }),
        });
        const data = await response.json();
  
        setTasks((prevTasks) => {
          if (!prevTasks) return [];
          const updatedTasks = [data, ...prevTasks];
          if (activeSortOption === 'manualOrder') {
            return updatedTasks.sort((a, b) => a.order - b.order);
          } else {
            const sortedTasks = sortTasks(updatedTasks);
            return sortedTasks ? sortedTasks : updatedTasks;
          }
        });

        updateTaskStats(data, 'duedate');
  
        setNewTask('');
        setTags([]);
  
        toast({
          title: 'New Task',
          description: 'A new task has been added.',
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

        return data;
      } catch (error) {
        console.error('Failed to add task:', error);
        toast({
          title: 'Error',
          description: 'Failed to add task.',
          variant: 'destructive',
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    }
    return null;
  };

  const bulkAddTasks = async (newTasks: Task[]) => {
    try {
      const response = await fetch('/api/tasks/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks: newTasks }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add tasks');
      }

      const { tasks: addedTasks } = await response.json();
      setTasks((prevTasks) => {
        const updatedTasks = [...prevTasks, ...addedTasks];
        sortTasks(updatedTasks);
        return updatedTasks;
      });
    } catch (error) {
      console.error('Failed to bulk add tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to bulk add tasks.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const undoAdd = async (taskId: string) => {
    setIsLoading(true);
    try {
      const taskToRemove = tasks.find(task => task._id === taskId);
      if (!taskToRemove) {
        throw new Error('Task not found');
      }
  
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
  
      // Revert the stats
      updateTaskStats(taskToRemove, 'duedate', taskToRemove.dueDate);
  
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

      updateTaskStats(updatedTask, updatedTask.status === 'COMPLETED' ? 'complete' : 'uncomplete');

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

      toast({
        title: 'Tasks Deleted',
        description: `${tasksToDelete.length} tasks have been deleted.`,
        duration: 5000,
        action: (
          <ToastAction altText="Undo" onClick={() => undoDeleteSelectedTasks(selectedTaskIds)}>
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
    setIsLoading(false);
  };

  const undoDeleteSelectedTasks = async (taskIds: string[]) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/bulk`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskIds, isDeleted: false }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to undo delete');
      }

      const selectedTasks = await response.json();

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          selectedTasks.updatedTasks.some((selectedTask: Task) => selectedTask._id === task._id)
            ? { ...task, isDeleted: false }
            : task
        )
      );

      toast({
        title: 'Undo Successful',
        description: `${selectedTasks.updatedTasks.length} tasks have been restored.`,
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

      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task) =>
          task._id === taskId ? { ...task, group: groupName ?? '' } : task
        );
        return sortTasks(updatedTasks) || updatedTasks;
      });

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

  const updateTaskCurrentlyFocused = async (taskId: string, isCurrentlyFocused: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isCurrentlyFocused }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update task');
      }
  
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task) =>
          task._id === taskId ? { ...task, isCurrentlyFocused } : task
        );
        return sortTasks(updatedTasks) || updatedTasks;
      });
  
      toast({
        title: 'Task Updated',
        description: `Task is ${isCurrentlyFocused ? 'now' : 'no longer'} marked as currently focused.`,
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

      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task) =>
          task._id === taskId ? { ...task, title: newTitle } : task
        );
        const sortedTasks = sortTasks(updatedTasks);
        return sortedTasks ? sortedTasks : updatedTasks;
      });

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

      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task) =>
          task._id === taskId ? { ...task, priority: newPriority } : task
        );
        const sortedTasks = sortTasks(updatedTasks);
        return sortedTasks ? sortedTasks : updatedTasks;
      });

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
      const taskToUpdate = tasks.find(task => task._id === taskId);
      if (!taskToUpdate) {
        throw new Error('Task not found');
      }
  
      const previousDueDate = taskToUpdate.dueDate;
  
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
  
      const { updatedTask } = await response.json();
  
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task) =>
          task._id === taskId ? { ...task, dueDate: newDueDate } : task
        );
        return sortTasks(updatedTasks) || updatedTasks;
      });
  
      updateTaskStats(updatedTask, 'duedate', previousDueDate);

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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ taskIds: selectedTaskIds, group: groupName }),
      });
      if (!response.ok) throw new Error('Failed to bulk assign group');
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task) =>
          selectedTaskIds.includes(task._id) ? { ...task, group: groupName } : task
        );
        return sortTasks(updatedTasks) || updatedTasks;
      });
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
      const tasksToUpdate = tasks.filter(task => selectedTaskIds.includes(task._id));
      const response = await fetch('/api/tasks/bulk', {
        method: 'PUT',
        body: JSON.stringify({ taskIds: selectedTaskIds, dueDate }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to bulk assign due date');
      
      const { updatedTasks } = await response.json();

      setTasks((prevTasks) => {
        const updatedTasksMap = new Map(updatedTasks.map((task: Task) => [task._id, task]));
        const newTasks = prevTasks.map((task) =>
          updatedTasksMap.has(task._id) ? updatedTasksMap.get(task._id) as Task : task
        );
        return sortTasks(newTasks as Task[]) || newTasks;
      });
  
      // Update stats for each updated task
      tasksToUpdate.forEach((task) => {
        const updatedTask = updatedTasks.find((t: Task) => t._id === task._id);
        if (updatedTask) {
          updateTaskStats(updatedTask, 'duedate', task.dueDate);
        }
      });
  
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
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task) =>
          selectedTaskIds.includes(task._id) ? { ...task, priority } : task
        );
        return sortTasks(updatedTasks) || updatedTasks;
      });
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
      const tasksToComplete = tasks.filter(task => selectedTaskIds.includes(task._id));
      const response = await fetch('/api/tasks/bulk', {
        method: 'PUT',
        body: JSON.stringify({ taskIds: selectedTaskIds, status: 'COMPLETED' }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to bulk complete tasks');
      
      const { updatedTasks } = await response.json();
  
      setTasks((prevTasks) => {
        const updatedTasksMap = new Map(updatedTasks.map((task: Task) => [task._id, task]));
        const newTasks = prevTasks.map((task) =>
          updatedTasksMap.has(task._id) ? updatedTasksMap.get(task._id)! : task
        );
        return sortTasks(newTasks as Task[]) || newTasks;
      });
  
      tasksToComplete.forEach((task) => {
        const updatedTask = updatedTasks.find((t: Task) => t._id === task._id);
        if (updatedTask) {
          updateTaskStats(updatedTask, 'complete');
        }
      });
  
      const completedTasks = selectedTaskIds.length;
  
      if (completedTasks === incompleteTasks.length) {
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
  
      // Adding undo option after completing tasks
      toast({
        title: 'Tasks Completed',
        description: `${completedTasks} tasks have been completed.`,
        action: (
          <ToastAction
            altText="Undo"
            onClick={() => undoTasksComplete(selectedTaskIds)}
          >
            Undo
          </ToastAction>
        ),
      });
  
      setSelectedTaskIds([]);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to complete tasks.',
        variant: 'destructive',
        duration: 3000,
      });
    }
    setIsLoading(false);
    setShowBulkActions(false);
  };

  const undoTasksComplete = async (taskIds: string[]) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskIds, status: 'PENDING' }),
      });

      if (!response.ok) {
        throw new Error('Failed to undo task completion');
      }

      const { updatedTasks } = await response.json();

      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          const updatedTask = updatedTasks.find((t: Task) => t._id === task._id);
          return updatedTask ? updatedTask : task;
        })
      );

      updatedTasks.forEach((task: Task) => {
        updateTaskStats(task, 'uncomplete');
      });

      toast({
        title: 'Undo Successful',
        description: 'Task completion has been undone.',
      });
    } catch (error) {
      console.error('Failed to undo task completion:', error);
    }
    setIsLoading(false);
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
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task) =>
          selectedTaskIds.includes(task._id) ? { ...task, status: 'IGNORED' } : task
        );
        const sortedTasks = sortTasks(updatedTasks);
        return sortedTasks ? sortedTasks : updatedTasks;
      });
      setSelectedTaskIds([]);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
    setShowBulkActions(false);
  };

  const bulkUpdateCurrentlyFocused = async (isCurrentlyFocused: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks/bulk', {
        method: 'PUT',
        body: JSON.stringify({ taskIds: selectedTaskIds, isCurrentlyFocused }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to bulk update currently working status');
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task) =>
          selectedTaskIds.includes(task._id) ? { ...task, isCurrentlyFocused } : task
        );
        const sortedTasks = sortTasks(updatedTasks);
        return sortedTasks ? sortedTasks : updatedTasks;
      });
      setSelectedTaskIds([]);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
    setShowBulkActions(false);
  };

  const fetchTaskStats = async () => {
    try {
      const response = await fetch('/api/tasks/stats', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch task statistics');
      }

      const data = await response.json();
      setTaskStats(data);
    } catch (error) {
      console.error('Failed to fetch task statistics:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch task statistics.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const fetchUserPlan = async () => {
    const response = await fetch('/api/user-plans', {
      method: 'GET',
    });
    const data = await response.json();
    setUserPlan(data.plan);
  };

  const updateTaskOrder = async (taskId: string, prevTaskId: string | undefined, nextTaskId: string | undefined) => {
    const response = await fetch(`/api/tasks/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskId, prevTaskId, nextTaskId }),
    });

    if (!response.ok) {
      toast({
        title: 'Error',
        description: 'Failed to update task order.',
        variant: 'destructive',
        duration: 3000,
      });
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update task order');
    }

    toast({
      title: 'Task Order Updated',
      description: 'The task order has been updated.',
      duration: 3000,
    });
  };

  const addComment = async (taskId: string, content: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, taskId }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add comment');
      }
      const responseData = await response.json();
      setCommentContent('');
      setTaskComments((prevComments) => [...prevComments,
        { 
          _id: responseData.id, 
          content, 
          taskId: responseData.taskId, 
          userId: responseData.userId, 
          isDeleted: responseData.isDeleted, 
          createdAt: responseData.createdAt, 
          updatedAt: responseData.updatedAt 
        }
      ]);
      toast({
        title: 'Comment Added',
        description: 'Your comment has been added successfully.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast({
        title: 'Error',
        description: `${error instanceof Error ? error.message : 'Failed to add comment.'}`,
        variant: 'destructive',
        duration: 3000,
      });
    }
    setIsLoading(false);
  };
  
  const updateComment = async (taskId: string, commentId: string, content: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, taskId, commentId }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update comment');
      }

      setEditingCommentId(null);
      setTaskComments((prevComments) => prevComments.map((comment) => comment._id === commentId ? { ...comment, content } : comment));
      toast({
        title: 'Comment Updated',
        description: 'Your comment has been updated successfully.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to update comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update comment.',
        variant: 'destructive',
        duration: 3000,
      });
    }
    setIsLoading(false);
  };
  
  const deleteComment = async (taskId: string, commentId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/comments/${commentId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      setTaskComments((prevComments) => prevComments.filter((comment) => comment._id !== commentId));

      toast({
        title: 'Comment Deleted',
        description: 'Your comment has been deleted successfully.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete comment.',
        variant: 'destructive',
        duration: 3000,
      });
    }
    setIsLoading(false);
  };

  const getCommentsForTask = async (taskId: string) => {
    setIsLoading(true);
    try { 
      const response = await fetch(`/api/tasks/comments?taskId=${taskId}`);
      const data = await response.json();
      setTaskComments(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch comments.',
        variant: 'destructive',
        duration: 3000,
      });
    }
    setIsLoading(false);
  };

  
  const handleCommentDialogOpen = async (taskId: string) => {
    setIsLoading(true);
    try {
      await getCommentsForTask(taskId);
      setActiveTaskId(taskId);
      setShowCommentDialog(true);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch comments.',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }

    if (!manualOrderingEnabled) {
      setShowResetConfirmDialog(true);
      return;
    }

    await applyDragResult(result);
  };

  const applyDragResult = async (result: DropResult) => {
    const items = Array.from(incompleteTasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination!.index, 0, reorderedItem);

    setTasks(items);

    try {
      await updateTaskOrder(
        result.draggableId,
        items[result.destination!.index - 1]?._id,
        items[result.destination!.index + 1]?._id
      );
    } catch (error) {
      console.error('Failed to update task order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task order.',
        variant: 'destructive',
        duration: 3000,
      });
      // Revert the change if the API call fails
      setTasks(incompleteTasks);
    }
  };

  const handleResetConfirm = () => {
    setSortOptions({ manualOrder: true, createdAt: false, priority: false, dueDate: false, group: false, title: false, focus: false });
    setCurrentFilter({ type: null, value: null });
    setManualOrderingEnabled(true);
    setShowResetConfirmDialog(false);
    setTasks((prevTasks) => {
      return [...prevTasks].sort((a, b) => a.order - b.order);
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (status === 'authenticated') {
        setIsFetchLoading(true);
        try {
          await Promise.all([fetchTasksAndGroups(), fetchTaskStats(), fetchUserPlan()]);
          setTasks((prevTasks) => {
            if (activeSortOption === 'manualOrder') {
              return prevTasks.sort((a, b) => a.order - b.order);
            } else {
              const sortedTasks = sortTasks(prevTasks);
              return sortedTasks ? sortedTasks : prevTasks;
            }
          });
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setIsFetchLoading(false);
        }
      }
    };

    fetchData();
  }, [status, activeSortOption]);

  useEffect(() => {
    setTasks((prevTasks) => {
      const sortedTasks = sortTasks(prevTasks);
      return sortedTasks ? sortedTasks : prevTasks;
    });
  }, [sortOptions]);

  useEffect(() => {
    // Load saved states from localStorage
    const savedSortOptions = localStorage.getItem('sortOptions');
    const savedSortDirection = localStorage.getItem('sortDirection');
    const savedFilter = localStorage.getItem('currentFilter');
    const savedManualOrdering = localStorage.getItem('manualOrderingEnabled');
  
    if (savedSortOptions) {
      setSortOptions(JSON.parse(savedSortOptions));
    }
    if (savedSortDirection) {
      setSortDirection(JSON.parse(savedSortDirection));
    }
    if (savedFilter) {
      setCurrentFilter(JSON.parse(savedFilter));
    }
    if (savedManualOrdering !== null) {
      setManualOrderingEnabled(JSON.parse(savedManualOrdering));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sortOptions', JSON.stringify(sortOptions));
    localStorage.setItem('sortDirection', JSON.stringify(sortDirection));
    localStorage.setItem('currentFilter', JSON.stringify(currentFilter));
    localStorage.setItem('manualOrderingEnabled', JSON.stringify(manualOrderingEnabled));
  }, [sortOptions, sortDirection, currentFilter, manualOrderingEnabled]);

  if (status === 'loading' || isFetchLoading || isLoading) {
    return (
      <div className="py-16 flex justify-center items-start min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-t-transparent dark:border-t-black border-black dark:border-white rounded-full mt-6"/>
      </div>
    );
  }

  return (
    <Layout>
      <Card className="max-w-4xl mx-auto border-none shadow-none">
        <CardHeader className="mb-2 pt-0 pb-0">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-2xl">To-Do Lists</CardTitle>
              {(userPlan === "PRO_YEARLY" || userPlan === "PRO_MONTHLY") && (
                <Badge className="ml-2">
                  <div className="flex justify-center items-center text-xs">
                    <Crown size={16} className="mr-1" />
                    PRO
                  </div>
                </Badge>
              )}
            </div>
            <CurrentDateTime />
            <div className="flex items-center space-x-3 text-sm">
              {taskStats.completedToday > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-1 cursor-pointer">
                        <CheckCircle size={16} className="text-green-400" />
                        <span>{taskStats.completedToday}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Completed today</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {taskStats.dueToday > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-1 cursor-pointer">
                        <Clock size={16} className="text-yellow-400" />
                        <span>{taskStats.dueToday}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Due today</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {taskStats.overdue > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-1 cursor-pointer">
                        <AlertCircle size={16} className="text-red-500" />
                        <span>{taskStats.overdue}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Overdue</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="flex justify-between items-center space-x-1">
              <div className="flex items-center space-x-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => setShowAiInput(!showAiInput)}
                        aria-label="Show AI Input"
                        variant="ghost"
                        size="icon"
                      >
                        <Sparkles size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Use AI to generate tasks</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => setShowSearch(!showSearch)}
                        aria-label="Search Tasks"
                        variant="ghost"
                        size="icon"
                      >
                        <Search size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Search tasks</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Popover open={showFilter} onOpenChange={setShowFilter}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Filter Tasks"
                            >
                              <Filter size={16} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48">
                            <div className="space-y-2 text-sm">
                              <p>Filter by Group or Tag</p>
                              <Button 
                                variant={currentFilter.type === null ? "secondary" : "outline"} 
                                onClick={() => handleFilterChange(null, null)}
                                className="w-full justify-start text-sm"
                              >
                                All tasks
                              </Button>
                              {groups.map(group => (
                                <Button
                                  key={group._id}
                                  variant={currentFilter.type === 'group' && currentFilter.value === group.name ? "secondary" : "outline"}
                                  onClick={() => handleFilterChange('group', group.name)}
                                  className="w-full justify-start text-sm"
                                >
                                  <Folder className="mr-2" size={16} />{group.name}
                                </Button>
                              ))}
                              {Array.from(new Set(tasks.flatMap(task => task.tags || []))).map(tag => (
                                <Button
                                  key={tag}
                                  variant={currentFilter.type === 'tag' && currentFilter.value === tag ? "secondary" : "outline"}
                                  onClick={() => handleFilterChange('tag', tag)}
                                  className="w-full justify-start"
                                >
                                  <Tag className="mr-2" size={16} />{tag}
                                </Button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Filter tasks</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
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
                          <PopoverContent className="w-48 p-2">
                            <p className="mb-2 text-sm">Sort By</p>
                            <div className="space-y-2">
                              {Object.entries(sortOptions).map(([key, isActive]) => (
                                <div key={key} className="flex items-center space-x-2">
                                  <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    size="icon"
                                    className="w-full justify-start"
                                    onClick={() => handleSortChange(key as keyof typeof sortOptions)}
                                  >
                                    <div className="flex items-center space-x-2 p-1">
                                      {isActive ? <Check size={16} /> : null}
                                      {key !== 'manualOrder' && (
                                        (key === 'dueDate' || key === 'priority' || key === 'focus')
                                          ? (sortDirection[key as keyof typeof sortDirection] === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)
                                          : (sortDirection[key as keyof typeof sortDirection] === 'asc' ? <ChevronDown size={16} /> : <ChevronUp size={16} />)
                                      )}
                                      {key === 'manualOrder' && <GripVertical size={16} />}
                                      {key === 'createdAt' && <CalendarPlus size={16} />}
                                      {key === 'priority' && <Flag size={16} />}
                                      {key === 'dueDate' && <CalendarClock size={16} />}
                                      {key === 'group' && <Folder size={16} />}
                                      {key === 'title' && <FileText size={16} />}
                                      {key === 'focus' && <Rocket size={16} />}
                                      <span className="text-sm">
                                        {key === 'manualOrder' && 'Manual Order'}
                                        {key === 'createdAt' && 'Created Date'}
                                        {key === 'priority' && 'Priority'}
                                        {key === 'dueDate' && 'Due Date'}
                                        {key === 'group' && 'Group'}
                                        {key === 'title' && 'Title'}
                                        {key === 'focus' && 'Focus'}
                                      </span>
                                    </div>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
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
          </div>
        </CardHeader>
        <CardContent>
          {showSearch && (
            <div className="flex flex-col w-full mb-2">
              { isSearchInputFocused ? (
              <Input
                type="text"
                placeholder="Search tasks by task title and description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onBlur={() => setIsSearchInputFocused(false)}
                className="w-full flex-1 text-sm"
                autoFocus
              />
              ) : (
                <SearchInputPlaceholder onClick={() => setIsSearchInputFocused(true)} />
              )}
            </div>
          )}
          <div className="flex flex-col gap-0 mb-2">
            <div className={`flex flex-row items-center justify-start ${showAiInput ? 'gap-2' : ''}`}>
              {showAiInput && (
                <>
                  <div className="flex flex-col w-full">
                    { isAiInputFocused || aiInput.trim() ? (
                      <Input
                        placeholder="Input your prompt here"
                        className="w-full shadow-none border-none flex-1 text-sm"
                        type="text"
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleGenerateTodoListsWithAI();
                          }
                        }}
                        onBlur={() => setIsAiInputFocused(false)}
                        aria-label="AI Input"
                        autoFocus
                      />
                    ) : (
                      <AiInputPlaceholder onClick={() => setIsAiInputFocused(true)} />
                    )}
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="AI Model Settings"
                              >
                                <Settings size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>
                                      <DropdownMenuItem 
                                        onClick={() => setAiModel("llama-3.2-3b-instruct")}
                                        className="flex items-center justify-start cursor-pointer"
                                      >
                                        {aiModel === "llama-3.2-3b-instruct" && <Check className="h-4 w-4 mr-2" />}
                                        Llama 3.2 3B Instruct
                                      </DropdownMenuItem>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="w-80">
                                    <p>
                                      The Llama 3.2 instruction-tuned text only models are optimized
                                      for multilingual dialogue use cases, including agentic retrieval and summarization tasks.
                                      Free to use.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>
                                      <DropdownMenuItem 
                                        onClick={() => setAiModel("gpt-4o")}
                                        disabled={userPlan === "FREE"}
                                        className={`flex items-center justify-start ${userPlan === "FREE" ? "cursor-not-allowed pointer-events-none" : "cursor-pointer"}`}
                                      >
                                        {aiModel === "gpt-4o" && <Check className="h-4 w-4 mr-2" />}
                                        GPT-4o
                                      </DropdownMenuItem>
                                    </div>
                                  </TooltipTrigger>
                                    <TooltipContent className="w-80">
                                      <p>
                                        The GPT-4o model is a version of GPT-4 optimized for performance in various generative tasks.
                                        It is designed to excel in tasks like text generation, summarization, and language understanding across multiple languages.
                                      </p>
                                      {userPlan === "FREE" && (
                                      <p className="text-red-500 mt-2">
                                        Subscribe to the Pro plan to use this model.
                                      </p>)}
                                    </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>AI Model Settings</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleGenerateTodoListsWithAI}
                          disabled={!aiInput.trim() || isLoading}
                          variant="ghost"
                          size="icon"
                          className="w-auto px-1.5"
                        >
                          {isLoading ? (
                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <Sparkles size={16} />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Generate tasks using AI</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
            </div>
            {generatedTasks.length > 0 && (
              <GeneratedTasksApproval
                tasks={generatedTasks}
                onApprove={(task) => handleApproveTask(task.title)}
                onReject={(task) => handleRejectTask(task.title)}
                onApproveAll={handleApproveAllTasks}
                onRejectAll={handleRejectAllTasks}
              />
            )}
            
            <div className={`flex flex-row gap-2 ${isFileTextButtonClicked ? 'items-start justify-start' : 'items-center justify-center'}`}>
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center space-x-2 relative group">
                  { isAddingTaskInputFocused || newTask.trim() ? (
                    <Input
                      placeholder="Input your task here"
                      className="shadow-none border-none flex-1"
                      type="text"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTask(newTaskDescription);
                      }
                    }}
                    onBlur={() => setIsAddingTaskInputFocused(false)}
                    aria-label="New Task"
                    autoFocus
                  />
                ) : (
                  <TaskInputPlaceholder onClick={() => setIsAddingTaskInputFocused(true)} />
                )}
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsCurrentlyFocused(!isCurrentlyFocused)}
                          aria-label="Toggle Currently Focused"
                          className={`w-auto px-1.5 ${isCurrentlyFocused ? 'bg-blue-400 text-black hover:bg-blue-300 dark:text-black' : 'hover:bg-blue-300 hover:text-black dark:hover:bg-blue-300 dark:hover:text-black'}`}
                        >
                          <Rocket size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        { isCurrentlyFocused ? <p>Remove focus</p> : <p>Let&apos;s focus</p> }
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
                              <CalendarClock size={16} />
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
                        <Popover open={showPriorityDropdown} onOpenChange={setShowPriorityDropdown}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              aria-label="priority"
                              size="icon"
                              onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                              className="w-auto px-1.5"
                            >
                              {priority === 'High' && <ChevronsUp size={16} className="text-red-500" />}
                              {priority === 'Medium' && <ChevronUp size={16} />}
                              {priority === 'Low' && <ChevronDown size={16} />}
                              {!priority && <Flag size={16} />}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-40 text-sm">
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
                                placeholder="Use space, enter or comma to add tag"
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
                </div>

                <div className="flex items-center justify-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          onClick={() => handleAddTask(newTaskDescription)}
                          aria-label="Add Task"
                          variant="ghost"
                          size="icon"
                          disabled={!newTask.trim()}
                          className="w-auto px-1"
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
              </div>

              {isFileTextButtonClicked && (
                <Textarea
                  placeholder="Add task description here"
                  className="w-full shadow-none resize-vertical text-sm"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  aria-label="New Task Description"
                  rows={1}
                  style={{ minHeight: '4rem', overflow: 'hidden' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                  autoFocus
                />
              )}
            </div>
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
                        : isSameDay(new Date(dueDate), new Date(new Date().setDate(new Date().getDate() + 1)))
                        ? 'bg-orange-200 text-black'
                        : ''
                    }
                  >
                    <CalendarClock size={12} className="mr-1" />
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
                          <Button onClick={() => {}} aria-label="Mark as Completed" variant="ghost" size="icon" disabled={selectedTaskIds.length === 0}>
                            <SquareCheck size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Completion</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to mark {selectedTaskIds.length} task(s) as completed?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={bulkMarkAsCompleted}>
                              Complete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Mark selected tasks as completed</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Set Focus Status"
                            disabled={selectedTaskIds.length === 0}
                            className="w-auto px-1.5"
                          >
                            <Rocket size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => bulkUpdateCurrentlyFocused(true)} className="cursor-pointer">
                            Set as Focused
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => bulkUpdateCurrentlyFocused(false)} className="cursor-pointer">
                            Remove Focus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Set focus status</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button aria-label="Bulk Assign Due Date" variant="ghost" size="icon" disabled={selectedTaskIds.length === 0}>
                            <CalendarClock size={16} />
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
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button onClick={() => {}} aria-label="Mark as Ignored" variant="ghost" size="icon" disabled={selectedTaskIds.length === 0}>
                            <MinusCircle size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Ignore</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to ignore {selectedTaskIds.length} selected task(s)? This action can be undone later.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={bulkMarkAsIgnored}>
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
                              {`Are you sure you want to delete ${selectedTaskIds.length} selected task(s)?`}
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
              </div>
            </div>
          )}
  
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {incompleteTasks.length > 0 ? (
                    incompleteTasks.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`rounded-md text-sm ${
                              snapshot.isDragging ? 'bg-gray-100 dark:bg-gray-800' : ''
                            } group relative`}
                          >
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    {...provided.dragHandleProps}
                                    className={`absolute left-0 top-0 bottom-0 mb-1 w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 ${
                                      manualOrderingEnabled ? '' : 'cursor-not-allowed'
                                    } transition-opacity -ml-8`}
                                  >
                                    <GripVertical size={16} className="text-gray-400" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {manualOrderingEnabled 
                                    ? "Drag to reorder"
                                    : "Sort with manual ordering and clear the filter first"}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
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

                              {task.isCurrentlyFocused && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => updateTaskCurrentlyFocused(task._id, false)}
                                        aria-label="Currently Focused"
                                        className="w-auto px-1 bg-blue-400 dark:bg-blue-400 dark:text-black hover:bg-blue-300 hover:dark:bg-blue-300"
                                      >
                                        <Rocket size={16} />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Remove focus</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}

                              {task.priority && task.priority !== '' && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button variant="ghost" size="icon" className="w-auto px-1">
                                            {task.priority === 'High' && <ChevronsUp size={16} className="text-red-500" />}
                                            {task.priority === 'Medium' && <ChevronUp size={16} />}
                                            {task.priority === 'Low' && <ChevronDown size={16} />}
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
                              )}

                              <div className="flex flex-col gap-1 w-full">
                                {editingTaskTitleId === task._id ? (
                                  <div className="flex items-center gap-1 w-[530px]">
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

                              <div className="flex items-center relative group">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-auto px-1 transition-opacity duration-300 group-hover:opacity-0"
                                  aria-label="Edit Task"
                                >
                                  <Edit size={16} />
                                </Button>
                                <div className="absolute right-0 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  {!task.isCurrentlyFocused && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => updateTaskCurrentlyFocused(task._id, !task.isCurrentlyFocused)}
                                            aria-label="Toggle Currently Focused"
                                            className="w-auto px-1.5"
                                          >
                                            <Rocket size={16} />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Let&apos;s focus</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                  {!task.dueDate && (
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
                                                <CalendarClock size={16} />
                                              </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-52 text-sm">
                                              <div className="flex flex-col space-y-1">
                                                <p className="">Select Due Date</p>
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
                                                          updateTaskDueDate(task._id, from);
                                                        }}
                                                        variant="outline"
                                                        numberOfMonths={1}
                                                        className="min-w-[150px] border rounded-md ml-3 mt-2 justify-center items-center"
                                                      />
                                                      <Button
                                                        variant="outline"
                                                        onClick={() => {
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
                                  )}
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
                                          className="w-auto px-1"
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
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleCommentDialogOpen(task._id)}
                                          className="w-auto px-1"
                                        >
                                          <MessageCircle size={16} />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Manage comments</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  {!task.group && (
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
                                  )}
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
                                              <div className="font-medium">Edit tags</div>
                                              <InputTags
                                                type="text"
                                                value={editingTaskTags}
                                                onChange={(value) => setEditingTaskTags(value as string[])}
                                                placeholder="Use space, enter or comma to add tag"
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
                                                  disabled={JSON.stringify(editingTaskTags) === JSON.stringify(task.tags)}
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
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <AlertDialog>
                                      <TooltipTrigger asChild>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label="Ignore Task"
                                            className="w-auto px-1"
                                          >
                                            <CircleMinus size={16} />
                                          </Button>
                                        </AlertDialogTrigger>
                                      </TooltipTrigger>
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
                                              Are you sure you want to delete this task?.
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
                                <div className="flex justify-end items-center gap-2 mt-1">
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
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <div>
                                      <Badge
                                        variant="outline"
                                        className={`
                                          ${new Date(task.dueDate) < new Date() && !isSameDay(new Date(task.dueDate), new Date())
                                            ? 'bg-red-400 text-black'
                                            : isSameDay(new Date(task.dueDate), new Date())
                                            ? 'bg-yellow-200 text-black'
                                            : isSameDay(new Date(task.dueDate), new Date(new Date().setDate(new Date().getDate() + 1)))
                                            ? 'bg-orange-200 text-black'
                                            : ''
                                          } cursor-pointer hover:bg-opacity-80 transition-colors
                                        `}
                                      >
                                        <CalendarClock size={12} className="mr-1" />
                                        {isSameDay(new Date(task.dueDate), new Date())
                                          ? 'Today'
                                          : isSameDay(new Date(task.dueDate), new Date(new Date().setDate(new Date().getDate() + 1)))
                                          ? 'Tomorrow'
                                          : format(new Date(task.dueDate), 'PPP')}
                                      </Badge>
                                    </div>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-52 text-sm">
                                    <div className="flex flex-col space-y-1">
                                      <p className="">Select Due Date</p>
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
                                                updateTaskDueDate(task._id, from);
                                              }}
                                              variant="outline"
                                              numberOfMonths={1}
                                              className="min-w-[150px] border rounded-md ml-3 mt-2 justify-center items-center"
                                            />
                                            <Button
                                              variant="outline"
                                              onClick={() => {
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
                              )}
                              {task.group && (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <div>
                                      <Badge variant="secondary" className="cursor-pointer hover:bg-opacity-80 transition-colors">
                                        <Folder size={12} className="mr-1" />
                                        {task.group}
                                      </Badge>
                                    </div>
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
                              )}
                              {task.tags?.map((tag, index) => (
                                <Badge key={index} variant="outline" className="flex items-center">
                                  <Tag size={12} className="mr-1" />
                                  {tag}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 p-0 ml-1"
                                    onClick={() => {
                                      const newTags = task.tags?.filter((t) => t !== tag);
                                      updateTaskTags(task._id, newTags || []);
                                    }}
                                  >
                                    <X size={12} />
                                  </Button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center text-sm">No task yet.</p>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <Dialog open={showResetConfirmDialog} onOpenChange={setShowResetConfirmDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Task Ordering Requirement</DialogTitle>
                <DialogDescription>
                  To re-order tasks, you need to reset the filtering and sorting options first. Once resetted, you can re-order tasks.
                  Do you want to reset the filtering and sorting options?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowResetConfirmDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleResetConfirm}>Yes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto text-sm">
          <DialogHeader>
            <DialogTitle>Task Comments</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {activeTaskId && taskComments.length > 0 &&
              taskComments.map((comment: Comment) => (
                  <div key={comment._id} className="flex items-start space-x-2">
                    <div className="flex-grow">
                      {editingCommentId === comment._id ? (
                        <Textarea
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          className="w-full"
                        />
                      ) : (
                        <>
                          <p>{comment.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                          Created: {format(new Date(comment.createdAt), 'PPp')}
                          {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                            <> • Updated: {format(new Date(comment.updatedAt), 'PPp')}</>
                          )}
                        </p>
                      </>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      {editingCommentId === comment._id ? (
                        <>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    updateComment(activeTaskId, comment._id, commentContent);
                                    setEditingCommentId(null);
                                    setCommentContent('');
                                  }}
                                >
                                  <Save size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Save</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingCommentId(null);
                                    setCommentContent('');
                                  }}
                                >
                                  <X size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Cancel</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </>
                      ) : (
                        <>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingCommentId(comment._id);
                                    setCommentContent(comment.content);
                                  }}
                                >
                                  <Edit size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteComment(activeTaskId, comment._id)}
                                >
                                  <Trash size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </>
                      )}
                    </div>
                  </div>
                ))}
          </div>
          { !editingCommentId && (
          <div className="mt-4">
            <Textarea
              placeholder="Add a comment..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="w-full min-h-[150px]"
            />
            {commentContent.length > MAXIMUM_COMMENT_CHARS_LENGTH && (
              <p className="text-sm">Maximum character limit exceeded. {commentContent.length} / {MAXIMUM_COMMENT_CHARS_LENGTH}</p>
            )}
          </div>
          )}
          <DialogFooter className="sticky bottom-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      onClick={() => {
                        if (activeTaskId && commentContent.length <= MAXIMUM_COMMENT_CHARS_LENGTH) {
                          addComment(activeTaskId, commentContent);
                          setCommentContent('');
                        }
                      }}
                      disabled={!commentContent.trim() || commentContent.length > MAXIMUM_COMMENT_CHARS_LENGTH}
                      size="icon"
                    >
                      <MessageCircle size={16} />
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="mr-2">
                  <p>Add Comment</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
