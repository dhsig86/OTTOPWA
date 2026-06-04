import React, { useState, useEffect } from 'react';
import { OTTO_MODULES } from '../config/modules';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useServiceWarmUp } from '../hooks/useServiceWarmUp';
import { trackProfileFilterChanged } from '../lib/analytics';

export const Home: React.FC = () => {
  useServiceWarmUp();
  const { profile, onboardingCompleted } = useAuth();
  const navigate = useNavigate();
  // Se usuário tem profile, esse é o padrao dele, senão usa 'medico'
  const [activeFilter, setActiveFilter] = useState<'medico' | 'estudante' | 'profissional' | 'paciente'>(profile || 'medico');

  const [greeting, setGreeting] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [actionLabel, setActionLabel] = useState('');
  const [actionCommand, setActionCommand] = useState('');

  useEffect(() => {
    const hours = new Date().getHours();
    let greet = '';
    let sug = '';
    let actLbl = '';
    let actCmd = '';

    if (hours >= 5 && hours < 12) {
      greet = 'Bom dia';
      sug = 'Que tal agilizar sua manhã clínica com o prontuário inteligente ou as calculadoras?';
      actLbl = 'Abrir PROTTO';
      actCmd = 'abrir protto';
    } else if (hours >= 12 && hours < 18) {
      greet = 'Boa tarde';
      sug = 'Precisa preencher um laudo cirúrgico TUSS ou calcular algum PROM?';
      actLbl = 'Gerar Laudo';
      actCmd = 'abrir procod';
    } else {
      greet = 'Boa noite';
      sug = 'Aproveite o final do dia para conferir as novas pílulas literárias no OTTO NEWS.';
      actLbl = 'Ver Literatura';
      actCmd = 'abrir update';
    }

    setGreeting(greet);
    setSuggestion(sug);
    setActionLabel(actLbl);
    setActionCommand(actCmd);
  }, []);

  useEffect(() => {
    // Verifica contexto E localStorage — contexto é fonte primária (Firestore),
    // localStorage é fallback para Samsung/outros browsers que limpam storage
    const localFlag = localStorage.getItem('otto_onboarding_completed') === 'true';
    if (!onboardingCompleted && !localFlag) {
      navigate('/onboarding', { replace: true });
    }
  }, [navigate, onboardingCompleted]);

  const handleOpenConcierge = (cmd?: string) => {
    const event = new CustomEvent('otto-open-concierge', { detail: { command: cmd } });
    window.dispatchEvent(event);
  };

  const handleRunModule = (url: string, external: boolean, status: string) => {
    if (status === 'coming-soon') return;
    if (external) {
      if(url) {
        navigate('/modules/webview', { state: { url } });
      }
    } else {
      if(url) navigate(url);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  };

  // Funcao para renderizar as caixas de ferramentas
  const renderModulesCategory = (categoryFilter: string, title: string) => {
    const modules = OTTO_MODULES.filter(mod => 
      mod.category === categoryFilter && mod.profiles.includes(activeFilter)
    );

    if (modules.length === 0) return null;

    return (
      <div className="mb-6">
        <h2 className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-4 px-4">
          {title}
        </h2>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-6 gap-x-2 px-3"
        >
          <AnimatePresence mode='popLayout'>
            {modules.map(mod => {
              const Icon = mod.icon;
              const isComingSoon = mod.status === 'coming-soon';

              return (
                <motion.button
                  layout
                  variants={itemVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  whileHover={!isComingSoon ? { scale: 1.05 } : {}}
                  whileTap={!isComingSoon ? { scale: 0.95 } : {}}
                  key={mod.id}
                  disabled={isComingSoon}
                  onClick={() => handleRunModule(mod.url, mod.external, mod.status)}
                  className={`flex flex-col items-center justify-start text-center outline-none transition-all ${
                    isComingSoon ? 'opacity-40 cursor-not-allowed grayscale' : ''
                  }`}
                >
                  <div className={`relative w-16 h-16 rounded-[22px] flex items-center justify-center mb-2 shadow-sm ${mod.iconBg || 'bg-gray-100 text-gray-600'}`}>
                    <Icon size={28} strokeWidth={2.2} />
                    {mod.hasIA && (
                      <div className="absolute -top-1 -right-1 bg-otto-teal text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm border border-white">
                        IA
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center w-full px-1">
                    <span className="text-[13px] font-bold text-gray-800 leading-tight">
                      {mod.name}
                    </span>
                    <span className="text-[10px] text-gray-500 leading-tight mt-0.5 line-clamp-2 w-full">
                      {mod.description}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Filtros em Pílulas */}
      <div className="flex justify-center items-center px-4 py-4 border-b border-gray-100 bg-white">
        <div className="flex bg-white w-full rounded-full gap-2">
          {(['medico', 'estudante', 'profissional', 'paciente'] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setActiveFilter(f); trackProfileFilterChanged(f); }}
              className={`flex-1 py-2.5 px-1.5 rounded-full text-xs font-bold transition-all ${
                activeFilter === f
                  ? f === 'medico'
                      ? 'bg-[#E1F7EE] text-[#1D9E75] ring-1 ring-[#1D9E75]/20'
                      : f === 'estudante'
                      ? 'bg-[#E6EDFB] text-[#4068B2] ring-1 ring-[#4068B2]/20'
                      : f === 'profissional'
                      ? 'bg-[#FFF4E6] text-[#D97706] ring-1 ring-[#D97706]/20'
                      : 'bg-[#F2EFFC] text-[#6A47C9] ring-1 ring-[#6A47C9]/20'
                  : 'bg-transparent text-gray-400 hover:bg-gray-50'
              }`}
            >
              {f === 'medico' ? 'Médico' :
               f === 'estudante' ? 'Estudante' :
               f === 'profissional' ? 'Profis.' : 'Paciente'}
            </button>
          ))}
        </div>
      </div>

      {/* Card do OTTO Concierge Proativo (Ser Vivo) */}
      <div className="px-4 py-2">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#E1F7EE] via-[#E8F9F3] to-[#CDF0E3] border border-[#1D9E75]/20 rounded-3xl p-5 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          {/* Fundo decorativo premium */}
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/20 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-start gap-4">
            {/* Mascot Avatar com animação de pulso */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-[#1D9E75] flex items-center justify-center shadow-md">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M12 2a10 10 0 0 1 10 10v1a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-1A10 10 0 0 1 12 2Z" />
                  <path d="M8 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
                  <path d="M16 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
                  <path d="M10 16s1 1 2 1 2-1 2-1" />
                </svg>
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-white"></span>
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-black text-[#0F6E56] uppercase tracking-widest flex items-center gap-1">
                ✦ Assistente OTTO
              </span>
              <h3 className="text-base font-bold text-gray-800 mt-0.5">
                {greeting}, {localStorage.getItem('otto_user_name')?.split(' ')[0] || 'Doutor'}!
              </h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed max-w-md">
                {suggestion}
              </p>
            </div>
          </div>

          <div className="flex flex-row gap-2 shrink-0 self-end md:self-center z-10">
            <button
              onClick={() => handleOpenConcierge(actionCommand)}
              className="px-4 py-2 bg-[#1D9E75] hover:bg-[#0F6E56] text-white text-xs font-extrabold rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1"
            >
              <span className="font-bold">{actionLabel}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => handleOpenConcierge()}
              className="px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-[#1D9E75] text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95 flex items-center gap-1"
            >
              Falar com IA
            </button>
          </div>
        </motion.div>
      </div>

      {/* Ferramentas Clínicas */}
      {renderModulesCategory('clinico', 'Ferramentas Clínicas')}

      {/* Academia */}
      {renderModulesCategory('academia', 'Academia')}

      {/* Educação & Pacientes */}
      {renderModulesCategory('publico', 'Educação & Pacientes')}

      {/* Footer — About */}
      <footer className="mt-8 mb-24 px-6 py-6 text-center space-y-2.5 border-t border-gray-100">
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-[11px] font-bold text-[#1D9E75] tracking-wider uppercase">HART's OTTO</span>
          <span className="text-[10px] text-gray-300">•</span>
          <span className="text-[10px] text-gray-400 font-medium">v2.0</span>
        </div>
        <p className="text-[10px] text-gray-400 leading-relaxed max-w-xs mx-auto">
          Plataforma clínica digital em ORL e CCP
        </p>
        <p className="text-[10px] text-gray-400">
          Idealizado e realizado por{' '}
          <span className="font-semibold text-gray-500">Dr. Dario Hart Signorini</span>
        </p>
        <div className="flex items-center justify-center gap-4 pt-1">
          <button
            onClick={() => navigate('/modules/feedback')}
            className="text-[10px] text-gray-400 hover:text-[#1D9E75] transition-colors font-medium"
          >
            Feedback & Suporte
          </button>
          <span className="text-[8px] text-gray-200">|</span>
          <button
            onClick={() => navigate('/terms')}
            className="text-[10px] text-gray-400 hover:text-[#1D9E75] transition-colors font-medium"
          >
            Termos de Uso
          </button>
        </div>
      </footer>
    </div>
  );
};
