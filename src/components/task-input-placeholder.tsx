import React from 'react';
import { Plus } from 'lucide-react';

interface TaskInputPlaceholderProps {
  onClick: () => void;
}

const TaskInputPlaceholder: React.FC<TaskInputPlaceholderProps> = ({ onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between border-b-2 border-dashed border-gray-300 cursor-pointer hover:border-gray-400 transition-colors duration-200 group w-[620px] pb-1"
    >
      <div className="flex items-center space-x-2 text-sm">
        <Plus className="text-gray-400 group-hover:text-gray-600" size={16} />
        <span className="text-gray-500 group-hover:text-gray-700 text-sm">Add a new task</span>
      </div>
    </div>
  );
};

export default TaskInputPlaceholder;