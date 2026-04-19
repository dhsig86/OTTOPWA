import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const [iframeError, setIframeError] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white relative">
      <header className="h-14 bg-[#1D9E75] text-white flex items-center justify-between px-4 shrink-0 shadow-sm relative z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-[#0A865F] rounded-full transition-colors flex items-center gap-1">
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Voltar</span>
        </button>
        <span className="font-bold flex items-center gap-2">
          <GraduationCap size={18} />
          OTTO Quiz
        </span>
        <div className="w-8"></div>
      </header>

      <div className="flex-1 w-full bg-gray-50 relative flex flex-col items-center justify-center">
        {!iframeError ? (
          <iframe 
            src="https://dhsig86.github.io/SIMULOTTO/" 
            className="absolute inset-0 w-full h-full border-0 z-10"
            onError={() => setIframeError(true)}
            title="OTTO Quiz"
          />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center p-8 text-center max-w-sm">
            <GraduationCap size={48} className="text-[#1D9E75] mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Simulador Bloqueado no Navegador</h2>
            <p className="text-gray-500 text-sm mb-6">Seu navegador bloqueou o carregamento interno do Quiz. Você pode acessá-lo externamente.</p>
            <button onClick={() => window.open('https://dhsig86.github.io/SIMULOTTO/', '_blank')} className="bg-[#1D9E75] text-white px-6 py-3 rounded-xl font-bold">
              Abrir Quiz em Nova Guia
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
