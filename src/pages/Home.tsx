import React, { useState } from 'react';
import { OTTO_MODULES } from '../config/modules';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';

export const Home: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  // Se usuário tem profile, esse é o padrao dele, senão usa 'medico'
  const [activeFilter, setActiveFilter] = useState<'medico' | 'estudante' | 'paciente'>(profile || 'medico');

  const handleRunModule = (url: string, external: boolean, status: string) => {
    if (status === 'coming-soon') return;
    if (external) {
      if(url) {
        navigate('/modules/webview', { state: { url } });
      }
    } else {
      if(url) navigate(url);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  };

  // Funcao para renderizar as caixas de ferramentas
  const renderModulesCategory = (categoryFilter: string, title: string) => {
    const modules = OTTO_MODULES.filter(mod => 
      mod.category === categoryFilter && mod.profiles.includes(activeFilter)
    );

    if (modules.length === 0) return null;

    return (
      <div className="mb-6">
        <h2 className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-4 px-4">
          {title}
        </h2>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-3 gap-y-6 gap-x-2 px-3"
        >
          <AnimatePresence mode='popLayout'>
            {modules.map(mod => {
              const Icon = mod.icon;
              const isComingSoon = mod.status === 'coming-soon';

              return (
                <motion.button
                  layout
                  variants={itemVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  whileHover={!isComingSoon ? { scale: 1.05 } : {}}
                  whileTap={!isComingSoon ? { scale: 0.95 } : {}}
                  key={mod.id}
                  disabled={isComingSoon}
                  onClick={() => handleRunModule(mod.url, mod.external, mod.status)}
                  className={`flex flex-col items-center justify-start text-center outline-none transition-all ${
                    isComingSoon ? 'opacity-40 cursor-not-allowed grayscale' : ''
                  }`}
                >
                  <div className={`relative w-16 h-16 rounded-[22px] flex items-center justify-center mb-2 shadow-sm ${mod.iconBg || 'bg-gray-100 text-gray-600'}`}>
                    <Icon size={28} strokeWidth={2.2} />
                    {mod.hasIA && (
                      <div className="absolute -top-1 -right-1 bg-otto-teal text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm border border-white">
                        IA
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center w-full px-1">
                    <span className="text-[13px] font-bold text-gray-800 leading-tight">
                      {mod.name}
                    </span>
                    <span className="text-[10px] text-gray-500 leading-tight mt-0.5 truncate w-full">
                      {mod.description}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Filtros em Pílulas */}
      <div className="flex justify-center items-center px-4 py-4 border-b border-gray-100 bg-white">
        <div className="flex bg-white w-full rounded-full gap-2">
          {['medico', 'estudante', 'paciente'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f as any)}
              className={`flex-1 py-1.5 px-2 rounded-full text-sm font-bold transition-all ${
                activeFilter === f
                  ? f === 'medico' 
                      ? 'bg-[#E1F7EE] text-[#1D9E75] ring-1 ring-[#1D9E75]/20'
                      : f === 'estudante'
                      ? 'bg-[#E6EDFB] text-[#4068B2] ring-1 ring-[#4068B2]/20'
                      : 'bg-[#F2EFFC] text-[#6A47C9] ring-1 ring-[#6A47C9]/20'
                  : 'bg-transparent text-gray-400 hover:bg-gray-50'
              }`}
            >
              {f === 'medico' ? 'Médico' : 
               f === 'estudante' ? 'Estudante' : 'Paciente'}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6 pb-24 max-w-lg mx-auto">
        {renderModulesCategory('clinico', 'Ferramentas Clínicas')}
        {renderModulesCategory('educacao_paciente', 'Educação & Pacientes')}
      </div>
    </div>
  );
};
