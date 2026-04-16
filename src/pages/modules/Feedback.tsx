import React from 'react';
import { MessageCircleQuestion, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Feedback: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-otto-border text-center space-y-4">
        <div className="w-16 h-16 bg-[#FAEEDA] text-amber-800 rounded-full flex items-center justify-center mx-auto mb-2">
          <MessageCircleQuestion size={32} />
        </div>
        
        <h2 className="text-xl font-bold text-otto-text">Feedback do Beta</h2>
        <p className="text-sm text-otto-muted leading-relaxed max-w-sm mx-auto">
          Nos ajude a melhorar o OTTO PWA! Como esse é um ambiente restrito (Beta), suas sugestões, críticas e relatos de erros são essenciais para polirmos a plataforma.
        </p>
        
        <button 
          onClick={() => navigate('/modules/webview', { state: { url: 'https://tally.so/r/nPbxxk' } })} 
          className="mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-[#1D9E75] text-white font-bold rounded-xl hover:bg-[#0A865F] active:scale-95 transition-all w-full shadow-md"
        >
          <span>Abrir Formulário de Feedback</span>
          <ExternalLink size={18} />
        </button>

        <button 
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 bg-transparent text-otto-muted font-medium hover:text-otto-text transition-all w-full"
        >
          Voltar
        </button>
      </div>
    </div>
  );
};
