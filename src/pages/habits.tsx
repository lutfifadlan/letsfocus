import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSession } from 'next-auth/react';
import Layout from '@/components/layout';
import { Plus, Trash, Check, X, Edit, Save, Loader2 } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import CustomBackground from '@/components/backgrounds/custom';
import Link from 'next/link';
import { BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakInfo {
  current: number;
  longest: number;
}

interface Habit {
  _id: string;
  title: string;
  completionDates: string[];
  userId: string;
  streaks?: StreakInfo;
}

const calculateStreak = (completionDates: string[]): StreakInfo => {
  const sortedDates = [...completionDates].sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd');
  
  // Calculate current streak
  if (completionDates.includes(today)) {
    currentStreak = 1;
    let checkDate = yesterday;
    while (completionDates.includes(checkDate)) {
      currentStreak++;
      checkDate = format(addDays(new Date(checkDate), -1), 'yyyy-MM-dd');
    }
  }

  // Calculate longest streak
  sortedDates.forEach((date, index) => {
    if (index === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(sortedDates[index - 1]);
      const currDate = new Date(date);
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  });

  return { current: currentStreak, longest: longestStreak };
};

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dates, setDates] = useState<Date[]>([]);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editedHabitTitle, setEditedHabitTitle] = useState('');

  const { status } = useSession();
  const { toast } = useToast();

  // Generate dates for the next 7 days
  useEffect(() => {
    const generateDates = () => {
      const dateArray: Date[] = [];
      const today = new Date();
      for (let i = 0; i < 1; i++) {
        dateArray.push(addDays(today, i));
      }
      setDates(dateArray);
    };
    generateDates();
  }, []);

  const fetchHabits = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/habits');
      const data = await response.json();
      setHabits(data);
    } catch (error) {
      console.error('Failed to fetch habits:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch habits.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchHabits();
    }
  }, [status]);

  const addHabit = async () => {
    if (!newHabit.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newHabit }),
      });

      if (!response.ok) {
        throw new Error('Failed to add habit');
      }

      const habit = await response.json();
      setHabits([...habits, habit]);
      setNewHabit('');

      toast({
        title: 'Success',
        description: 'New habit has been added.',
      });
    } catch (error) {
      console.error('Failed to add habit:', error);
      toast({
        title: 'Error',
        description: 'Failed to add habit.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const deleteHabit = async (habitId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete habit');
      }

      setHabits(habits.filter(habit => habit._id !== habitId));
      toast({
        title: 'Success',
        description: 'Habit has been deleted.',
      });
    } catch (error) {
      console.error('Failed to delete habit:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete habit.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const toggleHabitCompletion = async (habitId: string, date: Date) => {
    setIsLoading(true);
    const dateStr = format(date, 'yyyy-MM-dd');
    const habit = habits.find(h => h._id === habitId);
    
    if (!habit) return;

    const isCompleted = habit.completionDates.includes(dateStr);
    const newCompletionDates = isCompleted
      ? habit.completionDates.filter(d => d !== dateStr)
      : [...habit.completionDates, dateStr];

    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completionDates: newCompletionDates }),
      });

      if (!response.ok) {
        throw new Error('Failed to update habit');
      }

      setHabits(habits.map(h => 
        h._id === habitId 
          ? { ...h, completionDates: newCompletionDates }
          : h
      ));
    } catch (error) {
      console.error('Failed to update habit:', error);
      toast({
        title: 'Error',
        description: 'Failed to update habit completion.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const updateHabitTitle = async (habitId: string) => {
    if (!editedHabitTitle.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editedHabitTitle }),
      });

      if (!response.ok) {
        throw new Error('Failed to update habit');
      }

      setHabits(habits.map(h => 
        h._id === habitId 
          ? { ...h, title: editedHabitTitle }
          : h
      ));

      setEditingHabitId(null);
      setEditedHabitTitle('');

      toast({
        title: 'Success',
        description: 'Habit has been updated.',
      });
    } catch (error) {
      console.error('Failed to update habit:', error);
      toast({
        title: 'Error',
        description: 'Failed to update habit.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  if (status === 'loading' || isLoading) {
    return (
      <Layout>
        <CustomBackground type="animated-grid" />
        <Card className="max-w-[95%] mx-auto relative z-20">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="h-7 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
              <div className="h-9 w-28 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <CustomBackground type="animated-grid" />
      <Card className="max-w-[95%] w-full mx-auto relative z-20 overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <CardTitle>Habit Tracker</CardTitle>
          <Link href="/habits-history">
            <Button variant="outline" size="sm">
              <BarChart className="h-4 w-4 mr-2" />
              View History
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Input
              type="text"
              placeholder="Add new habit..."
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addHabit();
                }
              }}
              className="max-w-sm"
            />
            <Button 
              onClick={addHabit} 
              disabled={!newHabit.trim() || isLoading}
              className="transition-all duration-200 hover:scale-105"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="overflow-x-auto -mx-6 sm:mx-0">
            {habits.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg mb-2">No habits added yet</p>
                <p className="text-sm">Start by adding a new habit above</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px] sm:w-[50px]">#</TableHead>
                    <TableHead className="min-w-[150px] sm:min-w-[200px]">Habit</TableHead>
                    <TableHead className="w-[100px] sm:w-[120px] text-center">Streak</TableHead>
                    {dates.map((date) => (
                      <TableHead key={date.toISOString()} className="text-center w-[60px] sm:w-[80px]">
                        {format(date, 'MMM d')}
                      </TableHead>
                    ))}
                    <TableHead className="w-[40px] sm:w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {habits.map((habit, index) => {
                    const streakInfo = calculateStreak(habit.completionDates);
                    return (
                      <TableRow 
                        key={habit._id}
                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          {editingHabitId === habit._id ? (
                            <div className="flex items-center space-x-2">
                              <Input
                                type="text"
                                value={editedHabitTitle}
                                onChange={(e) => setEditedHabitTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    updateHabitTitle(habit._id);
                                  } else if (e.key === 'Escape') {
                                    setEditingHabitId(null);
                                    setEditedHabitTitle('');
                                  }
                                }}
                                className="max-w-[120px] sm:max-w-[200px]"
                                autoFocus
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingHabitId(null);
                                  setEditedHabitTitle('');
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => updateHabitTitle(habit._id)}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                 
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <span className="truncate mr-2">{habit.title}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingHabitId(habit._id);
                                  setEditedHabitTitle(habit.title);
                                }}
                                className="flex-shrink-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center text-sm">
                            <span className="font-medium">{streakInfo.current}🔥</span>
                            <span className="text-xs text-gray-500">Best: {streakInfo.longest}</span>
                          </div>
                        </TableCell>
                        {dates.map((date) => {
                          const dateStr = format(date, 'yyyy-MM-dd');
                          const isCompleted = habit.completionDates.includes(dateStr);
                          return (
                            <TableCell key={date.toISOString()} className="text-center p-2 sm:p-4">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  'w-6 h-6 sm:w-8 sm:h-8 transition-all duration-200',
                                  isCompleted ? 'bg-green-500/20 hover:bg-green-500/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                )}
                                onClick={() => toggleHabitCompletion(habit._id, date)}
                              >
                                {isCompleted ? (
                                  <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                                ) : (
                                  <X className="h-3 w-3 sm:h-4 sm:w-4 text-gray-300" />
                                )}
                              </Button>
                            </TableCell>
                          );
                        })}
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteHabit(habit._id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
} 