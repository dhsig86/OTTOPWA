import React, { useState } from 'react';
import { OTTO_MODULES } from '../config/modules';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Home: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  // We can filter by profile, or show all if we want them to see what exists
  // but let's default to filtering by their profile if they have one.
  const [activeFilter, setActiveFilter] = useState<'todos' | 'medico' | 'estudante' | 'paciente'>('todos');

  const handleRunModule = (url: string, external: boolean, status: string) => {
    if (status === 'coming-soon') return;
    if (external) {
      navigate('/modules/webview', { state: { url } });
    } else {
      navigate(url);
    }
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'clinico': return 'bg-otto-teal-light text-otto-teal-darker';
      case 'educacao': return 'bg-[#E6F1FB] text-blue-800';
      case 'paciente': return 'bg-[#EEEDFE] text-purple-800';
      case 'gestao': return 'bg-[#FAEEDA] text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const visibleModules = OTTO_MODULES.filter(mod => {
    if (activeFilter === 'todos') {
      if (!profile) return true;
      return mod.profiles.includes(profile);
    }
    return mod.profiles.includes(activeFilter as any);
  });

  return (
    <div className="p-4 space-y-6 pb-20">
      
      {/* Filtros */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['todos', 'medico', 'estudante', 'paciente'].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f as any)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === f
                ? 'bg-otto-teal text-white shadow-sm'
                : 'bg-white border border-otto-border text-otto-muted hover:bg-gray-50'
            }`}
          >
            {f === 'todos' ? 'Meu Perfil' : 
             f === 'medico' ? 'Médicos' : 
             f === 'estudante' ? 'Estudantes' : 'Pacientes'}
          </button>
        ))}
      </div>

      {/* Grid de módulos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {visibleModules.map(mod => {
          const Icon = mod.icon;
          const isComingSoon = mod.status === 'coming-soon';

          return (
            <button
              key={mod.id}
              disabled={isComingSoon}
              onClick={() => handleRunModule(mod.url, mod.external, mod.status)}
              className={`relative bg-white rounded-xl p-4 flex flex-col items-center justify-start text-center border border-otto-border/50 shadow-sm transition-all
                ${isComingSoon ? 'opacity-60 cursor-not-allowed grayscale-[0.5]' : 'hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm'}
              `}
            >
              {mod.status === 'beta' && (
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                </span>
              )}
              
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-inner ${getCategoryColor(mod.category)}`}>
                <Icon size={28} className={mod.status === 'beta' ? 'text-otto-teal-dark' : ''} />
              </div>
              
              <h3 className="font-bold text-sm text-otto-text leading-tight mb-1">{mod.name}</h3>
              <p className="text-[10px] text-otto-muted leading-tight line-clamp-2">{mod.description}</p>
              
              {isComingSoon && (
                <div className="absolute inset-x-0 bottom-2 text-[10px] uppercase font-bold text-otto-muted tracking-wider">
                  Em Breve
                </div>
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
};
