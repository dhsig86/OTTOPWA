import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  onMenuClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { userName, profile, isPremium } = useAuth();
  const navigate = useNavigate();

  const getProfileLabel = () => {
    switch (profile) {
      case 'medico': return 'Otorrinolaringologista';
      case 'estudante': return 'Residente / Acadêmico';
      case 'paciente': return 'Paciente';
      default: return 'Usuário';
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'US';
    // Se for 'Dr. Dario Hart', queremos 'DH'
    const parts = name.replace(/^Dr\.?\s*/i, '').split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <header className="sticky top-0 left-0 right-0 pt-10 bg-[#1D9E75] text-white flex flex-col z-40 shadow-sm">
        <div className="flex flex-row items-center justify-between px-5 pb-5 w-full relative">
          <div className="flex items-center gap-2 z-10">
            <button onClick={() => navigate('/search')} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors pointer-events-auto">
              <Search size={18} />
            </button>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-5 pt-0">
            <h1 className="text-2xl font-extrabold tracking-tight leading-none text-center">HART'S OTTO</h1>
          </div>
          <div className="flex items-center gap-2 z-10">
            <button onClick={() => navigate('/notifications')} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors pointer-events-auto">
              <Bell size={18} />
            </button>
            <button onClick={onMenuClick} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors pointer-events-auto">
              <Menu size={18} />
            </button>
          </div>
        </div>
        
        {/* Profile Block (Dark Green) */}
        <div className="bg-[#0F6E56] px-5 py-3 w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex flex-col items-center justify-center border border-white/10 shrink-0">
              <span className="font-bold text-sm tracking-widest text-[#1D9E75] uppercase bg-[#E1F7EE] w-full h-full rounded-full flex items-center justify-center">
                {getInitials(userName || '')}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold line-clamp-1">{userName || 'Usuário'}</span>
              <span className="text-xs text-[#CDF0E3]">{getProfileLabel()}</span>
            </div>
          </div>
          
          {/* Badge Premium */}
          {isPremium ? (
            <span className="bg-[#EF9F27] text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm shrink-0 flex items-center gap-1">
              ⭐ OTTO PRO
            </span>
          ) : (
            <button
              onClick={() => navigate('/modules/premium')}
              className="bg-[#EF9F27] hover:bg-[#D58C20] text-white px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm shrink-0"
            >
              Seja Premium
            </button>
          )}
        </div>
      </header>
    </>
  );
};
