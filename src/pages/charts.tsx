import React, { useState, useEffect } from 'react';
import { Task } from '@/interfaces';
import Layout from '@/components/layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Pie, PieChart, Bar, BarChart, CartesianGrid, LabelList, XAxis } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedChartDateRange, setSelectedChartDateRange] = useState('2w');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error(`Error fetching tasks: ${response.statusText}`);
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };
  // Helper function to get the date range based on the selected date range
  function getDateRange(range: string): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate = new Date();
    const endDate = now;

    switch (range) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '3d':
        startDate.setDate(now.getDate() - 3);
        break;
      case '1w':
        startDate.setDate(now.getDate() - 7);
        break;
      case '2w':
        startDate.setDate(now.getDate() - 14);
        break;
      case '4w':
        startDate.setDate(now.getDate() - 28);
        break;
      case '1m':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '2m':
        startDate.setMonth(now.getMonth() - 2);
        break;
      case '3m':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0); // default to all time
    }
    return { startDate, endDate };
  }

  const { startDate, endDate } = getDateRange(selectedDateRange);
  const {
    startDate: chartStartDate,
    endDate: chartEndDate,
  } = getDateRange(selectedChartDateRange);

  // Filter tasks based on the selected date range
  const filteredTasks = tasks.filter((task) => {
    const createdAt = new Date(task.createdAt);
    return createdAt >= startDate && createdAt <= endDate;
  });

  // Compute statistics based on filtered tasks
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter((task) => task.isCompleted).length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Compute tasks completed per day for the chart
  const tasksForChart = tasks
    .filter((task) => task.isCompleted && task.updatedAt)
    .filter((task) => {
      const updatedAt = new Date(task.updatedAt);
      return updatedAt >= chartStartDate && updatedAt <= chartEndDate;
    });

  const tasksCompletedPerDay: { [date: string]: number } = {};

  tasksForChart.forEach((task) => {
    const date = new Date(task.updatedAt).toISOString().split('T')[0];
    tasksCompletedPerDay[date] = (tasksCompletedPerDay[date] || 0) + 1;
  });

  // Generate an array of all dates within the selected range
  function getDateArray(start: Date, end: Date): string[] {
    const arr: string[] = [];
    const dt = new Date(start);
    while (dt <= end) {
      arr.push(new Date(dt).toISOString().split('T')[0]);
      dt.setDate(dt.getDate() + 1);
    }
    return arr;
  }

  const dateArray = getDateArray(chartStartDate, chartEndDate);

  // Prepare data for the bar chart
  const data = dateArray.map((date) => ({
    date,
    count: tasksCompletedPerDay[date] || 0,
  }));

  // Define chartConfig for the pie chart with updated colors
  const chartConfig = {
    value: {
      label: 'Tasks',
    },
    Completed: {
      label: 'Completed',
      color: 'hsl(var(--green-500))', // Green for completed
    },
    Incomplete: {
      label: 'Incomplete',
      color: 'hsl(var(--red-500))', // Red for incomplete
    },
  } satisfies ChartConfig;

  // Prepare data for the pie chart (uses all-time data)
  const totalCompletedTasksAllTime = tasks.filter((task) => task.isCompleted)
    .length;
  const totalIncompleteTasksAllTime = tasks.filter((task) => !task.isCompleted)
    .length;

  const pieData = [
    {
      name: 'Completed',
      value: totalCompletedTasksAllTime,
      fill: chartConfig.Completed.color,
    },
    {
      name: 'Incomplete',
      value: totalIncompleteTasksAllTime,
      fill: chartConfig.Incomplete.color,
    },
  ];

  // Compute tasks created per day within the selected date range
  const tasksCreatedPerDay: { [date: string]: number } = {};

  filteredTasks.forEach((task) => {
    const date = new Date(task.createdAt).toISOString().split('T')[0];
    tasksCreatedPerDay[date] = (tasksCreatedPerDay[date] || 0) + 1;
  });

  // Calculate percentage change compared to previous period
  const durationInDays = Math.ceil(
    (chartEndDate.getTime() - chartStartDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const previousPeriodEndDate = new Date(chartStartDate.getTime() - 1);
  const previousPeriodStartDate = new Date(
    chartStartDate.getTime() - durationInDays * 24 * 60 * 60 * 1000
  );

  const tasksForPreviousPeriod = tasks
    .filter((task) => task.isCompleted && task.updatedAt)
    .filter((task) => {
      const updatedAt = new Date(task.updatedAt);
      return (
        updatedAt >= previousPeriodStartDate && updatedAt <= previousPeriodEndDate
      );
    });

  const totalCompletedInPeriod = tasksForChart.length;
  const totalCompletedInPreviousPeriod = tasksForPreviousPeriod.length;

  let percentageChange = 0;
  if (totalCompletedInPreviousPeriod > 0) {
    percentageChange =
      ((totalCompletedInPeriod - totalCompletedInPreviousPeriod) /
        totalCompletedInPreviousPeriod) *
      100;
  }

  // Date range options
  const dateRanges = [
    { label: 'Yesterday', value: '1d' },
    { label: 'Last 3 Days', value: '3d' },
    { label: 'Last Week', value: '1w' },
    { label: 'Last 2 Weeks', value: '2w' },
    { label: 'Last 4 Weeks', value: '4w' },
    { label: 'Last Month', value: '1m' },
    { label: 'Last 2 Months', value: '2m' },
    { label: 'Last 3 Months', value: '3m' },
    { label: 'Last 6 Months', value: '6m' },
    { label: 'Last Year', value: '1y' },
    { label: 'All Time', value: 'all' },
  ];

  const dateRangesForCompletionOverTime = [
    { label: 'Yesterday', value: '1d' },
    { label: 'Last 3 Days', value: '3d' },
    { label: 'Last Week', value: '1w' },
    { label: 'Last 2 Weeks', value: '2w' },
    { label: 'Last 4 Weeks', value: '4w' },
  ];

  return (
    <Layout>
      <div className="container mx-auto my-8 px-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Your To-Do Lists Statistics</h1>
          <div className="flex items-center space-x-4">
            <Select
              value={selectedDateRange}
              onValueChange={setSelectedDateRange}
            >
              <SelectTrigger className="w-[180px]" defaultValue="all">
                <SelectValue placeholder="Select a date range" />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-row space-x-4">
              <Card>
                <CardHeader>
                  <CardTitle>Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {completionRate.toFixed(2)}%
                  </p>
                </CardContent>
              </Card>
            </div>
            <Card className="flex flex-col">
              <CardHeader className="items-center pb-0">
                <CardTitle>Task Completion Status</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pb-0">
                {totalCompletedTasksAllTime + totalIncompleteTasksAllTime > 0 ? (
                  <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
                  >
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                      <Pie
                        data={pieData}
                        dataKey="value"
                        label
                        nameKey="name"
                      />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <p className="text-gray-600">No tasks available.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Tasks Completed Over Time</CardTitle>
                <div className="flex items-center space-x-4">
                  <Select
                    value={selectedChartDateRange}
                    onValueChange={setSelectedChartDateRange}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a date range" />
                    </SelectTrigger>
                    <SelectContent>
                      {dateRangesForCompletionOverTime.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              {data.length > 0 ? (
                <ChartContainer
                  config={{
                    count: {
                      label: 'Tasks Completed',
                      color: 'hsl(var(--green-500))', // Green for bar chart
                    },
                  }}
                  className="h-64 w-full"
                >
                  <BarChart
                    accessibilityLayer
                    data={data}
                    margin={{
                      top: 25,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })
                      }
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar
                      dataKey="count"
                      fill="hsl(var(--green-500))" // Green for bar chart
                      radius={8}
                    >
                      <LabelList
                        position="top"
                        offset={12}
                        className="fill-foreground"
                        fontSize={12}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              ) : (
                <p className="text-gray-600">
                  No tasks completed in the selected period.
                </p>
              )}
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
              {totalCompletedInPreviousPeriod > 0 ? (
                <div className="flex gap-2 font-medium leading-none">
                  {percentageChange >= 0 ? 'Trending up' : 'Trending down'} by{' '}
                  {Math.abs(percentageChange).toFixed(2)}% compared to previous period{' '}
                  {percentageChange >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                </div>
              ) : (
                <div className="flex gap-2 font-medium leading-none">
                  No data for previous period
                </div>
              )}
              <div className="leading-none text-muted-foreground">
                Showing total tasks completed for the selected period
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
