import React from 'react';
import { motion } from 'framer-motion';
import { Bell, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CHANGELOG = [
  {
    id: 1,
    date: '19 Abr 2026',
    type: 'novo',
    title: 'OTTO Tests adicionado',
    description: 'Plataforma de avaliação acadêmica ORL/CCP agora disponível para médicos e estudantes.',
    icon: '🎓'
  },
  {
    id: 2,
    date: '15 Abr 2026',
    type: 'melhoria',
    title: 'ModuleFrame mais robusto',
    description: 'Módulos externos agora têm spinner de carregamento e fallback automático após 12 segundos.',
    icon: '⚡'
  },
  {
    id: 3,
    date: '10 Abr 2026',
    type: 'melhoria',
    title: 'Seletor de perfil no login',
    description: 'Agora você pode entrar como Médico, Estudante ou Paciente diretamente na tela de login.',
    icon: '👤'
  },
  {
    id: 4,
    date: '05 Abr 2026',
    type: 'novo',
    title: 'OTTO PWA lançado em BETA',
    description: 'A shell unificada do ecossistema Hart\'s OTTO está disponível. 12 ferramentas num só lugar.',
    icon: '🚀'
  },
];

export const Notifications: React.FC = () => {
  const navigate = useNavigate();

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'novo': return 'bg-green-100 text-green-700';
      case 'melhoria': return 'bg-blue-100 text-blue-700';
      case 'fix': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative pb-20">
      <header className="h-14 bg-[#1D9E75] text-white flex items-center justify-between px-4 shrink-0 shadow-sm relative z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-[#0A865F] rounded-full transition-colors flex items-center gap-1">
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Voltar</span>
        </button>
        <span className="font-bold flex items-center gap-2">
          <Bell size={18} />
          Novidades
        </span>
        <div className="w-8"></div>
      </header>

      <div className="flex-1 w-full bg-gray-50 p-4 space-y-4 overflow-y-auto">
        {CHANGELOG.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-start"
          >
            <div className="text-2xl pt-1">{item.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getTypeStyle(item.type)}`}>
                  {item.type}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">{item.date}</span>
              </div>
              <h3 className="text-sm font-bold text-gray-800 leading-tight mb-1">{item.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
