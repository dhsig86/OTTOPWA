import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, GraduationCap, Heart, Activity,
  Brain, FileText, Ear, ScanText,
  ClipboardCheck, PlaySquare, BookOpen, Volume2,
  MessageSquare, Zap, ShieldCheck, Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { trackOnboardingCompleted } from '../lib/analytics';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { profile, markOnboardingCompleted } = useAuth();
  const [step, setStep] = useState(1);
  const tempProfile: 'medico' | 'estudante' | 'profissional' | 'paciente' = (profile as any) || 'medico';

  const finishOnboarding = async (action: 'free' | 'premium') => {
    // Persist to Firestore + localStorage so new browsers don't repeat onboarding
    await markOnboardingCompleted();
    // PRODUCT-01: Métrica de ativação — qual perfil completou o onboarding
    trackOnboardingCompleted(tempProfile, action === 'premium');
    if (action === 'premium') {
      navigate('/modules/premium');
    } else {
      navigate('/', { replace: true });
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  // TELA 1 ─────────────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <motion.div key="step1" variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col h-full justify-between">
      <div>
        <div className="w-16 h-16 bg-[#1D9E75] text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="font-black text-3xl">O</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">Bem-vindo ao HART'S OTTO</h1>
        <p className="text-gray-500 text-center mb-8 px-4">Sua plataforma completa de Otorrinolaringologia</p>

        <div className="space-y-3">
          {/* Mostra apenas o perfil ativo do usuário, confirmado no cadastro */}
          <div className={`w-full flex items-center p-5 rounded-2xl border-2 text-left bg-white shadow-sm ${
            tempProfile === 'medico' ? 'border-[#1D9E75]' :
            tempProfile === 'estudante' ? 'border-[#4068B2]' :
            tempProfile === 'profissional' ? 'border-[#0F766E]' : 'border-[#6A47C9]'
          }`}>
            <div className={`p-3 rounded-full mr-4 text-white shrink-0 ${
              tempProfile === 'medico' ? 'bg-[#1D9E75]' :
              tempProfile === 'estudante' ? 'bg-[#4068B2]' :
              tempProfile === 'profissional' ? 'bg-[#0F766E]' : 'bg-[#6A47C9]'
            }`}>
              {tempProfile === 'medico' && <Stethoscope size={24} />}
              {tempProfile === 'estudante' && <GraduationCap size={24} />}
              {tempProfile === 'profissional' && <Activity size={24} />}
              {tempProfile === 'paciente' && <Heart size={24} />}
            </div>
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none block">Perfil Confirmado</span>
              <h3 className="font-extrabold text-lg text-gray-800 mt-1">
                {tempProfile === 'medico' ? 'Médico' :
                 tempProfile === 'estudante' ? 'Estudante / Residente' :
                 tempProfile === 'profissional' ? 'Prof. de Saúde' : 'Paciente'}
              </h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                {tempProfile === 'medico' && 'Acesso total a ferramentas clínicas, IA diagnóstica e laudos cirúrgicos.'}
                {tempProfile === 'estudante' && 'Acesso a simulados, quizzes educativos e base de residência.'}
                {tempProfile === 'profissional' && 'Ferramentas de triagem vocal, escalas VHI e referência rápida.'}
                {tempProfile === 'paciente' && 'Recursos de terapia sonora para zumbido e cartilhas de saúde.'}
              </p>
            </div>
          </div>
        </div>
      </div>
      <button onClick={nextStep} className="w-full mt-8 py-4 bg-gray-900 text-white rounded-xl font-bold shadow-md active:scale-95 transition-all">
        Conhecer minhas ferramentas →
      </button>
    </motion.div>
  );

  // TELA 2 ─────────────────────────────────────────────────────────────────
  const renderStep2 = () => {
    let highlights = [];
    if (tempProfile === 'medico') {
      highlights = [
        { icon: Brain, title: 'BOTTOK', desc: 'IA para 2ª opinião focada em fluxos clínicos REAIS.', color: 'text-green-600 bg-green-100' },
        { icon: Ear, title: 'Atlas ORL', desc: 'Base imagiológica vasta para tirar dúvidas visuais urgentes.', color: 'text-teal-600 bg-teal-100' },
        { icon: ScanText, title: 'OTTO OCR', desc: 'Extração avançada de PDFs para evitar redigitação.', color: 'text-blue-600 bg-blue-100' },
      ];
    } else if (tempProfile === 'estudante') {
      highlights = [
        { icon: ClipboardCheck, title: 'OTTO Quiz & Tests', desc: 'Simulados para você gabaritar as provas de ORL.', color: 'text-blue-600 bg-blue-100' },
        { icon: PlaySquare, title: 'Vídeos Educativos', desc: 'Procedimentos e explicações cirúrgicas passo a passo.', color: 'text-teal-600 bg-teal-100' },
        { icon: BookOpen, title: 'Informações Core', desc: 'Acesso rápido à base acadêmica estruturada.', color: 'text-indigo-600 bg-indigo-100' },
      ];
    } else if (tempProfile === 'profissional') {
      highlights = [
        { icon: Activity, title: 'OTTO Voice / VoiSS', desc: 'Triagem vocal e escalas VHI para fonoaudiólogos e otorrinos.', color: 'text-teal-700 bg-teal-100' },
        { icon: Ear, title: 'Atlas ORL', desc: 'Base imagiológica para referência clínica rápida em campo.', color: 'text-green-600 bg-green-100' },
        { icon: ClipboardCheck, title: 'Triagem', desc: 'Protocolos de triagem auditiva e vestibular simplificados.', color: 'text-blue-600 bg-blue-100' },
      ];
    } else {
      highlights = [
        { icon: Volume2, title: 'Zumbido / Tinnitus', desc: 'Terapia sonora personalizada para mascaramento.', color: 'text-purple-600 bg-purple-100' },
        { icon: FileText, title: 'Artigos', desc: 'Dicas sobre saúde auricular, amígdalas e respiração.', color: 'text-teal-600 bg-teal-100' },
        { icon: MessageSquare, title: 'OTTO DIC', desc: 'Pequeno dicionário simplificado para entender o jargão.', color: 'text-indigo-600 bg-indigo-100' },
      ];
    }

    return (
      <motion.div key="step2" variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col h-full justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Baseado no seu perfil, aqui está seu arsenal</h2>
          <div className="space-y-4">
            {highlights.map((h, i) => {
              const Icon = h.icon;
              return (
                <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className={`p-3 rounded-full ${h.color}`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 leading-none mb-1">{h.title}</h4>
                    <p className="text-xs text-gray-500 leading-tight">{h.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-8 flex gap-3">
          <button onClick={prevStep} className="p-4 bg-gray-100 text-gray-600 rounded-xl font-bold">Voltar</button>
          <button onClick={nextStep} className="flex-1 py-4 bg-gray-900 text-white rounded-xl font-bold shadow-md active:scale-95 transition-all">
            Ver minhas ferramentas →
          </button>
        </div>
      </motion.div>
    );
  };

  // TELA 3 ─────────────────────────────────────────────────────────────────
  const renderStep3 = () => (
    <motion.div key="step3" variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col h-full justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Por que o OTTO é diferente?</h2>
        
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="shrink-0 w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <Zap size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-1">IA Integrada</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Diagnóstico e geração de laudos assistidos de forma ultra-rápida e segura.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="shrink-0 w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <BookOpen size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-1">Conteúdo Científico</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Conhecimento baseado nos rigorosos *guidelines* das maiores academias globais (ABORL-CCF, AAO-HNS) e referências de ponta mundiais (ENT Hospital of Fudan University).</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="shrink-0 w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-1">Seguro e Confiável</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Autenticação militar via Firebase, dados guardados à sete chaves sob adequação à LGPD.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex gap-3">
        <button onClick={prevStep} className="p-4 bg-gray-100 text-gray-600 rounded-xl font-bold">Voltar</button>
        <button onClick={nextStep} className="flex-1 py-4 bg-[#1D9E75] text-white rounded-xl font-bold shadow-md active:scale-95 transition-all">
          Entendi →
        </button>
      </div>
    </motion.div>
  );

  // TELA 4 ─────────────────────────────────────────────────────────────────
  const renderStep4 = () => (
    <motion.div key="step4" variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col h-full justify-between">
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-[#1D9E75] to-[#EF9F27] rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-900/20">
          <Star size={36} className="text-white fill-current" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 px-4">Comece grátis, evolua quando quiser</h2>
        
        <div className="w-full text-left bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4 mb-4">
          <div className="flex gap-3">
            <div className="shrink-0 mt-1"><div className="w-2 h-2 rounded-full bg-gray-300"></div></div>
            <div>
              <h4 className="font-bold text-gray-700 text-sm">Plano Free</h4>
              <p className="text-xs text-gray-500 mt-1">Acesso a calculadoras, OTTO DIC, artigos básicos e 5 quizzes/mês.</p>
            </div>
          </div>
          <div className="h-[1px] bg-gray-100 w-full" />
          <div className="flex gap-3">
            <div className="shrink-0 mt-1"><div className="w-2 h-2 rounded-full bg-[#1D9E75]"></div></div>
            <div>
              <h4 className="font-bold text-[#1D9E75] text-sm">Plano OTTO PRO</h4>
              <p className="text-xs text-gray-500 mt-1">Acesso total e irrestrito a todos os módulos com Inteligência Artificial, sem limite de uso ou consultas locais.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex flex-col gap-3">
        <button
          onClick={() => finishOnboarding('free')}
          className="w-full py-4 bg-[#1D9E75] text-white rounded-xl font-bold shadow-md active:scale-95 transition-all"
        >
          Começar a usar o OTTO →
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col">
      {/* ProgressBar Header */}
      <div className="h-1.5 w-full bg-gray-200">
        <div 
          className="h-full bg-[#1D9E75] transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </AnimatePresence>
      </div>
    </div>
  );
};
