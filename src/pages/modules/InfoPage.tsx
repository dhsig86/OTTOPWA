import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ARTICLES = [
  { id: 1, title: 'Atualização no Guideline de Rinossinusite 2024', date: '10 Abr 2026', category: 'Clínica' },
  { id: 2, title: 'Novo protocolo de TQT Pediátrica implantado', date: '05 Abr 2026', category: 'Cirurgia' },
  { id: 3, title: 'Como interpretar as curvas de timpanometria?', date: '15 Mar 2026', category: 'Otologia' }
];

export const InfoPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <header className="h-14 bg-gradient-to-r from-[#5649B4] to-[#453A9C] text-white flex items-center px-4 shadow-md sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/20 rounded-full transition-colors flex items-center gap-1">
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Voltar</span>
        </button>
        <span className="font-bold flex items-center gap-2 mx-auto pr-8">
          <FileText size={18} />
          Informações Técnicas
        </span>
      </header>

      <div className="p-4 space-y-4">
        {ARTICLES.map((art, i) => (
          <motion.div
            key={art.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedTitle(art.title)}
          >
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  {art.category}
                </span>
                <span className="text-xs text-gray-400">{art.date}</span>
              </div>
              <h3 className="font-bold text-gray-800 leading-snug">{art.title}</h3>
            </div>
            <ChevronRight className="text-gray-400 shrink-0" size={20} />
          </motion.div>
        ))}
      </div>
      
      <AnimatePresence>
        {selectedTitle && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-0 right-0 mx-4 bg-[#1D9E75] text-white p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3 z-50"
          >
            <p className="text-sm font-medium flex-1">"{selectedTitle}" estará disponível em breve.</p>
            <button onClick={() => setSelectedTitle(null)} className="text-white/80 hover:text-white font-bold text-lg leading-none">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
