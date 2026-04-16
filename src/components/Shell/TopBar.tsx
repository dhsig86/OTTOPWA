import React from 'react';
import { Menu, Search } from 'lucide-react';

interface TopBarProps {
  title?: string;
  onMenuClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ title = "Hart's OTTOs", onMenuClick }) => {
  return (
    <>
      <header className="sticky top-0 left-0 right-0 pt-10 bg-[#1D9E75] text-white flex flex-col z-40 shadow-sm">
        <div className="flex flex-row items-start justify-between px-5 pb-5">
          <div className="flex flex-col">
            <h1 className="text-3xl font-extrabold tracking-tight leading-none">{title}</h1>
            <span className="text-[13px] text-otto-teal-light font-medium mt-1">OtoAtlas · CCP</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
              <Search size={18} />
            </button>
            <button onClick={onMenuClick} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
              <Menu size={18} />
            </button>
          </div>
        </div>
        
        {/* Profile Block (Dark Green) */}
        <div className="bg-[#0F6E56] px-5 py-3 w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex flex-col items-center justify-center border border-white/10">
              <span className="font-bold text-sm tracking-widest text-[#1D9E75] uppercase bg-[#E1F7EE] w-full h-full rounded-full flex items-center justify-center">DR</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold">Dr. Rafael</span>
              <span className="text-xs text-otto-teal-light">Otorrinolaringologista</span>
            </div>
          </div>
          
          {/* Badge Premium */}
          <button className="bg-[#EF9F27] hover:bg-[#D58C20] text-white px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm">
            Premium
          </button>
        </div>
      </header>
    </>
  );
};
