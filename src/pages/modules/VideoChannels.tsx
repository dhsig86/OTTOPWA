import React from 'react';
import { Youtube, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const VideoChannels: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-otto-border text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <Youtube size={32} />
        </div>
        <h2 className="text-xl font-bold text-otto-text">Canais Curados ORL/CCP</h2>
        <p className="text-sm text-otto-muted">
          Vídeos educativos e científicos selecionados para a prática clínica e estudantes.
        </p>
        
        {/* Mock for now */}
        <div className="pt-4 border-t border-otto-border/50 text-left space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-3 items-center bg-gray-50 p-2 rounded-lg">
              <div className="w-24 h-16 bg-gray-300 rounded animate-pulse shrink-0"></div>
              <div className="flex-1 space-y-2">
                 <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
                 <div className="h-3 bg-gray-300 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-2 bg-otto-teal text-white font-medium rounded-lg hover:bg-otto-teal-dark active:scale-95 transition-all w-full"
        >
          Voltar
        </button>
      </div>
    </div>
  );
};
