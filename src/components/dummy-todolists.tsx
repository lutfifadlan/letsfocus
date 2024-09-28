import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Task } from '@/interfaces';
import {
  Plus,
  Check,
  Trash,
  Tag,
  Folder,
  PlusCircle,
  Edit,
  FileText,
  Save,
  X,
  CalendarIcon,
  Rocket,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { InputTags } from '@/components/ui/input-tags';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDatePicker } from '@/components/calendar-date-picker';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import confetti from 'canvas-confetti';

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

const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

const userId = generateId();
const defaultTasks: Task[] = [
  {
    _id: generateId(),
    title: 'Click the check button on the task to mark task as completed',
    tags: ['welcome'],
    group: 'Getting Started',
    description: '',
    dueDate: new Date(), // due date as today
    status: 'PENDING',
    isDeleted: false,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: null,
    deletedAt: null,
  },
  {
    _id: generateId(),
    title: "Try out Let's Focus",
    tags: ['welcome'],
    group: 'Getting Started',
    description: '',
    dueDate: new Date(), // due date as today
    status: 'PENDING',
    isDeleted: false,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: null,
    deletedAt: null,
  },
];

// Default groups
const defaultGroups = [
  {
    _id: generateId(),
    name: 'Getting Started',
  },
];

export default function DummyTodolists() {
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

  // Initialize tasks and groups with default values
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [newTask, setNewTask] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [groups, setGroups] = useState<{ _id: string; name: string }[]>(defaultGroups);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [isGroupPopoverOpen, setIsGroupPopoverOpen] = useState(false);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [editingTaskDescriptionId, setEditingTaskDescriptionId] = useState<
    string | null
  >(null);
  const [editingTaskTitleId, setEditingTaskTitleId] = useState<string | null>(
    null
  );
  const [taskDescription, setTaskDescription] = useState<string>('');
  const [isFileTextButtonClicked, setIsFileTextButtonClicked] = useState(false);
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [isCalendarPickerOpen, setIsCalendarPickerOpen] = useState(false);
  const [existingTaskDueDate, setExistingTaskDueDate] = useState<Date | null>(
    null
  );
  const [editingTaskDueDateId, setEditingTaskDueDateId] = useState<
    string | null
  >(null);
  const [editingTaskTagsId, setEditingTaskTagsId] = useState<string | null>(
    null
  );
  const [editingTaskTags, setEditingTaskTags] = useState<string[]>([]);

  const { toast } = useToast();
  const incompleteTasks = tasks.filter(
    (task) => task.status !== 'COMPLETED' && !task.isDeleted
  );

  const handleAddTask = (description: string) => {
    addTask(description, dueDate);
    setNewTaskDescription('');
    setIsFileTextButtonClicked(false);
    setDueDate(null);
  };

  const createGroup = (groupName: string) => {
    setIsLoading(true);
    try {
      const newGroup = {
        _id: generateId(),
        name: groupName,
      };
      setGroups((prev) => {
        const updatedGroups = [...prev, newGroup];
        return updatedGroups;
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

  const deleteGroup = (groupId: string) => {
    setIsLoading(true);
    try {
      setGroups((prev) => {
        const updatedGroups = prev.filter((group) => group._id !== groupId);
        return updatedGroups;
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

  const updateGroup = (groupId: string, newName: string) => {
    setIsLoading(true);
    try {
      setGroups((prev) => {
        const updatedGroups = prev.map((group) =>
          group._id === groupId ? { ...group, name: newName } : group
        );
        return updatedGroups;
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

  const addTask = (description: string, dueDate: Date | null) => {
    if (newTask.trim()) {
      setIsLoading(true);
      try {
        const newTaskObj: Task = {
          _id: generateId(),
          title: newTask,
          tags: tags,
          group: selectedGroup || '',
          description: description,
          dueDate: dueDate,
          status: 'PENDING',
          isDeleted: false,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          completedAt: null,
          deletedAt: null,
        };
        setTasks((prevTasks) => [...prevTasks, newTaskObj]);
        setNewTask('');
        setTags([]);

        toast({
          title: 'Task Added',
          description: `Task "${newTaskObj.title}" has been added.`,
          action: (
            <ToastAction
              altText="Undo"
              onClick={() => {
                undoAdd(newTaskObj._id);
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

  const undoAdd = (taskId: string) => {
    setIsLoading(true);
    try {
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

  const toggleTaskCompletion = (taskId: string) => {
    setIsLoading(true);
    const taskIndex = tasks.findIndex((task) => task._id === taskId);
    if (taskIndex === -1) return;

    const updatedTask = {
      ...tasks[taskIndex],
      status:
        tasks[taskIndex].status === 'COMPLETED' ? 'PENDING' : 'COMPLETED',
    };

    setTasks((prevTasks) => {
      const newTasks = [...prevTasks];
      newTasks[taskIndex] = updatedTask;
      return newTasks;
    });

    if (updatedTask.status === 'COMPLETED') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    toast({
      title:
        updatedTask.status === 'COMPLETED'
          ? 'Task Completed'
          : 'Task Uncompleted',
      description: `Task "${updatedTask.title}" has been ${
        updatedTask.status === 'COMPLETED' ? 'completed' : 'marked as incomplete'
      }`,
      duration: 3000,
    });
    setIsLoading(false);
  };

  const deleteTask = (taskId: string) => {
    setIsLoading(true);
    const taskToDelete = tasks.find((task) => task._id === taskId);
    if (!taskToDelete) return;

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === taskId ? { ...task, isDeleted: true } : task
      )
    );

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
    setIsLoading(false);
  };

  const undoDelete = (taskId: string) => {
    setIsLoading(true);
    try {
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

  const updateTaskGroup = (taskId: string, groupName: string | null) => {
    setIsLoading(true);
    try {
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
      console.error('Failed to update task group', error);
      toast({
        title: 'Error',
        description: 'Failed to update task group.',
        variant: 'destructive',
        duration: 3000,
      });
    }
    setIsLoading(false);
  };

  const updateTaskTags = (taskId: string, newTags: string[]) => {
    setIsLoading(true);
    try {
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

  const updateTaskTitle = (taskId: string, newTitle: string) => {
    setIsLoading(true);
    try {
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

  const updateTaskDescription = (taskId: string, newDescription: string) => {
    try {
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

  const updateTaskDueDate = (taskId: string, newDueDate: Date | null) => {
    setIsLoading(true);
    try {
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

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center items-center h-full">
        <div className="animate-spin h-8 w-8 border-4 border-t-transparent dark:border-t-black border-black dark:border-white rounded-full"></div>
      </div>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-center text-2xl">To-Do Lists</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 mb-2">
          <div
            className={`flex flex-row gap-2 ${
              isFileTextButtonClicked
                ? 'items-start justify-start'
                : 'items-center justify-center'
            }`}
          >
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
                placeholder="Task name"
                className="w-full shadow-none text-sm flex-1"
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTask(newTaskDescription);
                  }
                }}
                aria-label="New Task"
                autoFocus // Enable auto-focus
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
                />
              )}
            </div>
            <Button
              onClick={() =>
                setIsFileTextButtonClicked(!isFileTextButtonClicked)
              }
              aria-label="Add Description"
              variant="ghost"
              size="icon"
            >
              <FileText size={16} />
            </Button>
            <Popover
              open={isGroupPopoverOpen}
              onOpenChange={setIsGroupPopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button aria-label="Select Group" variant="ghost" size="icon">
                  <Folder size={16} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2 text-sm">
                  <p>Select or create a group</p>
                  <Button
                    variant={selectedGroup === null ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => setSelectedGroup(null)}
                  >
                    No Group
                  </Button>
                  {groups.map((group) => (
                    <div
                      key={group._id}
                      className="flex items-center justify-between text-sm"
                    >
                      {editingGroup === group.name ? (
                        <Input
                          type="text"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          onBlur={() => {
                            if (
                              newGroupName.trim() &&
                              newGroupName !== group.name
                            ) {
                              updateGroup(group._id, newGroupName);
                            }
                            setEditingGroup(null);
                            setNewGroupName('');
                            setIsGroupPopoverOpen(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (
                                newGroupName.trim() &&
                                newGroupName !== group.name
                              ) {
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
                            variant={
                              selectedGroup === group.name
                                ? 'secondary'
                                : 'ghost'
                            }
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
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteGroup(group._id)}
                      >
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
            <Popover>
              <PopoverTrigger asChild>
                <Button aria-label="Add Tags" variant="ghost" size="icon">
                  <Tag size={16} />
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
            <Popover
              open={isCalendarPickerOpen}
              onOpenChange={setIsCalendarPickerOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  onClick={() =>
                    setIsCalendarPickerOpen(!isCalendarPickerOpen)
                  }
                  aria-label="Add Due Date"
                  variant="ghost"
                  size="icon"
                >
                  <CalendarIcon size={16} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 text-sm">
                <div className="flex flex-col space-y-1">
                  <p className="text-center">Select Due Date</p>
                  <div className="flex items-center justify-center space-x-4">
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit((data) => {
                          setDueDate(data.datePicker.to);
                          setIsCalendarPickerOpen(false);
                        })}
                        className="flex flex-col justify-center text-center items-center space-y-2"
                      >
                        <CalendarDatePicker
                          date={{
                            from: dueDate || new Date(),
                            to: dueDate || new Date(),
                          }}
                          onDateSelect={({ from, to }) => {
                            form.setValue('datePicker', { from, to });
                            setDueDate(from);
                            setIsCalendarPickerOpen(false);
                          }}
                          variant="outline"
                          numberOfMonths={1}
                          className="min-w-[150px] border rounded-md p-2"
                        />
                        <div className="flex space-x-4">
                          <Button
                            variant="outline"
                            type="button"
                            onClick={() => {
                              setDueDate(new Date());
                              setIsCalendarPickerOpen(false);
                            }}
                            className="px-4 py-1"
                          >
                            Today
                          </Button>
                          <Button
                            variant="outline"
                            type="button"
                            onClick={() => {
                              setDueDate(null);
                              setIsCalendarPickerOpen(false);
                            }}
                            className="px-4 py-1"
                          >
                            No Date
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              onClick={() => handleAddTask(newTaskDescription)}
              aria-label="Add Task"
              variant="ghost"
              size="icon"
              disabled={!newTask.trim()}
            >
              <Plus size={16} />
            </Button>
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
                <Badge variant="outline">
                  <CalendarIcon size={12} className="mr-1" />
                  {format(dueDate, 'PPP')}
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="space-y-2">
          {incompleteTasks.length > 0 ? (
            incompleteTasks.map((task) => (
              <div key={task._id} className="rounded-md text-sm">
                <div className="flex flex-row gap-2 items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleTaskCompletion(task._id)}
                    aria-label="Complete Task"
                  >
                    <Check size={16} className="text-green-500" />
                  </Button>

                  <div className="flex flex-col gap-2 w-full">
                    {editingTaskTitleId === task._id ? (
                      <Input
                        className="flex-1 border"
                        type="text"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        onBlur={() => {
                          if (taskTitle.trim() && taskTitle !== task.title) {
                            updateTaskTitle(task._id, taskTitle);
                          }
                          setEditingTaskTitleId(null);
                          setTaskTitle('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (
                              taskTitle.trim() &&
                              taskTitle !== task.title
                            ) {
                              updateTaskTitle(task._id, taskTitle);
                            }
                            setEditingTaskTitleId(null);
                            setTaskTitle('');
                          }
                        }}
                        autoFocus
                      />
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

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingTaskDescriptionId(
                        editingTaskDescriptionId === task._id ? null : task._id
                      );
                      setTaskDescription(
                        editingTaskDescriptionId
                          ? ''
                          : task.description || ''
                      );
                    }}
                  >
                    <FileText size={16} />
                  </Button>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon">
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
                            onClick={() =>
                              updateTaskGroup(task._id, group.name)
                            }
                          >
                            {group.name}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

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
                      <Button variant="ghost" size="icon">
                        <Tag size={16} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 text-sm">
                      <div className="space-y-2">
                        <div className="font-medium">Add tags</div>
                        <InputTags
                          type="text"
                          value={editingTaskTags}
                          onChange={(value) =>
                            setEditingTaskTags(value as string[])
                          }
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
                      >
                        <CalendarIcon size={16} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 text-sm">
                      <div className="flex flex-col justify-center text-center items-center space-y-2">
                        <p className="text-center">Select Due Date</p>
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
                          className="min-w-[150px] border rounded-md p-2"
                        />
                        <div className="flex space-x-4 justify-center">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setExistingTaskDueDate(new Date());
                              updateTaskDueDate(task._id, new Date());
                            }}
                            className="px-4 py-1"
                          >
                            Today
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setExistingTaskDueDate(null);
                              updateTaskDueDate(task._id, null);
                            }}
                            className="px-4 py-1"
                          >
                            No Date
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTask(task._id)}
                    aria-label="Delete Task"
                  >
                    <Trash size={16} />
                  </Button>
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
                    <div className="flex justify-end mt-1 gap-2">
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
                  {task.dueDate && (
                    <Badge variant="outline">
                      <CalendarIcon size={12} className="mr-1" />
                      {format(new Date(task.dueDate), 'PPP')}
                    </Badge>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">
              No tasks yet. Add one to get started!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
