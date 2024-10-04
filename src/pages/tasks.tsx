import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Task } from '@/interfaces';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  X,
  Filter,
  Check,
  Clock,
  Search,
  Columns,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash,
  ChevronsUp,
  ChevronUp,
  ChevronDown,
  Flag,
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { CardTitle } from '@/components/ui/card';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { CalendarDatePicker } from '@/components/calendar-date-picker';
import { InputTags } from '@/components/ui/input-tags';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCriteria, setFilterCriteria] = useState({
    createdDate: { from: null as Date | null, to: null as Date | null },
    completedDate: { from: null as Date | null, to: null as Date | null },
    dueDate: { from: null as Date | null, to: null as Date | null },
    showCompleted: false,
    showPending: false,
    showIgnored: false,
    tags: [] as string[],
    group: '',
    ignoredDate: { from: null as Date | null, to: null as Date | null },
    showCompletionStatus: false,
  });
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortField, setSortField] = useState<keyof Task | 'timeTaken' | 'status' | 'completionStatus'>('createdAt');
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    description: false,
    group: false,
    tags: false,
    createdAt: false,
    ignoredAt: false,
    completionStatus: false,
  });
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [taskFormData, setTaskFormData] = useState<Partial<Task>>({
    priority: 'Medium',
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filterCriteria, searchTerm, sortOrder, sortField, tasks]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
      setFilteredTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tasks.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const priorityOrder = ['High', 'Medium', 'Low', 'No Priority'];

  const applyFilters = () => {
    let filtered = tasks;

    if (filterCriteria.createdDate.from && filterCriteria.createdDate.to) {
      filtered = filtered.filter(
        (task) =>
          new Date(task.createdAt) >= new Date(filterCriteria.createdDate.from!) &&
          new Date(task.createdAt) <= new Date(filterCriteria.createdDate.to!)
      );
    }
    if (filterCriteria.completedDate.from && filterCriteria.completedDate.to) {
      filtered = filtered.filter(
        (task) =>
          task.status === 'COMPLETED' &&
          task.completedAt &&
          new Date(task.completedAt) >= new Date(filterCriteria.completedDate.from!) &&
          new Date(task.completedAt) <= new Date(filterCriteria.completedDate.to!)
      );
    }
    if (filterCriteria.dueDate.from && filterCriteria.dueDate.to) {
      filtered = filtered.filter(
        (task) =>
          task.dueDate &&
          new Date(task.dueDate) >= new Date(filterCriteria.dueDate.from!) &&
          new Date(task.dueDate) <= new Date(filterCriteria.dueDate.to!)
      );
    }

    if (filterCriteria.showCompleted && !filterCriteria.showPending && !filterCriteria.showIgnored) {
      filtered = filtered.filter((task) => task.status === 'COMPLETED');
    }
    if (filterCriteria.showPending && !filterCriteria.showCompleted && !filterCriteria.showIgnored) {
      filtered = filtered.filter((task) => task.status === 'PENDING');
    }
    if (filterCriteria.showIgnored && !filterCriteria.showCompleted && !filterCriteria.showPending) {
      filtered = filtered.filter((task) => task.status === 'IGNORED');
    }

    if (filterCriteria.showCompletionStatus) {
      filtered = filtered.filter((task) => {
        if (task.completedAt && task.dueDate) {
          const completedAt = new Date(task.completedAt);
          const dueDate = new Date(task.dueDate);
          return completedAt < dueDate;
        }
        return false;
      });
    }

    filtered = filtered.filter((task) => !task.isDeleted);

    if (filterCriteria.tags.length > 0) {
      filtered = filtered.filter((task) =>
        filterCriteria.tags.every((tag) => task.tags.includes(tag))
      );
    }

    if (filterCriteria.group) {
      filtered = filtered.filter((task) => task.group === filterCriteria.group);
    }

    if (filterCriteria.ignoredDate.from && filterCriteria.ignoredDate.to) {
      filtered = filtered.filter(
        (task) =>
          task.status === 'IGNORED' &&
          task.ignoredAt &&
          new Date(task.ignoredAt) >= new Date(filterCriteria.ignoredDate.from!) &&
          new Date(task.ignoredAt) <= new Date(filterCriteria.ignoredDate.to!)
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.description &&
            task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    filtered = filtered.sort((a, b) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let valueA: any = a[sortField as keyof Task];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let valueB: any = b[sortField as keyof Task];
  
      if (sortField === 'timeTaken') {
        valueA = a.completedAt && a.createdAt
          ? new Date(a.completedAt).getTime() - new Date(a.createdAt).getTime()
          : null;
        valueB = b.completedAt && b.createdAt
          ? new Date(b.completedAt).getTime() - new Date(b.createdAt).getTime()
          : null;
      } else if (sortField === 'completionStatus') {
        const getCompletionStatus = (task: Task) => {
          if (task.completedAt && task.dueDate) {
            const completedAt = new Date(task.completedAt);
            const dueDate = new Date(task.dueDate);
  
            if (completedAt < dueDate) return 'Early';
            if (completedAt.getTime() === dueDate.getTime()) return 'On Time';
            return 'Late';
          }
          return null;
        };
  
        valueA = getCompletionStatus(a);
        valueB = getCompletionStatus(b);
  
        const statusOrder = ['Early', 'On Time', 'Late'];
  
        if (valueA === null && valueB === null) return 0;
        if (valueA === null) return 1;
        if (valueB === null) return -1;
  
        return sortOrder === 'asc'
          ? statusOrder.indexOf(valueA) - statusOrder.indexOf(valueB)
          : statusOrder.indexOf(valueB) - statusOrder.indexOf(valueA);
      } else if (sortField === 'priority') {
        const priorityA = a.priority || '';
        const priorityB = b.priority || '';
        
        if (priorityA && !priorityB) return -1;
        if (!priorityA && priorityB) return 1;
        
        if (priorityA && priorityB) {
          const indexA = priorityOrder.indexOf(priorityA);
          const indexB = priorityOrder.indexOf(priorityB);
          return sortOrder === 'asc' ? indexA - indexB : indexB - indexA;
        }
        
        return 0;
      }
  
      if (valueA == null && valueB == null) return 0;
      if (valueA == null) return 1;
      if (valueB == null) return -1;
  
      if (typeof valueA === 'string') valueA = valueA.toLowerCase();
      if (typeof valueB === 'string') valueB = valueB.toLowerCase();
  
      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredTasks(filtered);
  };

  const resetFilters = () => {
    setFilterCriteria({
      createdDate: { from: null, to: null },
      completedDate: { from: null, to: null },
      dueDate: { from: null, to: null },
      showCompleted: false,
      showPending: false,
      showIgnored: false,
      tags: [],
      group: '',
      ignoredDate: { from: null, to: null },
      showCompletionStatus: false,
    });
    setSearchTerm('');
    setSortOrder('asc');
    setSortField('createdAt');
  };

  const handleSort = (field: keyof Task | 'timeTaken' | 'status' | 'completionStatus' | 'priority') => {
    const newSortOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newSortOrder);
  };

  const formatTimeTaken = (start: Date, end: Date) => {
    const diff = end.getTime() - start.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) {
      return `${days} days ${hours} hours`;
    } else if (hours > 0) {
      return `${hours} hours ${minutes} minutes`;
    } else if (minutes > 0) {
      return `${minutes} minutes ${seconds} seconds`;
    } else {
      return `${seconds} seconds`;
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
    setIsEditMode(false);
  };

  const handleEditClick = () => {
    setIsEditMode(true);
    setTaskFormData(selectedTask || {});
  };

  const handleDeleteClick = async () => {
    if (selectedTask) {
      try {
        const response = await fetch(`/api/tasks/${selectedTask._id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setTasks(tasks.filter((task) => task._id !== selectedTask._id));
          setFilteredTasks(filteredTasks.filter((task) => task._id !== selectedTask._id));
          setIsDialogOpen(false);
          toast({
            title: 'Success',
            description: 'Task deleted successfully.',
            duration: 3000,
          });
        } else {
          throw new Error('Failed to delete task');
        }
      } catch (error) {
        console.error('Failed to delete task:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete task.',
          variant: 'destructive',
          duration: 3000,
        });
      }
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTaskFormData({ ...taskFormData, [name]: value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTask) {
      try {
        const response = await fetch(`/api/tasks/${selectedTask._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskFormData),
        });
        if (response.ok) {
          const updatedTask = await response.json();
          setTasks(tasks.map((task) => (task._id === updatedTask._id ? updatedTask : task)));
          setFilteredTasks(
            filteredTasks.map((task) => (task._id === updatedTask._id ? updatedTask : task))
          );
          setIsDialogOpen(false);
          toast({
            title: 'Success',
            description: 'Task updated successfully.',
            duration: 3000,
          });
        } else {
          throw new Error('Failed to update task');
        }
      } catch (error) {
        console.error('Failed to update task:', error);
        toast({
          title: 'Error',
          description: 'Failed to update task.',
          variant: 'destructive',
          duration: 3000,
        });
      }
      fetchTasks();
    }
  };

  const renderPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High':
        return <ChevronsUp size={16} className="text-red-500" />;
      case 'Medium':
        return <ChevronUp size={16} />;
      case 'Low':
        return <ChevronDown size={16} />;
      default:
        return <Flag size={16} />;
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-2">
        <CardTitle className="text-center text-2xl">Tasks</CardTitle>

        {/* Search Bar and Toolbar */}
        <div className="mb-2 flex items-center justify-between space-x-2">
          {/* Search Icon Button */}
          <div className="flex items-center justify-start space-x-2 w-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchBarVisible(!isSearchBarVisible)}
            >
              <Search size={16} />
            </Button>

            {/* Search Input */}
            {isSearchBarVisible && (
              <div className="flex items-center justify-center w-1/2 space-x-2">
                <Input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-sm"
                />
                <Button variant="ghost" size="icon" onClick={() => setSearchTerm('')}>
                  <X size={16} />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center space-x-2">
            {/* Filters Toggle Button */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Filter size={16} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4">
                {/* Filters Content */}
                <div className="space-y-4">
                  {/* Date Filters */}
                  <div className="space-y-2">
                    <Label className="text-sm">Created Date</Label>
                    <div className="flex items-center">
                      <CalendarDatePicker
                        date={{ from: filterCriteria.createdDate.from || undefined, to: filterCriteria.createdDate.to || undefined }}
                        onDateSelect={(date) =>
                          setFilterCriteria({ ...filterCriteria, createdDate: date })
                        }
                        className="text-sm"
                        numberOfMonths={2}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setFilterCriteria({ ...filterCriteria, createdDate: { from: null, to: null } })}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Completed Date</Label>
                    <div className="flex items-center">
                      <CalendarDatePicker
                        date={{ from: filterCriteria.completedDate.from || undefined, to: filterCriteria.completedDate.to || undefined }}
                        onDateSelect={(date) =>
                          setFilterCriteria({ ...filterCriteria, completedDate: date })
                        }
                        className="text-sm"
                        numberOfMonths={2}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setFilterCriteria({ ...filterCriteria, completedDate: { from: null, to: null } })
                        }
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Due Date</Label>
                    <div className="flex items-center">
                      <CalendarDatePicker
                        date={{ from: filterCriteria.dueDate.from || undefined, to: filterCriteria.dueDate.to || undefined }}
                        onDateSelect={(date) =>
                          setFilterCriteria({ ...filterCriteria, dueDate: date })
                        }
                        className="text-sm"
                        numberOfMonths={2}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setFilterCriteria({ ...filterCriteria, dueDate: { from: null, to: null } })}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Ignored Date</Label>
                    <div className="flex items-center">
                      <CalendarDatePicker
                        date={{ from: filterCriteria.ignoredDate.from || undefined, to: filterCriteria.ignoredDate.to || undefined }}
                        onDateSelect={(date) =>
                          setFilterCriteria({ ...filterCriteria, ignoredDate: date })
                        }
                        className="text-sm"
                        numberOfMonths={1}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setFilterCriteria({ ...filterCriteria, ignoredDate: { from: null, to: null } })}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-4 p-4">
                    {[
                      { id: "showCompleted", label: "Completed", checked: filterCriteria.showCompleted },
                      { id: "showPending", label: "Pending", checked: filterCriteria.showPending },
                      { id: "showIgnored", label: "Ignored", checked: filterCriteria.showIgnored }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={item.id}
                          checked={item.checked as boolean}
                          onCheckedChange={(checked: boolean) =>
                            setFilterCriteria({ ...filterCriteria, [item.id]: checked })
                          }
                          className="rounded border-gray-300 focus:ring-emerald-400"
                        />
                        <Label htmlFor={item.id} className="text-sm font-medium">
                          {item.label}
                        </Label>
                      </div>
                    ))}
                  </div>

                  {/* Tags Filter */}
                  <div>
                    <Label className="text-sm">Tags</Label>
                    <InputTags
                      type="text"
                      value={filterCriteria.tags}
                      onChange={(value) =>
                        setFilterCriteria({
                          ...filterCriteria,
                          tags: value as string[],
                        })
                      }
                      placeholder="Tags"
                      className="text-sm"
                    />
                  </div>

                  {/* Group Filter */}
                  <div>
                    <Label className="text-sm">Group</Label>
                    <Input
                      type="text"
                      value={filterCriteria.group}
                      onChange={(e) =>
                        setFilterCriteria({
                          ...filterCriteria,
                          group: e.target.value,
                        })
                      }
                      placeholder="Group"
                      className="text-sm"
                    />
                  </div>

                  {/* Reset Filters Button */}
                  <Button variant="outline" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Columns Toggle Button */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Columns size={16} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox
                      id="description"
                      checked={visibleColumns.description}
                      onCheckedChange={(checked: boolean) =>
                        setVisibleColumns({ ...visibleColumns, description: checked })
                      }
                    />
                    <Label htmlFor="description" className="ml-2 text-sm">
                      Description
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="group"
                      checked={!!visibleColumns.group}
                      onCheckedChange={(checked: boolean) =>
                        setVisibleColumns({ ...visibleColumns, group: checked })
                      }
                    />
                    <Label htmlFor="group" className="ml-2 text-sm">
                      Group
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="tags"
                      checked={!!visibleColumns.tags}
                      onCheckedChange={(checked: boolean) =>
                        setVisibleColumns({ ...visibleColumns, tags: checked })
                      }
                    />
                    <Label htmlFor="tags" className="ml-2 text-sm">
                      Tags
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="createdAt"
                      checked={!!visibleColumns.createdAt}
                      onCheckedChange={(checked: boolean) =>
                        setVisibleColumns({ ...visibleColumns, createdAt: checked })
                      }
                    />
                    <Label htmlFor="createdAt" className="ml-2 text-sm">
                      Created At
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="ignoredAt"
                      checked={!!visibleColumns.ignoredAt}
                      onCheckedChange={(checked: boolean) =>
                        setVisibleColumns({ ...visibleColumns, ignoredAt: checked })
                      }
                    />
                    <Label htmlFor="ignoredAt" className="ml-2 text-sm">
                      Ignored At
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="completionStatus"
                      checked={!!visibleColumns.completionStatus}
                      onCheckedChange={(checked: boolean) =>
                        setVisibleColumns({ ...visibleColumns, completionStatus: checked })
                      }
                    />
                    <Label htmlFor="completionStatus" className="ml-2 text-sm">
                      Completion Status
                    </Label>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Display Filtered Tasks */}
        <div className="space-y-1">
          {filteredTasks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex flex-row items-center gap-2">
                      Title
                      {sortField === 'title' ? (
                        sortOrder === 'asc' ? (
                          <ArrowDown size={16} />
                        ) : (
                          <ArrowUp size={16} />
                        )
                      ) : (
                        <ArrowUpDown size={16} />
                      )}
                    </div>
                  </TableHead>
                  {visibleColumns.description && <TableHead>Description</TableHead>}
                  {visibleColumns.group && (
                    <TableHead
                      className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort('group')}
                    >
                      <div className="flex flex-row items-center gap-2">
                        Group
                        {sortField === 'group' ? (
                          sortOrder === 'asc' ? (
                            <ArrowDown size={16} />
                          ) : (
                            <ArrowUp size={16} />
                          )
                        ) : (
                          <ArrowUpDown size={16} />
                        )}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.tags && (
                    <TableHead>
                      Tags
                    </TableHead>
                  )}
                  <TableHead
                    className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => handleSort('dueDate')}
                  >
                    <div className="flex flex-row items-center gap-2">
                      Due Date
                      {sortField === 'dueDate' ? (
                        sortOrder === 'asc' ? (
                          <ArrowDown size={16} />
                        ) : (
                          <ArrowUp size={16} />
                        )
                      ) : (
                        <ArrowUpDown size={16} />
                      )}
                    </div>
                  </TableHead>
                  {visibleColumns.createdAt && (
                    <TableHead
                      className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex flex-row items-center gap-2">
                        Created At
                        {sortField === 'createdAt' ? (
                          sortOrder === 'asc' ? (
                            <ArrowDown size={16} />
                          ) : (
                            <ArrowUp size={16} />
                          )
                        ) : (
                          <ArrowUpDown size={16} />
                        )}
                      </div>
                    </TableHead>
                  )}
                  <TableHead
                    className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => handleSort('completedAt')}
                  >
                    <div className="flex flex-row items-center gap-2">
                      Completed At
                      {sortField === 'completedAt' ? (
                        sortOrder === 'asc' ? (
                          <ArrowDown size={16} />
                        ) : (
                          <ArrowUp size={16} />
                        )
                      ) : (
                        <ArrowUpDown size={16} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => handleSort('timeTaken')}
                  >
                    <div className="flex flex-row items-center gap-2">
                      Time Taken
                      {sortField === 'timeTaken' ? (
                        sortOrder === 'asc' ? (
                          <ArrowDown size={16} />
                        ) : (
                          <ArrowUp size={16} />
                        )
                      ) : (
                        <ArrowUpDown size={16} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex flex-row items-center gap-2">
                      Status
                      {sortField === 'status' ? (
                        sortOrder === 'asc' ? (
                          <ArrowUp size={16} />
                        ) : (
                          <ArrowDown size={16} />
                        )
                      ) : (
                        <ArrowUpDown size={16} />
                      )}
                    </div>
                  </TableHead>
                  {visibleColumns.completionStatus && (
                    <TableHead
                      className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort('completionStatus')}
                    >
                      <div className="flex flex-row items-center gap-2">
                        Completion Status
                        {sortField === 'completionStatus' ? (
                          sortOrder === 'asc' ? (
                            <ArrowDown size={16} />
                          ) : (
                            <ArrowUp size={16} />
                          )
                        ) : (
                          <ArrowUpDown size={16} />
                        )}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.ignoredAt && (
                    <TableHead
                      className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort('ignoredAt')}
                    >
                      <div className="flex flex-row items-center gap-2">
                        Ignored At
                        {sortField === 'ignoredAt' ? (
                          sortOrder === 'asc' ? (
                            <ArrowDown size={16} />
                          ) : (
                            <ArrowUp size={16} />
                          )
                        ) : (
                          <ArrowUpDown size={16} />
                        )}
                      </div>
                    </TableHead>
                  )}
                  <TableHead
                    className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => handleSort('priority')}
                  >
                    <div className="flex flex-row items-center gap-2">
                      Priority
                      {sortField === 'priority' ? (
                        sortOrder === 'asc' ? (
                          <ArrowUp size={16} />
                        ) : (
                          <ArrowDown size={16} />
                        )
                      ) : (
                        <ArrowUpDown size={16} />
                      )}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task, index) => (
                  <TableRow key={task._id} onClick={() => handleTaskClick(task)} className="cursor-pointer">
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{task.title}</TableCell>
                    {visibleColumns.description && (
                      <TableCell>{task.description || '-'}</TableCell>
                    )}
                    {visibleColumns.group && <TableCell>{task.group || '-'}</TableCell>}
                    {visibleColumns.tags && (
                      <TableCell>
                        {task.tags && task.tags.length > 0 ? (
                          task.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-sm">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      {task.dueDate ? format(new Date(task.dueDate), 'PPP') : '-'}
                    </TableCell>
                    {visibleColumns.createdAt && (
                      <TableCell>
                        {task.createdAt ? format(new Date(task.createdAt), 'PPP') : '-'}
                      </TableCell>
                    )}
                    <TableCell>
                      {task.completedAt ? format(new Date(task.completedAt), 'PPP') : '-'}
                    </TableCell>
                    <TableCell>
                      {task.completedAt && task.createdAt
                        ? formatTimeTaken(new Date(task.createdAt), new Date(task.completedAt))
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {task.status === 'COMPLETED' ? (
                        <Check size={16} />
                      ) : task.status === 'IGNORED' ? (
                        <X size={16} />
                      ) : (
                        <Clock size={16} />
                      )}
                    </TableCell>
                    {visibleColumns.completionStatus && (
                      <TableCell>
                        { task.completedAt && task.dueDate && new Date(task.completedAt).toDateString() === new Date(task.dueDate).toDateString() ? (
                          <Badge variant="outline" className="text-sm text-green-500">
                            On Time
                          </Badge>
                        ) : task.completedAt && task.dueDate && new Date(task.completedAt) < new Date(task.dueDate) ? (
                          <Badge variant="outline" className="text-sm text-blue-500">
                            Early
                          </Badge>
                        ) : task.completedAt && task.dueDate && new Date(task.completedAt) > new Date(task.dueDate) ?  (
                          <Badge variant="outline" className="text-sm text-red-500">
                            Late
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    )}
                    {visibleColumns.ignoredAt && (
                      <TableCell>
                        {task.ignoredAt ? format(new Date(task.ignoredAt), 'PPP') : '-'}
                      </TableCell>
                    )}
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            {renderPriorityIcon(task.priority || 'No Priority')}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{task.priority || 'No Priority'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-500 text-center text-sm">No tasks found.</p>
          )}
        </div>
      </div>

      {/* Task Details Dialog */}
      {selectedTask && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center space-x-2">
                <span>{isEditMode ? 'Edit Task' : selectedTask.title}</span>
              </DialogTitle>
              <DialogClose />
            </DialogHeader>
            <div className="p-2 space-y-3">
              {isEditMode ? (
                // Render the edit form
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-base font-medium">
                      Title
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      type="text"
                      value={taskFormData.title || ''}
                      onChange={handleFormChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  {/* Description */}
                  <div>
                    <Label
                      htmlFor="description"
                      className="text-base font-medium"
                    >
                      Description
                    </Label>
                    <textarea
                      id="description"
                      name="description"
                      value={taskFormData.description || ''}
                      onChange={handleFormChange}
                      className="mt-1 w-full border rounded p-2"
                    />
                  </div>
                  {/* Group */}
                  <div>
                    <Label htmlFor="group" className="text-base font-medium">
                      Group
                    </Label>
                    <Input
                      id="group"
                      name="group"
                      type="text"
                      value={taskFormData.group || ''}
                      onChange={handleFormChange}
                      className="mt-1"
                    />
                  </div>
                  {/* Tags */}
                  <div>
                    <Label htmlFor="tags" className="text-base font-medium">
                      Tags
                    </Label>
                    <InputTags
                      type="text"
                      id="tags"
                      name="tags"
                      value={taskFormData.tags || []}
                      onChange={(value) =>
                        setTaskFormData({ ...taskFormData, tags: value as string[] })
                      }
                    />
                  </div>
                  {/* Due Date */}
                  <div>
                    <Label htmlFor="dueDate" className="text-base font-medium">
                      Due Date
                    </Label>
                    <CalendarDatePicker
                      date={
                        taskFormData.dueDate
                          ? {
                              from: new Date(taskFormData.dueDate),
                              to: new Date(taskFormData.dueDate),
                            }
                          : { from: undefined, to: undefined }
                      }
                      onDateSelect={(date) =>
                        setTaskFormData({
                          ...taskFormData,
                          dueDate: date.from
                            ? new Date(date.from)
                            : null,
                        })
                      }
                      className="text-sm"
                      numberOfMonths={1}
                    />
                  </div>
                  {/* Priority */}
                  <div>
                    <Label htmlFor="priority" className="text-base font-medium">
                      Priority
                    </Label>
                    <div className="flex space-x-2 mt-1">
                      {['High', 'Medium', 'Low', ''].map((priority) => (
                        <TooltipProvider key={priority}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant={taskFormData.priority === priority ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setTaskFormData({ ...taskFormData, priority })}
                              >
                                {renderPriorityIcon(priority)}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{priority}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>
                  {/* Status */}
                  <div>
                    <Label htmlFor="status" className="text-base font-medium">
                      Status
                    </Label>
                    <div className="flex space-x-2 mt-1">
                      {['PENDING', 'COMPLETED', 'IGNORED'].map((status) => (
                        <Button
                          key={status}
                          variant={taskFormData.status === status ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTaskFormData({ ...taskFormData, status })}
                        >
                          {status === 'COMPLETED' ? <Check size={16} className="mr-1"/> :
                           status === 'IGNORED' ? <X size={16} className="mr-1"/> :
                           <Clock size={16} className="mr-1"/>}
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setIsEditMode(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                  </div>
                </form>
              ) : (
                // Render the task details
                <>
                  {/* Description */}
                  {selectedTask.description && (
                    <div>
                      <Label className="text-base font-medium">Description</Label>
                      <p className="text-sm text-gray-700 mt-1">
                        {selectedTask.description}
                      </p>
                    </div>
                  )}

                  {/* Group and Tags */}
                  <div className="flex flex-wrap space-x-6">
                    {selectedTask.group && (
                      <div>
                        <Label className="text-base font-medium">Group</Label>
                        <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">
                          {selectedTask.group}
                        </p>
                      </div>
                    )}
                    {selectedTask.tags && selectedTask.tags.length > 0 && (
                      <div>
                        <Label className="text-base font-medium">Tags</Label>
                        <div className="flex flex-wrap mt-1">
                          {selectedTask.tags.map((tag, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-sm mr-1 mb-1"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dates and Time Taken */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-base font-medium">Created At</Label>
                      <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">
                        {selectedTask.createdAt
                          ? format(new Date(selectedTask.createdAt), 'PPpp')
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-base font-medium">Due Date</Label>
                      <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">
                        {selectedTask.dueDate
                          ? format(new Date(selectedTask.dueDate), 'PPpp')
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-base font-medium">Completed At</Label>
                      <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">
                        {selectedTask.completedAt
                          ? format(new Date(selectedTask.completedAt), 'PPpp')
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-base font-medium">Ignored At</Label>
                      <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">
                        {selectedTask.ignoredAt
                          ? format(new Date(selectedTask.ignoredAt), 'PPpp')
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-base font-medium">Time Taken</Label>
                      <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">
                        {selectedTask.completedAt && selectedTask.createdAt
                          ? formatTimeTaken(
                              new Date(selectedTask.createdAt),
                              new Date(selectedTask.completedAt)
                            )
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <Label className="text-base font-medium">Priority</Label>
                    <div className="flex items-center mt-1">
                      {renderPriorityIcon(selectedTask.priority || 'No Priority')}
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">
                        {selectedTask.priority || 'No Priority'}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center space-x-2">
                    <Label className="text-base font-medium">Status:</Label>
                    {selectedTask.status === 'COMPLETED' ? (
                      <Badge variant="outline" className="flex items-center">
                        <Check size={16} className="mr-1" /> Completed
                      </Badge>
                    ) : selectedTask.status === 'IGNORED' ? (
                      <Badge variant="outline" className="flex items-center">
                        <X size={16} className="mr-1" /> Ignored
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center">
                        <Clock size={16} className="mr-1" /> Pending
                      </Badge>
                    )}
                  </div>

                  {/* Completion Status */}
                  {selectedTask.completedAt && selectedTask.dueDate && (
                    <div>
                      <Label className="text-base font-medium">Completion Status</Label>
                      <Badge
                        variant="outline"
                        className={`text-sm mt-1 ${
                          new Date(selectedTask.completedAt) <= new Date(selectedTask.dueDate)
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        {new Date(selectedTask.completedAt).toDateString() === new Date(selectedTask.dueDate).toDateString()
                          ? 'On Time'
                          : new Date(selectedTask.completedAt) < new Date(selectedTask.dueDate)
                          ? 'Early'
                          : 'Late'}
                      </Badge>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button variant="ghost" onClick={handleEditClick}>
                            <Edit size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit Task</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button variant="ghost" onClick={handleDeleteClick}>
                            <Trash size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete Task</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
}