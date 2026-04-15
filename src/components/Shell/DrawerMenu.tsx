import React from 'react';
import { X } from 'lucide-react';
import { OTTO_MODULES } from '../../config/modules';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileBadge } from './ProfileBadge';
import { motion, AnimatePresence } from 'framer-motion';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { profile, isAuthenticated } = useAuth();

  const handleRunModule = (modulePath: string, external: boolean, status?: string) => {
    if (status === 'coming-soon') return;
    onClose();
    if (external) {
      navigate('/modules/webview', { state: { url: modulePath } });
    } else {
      navigate(modulePath);
    }
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'clinico': return 'bg-otto-teal-light text-otto-teal-dark';
      case 'educacao': return 'bg-[#E6F1FB] text-blue-800';
      case 'paciente': return 'bg-[#EEEDFE] text-purple-800';
      case 'gestao': return 'bg-[#FAEEDA] text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white/95 backdrop-blur-2xl z-50 flex flex-col shadow-[20px_0_40px_rgba(0,0,0,0.1)] border-r border-white"
          >
            <div className="bg-gradient-to-r from-otto-teal-dark to-otto-teal text-white p-4 flex justify-between items-center shadow-md">
              <span className="font-extrabold text-lg tracking-wide">HART'S OTTOs</span>
              <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {isAuthenticated && (
              <div className="p-4 border-b border-otto-border/50 bg-white shadow-sm z-10 relative">
                <ProfileBadge />
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
              <div className="space-y-6">
                {['clinico', 'educacao', 'paciente', 'gestao'].map((category) => {
                  const categoryModules = OTTO_MODULES.filter(m => m.category === category);
                  if (categoryModules.length === 0) return null;
                  
                  const categoryTitle = 
                    category === 'clinico' ? 'Uso Clínico' :
                    category === 'educacao' ? 'Educação / Ensino' :
                    category === 'paciente' ? 'Pacientes' : 'Gestão / Feedback';

                  return (
                    <div key={category}>
                      <h3 className="uppercase text-[10px] font-bold text-otto-muted mb-3 tracking-[0.15em] ml-1">
                        {categoryTitle}
                      </h3>
                      <div className="space-y-2">
                        {categoryModules.map(mod => {
                          const Icon = mod.icon;
                          const hasAccess = profile ? mod.profiles.includes(profile) : true;
                          
                          if (!hasAccess && profile) return null;

                          return (
                            <motion.button
                              whileTap={mod.status === 'coming-soon' ? {} : { scale: 0.96 }}
                              key={mod.id}
                              onClick={() => handleRunModule(mod.url, mod.external, mod.status)}
                              disabled={mod.status === 'coming-soon'}
                              className={`w-full flex items-center p-2.5 rounded-xl text-left transition-all ${
                                mod.status === 'coming-soon' 
                                  ? 'opacity-40 cursor-not-allowed grayscale' 
                                  : 'hover:bg-otto-teal/5 border border-transparent hover:border-otto-teal/10 hover:shadow-sm'
                              }`}
                            >
                              <div className={`p-2 rounded-lg mr-3 shadow-inner ${getCategoryColor(mod.category)}`}>
                                <Icon size={18} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-otto-text flex items-center gap-2 truncate">
                                  {mod.name}
                                  {mod.status === 'beta' && (
                                    <span className="text-[9px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Beta</span>
                                  )}
                                </div>
                                <div className="text-[11px] text-otto-muted truncate mt-0.5">{mod.description}</div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
