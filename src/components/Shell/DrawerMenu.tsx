import React from 'react';
import { X } from 'lucide-react';
import { OTTO_MODULES } from '../../config/modules';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileBadge } from './ProfileBadge';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { profile, isAuthenticated } = useAuth();

  const handleModuleClick = (modulePath: string, external: boolean) => {
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
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="bg-otto-teal text-white p-4 flex justify-between items-center">
          <span className="font-bold text-lg tracking-wide">Menu OTTO</span>
          <button onClick={onClose} className="p-1 hover:bg-otto-teal-dark rounded-full">
            <X size={24} />
          </button>
        </div>

        {isAuthenticated && (
          <div className="p-4 border-b border-otto-border bg-otto-surface">
            <ProfileBadge />
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-2 py-4">
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
                  <h3 className="uppercase text-xs font-semibold text-otto-muted px-3 mb-2 tracking-wider">
                    {categoryTitle}
                  </h3>
                  <div className="space-y-1">
                    {categoryModules.map(mod => {
                      const Icon = mod.icon;
                      const hasAccess = profile ? mod.profiles.includes(profile) : true;
                      
                      if (!hasAccess && profile) return null;

                      return (
                        <button
                          key={mod.id}
                          onClick={() => handleModuleClick(mod.url, mod.external)}
                          disabled={mod.status === 'coming-soon'}
                          className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                            mod.status === 'coming-soon' 
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'hover:bg-otto-teal-light'
                          }`}
                        >
                          <div className={`p-2 rounded-lg mr-3 ${getCategoryColor(mod.category)}`}>
                            <Icon size={18} />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-otto-text flex items-center gap-2">
                              {mod.name}
                              {mod.status === 'beta' && (
                                <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-bold uppercase">Beta</span>
                              )}
                            </div>
                            <div className="text-xs text-otto-muted truncate">{mod.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
