import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm space-y-4"
      >
        <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
          <FileQuestion size={36} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">404 - Sem Resposta</h2>
        <p className="text-gray-500 text-sm">
          Aparentemente a página ou módulo que você tentou acessar não está disponível na sua licença no momento ou o endereço foi alterado.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="mt-6 px-6 py-2.5 bg-[#1D9E75] hover:bg-[#0A865F] text-white font-bold rounded-xl transition-all shadow-sm"
        >
          Voltar para Home
        </button>
      </motion.div>
    </div>
  );
};
