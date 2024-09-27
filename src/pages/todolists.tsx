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
import { Plus, Check, Trash, Tag, Folder, PlusCircle, Edit } from 'lucide-react'; // Removed unused 'Edit' icon
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { InputTags } from '@/components/ui/input-tags';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge'; // Import Badge component

interface MainContentProps {
  tasks: Task[];
  newTask: string;
  setNewTask: (value: string) => void;
  addTask: () => void;
  toggleTaskCompletion: (id: string) => void;
  deleteTask: (id: string) => void;
  tags: string[];
  setTags: (value: string[]) => void;
  groups: { _id: string; name: string }[];
  selectedGroup: string | null;
  setSelectedGroup: (value: string | null) => void;
  createGroup: (name: string) => void;
  deleteGroup: (name: string) => void;
  updateGroup: (oldName: string, newName: string) => void;
  updateTaskGroup: (taskId: string, groupName: string | null) => void;
  updateTaskTags: (taskId: string, newTags: string[]) => void;
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
}) => {
  const incompleteTasks = tasks.filter((task) => !task.isCompleted && !task.isDeleted);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState<string | null>(null);

  return (
    <Card className="max-w-4xl mx-auto border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-center text-2xl">To-Do Lists</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex flex-row gap-2 items-center">
            <Input
              placeholder="Add a new task..."
              className="flex-1"
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addTask();
                }
              }}
              aria-label="New Task"
            />
            <Popover>
              <PopoverTrigger asChild>
              <Button aria-label="Select Group" variant="outline" size="icon">
                <Folder size={16} />
              </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  <div className="font-medium">Select or create a group</div>
                  <Button
                    variant={selectedGroup === null ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedGroup(null)}
                  >
                    No Group
                  </Button>
                  {groups.map((group) => (
                    <div key={group._id} className="flex items-center justify-between">
                      {editingGroup === group.name ? (
                        <Input
                          type="text"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          onBlur={() => {
                            if (newGroupName.trim() && newGroupName !== group.name) {
                              updateGroup(group.name, newGroupName);
                            }
                            setEditingGroup(null);
                            setNewGroupName('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (newGroupName.trim() && newGroupName !== group.name) {
                                updateGroup(group.name, newGroupName);
                              }
                              setEditingGroup(null);
                              setNewGroupName('');
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
                            size="sm"
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
                      <Button size="sm" variant="ghost" onClick={() => deleteGroup(group.name)}>
                        <Trash size={12} />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
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
                      size="sm"
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
              <Button aria-label="Add Tags" variant="outline" size="icon">
                <Tag size={16} />
              </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  <div className="font-medium">Add tags</div>
                  <InputTags
                    type="text"
                    value={tags}
                    onChange={(value) => setTags(value as string[])}
                    placeholder="Add tags..."
                    className="w-full"
                  />
                </div>
              </PopoverContent>
            </Popover>
            <Button
                onClick={addTask}
                aria-label="Add Task"
                variant="outline"
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
              <div key={task._id} className="flex items-center justify-between p-2 rounded-md">
                <div className="flex-1">
                  <p className="font-medium">{task.title}</p>
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
                <div className="flex items-center space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm">
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
                      <Button variant="ghost" size="sm">
                        <Tag size={16} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <div className="space-y-2">
                        <div className="font-medium">Add tags</div>
                        <InputTags
                          type="text"
                          value={task.tags || []}
                          onChange={(value) => updateTaskTags(task._id, value as string[])}
                          placeholder="Add tags..."
                          className="w-full"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleTaskCompletion(task._id)}
                    aria-label="Complete Task"
                  >
                    <Check size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTask(task._id)}
                    aria-label="Delete Task"
                  >
                    <Trash size={16} />
                  </Button>
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
      // setSelectedGroup(newGroup.name); // Set the new group as the selected group
    } catch (error) {
      console.error('Failed to create group', error);
    }
  };

  const deleteGroup = async (groupName: string) => {
    try {
      await fetch(`/api/groups/${groupName}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setGroups((prev) => prev.filter((group) => group.name !== groupName));
    } catch (error) {
      console.error('Failed to delete group', error);
    }
  };

  const updateGroup = async (oldName: string, newName: string) => {
    try {
      await fetch(`/api/groups/${oldName}`, {
        method: 'PUT',
        body: JSON.stringify({ newName }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setGroups((prev) => prev.map((group) => group.name === oldName ? { ...group, name: newName } : group));
    } catch (error) {
      console.error('Failed to update group', error);
    }
  };

  const addTask = async () => {
    if (newTask.trim()) {
      try {
        console.log('Adding task:', newTask, tags, selectedGroup);
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: newTask, tags, group: selectedGroup }),
        });
        const data = await response.json();
        console.log('Task added:', data);
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
      isCompleted: !tasks[taskIndex].isCompleted,
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
        body: JSON.stringify({ isCompleted: updatedTask.isCompleted }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update task');
      }

      toast({
        title: updatedTask.isCompleted
          ? 'Task Completed'
          : 'Task Uncompleted',
          description: `Task "${updatedTask.title}" has been ${
          updatedTask.isCompleted ? 'completed' : 'marked as incomplete'
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
      />
    </Layout>
  );
}
