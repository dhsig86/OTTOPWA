import React from 'react';
import { Volume2, Play, Waves } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ZumbidoTherapy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-otto-border text-center space-y-6">
        <div className="w-20 h-20 bg-otto-teal-light text-otto-teal-darker rounded-full flex items-center justify-center mx-auto mb-2 relative">
          <span className="absolute inset-0 bg-otto-teal-light rounded-full animate-ping opacity-50"></span>
          <Volume2 size={40} className="relative z-10" />
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-otto-text">Terapia de Zumbido</h2>
          <p className="text-sm text-otto-muted mt-1">
            Sons terapêuticos e ruído branco para alívio diário.
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded shadow-sm">
              <Waves className="text-blue-500" size={24} />
            </div>
            <div className="text-left">
              <span className="block font-semibold text-sm">Ruído Branco</span>
              <span className="text-[10px] text-gray-500 uppercase">30 minutos</span>
            </div>
          </div>
          <button className="h-10 w-10 bg-otto-teal text-white rounded-full flex items-center justify-center hover:bg-otto-teal-dark active:scale-90 transition">
            <Play size={20} className="ml-1" />
          </button>
        </div>
        
        <button 
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-2 border border-otto-border text-otto-text font-medium rounded-lg hover:bg-gray-50 active:scale-95 transition-all w-full"
        >
          Voltar
        </button>
      </div>
    </div>
  );
};
