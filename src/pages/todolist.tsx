import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSession } from 'next-auth/react';
import { Task } from '@/interfaces';
import Layout from '@/components/layout';
import router from 'next/router';
import { Plus, Check, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

interface MainContentProps {
  tasks: Task[];
  newTask: string;
  setNewTask: (value: string) => void;
  addTask: () => void;
  toggleTaskCompletion: (id: string) => void;
  deleteTask: (id: string) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  tasks,
  newTask,
  setNewTask,
  addTask,
  toggleTaskCompletion,
  deleteTask,
}) => {
  const incompleteTasks = tasks.filter((task) => !task.isCompleted && !task.isDeleted);

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">To-Do List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4">
          <Input
            placeholder="Add a new task..."
            className="flex-1 mr-2"
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
          <Button
            onClick={addTask}
            aria-label="Add Task"
            variant="outline"
            disabled={!newTask.trim()}
          >
            <Plus size={16} />
          </Button>
        </div>
        <ScrollArea className="h-[300px]">
          {incompleteTasks.length > 0 ? (
            incompleteTasks.map((task) => (
              <div
                key={task._id}
                className="flex items-center justify-between mb-2"
              >
                <p className="flex-1">{task.title}</p>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    onClick={() => toggleTaskCompletion(task._id)}
                    aria-label="Complete Task"
                  >
                    <Check size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => deleteTask(task._id)}
                    aria-label="Delete Task"
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">
              No tasks yet. Add one to get started!
            </p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default function TaskPage() {
  const { status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTasks();
    }
  }, [status]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      // Filter out tasks where isDeleted is true
      setTasks(data.filter((task: Task) => !task.isDeleted));
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const addTask = async () => {
    if (newTask.trim()) {
      try {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: newTask }),
        });
        const data = await response.json();
  
        // Update tasks state using functional updater
        setTasks((prevTasks) => [...prevTasks, data]);
        setNewTask('');
  
        // Toast after ensuring task is added
        toast({
          title: 'Task Added',
          description: `Task "${data.title}" has been added.`,
          action: (
            <ToastAction
              altText="Undo"
              onClick={() => {
                undoAdd(data._id); // Pass task id to undo
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
  
      // Remove task from state using functional updater
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

    // Update tasks state using functional updater
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
  
    // Update state to show deletion immediately
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
        duration: 3000,
      });
  
      // Revert isDeleted if the API call fails
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
  
      // Restore task to state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, isDeleted: false } : task
        )
      );
  
      toast({
        title: 'Undo Successful',
        description: 'Task has been restored.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to undo delete:', error);
      toast({
        title: 'Error',
        description: 'Failed to undo delete.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };  

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') {
    router.push('/signin');
    return null;
  }

  return (
    <Layout>
      <MainContent
        tasks={tasks}
        newTask={newTask}
        setNewTask={setNewTask}
        addTask={addTask}
        toggleTaskCompletion={toggleTaskCompletion}
        deleteTask={deleteTask}
      />
    </Layout>
  );
}
