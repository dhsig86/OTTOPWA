import React from 'react';
import { motion } from 'framer-motion';

export const Search: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-gray-400 max-w-sm"
      >
        <span className="text-4xl block mb-4">🔍</span>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Busca Universal</h2>
        <p className="text-sm">A ferramenta unificada de busca inteligente está em construção e chegará nas próximas semanas.</p>
      </motion.div>
    </div>
  );
};
