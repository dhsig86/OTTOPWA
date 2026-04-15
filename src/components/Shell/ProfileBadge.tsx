import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, ShieldCheck } from 'lucide-react';

export const ProfileBadge: React.FC = () => {
  const { profile } = useAuth();
  
  const getProfileInfo = () => {
    switch(profile) {
      case 'medico': return { label: 'Médico (ORL/CCP)', bg: 'bg-otto-teal', text: 'text-white' };
      case 'estudante': return { label: 'Estudante/Residente', bg: 'bg-blue-600', text: 'text-white' };
      case 'paciente': return { label: 'Paciente', bg: 'bg-purple-600', text: 'text-white' };
      default: return { label: 'Visitante', bg: 'bg-gray-400', text: 'text-white' };
    }
  };

  const info = getProfileInfo();

  return (
    <div className="flex items-center gap-3 w-full">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${info.bg} ${info.text}`}>
        <User size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-otto-text truncate">
          {profile ? 'Dr(a). Usuário' : 'Visitante'}
        </h4>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`text-[10px] uppercase font-bold tracking-wider ${info.text} ${info.bg} px-1.5 py-0.5 rounded`}>
            {info.label}
          </span>
          {profile === 'medico' && (
            <span className="flex items-center gap-0.5 text-[10px] uppercase font-bold tracking-wider text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
              <ShieldCheck size={10} />
              Premium
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
