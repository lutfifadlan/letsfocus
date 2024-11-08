import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import Layout from '@/components/layout';
import CustomBackground from '@/components/backgrounds/custom';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, startOfDay, differenceInDays } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Habit {
  _id: string;
  title: string;
  completionDates: string[];
  userId: string;
  createdAt: string;
}

interface HabitStats {
  title: string;
  totalDays: number;
  completedDays: number;
  completionRate: number;
  streak: number;
  dailyStats: { date: string; completed: boolean }[];
  weeklyCompletionRate: number;
  twoWeekCompletionRate: number;
  threeWeekCompletionRate: number;
  monthlyCompletionRate: number;
}

export default function HabitsHistoryPage() {
  const [habitStats, setHabitStats] = useState<HabitStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { status } = useSession();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("30"); // days to show in table

  const fetchHabits = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/habits');
      const data = await response.json();
      calculateStats(data);
    } catch (error) {
      console.error('Failed to fetch habits:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch habits history.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const calculateStats = (habits: (Habit & { createdAt: string })[]) => {
    const stats = habits.map(habit => {
      const today = startOfDay(new Date());
      const habitStartDate = startOfDay(new Date(habit.createdAt));
      const daysFromStart = Math.min(30, differenceInDays(today, habitStartDate) + 1);
      
      // Create daily completion status from habit creation date
      const dailyStats = Array.from({ length: daysFromStart }, (_, i) => {
        const date = format(subDays(today, i), 'yyyy-MM-dd');
        return {
          date,
          completed: habit.completionDates.includes(date)
        };
      }).reverse();

      // Calculate completion rates for different time periods
      const weeklyCompletionRate = calculateCompletionRate(dailyStats.slice(-Math.min(7, daysFromStart)));
      const twoWeekCompletionRate = calculateCompletionRate(dailyStats.slice(-Math.min(14, daysFromStart)));
      const threeWeekCompletionRate = calculateCompletionRate(dailyStats.slice(-Math.min(21, daysFromStart)));
      const monthlyCompletionRate = calculateCompletionRate(dailyStats);

      return {
        title: habit.title,
        totalDays: daysFromStart,
        completedDays: dailyStats.filter(day => day.completed).length,
        completionRate: (dailyStats.filter(day => day.completed).length / daysFromStart) * 100,
        streak: calculateStreak(habit.completionDates),
        dailyStats,
        weeklyCompletionRate,
        twoWeekCompletionRate,
        threeWeekCompletionRate,
        monthlyCompletionRate,
      };
    });

    setHabitStats(stats);
  };

  const calculateCompletionRate = (days: { completed: boolean }[]) => {
    const completed = days.filter(day => day.completed).length;
    return (completed / days.length) * 100;
  };

  const calculateStreak = (completionDates: string[]) => {
    // Calculate current streak
    let streak = 0;
    let currentDate = startOfDay(new Date());
    while (true) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      if (completionDates.includes(dateStr)) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }
    return streak;
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchHabits();
    }
  }, [status]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="py-16 flex justify-center items-start min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-t-transparent dark:border-t-black border-black dark:border-white rounded-full mt-6"/>
      </div>
    );
  }

  return (
    <Layout>
      <CustomBackground type="animated-grid" />
      <Card className="max-w-[95%] mx-auto relative z-20">
        <CardHeader>
          <CardTitle>Habits History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="table" className="space-y-4">
            <TabsList>
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {habitStats.map((stat, index) => (
                  <Card key={index} className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{stat.title}</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'Last 7 Days:', value: stat.weeklyCompletionRate },
                        { label: 'Last 14 Days:', value: stat.twoWeekCompletionRate },
                        { label: 'Last 21 Days:', value: stat.threeWeekCompletionRate },
                        { label: 'Last 30 Days:', value: stat.monthlyCompletionRate },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className={`font-medium ${
                            item.value >= 80 ? 'text-green-500' :
                            item.value >= 60 ? 'text-yellow-500' :
                            'text-red-500'
                          }`}>
                            {item.value.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Streak:</span>
                        <span className="font-medium">{stat.streak} days</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="table">
              <div className="space-y-4">
                <Select
                  value={timeRange}
                  onValueChange={setTimeRange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="14">Last 14 days</SelectItem>
                    <SelectItem value="21">Last 21 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Habit</TableHead>
                        {habitStats[0]?.dailyStats
                          .slice(-parseInt(timeRange))
                          .map((day) => (
                            <TableHead key={day.date} className="text-center">
                              {format(new Date(day.date), 'MMM d')}
                            </TableHead>
                          ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {habitStats.map((stat, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {stat.title}
                          </TableCell>
                          {stat.dailyStats
                            .slice(-parseInt(timeRange))
                            .map((day) => (
                              <TableCell key={day.date} className="text-center">
                                {day.completed ? "✅" : "❌"}
                              </TableCell>
                            ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </Layout>
  );
} 