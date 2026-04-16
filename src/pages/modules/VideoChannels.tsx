import React from 'react';
import { PlaySquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const VideoChannels: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-otto-border text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <PlaySquare size={32} />
        </div>
        <h2 className="text-xl font-bold text-otto-text">Canais Curados ORL/CCP</h2>
        <p className="text-sm text-otto-muted">
          Vídeos educativos e científicos selecionados para a prática clínica e estudantes.
        </p>
        
        <div className="pt-4 border-t border-gray-200 text-left space-y-4">
          {[
            { id: '1b1iLYiT848', title: 'Otoscopia Normal vs Patológica', channel: 'Educação ORL' },
            { id: 'kO2bNnsWlg4', title: 'Anatomia da Laringe', channel: 'Medicina Resumida' },
            { id: '6b6tPqD10M0', title: 'Exame Físico ORL Completo', channel: 'Clínica Médica' }
          ].map(v => (
            <div key={v.id} className="flex flex-col gap-2 items-start bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="w-full aspect-video bg-gray-200 rounded-lg overflow-hidden shadow-sm">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={`https://www.youtube.com/embed/${v.id}`} 
                  title={v.title} 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
              <div className="flex-1 px-1">
                 <div className="text-sm font-bold text-gray-800 leading-tight">{v.title}</div>
                 <div className="text-xs text-gray-500">{v.channel}</div>
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
