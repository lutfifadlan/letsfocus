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
import { Plus, Check, Trash, Tag, Folder, PlusCircle, Edit, FileText, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { InputTags } from '@/components/ui/input-tags';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface MainContentProps {
  tasks: Task[];
  newTask: string;
  setNewTask: (value: string) => void;
  addTask: (description: string) => void;
  toggleTaskCompletion: (id: string) => void;
  deleteTask: (id: string) => void;
  tags: string[];
  setTags: (value: string[]) => void;
  groups: { _id: string; name: string }[];
  selectedGroup: string | null;
  setSelectedGroup: (value: string | null) => void;
  createGroup: (name: string) => void;
  deleteGroup: (name: string) => void;
  updateGroup: (groupId: string, newName: string) => void;
  updateTaskGroup: (taskId: string, groupName: string | null) => void;
  updateTaskTags: (taskId: string, newTags: string[]) => void;
  updateTaskDescription: (taskId: string, newDescription: string) => void;
  updateTaskTitle: (taskId: string, newTitle: string) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  tasks,
  newTask,
  setNewTask,
  addTask,
  toggleTaskCompletion,
  deleteTask,
  tags,
  setTags,
  groups,
  selectedGroup,
  setSelectedGroup,
  createGroup,
  deleteGroup,
  updateGroup,
  updateTaskGroup,
  updateTaskTags,
  updateTaskDescription,
  updateTaskTitle,
}) => {
  const incompleteTasks = tasks.filter((task) => task.status !== 'COMPLETED' && !task.isDeleted);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [isGroupPopoverOpen, setIsGroupPopoverOpen] = useState(false);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [editingTaskDescriptionId, setEditingTaskDescriptionId] = useState<string | null>(null);
  const [editingTaskTitleId, setEditingTaskTitleId] = useState<string | null>(null);
  const [taskDescription, setTaskDescription] = useState<string>('');
  const [isFileTextButtonClicked, setIsFileTextButtonClicked] = useState(false);
  const [taskTitle, setTaskTitle] = useState<string>('');

  const handleAddTask = (description: string) => {
    addTask(description);
    setNewTaskDescription('');
    setIsFileTextButtonClicked(false);
  };

  return (
    <Card className="max-w-4xl mx-auto border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-center text-2xl">To-Do Lists</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex flex-row gap-2">
            <div className="flex flex-col gap-2 w-full">
              <Input
                placeholder="Task name"
                className="w-full shadow-none"
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTask(newTaskDescription);
                  }
                }}
                aria-label="New Task"
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
              onClick={() => setIsFileTextButtonClicked(!isFileTextButtonClicked)}
              aria-label="Add Description"
              variant="ghost"
              size="icon"
            >
              <FileText size={16} />
            </Button>
            <Popover open={isGroupPopoverOpen} onOpenChange={setIsGroupPopoverOpen}>
              <PopoverTrigger asChild>
                <Button aria-label="Select Group" variant="ghost" size="icon">
                  <Folder size={16} />
                </Button>
              </PopoverTrigger>
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
                  />
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
          {(selectedGroup || tags.length > 0) && (
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
            </div>
          )}
        </div>
        <div className="space-y-2">
          {incompleteTasks.length > 0 ? (
            incompleteTasks.map((task) => (
              <div key={task._id} className="flex flex-col rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleTaskCompletion(task._id)}
                          aria-label="Complete Task"
                        >
                          <Check size={16} className="text-green-500" />
                        </Button>
                        {editingTaskTitleId === task._id ? (
                          <Input
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
                                if (taskTitle.trim() && taskTitle !== task.title) {
                                  updateTaskTitle(task._id, taskTitle);
                                }
                                setEditingTaskTitleId(null);
                                setTaskTitle('');
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <p className="font-medium" onClick={() => {
                            setEditingTaskTitleId(task._id);
                            setTaskTitle(task.title);
                          }}>{task.title}</p>
                        )}
                      </div>
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (editingTaskDescriptionId === task._id) {
                              setEditingTaskDescriptionId(null);
                              setTaskDescription('');
                            } else {
                              setEditingTaskDescriptionId(task._id);
                              setTaskDescription(task.description || '');
                            }
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
                            <div className="space-y-2">
                              <div className="font-medium">Change group</div>
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
                        <Popover>
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
                                value={task.tags || []}
                                onChange={(value) => updateTaskTags(task._id, value as string[])}
                                placeholder="Use enter or comma to add tag"
                                className="w-full text-xs"
                              />
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
                    </div>
                    {editingTaskDescriptionId === task._id && (
                      <div className="mt-2">
                        <Textarea
                          placeholder="Update description..."
                          value={taskDescription}
                          onChange={(e) => setTaskDescription(e.target.value)}
                          className="w-full resize-vertical"
                          style={{ minHeight: '2.5rem', overflow: 'hidden' }}
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = `${target.scrollHeight}px`;
                          }}
                        />
                        <div className="flex justify-end mt-1">
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
                      {task.tags && task.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          <Tag size={12} className="mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No tasks yet. Add one to get started!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function TaskPage() {
  const { status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [groups, setGroups] = useState<{ _id: string; name: string }[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTasks();
      fetchGroups();
    }
  }, [status]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data.filter((task: Task) => !task.isDeleted));
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups');
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    }
  };

  const createGroup = async (groupName: string) => {
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
    }
  };

  const deleteGroup = async (groupId: string) => {
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
    }
  };

  const updateGroup = async (groupId: string, newName: string) => {
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
    }
  };

  const addTask = async (description: string) => {
    if (newTask.trim()) {
      try {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: newTask, tags, group: selectedGroup, description }),
        });
        const data = await response.json();

        setTasks((prevTasks) => [...prevTasks, data]);
        setNewTask('');
        setTags([]);
        // Don't reset selectedGroup here to keep the selection
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
    }
  };

  const undoAdd = async (taskId: string) => {
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
  };

  const toggleTaskCompletion = async (taskId: string) => {
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
  };
  
  const deleteTask = async (taskId: string) => {
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
  };
  
  const undoDelete = async (taskId: string) => {
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
  };  

  const updateTaskGroup = async (taskId: string, groupName: string | null) => {
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
  };

  const updateTaskTags = async (taskId: string, newTags: string[]) => {
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
  };

  const updateTaskTitle = async (taskId: string, newTitle: string) => {
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
  };

  const updateTaskDescription = async (taskId: string, newDescription: string) => {
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

  return (
    <Layout>
      <MainContent
        tasks={tasks}
        newTask={newTask}
        setNewTask={setNewTask}
        addTask={addTask}
        toggleTaskCompletion={toggleTaskCompletion}
        deleteTask={deleteTask}
        tags={tags}
        setTags={setTags}
        groups={groups}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        createGroup={createGroup}
        deleteGroup={deleteGroup}
        updateGroup={updateGroup}
        updateTaskGroup={updateTaskGroup}
        updateTaskTags={updateTaskTags}
        updateTaskDescription={updateTaskDescription}
        updateTaskTitle={updateTaskTitle}
      />
    </Layout>
  );
}
