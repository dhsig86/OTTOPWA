import React from 'react';
import { Search, Menu } from 'lucide-react';

interface TopBarProps {
  title?: string;
  onMenuClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ title = "HART'S OTTOs", onMenuClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-otto-teal text-white flex items-center justify-between px-4 z-40 shadow-md">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="p-2 hover:bg-otto-teal-dark rounded-full transition">
          <Menu size={24} />
        </button>
        <span className="font-bold text-xl tracking-tight">{title}</span>
      </div>
      
      <button className="p-2 hover:bg-otto-teal-dark rounded-full transition">
        <Search size={24} />
      </button>
    </header>
  );
};
