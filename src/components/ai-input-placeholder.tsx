import React from 'react';
import { Sparkles } from 'lucide-react';

interface AiInputPlaceholderProps {
  onClick: () => void;
}

const AiInputPlaceholder: React.FC<AiInputPlaceholderProps> = ({ onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between border-b-2 border-dashed border-gray-300 cursor-pointer hover:border-gray-400 transition-colors duration-200 group pr-2 pb-1"
    >
      <div className="flex items-center space-x-2 text-sm">
        <Sparkles className="text-gray-400 group-hover:text-gray-600" size={16} />
        <span className="text-gray-500 group-hover:text-gray-700 text-sm">Generate to-do lists using AI</span>
      </div>
    </div>
  );
};

export default AiInputPlaceholder;