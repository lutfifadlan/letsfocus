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
import {
  PieChart,
  Pie,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { CalendarDatePicker } from '@/components/calendar-date-picker';
import {
  subDays,
  startOfDay,
  endOfDay,
  differenceInCalendarDays,
} from 'date-fns';

export default function StatsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedTasksCompletedOverTimeDateRange, setSelectedTasksCompletedOverTimeDateRange] = useState('3d');
  const [selectedTasksCompletionComparisonDateRange, setSelectedTasksCompletionComparisonOverTimeDateRange] = useState('3d');
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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
    let endDate = now;

    switch (range) {
      case 'today':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'selectedDate':
        if (selectedDate) {
          startDate = startOfDay(selectedDate);
          endDate = endOfDay(selectedDate);
        } else {
          startDate = startOfDay(now);
          endDate = endOfDay(now);
        }
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = startOfDay(customStartDate);
          endDate = endOfDay(customEndDate);
        } else {
          startDate = new Date(0);
          endDate = now;
        }
        break;
      case '1d':
        startDate = startOfDay(subDays(now, 1));
        endDate = endOfDay(subDays(now, 1));
        break;
      case '3d':
        startDate = startOfDay(subDays(now, 2));
        endDate = endOfDay(now);
        break;
      case '1w':
        startDate = startOfDay(subDays(now, 6));
        endDate = endOfDay(now);
        break;
      case '2w':
        startDate = startOfDay(subDays(now, 13));
        endDate = endOfDay(now);
        break;
      case '4w':
        startDate = startOfDay(subDays(now, 27));
        endDate = endOfDay(now);
        break;
      case '1m':
        startDate = startOfDay(subDays(now, 30));
        endDate = endOfDay(now);
        break;
      case '2m':
        startDate = startOfDay(subDays(now, 60));
        endDate = endOfDay(now);
        break;
      case '3m':
        startDate = startOfDay(subDays(now, 90));
        endDate = endOfDay(now);
        break;
      case '6m':
        startDate = startOfDay(subDays(now, 180));
        endDate = endOfDay(now);
        break;
      case '1y':
        startDate = startOfDay(subDays(now, 365));
        endDate = endOfDay(now);
        break;
      default:
        startDate = new Date(0); // default to all time
        endDate = now;
    }
    return { startDate, endDate };
  }

  const { startDate, endDate } = getDateRange(selectedDateRange);
  const {
    startDate: chartStartDate,
    endDate: chartEndDate,
  } = getDateRange(selectedTasksCompletedOverTimeDateRange);
  const {
    startDate: completionComparisonChartStartDate,
    endDate: completionComparisonChartEndDate
  } = getDateRange(selectedTasksCompletionComparisonDateRange);

  // Filter tasks based on the selected date range
  const filteredTasks = tasks.filter((task) => {
    let relevantDate: Date | null = null;

    if (task.status === 'COMPLETED' && task.completedAt) {
      relevantDate = new Date(task.completedAt);
    } else if (task.createdAt) {
      relevantDate = new Date(task.createdAt);
    }

    if (!relevantDate) return false;

    return relevantDate >= startDate && relevantDate <= endDate;
  });

  // Compute statistics based on filtered tasks
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(
    (task) => task.status === 'COMPLETED'
  ).length;
  const completionRate =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Completed tasks with due dates
  const completedTasksWithDueDates = filteredTasks.filter(
    (task) => task.status === 'COMPLETED' && task.dueDate
  ).length;

  // Tasks completed on time (only tasks with dueDate)
  const completedOnTimeTasks = filteredTasks.filter((task) => {
    if (task.status !== 'COMPLETED' || !task.completedAt || !task.dueDate) {
      return false;
    }
    const completedAt = new Date(task.completedAt);
    const dueDate = new Date(task.dueDate);
    return completedAt <= dueDate;
  }).length;

  // Tasks completed faster than due date
  const completedEarlyTasks = filteredTasks.filter((task) => {
    if (task.status !== 'COMPLETED' || !task.completedAt || !task.dueDate) {
      return false;
    }
    const completedAt = new Date(task.completedAt);
    const dueDate = new Date(task.dueDate);
    return completedAt < dueDate;
  }).length;

  // Tasks completed after due date
  const completedLateTasks = filteredTasks.filter((task) => {
    if (task.status !== 'COMPLETED' || !task.completedAt || !task.dueDate) {
      return false;
    }
    const completedAt = new Date(task.completedAt);
    const dueDate = new Date(task.dueDate);
    return completedAt > dueDate;
  }).length;

  const percentageCompletedEarly =
    completedTasksWithDueDates > 0 ? (completedEarlyTasks / completedTasksWithDueDates) * 100 : 0;
  
  const percentageCompletedLate =
    completedTasksWithDueDates > 0 ? (completedLateTasks / completedTasksWithDueDates) * 100 : 0;

  // Total tasks with due dates
  const totalTasksWithDueDate = filteredTasks.filter(
    (task) => task.dueDate
  ).length;

  // Tasks ignored (uncompleted and past due date)
  const ignoredTasks = filteredTasks.filter((task) => {
    if (task.status === 'COMPLETED' || !task.dueDate) {
      return false;
    }
    const dueDate = new Date(task.dueDate);
    return dueDate < new Date();
  }).length;

  // Total tasks with due dates excluding ignored
  const totalTasksWithDueDateExcludingIgnored =
    totalTasksWithDueDate - ignoredTasks;

  // Percentage calculations
  const percentageCompletedOnTimeOfAllTasksExcludingIgnored =
    totalTasksWithDueDateExcludingIgnored > 0
      ? (completedOnTimeTasks / totalTasksWithDueDateExcludingIgnored) * 100
      : 0;

  // Helper function to get completed tasks between two dates
  function getCompletedTasksBetween(
    tasks: Task[],
    startDate: Date,
    endDate: Date
  ) {
    return tasks.filter((task) => {
      if (task.status !== 'COMPLETED' || !task.completedAt) return false;
      const completedAt = new Date(task.completedAt);
      return completedAt >= startDate && completedAt <= endDate;
    });
  }

  // Calculate percentage change compared to previous period
  const durationInDays =
    differenceInCalendarDays(chartEndDate, chartStartDate) + 1; // Include both start and end dates

  const previousPeriodEndDate = endOfDay(subDays(chartStartDate, 1));
  const previousPeriodStartDate = startOfDay(
    subDays(chartStartDate, durationInDays)
  );

  const tasksForCurrentPeriod = getCompletedTasksBetween(
    tasks,
    chartStartDate,
    chartEndDate
  );
  const tasksForPreviousPeriod = getCompletedTasksBetween(
    tasks,
    previousPeriodStartDate,
    previousPeriodEndDate
  );

  const totalCompletedInPeriod = tasksForCurrentPeriod.length;
  const totalCompletedInPreviousPeriod = tasksForPreviousPeriod.length;

  let percentageChange = 0;
  if (totalCompletedInPreviousPeriod > 0) {
    percentageChange =
      ((totalCompletedInPeriod - totalCompletedInPreviousPeriod) /
        totalCompletedInPreviousPeriod) *
      100;
  }

  // Compute tasks completed per day for the chart
  const tasksCompletedPerDay: { [date: string]: number } = {};
  tasksForCurrentPeriod.forEach((task) => {
    if (task.completedAt) {
      const date = new Date(task.completedAt).toISOString().split('T')[0];
      tasksCompletedPerDay[date] =
        (tasksCompletedPerDay[date] || 0) + 1;
    }
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
  const dateForTasksCompletedArray = getDateArray(completionComparisonChartStartDate, completionComparisonChartEndDate);

  // Prepare data for the line chart
  const data = dateArray.map((date) => ({
    date,
    count: tasksCompletedPerDay[date] || 0,
  }));

  // Define chartConfig for the pie chart with updated colors
  const chartConfig: ChartConfig = {
    value: {
      label: 'Tasks',
    },
    Completed: {
      label: 'Completed',
      color: '#22c55e', // Tailwind green-500 hex code
    },
    Incomplete: {
      label: 'Incomplete',
      color: '#ef4444', // Tailwind red-500 hex code
    },
  };

  // Prepare data for the pie chart (uses data from filtered tasks)
  const totalCompletedTasksFiltered = filteredTasks.filter(
    (task) => task.status === 'COMPLETED'
  ).length;
  const totalIncompleteTasksFiltered = filteredTasks.filter(
    (task) => task.status !== 'COMPLETED'
  ).length;

  const pieData = [
    {
      name: 'Completed',
      value: totalCompletedTasksFiltered,
      fill: chartConfig.Completed.color,
    },
    {
      name: 'Incomplete',
      value: totalIncompleteTasksFiltered,
      fill: chartConfig.Incomplete.color,
    },
  ];

  // Compute top 5 groups
  const groupCounts: { [group: string]: number } = {};

  filteredTasks.forEach((task) => {
    if (task.status === 'COMPLETED' && task.group) {
      if (!groupCounts[task.group]) {
        groupCounts[task.group] = 0;
      }
      groupCounts[task.group]++;
    }
  });

  const topGroups = Object.entries(groupCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([group, count]) => ({ group, count }));

  // Compute top 5 tags
  const tagCounts: { [tag: string]: number } = {};

  filteredTasks.forEach((task) => {
    if (task.status === 'COMPLETED' && task.tags && task.tags.length > 0) {
      task.tags.forEach((tag) => {
        if (!tagCounts[tag]) {
          tagCounts[tag] = 0;
        }
        tagCounts[tag]++;
      });
    }
  });

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));

  // Date range options
  const dateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: '1d' },
    { label: 'Last 3 Days', value: '3d' },
    { label: 'Last Week', value: '1w' },
    { label: 'Last 2 Weeks', value: '2w' },
    { label: 'Last Month', value: '1m' },
    { label: 'Last 3 Months', value: '3m' },
    { label: 'Last 6 Months', value: '6m' },
    { label: 'All Time', value: 'all' },
    { label: 'Date Range', value: 'custom' },
  ];

  const dateRangesForCompletionOverTime = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: '1d' },
    { label: 'Last 3 Days', value: '3d' },
    { label: 'Last Week', value: '1w' },
    { label: 'Last 2 Weeks', value: '2w' },
    { label: 'Last Month', value: '1m' },
  ];

  // Prepare data for the new line chart
  const tasksCompletedOnTimePerDay: { [date: string]: number } = {};
  const tasksCompletedEarlyPerDay: { [date: string]: number } = {};
  const tasksCompletedLatePerDay: { [date: string]: number } = {};

  tasksForCurrentPeriod.forEach((task) => {
    if (task.completedAt) {
      const date = new Date(task.completedAt).toISOString().split('T')[0];
      if (task.status === 'COMPLETED' && task.dueDate) {
        const completedAt = new Date(task.completedAt);
        const dueDate = new Date(task.dueDate);
        if (completedAt < dueDate) {
          tasksCompletedEarlyPerDay[date] = (tasksCompletedEarlyPerDay[date] || 0) + 1;
        } else if (completedAt > dueDate) {
          tasksCompletedLatePerDay[date] = (tasksCompletedLatePerDay[date] || 0) + 1;
        } else {
          tasksCompletedOnTimePerDay[date] = (tasksCompletedOnTimePerDay[date] || 0) + 1;
        }
      }
    }
  });

  const lineChartData = dateForTasksCompletedArray.map((date) => ({
    date,
    onTime: tasksCompletedOnTimePerDay[date] || 0,
    early: tasksCompletedEarlyPerDay[date] || 0,
    late: tasksCompletedLatePerDay[date] || 0,
  }));

  const lineChartConfig: ChartConfig = {
    onTime: {
      label: 'On Time',
      color: '#22c55e', // Tailwind green-500 hex code
    },
    early: {
      label: 'Early',
      color: '#3b82f6', // Tailwind blue-500 hex code
    },
    late: {
      label: 'Late',
      color: '#ef4444', // Tailwind red-500 hex code
    },
  };

  return (
    <Layout>
      <div className="container mx-auto my-8 px-4">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Tasks Completion Stats
          </h2>
          <div className="flex items-center space-x-4">
            {/* Date Range Selector */}
            <Select
              value={selectedDateRange}
              onValueChange={setSelectedDateRange}
            >
              <SelectTrigger className="w-[180px]">
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

            {/* Custom Date Picker */}
            {selectedDateRange === 'custom' && (
              <div className="flex items-center space-x-2">
                <CalendarDatePicker
                  date={{
                    from: customStartDate || undefined,
                    to: customEndDate || undefined,
                  }}
                  onDateSelect={(date) => {
                    setCustomStartDate(date.from || null);
                    setCustomEndDate(date.to || null);
                  }}
                  className="text-sm"
                  numberOfMonths={2}
                />
              </div>
            )}

            {/* Single Date Picker for 'selectedDate' */}
            {selectedDateRange === 'selectedDate' && (
              <CalendarDatePicker
                date={{
                  from: selectedDate || undefined,
                  to: selectedDate || undefined,
                }}
                onDateSelect={(date) => setSelectedDate(date.from || null)}
                className="text-sm"
                numberOfMonths={1}
              />
            )}
          </div>
        </div>
        {/* Statistics Cards */}
        <div className="grid grid-cols-5 sm:grid-cols-2 lg:grid-cols-5 gap-1 mb-6">
          {/* Tasks Completed and Completion Rate Card */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="text-lg">Tasks Completed</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-4xl font-bold text-green-600">
                {completedTasks}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                out of {totalTasks} tasks
              </p>
              <p className="text-sm text-gray-500 mt-2">
                ({completionRate.toFixed(2)}% of tasks have been completed)
              </p>
            </CardContent>
          </Card>

          {/* Completed On Time Card */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="text-lg">Completed On Time</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-4xl font-bold text-green-600">
                {completedOnTimeTasks}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                out of {completedTasksWithDueDates} completed tasks with due dates
              </p>
              <p className="text-sm text-gray-500 mt-2">
                ({percentageCompletedOnTimeOfAllTasksExcludingIgnored.toFixed(2)}% of tasks have been completed on time)
              </p>
            </CardContent>
          </Card>

          {/* Completed Early Card */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="text-lg">Completed Early</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-4xl font-bold text-green-600">
                {completedEarlyTasks}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                out of {completedTasksWithDueDates} completed tasks with due dates
              </p>
              <p className="text-sm text-gray-500 mt-2">
                ({percentageCompletedEarly.toFixed(2)}% of all tasks)
              </p>
            </CardContent>
          </Card>

          {/* Completed Late Card */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="text-lg">Completed Late</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-4xl font-bold text-red-600">
                {completedLateTasks}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                out of {completedTasksWithDueDates} completed tasks with due dates
              </p>
              <p className="text-sm text-gray-500 mt-2">
                ({percentageCompletedLate.toFixed(2)}% of all tasks)
              </p>
            </CardContent>
          </Card>

          {/* Task Completion Status Pie Chart */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="items-center pb-0">
              <CardTitle className="text-lg">
                Completion Status
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              {totalCompletedTasksFiltered +
                totalIncompleteTasksFiltered >
              0 ? (
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
                >
                  <PieChart>
                    <ChartTooltip
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={pieData}
                      dataKey="value"
                      label
                      nameKey="name"
                      outerRadius={80}
                      innerRadius={40}
                    />
                  </PieChart>
                </ChartContainer>
              ) : (
                <p className="text-gray-600">No tasks available.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-bold mb-4">Tasks Completion Over Time</h2>

        {/* Charts Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {/* Tasks Completed Over Time Line Chart */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  Tasks Completed Over Time
                </CardTitle>
                <div className="flex items-center space-x-4">
                  {/* Date Range Selector for Chart */}
                  <Select
                    value={selectedTasksCompletedOverTimeDateRange}
                    onValueChange={setSelectedTasksCompletedOverTimeDateRange}
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

                  {/* Custom Date Picker for Chart */}
                  {selectedTasksCompletedOverTimeDateRange === 'custom' && (
                    <div className="flex items-center space-x-2">
                      <CalendarDatePicker
                        date={{
                          from: customStartDate || undefined,
                          to: customEndDate || undefined,
                        }}
                        onDateSelect={(date) => {
                          if (date.from) setCustomStartDate(date.from);
                          if (date.to) setCustomEndDate(date.to);
                        }}
                        className="text-sm"
                        numberOfMonths={2}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {data.length > 0 ? (
                <ChartContainer
                  config={{
                    count: {
                      label: 'Tasks Completed',
                      color: '#22c55e', // Tailwind green-500 hex code
                    },
                  }}
                  className="h-64 w-full"
                >
                  <LineChart
                    data={data}
                    margin={{
                      top: 20,
                      left: 12,
                      right: 12,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
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
                    <YAxis />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{
                        fill: '#22c55e',
                      }}
                      activeDot={{
                        r: 6,
                      }}
                    >
                      <LabelList
                        position="top"
                        offset={12}
                        className="fill-foreground"
                        fontSize={12}
                      />
                    </Line>
                  </LineChart>
                </ChartContainer>
              ) : (
                <p className="text-gray-600">
                  No tasks completed in the selected period.
                </p>
              )}
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
              {totalCompletedInPreviousPeriod > 0 ? (
                <div className="flex gap-2 font-medium leading-none text-gray-700">
                  {percentageChange >= 0 ? 'Trending up' : 'Trending down'} by{' '}
                  {Math.abs(percentageChange).toFixed(2)}% compared to previous
                  period{' '}
                  {percentageChange >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
              ) : (
                <div className="flex gap-2 font-medium leading-none text-gray-700">
                  No data for previous period
                </div>
              )}
            </CardFooter>
          </Card>

           {/* New Line Chart for Tasks Completed On Time vs Early vs Late */}
           <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tasks Completed On Time vs Early vs Late</CardTitle>
                <div className="flex items-center space-x-4">
                  {/* Date Range Selector for Chart */}
                  <Select
                    value={selectedTasksCompletionComparisonDateRange}
                    onValueChange={setSelectedTasksCompletionComparisonOverTimeDateRange}
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
            <CardContent>
              {lineChartData.length > 0 ? (
                <ChartContainer config={lineChartConfig} className="h-72 w-full">
                  <AreaChart data={lineChartData.filter(data => new Date(data.date) >= new Date(startDate) && new Date(data.date) <= new Date(endDate))} margin={{ left: -20, right: 12 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} tickCount={3} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Area dataKey="onTime" type="natural" fill={lineChartConfig.onTime.color} fillOpacity={0.4} stroke={lineChartConfig.onTime.color} stackId="a" />
                    <Area dataKey="early" type="natural" fill={lineChartConfig.early.color} fillOpacity={0.4} stroke={lineChartConfig.early.color} stackId="a" />
                    <Area dataKey="late" type="natural" fill={lineChartConfig.late.color} fillOpacity={0.4} stroke={lineChartConfig.late.color} stackId="a" />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <p className="text-gray-600">No tasks completed in the selected period.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-bold mb-4">Task Group and Tag Statistics</h2>

        {/* Top Groups and Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {/* Top 5 Groups */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-lg">
                Top 5 Completed Tasks by Group
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topGroups.length > 0 ? (
                <ChartContainer
                  className="h-64 w-full"
                  config={{
                    count: {
                      label: 'Tasks Completed',
                      color: '#22c55e', // Tailwind green-500 hex code
                    },
                  }}
                >
                  <BarChart
                    data={topGroups}
                    layout="vertical"
                    margin={{ left: 100, right: 20, top: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="group" type="category" width={100} />
                    <ChartTooltip
                      cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar
                      dataKey="count"
                      fill="#22c55e"
                      barSize={20}
                      radius={[4, 4, 4, 4]}
                    >
                      <LabelList
                        dataKey="count"
                        position="right"
                        className="fill-foreground"
                        fontSize={12}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              ) : (
                <p className="text-gray-600">
                  No completed tasks with groups in the selected period.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Top 5 Tags */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-lg">
                Top 5 Completed Tasks by Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topTags.length > 0 ? (
                <ChartContainer
                  className="h-64 w-full"
                  config={{
                    count: {
                      label: 'Tasks Completed',
                      color: '#22c55e', // Tailwind green-500 hex code
                    },
                  }}
                >
                  <BarChart
                    data={topTags}
                    layout="vertical"
                    margin={{ left: 100, right: 20, top: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="tag" type="category" width={100} />
                    <ChartTooltip
                      cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar
                      dataKey="count"
                      fill="#22c55e"
                      barSize={20}
                      radius={[4, 4, 4, 4]}
                    >
                      <LabelList
                        dataKey="count"
                        position="right"
                        className="fill-foreground"
                        fontSize={12}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              ) : (
                <p className="text-gray-600">
                  No completed tasks with tags in the selected period.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}