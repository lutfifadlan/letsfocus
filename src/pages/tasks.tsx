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
  ChevronUp,
  ChevronDown,
  Clock,
  Search,
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
import { Tooltip, TooltipProvider } from '@/components/ui/tooltip';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { CalendarDatePicker } from '@/components/calendar-date-picker';
import { InputTags } from '@/components/ui/input-tags';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCriteria, setFilterCriteria] = useState({
    createdDate: null as Date | null,
    completedDate: null as Date | null,
    deletedDate: null as Date | null,
    dueDate: null as Date | null,
    showCompleted: false,
    showPending: false,
    includeDeleted: false,
    tags: [] as string[],
    group: '',
  });
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortField, setSortField] = useState<keyof Task>('createdAt');
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
  const { toast } = useToast();

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

  const applyFilters = () => {
    let filtered = tasks;

    if (filterCriteria.createdDate) {
      filtered = filtered.filter(
        (task) =>
          new Date(task.createdAt).toDateString() ===
          new Date(filterCriteria.createdDate!).toDateString()
      );
    }
    if (filterCriteria.completedDate) {
      filtered = filtered.filter(
        (task) =>
          task.status === 'COMPLETED' &&
          task.completedAt &&
          new Date(task.completedAt).toDateString() ===
            new Date(filterCriteria.completedDate!).toDateString()
      );
    }
    if (filterCriteria.deletedDate) {
      filtered = filtered.filter(
        (task) =>
          task.isDeleted &&
          task.deletedAt &&
          new Date(task.deletedAt).toDateString() ===
            new Date(filterCriteria.deletedDate!).toDateString()
      );
    }
    if (filterCriteria.dueDate) {
      filtered = filtered.filter(
        (task) =>
          task.dueDate &&
          new Date(task.dueDate).toDateString() ===
            new Date(filterCriteria.dueDate!).toDateString()
      );
    }

    if (filterCriteria.showCompleted && !filterCriteria.showPending) {
      filtered = filtered.filter((task) => task.status === 'COMPLETED');
    }
    if (filterCriteria.showPending && !filterCriteria.showCompleted) {
      filtered = filtered.filter((task) => task.status !== 'COMPLETED');
    }

    if (!filterCriteria.includeDeleted) {
      filtered = filtered.filter((task) => !task.isDeleted);
    }

    if (filterCriteria.tags.length > 0) {
      filtered = filtered.filter((task) =>
        filterCriteria.tags.every((tag) => task.tags.includes(tag))
      );
    }

    if (filterCriteria.group) {
      filtered = filtered.filter((task) => task.group === filterCriteria.group);
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
      const valueA = a[sortField];
      const valueB = b[sortField];
  
      if (sortField === 'title' || sortField === 'group' || sortField === 'description') {
        // String comparison for string fields
        const strA = typeof valueA === 'string' ? valueA.toLowerCase() : '';
        const strB = typeof valueB === 'string' ? valueB.toLowerCase() : '';
        return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      } else if (sortField === 'tags') {
        // Handle array fields like tags
        const tagsA = Array.isArray(valueA) ? valueA.join(', ').toLowerCase() : '';
        const tagsB = Array.isArray(valueB) ? valueB.join(', ').toLowerCase() : '';
        return sortOrder === 'asc' ? tagsA.localeCompare(tagsB) : tagsB.localeCompare(tagsA);
      } else {
        // Numerical comparison for date fields
        const dateA = typeof valueA === 'string' || valueA instanceof Date ? new Date(valueA).getTime() : 0;
        const dateB = typeof valueB === 'string' || valueB instanceof Date ? new Date(valueB).getTime() : 0;
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });

    setFilteredTasks(filtered);
  };

  const resetFilters = () => {
    setFilterCriteria({
      createdDate: null,
      completedDate: null,
      deletedDate: null,
      dueDate: null,
      showCompleted: false,
      showPending: false,
      includeDeleted: false,
      tags: [],
      group: '',
    });
    setSearchTerm('');
    setSortOrder('asc');
    setSortField('createdAt');
  };

  const handleSort = (field: keyof Task) => {
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-2">
        <CardTitle className="text-center text-2xl">Tasks</CardTitle>

        {/* Search Bar and Filter Icon */}
        <div className="mb-2 flex items-center justify-between space-x-2">
          {/* Search Icon Button */}
          <Button variant="ghost" size="icon" onClick={() => setIsSearchBarVisible(!isSearchBarVisible)}>
            <Search size={16} />
          </Button>

          {/* Search Input */}
          {isSearchBarVisible && (
            <div className="flex items-center w-full space-x-2">
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

          {/* Filters Toggle Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <TooltipProvider>
                  <Tooltip>
                    <Filter size={16} />
                  </Tooltip>
                </TooltipProvider>
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
                      date={
                        filterCriteria.createdDate
                          ? { from: filterCriteria.createdDate, to: filterCriteria.createdDate }
                          : { from: undefined, to: undefined }
                      }
                      onDateSelect={(date) =>
                        setFilterCriteria({ ...filterCriteria, createdDate: date.from })
                      }
                      className="text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setFilterCriteria({ ...filterCriteria, createdDate: null })}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Completed Date</Label>
                  <div className="flex items-center">
                    <CalendarDatePicker
                      date={
                        filterCriteria.completedDate
                          ? { from: filterCriteria.completedDate, to: filterCriteria.completedDate }
                          : { from: undefined, to: undefined }
                      }
                      onDateSelect={(date) =>
                        setFilterCriteria({ ...filterCriteria, completedDate: date.from })
                      }
                      className="text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setFilterCriteria({ ...filterCriteria, completedDate: null })}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Due Date</Label>
                  <div className="flex items-center">
                    <CalendarDatePicker
                      date={
                        filterCriteria.dueDate
                          ? { from: filterCriteria.dueDate, to: filterCriteria.dueDate }
                          : { from: undefined, to: undefined }
                      }
                      onDateSelect={(date) =>
                        setFilterCriteria({ ...filterCriteria, dueDate: date.from })
                      }
                      className="text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setFilterCriteria({ ...filterCriteria, dueDate: null })}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>

                {/* Status Filters */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Checkbox
                      id="showCompleted"
                      checked={filterCriteria.showCompleted as boolean}
                      onCheckedChange={(checked: boolean) =>
                        setFilterCriteria({ ...filterCriteria, showCompleted: checked })
                      }
                    />
                    <Label htmlFor="showCompleted" className="ml-2 text-sm">
                      Completed
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="showPending"
                      checked={filterCriteria.showPending as boolean}
                      onCheckedChange={(checked: boolean) =>
                        setFilterCriteria({ ...filterCriteria, showPending: checked })
                      }
                    />
                    <Label htmlFor="showPending" className="ml-2 text-sm">
                      Pending
                    </Label>
                  </div>
                </div>

                {/* Deleted Tasks Filter */}
                <div className="flex items-center">
                  <Checkbox
                    id="includeDeleted"
                    checked={filterCriteria.includeDeleted as boolean}
                    onCheckedChange={(checked: boolean) =>
                      setFilterCriteria({ ...filterCriteria, includeDeleted: checked })
                    }
                  />
                  <Label htmlFor="includeDeleted" className="ml-2 text-sm">
                    Show Deleted Tasks
                  </Label>
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
        </div>

        {/* Display Filtered Tasks */}
        <div className="space-y-1">
          {filteredTasks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:bg-gray-100"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex flex-row items-center gap-2">
                      Title
                      {sortField === 'title' && (
                        sortOrder === 'asc' ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:bg-gray-100"
                    onClick={() => handleSort('group')}
                  >
                    <div className="flex flex-row items-center gap-2">
                      Group
                      {sortField === 'group' &&
                        (sortOrder === 'asc' ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:bg-gray-100"
                    onClick={() => handleSort('tags')}
                  >
                    <div className="flex flex-row items-center gap-2">
                      Tags
                      {sortField === 'tags' &&
                        (sortOrder === 'asc' ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:bg-gray-100"
                    onClick={() => handleSort('dueDate')}
                  >
                    <div className="flex flex-row items-center gap-2">
                      Due Date
                      {sortField === 'dueDate' &&
                        (sortOrder === 'asc' ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:bg-gray-100"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex flex-row items-center gap-2">
                      Created At
                      {sortField === 'createdAt' &&
                        (sortOrder === 'asc' ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:bg-gray-100"
                    onClick={() => handleSort('completedAt')}
                  >
                    <div className="flex flex-row items-center gap-2">
                      Completed At
                      {sortField === 'completedAt' &&
                        (sortOrder === 'asc' ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead>Time Taken</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deleted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task, index) => (
                  <TableRow key={task._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.description || '-'}</TableCell>
                    <TableCell>{task.group || '-'}</TableCell>
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
                    <TableCell>
                      {task.dueDate ? format(new Date(task.dueDate), 'PPP') : '-'}
                    </TableCell>
                    <TableCell>
                      {task.createdAt ? format(new Date(task.createdAt), 'PPP') : '-'}
                    </TableCell>
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
                      ) : (
                        <Clock size={16} />
                      )}
                    </TableCell>
                    <TableCell>{task.isDeleted ? 'Yes' : 'No'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-500 text-center text-sm">No tasks found.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}