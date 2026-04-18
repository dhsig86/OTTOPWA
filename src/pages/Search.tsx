import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, ArrowRight } from 'lucide-react';
import { OTTO_MODULES } from '../config/modules';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const { profile } = useAuth();
  const navigate = useNavigate();

  const filteredModules = useMemo(() => {
    if (!query.trim()) return [];
    
    return OTTO_MODULES.filter(mod => {
      // Filtrar pelo perfil
      if (profile && !mod.profiles.includes(profile)) return false;
      
      const searchStr = `${mod.name} ${mod.description} ${mod.tags?.join(' ') || ''}`.toLowerCase();
      return searchStr.includes(query.toLowerCase());
    });
  }, [query, profile]);

  const handleRunModule = (modulePath: string, external: boolean, status: string) => {
    if (status === 'coming-soon') return;
    if (external) {
      navigate('/modules/webview', { state: { url: modulePath } });
    } else {
      navigate(modulePath);
    }
  };

  return (
    <div className="flex flex-col min-h-full p-4 pb-20">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md pt-2 pb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="text-gray-400" size={20} />
          </div>
          <input
            type="text"
            className="w-full bg-gray-100 border-none rounded-xl py-3 pl-10 pr-4 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-[#1D9E75] focus:outline-none shadow-inner"
            placeholder="Buscar ferramentas, cursos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      <div className="mt-4 flex-1">
        {!query.trim() ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <SearchIcon size={32} className="mb-2 opacity-50" />
            <p className="text-sm">Digite para buscar no ecossistema OTTO</p>
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500">
            <p className="font-medium">Nenhum resultado encontrado.</p>
            <p className="text-xs mt-1">Tente buscar por termos diferentes.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredModules.map((mod, index) => {
              const Icon = mod.icon;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={mod.id}
                  onClick={() => handleRunModule(mod.url, mod.external, mod.status)}
                  className={`flex items-center p-4 rounded-2xl border ${mod.status === 'coming-soon' ? 'opacity-50 grayscale border-gray-200' : 'bg-white border-gray-100 shadow-sm hover:shadow-md cursor-pointer'} transition-all`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${mod.iconBg || 'bg-gray-100 text-gray-500'}`}>
                    <Icon size={24} />
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 truncate flex items-center gap-2">
                      {mod.name}
                      {mod.status === 'beta' && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Beta</span>}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{mod.description}</p>
                  </div>
                  {mod.status !== 'coming-soon' && (
                    <div className="ml-2 bg-gray-50 w-8 h-8 rounded-full flex items-center justify-center text-gray-400">
                      <ArrowRight size={16} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
