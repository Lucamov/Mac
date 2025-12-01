import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner: React.FC<{ text?: string }> = ({ text = "Thinking..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3 animate-fade-in">
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      <span className="text-sm font-medium text-slate-400">{text}</span>
    </div>
  );
};

export default LoadingSpinner;