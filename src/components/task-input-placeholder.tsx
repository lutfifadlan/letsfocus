import React from 'react';
import { Plus } from 'lucide-react';

interface TaskInputPlaceholderProps {
  onClick: () => void;
}

const TaskInputPlaceholder: React.FC<TaskInputPlaceholderProps> = ({ onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-4 mb-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors duration-200 group"
    >
      <div className="flex items-center space-x-2">
        <Plus className="text-gray-400 group-hover:text-gray-600" size={24} />
        <span className="text-gray-500 group-hover:text-gray-700">Add a new task...</span>
      </div>
      <span className="text-sm text-gray-400 group-hover:text-gray-600">Click to add</span>
    </div>
  );
};

export default TaskInputPlaceholder;