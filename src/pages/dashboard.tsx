import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BarChart, CheckCircle, Clock, FileText, List, Settings, Target } from 'lucide-react'
import router from 'next/router'
import { useSession } from 'next-auth/react'
import { Task } from '@/interfaces'
import Layout from '@/components/layout'

// Sidebar Component
const Sidebar = () => (
  <div className="w-64 bg-white p-4 border-r border-gray-200">
    <nav className="h-full">
      <Button variant="ghost" className="w-full justify-start mb-2">
        <List className="mr-2 h-4 w-4" />
        Tasks
      </Button>
      <Button variant="ghost" className="w-full justify-start mb-2">
        <CheckCircle className="mr-2 h-4 w-4" />
        Habits
      </Button>
      <Button variant="ghost" className="w-full justify-start mb-2">
        <Clock className="mr-2 h-4 w-4" />
        Time Tracking
      </Button>
      <Button variant="ghost" className="w-full justify-start mb-2">
        <FileText className="mr-2 h-4 w-4" />
        Notes
      </Button>
      <Button variant="ghost" className="w-full justify-start mb-2">
        <Target className="mr-2 h-4 w-4" />
        Goals
      </Button>
      <Button variant="ghost" className="w-full justify-start mb-2">
        <BarChart className="mr-2 h-4 w-4" />
        Analytics
      </Button>
      <Button variant="ghost" className="w-full justify-start">
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </Button>
    </nav>
  </div>
);
// Main Content Component
interface MainContentProps {
  tasks: Task[];
  newTask: string;
  setNewTask: (value: string) => void;
  addTask: () => void;
  toggleTaskCompletion: (id: string) => void;
}

const MainContent: React.FC<MainContentProps> = ({ tasks, newTask, setNewTask, addTask, toggleTaskCompletion }) => (
  <div className="flex-1 p-8">
    <Card>
      <CardHeader>
        <CardTitle>Daily Summary</CardTitle>
        <CardDescription>Your progress for today</CardDescription>
      </CardHeader>
    </Card>

    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <CardDescription>Manage your tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4">
          <Input
            placeholder="Add a new task..."
            className="mr-2"
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            aria-label="New Task"
          />
          <Button onClick={addTask} aria-label="Add Task">Add</Button>
        </div>
        <ScrollArea className="h-[300px]">
          {tasks.length > 0 ? (
            tasks.map(task => (
              <div key={task._id} className="flex items-center justify-between mb-2">
                <p className={task.completed ? 'line-through' : ''}>{task.title}</p>
                <Button variant="ghost" onClick={() => toggleTaskCompletion(task._id)} aria-label={task.completed ? 'Undo Task' : 'Complete Task'}>
                  {task.completed ? 'Undo' : 'Complete'}
                </Button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No tasks yet. Add one to get started!</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  </div>
);

export default function Dashboard() {
  const { status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTasks();
    }
  }, [status]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
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
        setTasks([...tasks, data]);
        setNewTask('');
      } catch (error) {
        console.error('Failed to add task:', error);
      }
    }
  };

  const toggleTaskCompletion = async (taskId: string) => {
    const taskIndex = tasks.findIndex(task => task._id === taskId);
    if (taskIndex === -1) return;

    const updatedTask = { ...tasks[taskIndex], completed: !tasks[taskIndex].completed };
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = updatedTask;
    setTasks(updatedTasks);

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: updatedTask.completed }),
      });
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') {
    router.push('/signin');
    return null;
  }

  return (
    <Layout>
      <div className="flex h-screen overflow-y-auto border-t border-b">
        <Sidebar />
        <MainContent
          tasks={tasks}
          newTask={newTask}
          setNewTask={setNewTask}
          addTask={addTask}
          toggleTaskCompletion={toggleTaskCompletion}
        />
      </div>
    </Layout>
  )
}