import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Check, ShieldCheck, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';

export const PremiumPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId, updatePremiumStatus } = useAuth();
  
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const plans = [
    { id: 'estudante',    title: 'Estudante / Residente',     price: 'R$ 20/mês',  rawPrice: 20,  features: ['Calculadoras clínicas', 'Quiz & Simulados', 'OTTO Tests'], delay: 0.1 },
    { id: 'profissional', title: 'Prof. de Saúde',            price: 'R$ 30/mês',  rawPrice: 30,  features: ['Calculadoras + VoiSS/VHI', 'Atlas ORL', 'OTTO Voice', 'Triagem'], delay: 0.15 },
    { id: 'medico',       title: 'Médico Individual',         price: 'R$ 50/mês',  rawPrice: 50,  features: ['Acesso completo', 'BOTTOK Ilimitado', 'OTTO OCR Premium', 'Whisper IA'], isPopular: true, delay: 0.2 },
    { id: 'clinica',      title: 'Clínica (Até 15 Médicos)',  price: 'R$ 350/mês', rawPrice: 350, features: ['Gestão de time', 'Integração de Prontuário', 'Brand personalizável'], delay: 0.3 }
  ];

  const handleSubscribe = async () => {
    if (!userId) {
      alert("Você precisa estar logado para assinar.");
      return;
    }
    setIsProcessing(true);
    // Simula delay do gateway de pagamento
    setTimeout(async () => {
      try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
          premiumActive: true,
          subscriptionPlan: selectedPlan.id,
          subscriptionDate: serverTimestamp()
        }, { merge: true });
        
        updatePremiumStatus(true, selectedPlan.id);
        setShowSuccess(true);
        setTimeout(() => {
          navigate(-1);
        }, 2000);
      } catch (err) {
        console.error("Erro ao ativar premium", err);
        alert("Ocorreu um erro ao processar. Tente novamente.");
      } finally {
        setIsProcessing(false);
      }
    }, 1500);
  };

  if (selectedPlan) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-4 sticky top-0 z-10 shadow-sm">
          <button onClick={() => setSelectedPlan(null)} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-1">
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Voltar aos planos</span>
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center p-4 py-8">
          <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg border border-gray-100 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="text-[#1D9E75]" size={24} />
              <h2 className="text-xl font-bold text-gray-800">Checkout Seguro</h2>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Resumo do Pedido</p>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-800 font-medium">Plano {selectedPlan.title}</span>
                <span className="text-gray-400 line-through text-sm">R$ {selectedPlan.rawPrice},00</span>
              </div>
              <div className="flex justify-between items-center text-[#1D9E75] font-bold mt-2 pt-2 border-t border-gray-200">
                <span className="flex items-center gap-1">
                  Cupom Aplicado (BETA) <Check size={14} />
                </span>
                <span className="text-xl">R$ 0,00</span>
              </div>
            </div>

            <div className="space-y-4 mb-8 opacity-60 pointer-events-none">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Cartão de Crédito</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="**** **** **** ****" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" disabled />
                </div>
              </div>
            </div>

            <button 
              onClick={handleSubscribe} 
              disabled={isProcessing || showSuccess}
              className="w-full py-4 bg-[#1D9E75] hover:bg-[#0A865F] text-white rounded-xl font-bold shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              {isProcessing ? 'Processando Autenticação...' : (showSuccess ? 'Bem-vindo ao OTTO Pro!' : 'Ativar Acesso Beta Gratuito')}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4 font-medium flex justify-center items-center gap-1">
              Testando Integração Stripe <ShieldCheck size={12} />
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="h-14 bg-[#1D9E75] text-white flex items-center px-4 z-10 sticky top-0 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/20 rounded-full transition-colors flex items-center gap-1">
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Início</span>
        </button>
      </header>

      <div className="flex-1 bg-gradient-to-b from-[#1D9E75] to-gray-50 flex flex-col items-center pt-8 px-4 pb-20">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center mb-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <Star size={32} className="text-yellow-300 fill-current" />
          </div>
          <h1 className="text-3xl font-extrabold mb-2 text-shadow tracking-tight">OTTO PRO</h1>
          <p className="text-white/90 max-w-sm font-medium">Poder clínico absoluto. Acesse os algoritmos irrestritos do ecossistema.</p>
        </motion.div>

        <div className="w-full max-w-md space-y-4">
          <AnimatePresence>
            {plans.map((plan) => (
              <PlanCard 
                key={plan.id} 
                {...plan} 
                onSelect={() => setSelectedPlan(plan)} 
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const PlanCard = ({ title, price, features, isPopular, delay, onSelect }: any) => (
  <motion.div 
    initial={{ y: 20, opacity: 0 }} 
    animate={{ y: 0, opacity: 1 }} 
    transition={{ delay }}
    className={`bg-white rounded-2xl p-5 shadow-xl border-2 ${isPopular ? 'border-[#EF9F27]' : 'border-transparent'} relative`}
  >
    {isPopular && (
      <span className="absolute -top-3 right-4 bg-gradient-to-r from-[#EF9F27] to-[#D58C20] text-white text-[10px] font-black uppercase py-1 px-3 rounded-full shadow-sm">
        Recomendado
      </span>
    )}
    <h3 className="font-bold text-gray-800 text-lg tracking-tight">{title}</h3>
    <div className="text-3xl font-black text-[#1D9E75] mt-1 mb-4">{price}</div>
    <ul className="space-y-2 mb-6">
      {features.map((f: string, i: number) => (
        <li key={i} className="flex items-center text-sm font-medium text-gray-600">
          <Check size={16} className="text-[#1D9E75] mr-2 shrink-0" /> {f}
        </li>
      ))}
    </ul>
    <button 
      onClick={onSelect}
      className={`block text-center w-full py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] ${
        isPopular ? 'bg-gray-900 hover:bg-black text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
      }`}
    >
      Testar Fase Beta Grátis
    </button>
  </motion.div>
);
