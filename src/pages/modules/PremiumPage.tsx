import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export const PremiumPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="h-14 bg-[#1D9E75] text-white flex items-center px-4 z-10 sticky top-0">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/20 rounded-full transition-colors flex items-center gap-1">
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Voltar</span>
        </button>
      </header>

      <div className="flex-1 bg-gradient-to-b from-[#1D9E75] to-gray-50 flex flex-col items-center pt-8 px-4 pb-20">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center mb-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <Star size={32} className="text-yellow-400 fill-current" />
          </div>
          <h1 className="text-3xl font-extrabold mb-2 text-shadow">HART'S OTTO PRO</h1>
          <p className="text-white/80 max-w-sm">Junte-se à lista de espera para o ecossistema completo definitivo de ORL/CCP.</p>
        </motion.div>

        <div className="w-full max-w-md space-y-4">
          <PlanCard title="Estudante/Residente" price="R$ 49/mês" features={['CIDs limitados', 'Quiz Básico', 'Laudos Simples']} delay={0.1} />
          <PlanCard title="Médico Premium" price="R$ 149/mês" features={['Acesso completo', 'BOTTOK Ilimitado', 'Calculadoras VIP']} isPopular delay={0.2} />
          <PlanCard title="Clínica" price="Sob consulta" features={['Multi-usuários', 'White-label reports', 'Integração API']} delay={0.3} />
        </div>
      </div>
    </div>
  );
};

const PlanCard = ({ title, price, features, isPopular, delay }: any) => (
  <motion.div 
    initial={{ y: 20, opacity: 0 }} 
    animate={{ y: 0, opacity: 1 }} 
    transition={{ delay }}
    className={`bg-white rounded-2xl p-5 shadow-lg border-2 ${isPopular ? 'border-[#EF9F27]' : 'border-transparent'} relative`}
  >
    {isPopular && (
      <span className="absolute -top-3 right-4 bg-[#EF9F27] text-white text-[10px] font-bold uppercase py-1 px-3 rounded-full">
        Mais Popular
      </span>
    )}
    <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
    <div className="text-2xl font-black text-[#1D9E75] mt-1 mb-4">{price}</div>
    <ul className="space-y-2 mb-6">
      {features.map((f: string, i: number) => (
        <li key={i} className="flex items-center text-sm text-gray-600">
          <Check size={16} className="text-[#1D9E75] mr-2" /> {f}
        </li>
      ))}
    </ul>
    <a 
      href="mailto:contato@drdariohart.com?subject=Interesse%20OTTO%20Premium"
      className={`block text-center w-full py-3 rounded-xl font-bold transition-transform active:scale-95 ${
        isPopular ? 'bg-[#EF9F27] hover:bg-[#D58C20] text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
      }`}
    >
      Entrar na Lista de Espera 
    </a>
  </motion.div>
);
