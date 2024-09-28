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

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCriteria, setFilterCriteria] = useState({
    createdDate: null as Date | null,
    completedDate: null as Date | null,
    dueDate: null as Date | null,
    showCompleted: false,
    showPending: false,
    tags: [] as string[],
    group: '',
  });
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortField, setSortField] = useState<keyof Task | 'timeTaken' | 'status'>('createdAt');
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    description: false,
    group: false,
    tags: false,
    createdAt: false,
  });
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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

    // Always exclude deleted tasks
    filtered = filtered.filter((task) => !task.isDeleted);

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
      let valueA: string | number | boolean | Date | string[] | null;
      let valueB: string | number | boolean | Date | string[] | null;
  
      if (sortField === 'timeTaken') {
        valueA =
          a.completedAt && a.createdAt
            ? new Date(a.completedAt).getTime() - new Date(a.createdAt).getTime()
            : 0;
        valueB =
          b.completedAt && b.createdAt
            ? new Date(b.completedAt).getTime() - new Date(b.createdAt).getTime()
            : 0;
      } else {
        valueA = a[sortField];
        valueB = b[sortField];
      }  

      if (
        sortField === 'title' ||
        sortField === 'group' ||
        sortField === 'description' ||
        sortField === 'status'
      ) {
        const strA = typeof valueA === 'string' ? valueA.toLowerCase() : '';
        const strB = typeof valueB === 'string' ? valueB.toLowerCase() : '';
        return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      } else if (sortField === 'tags') {
        const tagsA = Array.isArray(valueA) ? valueA.join(', ').toLowerCase() : '';
        const tagsB = Array.isArray(valueB) ? valueB.join(', ').toLowerCase() : '';
        return sortOrder === 'asc' ? tagsA.localeCompare(tagsB) : tagsB.localeCompare(tagsA);
      } else {
        const numA =
          typeof valueA === 'number' ? valueA : valueA instanceof Date ? valueA.getTime() : 0;
        const numB =
          typeof valueB === 'number' ? valueB : valueB instanceof Date ? valueB.getTime() : 0;
        return sortOrder === 'asc' ? numA - numB : numB - numA;
      }
    });

    setFilteredTasks(filtered);
  };

  const resetFilters = () => {
    setFilterCriteria({
      createdDate: null,
      completedDate: null,
      dueDate: null,
      showCompleted: false,
      showPending: false,
      tags: [],
      group: '',
    });
    setSearchTerm('');
    setSortOrder('asc');
    setSortField('createdAt');
  };

  const handleSort = (field: keyof Task | 'timeTaken' | 'status') => {
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
                        date={
                          filterCriteria.createdDate
                            ? { from: filterCriteria.createdDate, to: filterCriteria.createdDate }
                            : { from: undefined, to: undefined }
                        }
                        onDateSelect={(date) =>
                          setFilterCriteria({ ...filterCriteria, createdDate: date.from })
                        }
                        className="text-sm"
                        numberOfMonths={1}
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
                        numberOfMonths={1}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setFilterCriteria({ ...filterCriteria, completedDate: null })
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
                        date={
                          filterCriteria.dueDate
                            ? { from: filterCriteria.dueDate, to: filterCriteria.dueDate }
                            : { from: undefined, to: undefined }
                        }
                        onDateSelect={(date) =>
                          setFilterCriteria({ ...filterCriteria, dueDate: date.from })
                        }
                        className="text-sm"
                        numberOfMonths={1}
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
                    className="cursor-pointer select-none hover:bg-gray-100"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex flex-row items-center gap-2">
                      Title
                      {sortField === 'title' ? (
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
                  {visibleColumns.description && <TableHead>Description</TableHead>}
                  {visibleColumns.group && (
                    <TableHead
                      className="cursor-pointer select-none hover:bg-gray-100"
                      onClick={() => handleSort('group')}
                    >
                      <div className="flex flex-row items-center gap-2">
                        Group
                        {sortField === 'group' ? (
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
                  )}
                  {visibleColumns.tags && (
                    <TableHead
                      className="cursor-pointer select-none hover:bg-gray-100"
                      onClick={() => handleSort('tags')}
                    >
                      <div className="flex flex-row items-center gap-2">
                        Tags
                        {sortField === 'tags' ? (
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
                  )}
                  <TableHead
                    className="cursor-pointer select-none hover:bg-gray-100"
                    onClick={() => handleSort('dueDate')}
                  >
                    <div className="flex flex-row items-center gap-2">
                      Due Date
                      {sortField === 'dueDate' ? (
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
                  {visibleColumns.createdAt && (
                    <TableHead
                      className="cursor-pointer select-none hover:bg-gray-100"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex flex-row items-center gap-2">
                        Created At
                        {sortField === 'createdAt' ? (
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
                  )}
                  <TableHead
                    className="cursor-pointer select-none hover:bg-gray-100"
                    onClick={() => handleSort('completedAt')}
                  >
                    <div className="flex flex-row items-center gap-2">
                      Completed At
                      {sortField === 'completedAt' ? (
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
                  <TableHead
                    className="cursor-pointer select-none hover:bg-gray-100"
                    onClick={() => handleSort('timeTaken')}
                  >
                    <div className="flex flex-row items-center gap-2">
                      Time Taken
                      {sortField === 'timeTaken' ? (
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
                  <TableHead
                    className="cursor-pointer select-none hover:bg-gray-100"
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
                      ) : (
                        <Clock size={16} />
                      )}
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
                <span>{selectedTask.title}</span>
              </DialogTitle>
              <DialogClose />
            </DialogHeader>
            <div className="p-2 space-y-3">
              {/* Description */}
              {selectedTask.description && (
                <div>
                  <Label className="text-base font-medium">Description</Label>
                  <p className="text-sm text-gray-700 mt-1">{selectedTask.description}</p>
                </div>
              )}

              {/* Group and Tags */}
              <div className="flex flex-wrap space-x-6">
                {selectedTask.group && (
                  <div>
                    <Label className="text-base font-medium">Group</Label>
                    <p className="text-sm text-gray-700 mt-1">{selectedTask.group}</p>
                  </div>
                )}
                {selectedTask.tags && selectedTask.tags.length > 0 && (
                  <div>
                    <Label className="text-base font-medium">Tags</Label>
                    <div className="flex flex-wrap mt-1">
                      {selectedTask.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-sm mr-1 mb-1">
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
                  <p className="text-sm text-gray-700 mt-1">
                    {selectedTask.createdAt ? format(new Date(selectedTask.createdAt), 'PPpp') : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-base font-medium">Due Date</Label>
                  <p className="text-sm text-gray-700 mt-1">
                    {selectedTask.dueDate ? format(new Date(selectedTask.dueDate), 'PPpp') : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-base font-medium">Completed At</Label>
                  <p className="text-sm text-gray-700 mt-1">
                    {selectedTask.completedAt ? format(new Date(selectedTask.completedAt), 'PPpp') : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-base font-medium">Time Taken</Label>
                  <p className="text-sm text-gray-700 mt-1">
                    {selectedTask.completedAt && selectedTask.createdAt
                      ? formatTimeTaken(
                          new Date(selectedTask.createdAt),
                          new Date(selectedTask.completedAt)
                        )
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2">
                <Label className="text-base font-medium">Status:</Label>
                {selectedTask.status === 'COMPLETED' ? (
                  <Badge variant="outline" className="flex items-center">
                    <Check size={16} className="mr-1" /> Completed
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center">
                    <Clock size={16} className="mr-1" /> Pending
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="ghost" onClick={() => {/* Handle Edit */}}>
                  <Edit size={16} />
                </Button>
                <Button variant="ghost" onClick={() => {/* Handle Delete */}}>
                  <Trash size={16} />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
}