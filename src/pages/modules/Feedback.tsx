import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircleQuestion, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Send, 
  CheckCircle, 
  Bug, 
  Lightbulb, 
  Heart, 
  HelpCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'O que é o ecossistema OTTO?',
    answer: 'O OTTO é uma suíte integrada de ferramentas clínicas baseadas em Inteligência Artificial e curadoria médica (Whisper, Cases, Prontuário, Calculadoras) desenhada especificamente para otorrinolaringologistas visando a produtividade do consultório e a escrita de relatos científicos.'
  },
  {
    question: 'Como usar a integração do OTTO Whisper com o OTTO Cases?',
    answer: 'Grave ou digite sua nota de consulta no OTTO Whisper, clique no botão de exportar para "Cases" no rodapé e você será redirecionado para o OTTO Cases com os dados de rascunho preenchidos automaticamente no assistente de relato de caso científico.'
  },
  {
    question: 'Como funciona a privacidade de dados e conformidade LGPD?',
    answer: 'Nenhum dado pessoal de identificação do paciente (PII) é armazenado permanentemente no sistema de transcrição de voz. O tráfego de dados entre os módulos ocorre de maneira segura com autenticação via Firebase Tokens, mantendo a confidencialidade do ato médico.'
  },
  {
    question: 'O que fazer se um módulo parecer lento ou inativo?',
    answer: 'Alguns de nossos backends em nuvem utilizam planos dinâmicos que podem "adormecer" após períodos prolongados sem requisições. Ao clicar em um módulo e ver a mensagem de carregamento, aguarde entre 15 a 30 segundos para o servidor despertar e responder normalmente.'
  }
];

export const Feedback: React.FC = () => {
  const navigate = useNavigate();
  const { userId, userName, userEmail } = useAuth();
  
  // FAQ states
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Form states
  const [category, setCategory] = useState<'bug' | 'sugestao' | 'elogio' | 'outros'>('sugestao');
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Por favor, descreva o seu feedback.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await addDoc(collection(db, 'pwa_feedbacks'), {
        userId: userId || 'anonimo',
        userName: userName || 'Usuário Beta',
        userEmail: userEmail || 'sem-email@otto.com',
        category,
        rating,
        description: description.trim(),
        createdAt: serverTimestamp()
      });

      setIsSuccess(true);
      setDescription('');
      setRating(0);
    } catch (err: any) {
      console.error('Erro ao enviar feedback:', err);
      setErrorMsg('Houve uma falha ao enviar o feedback. Verifique sua conexão e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all text-gray-700"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Ajuda &amp; Feedback</h1>
          <p className="text-xs text-gray-500">Central de Suporte do OTTO PWA</p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <HelpCircle size={18} className="text-[#1D9E75]" />
          Perguntas Frequentes (FAQ)
        </h2>
        
        <div className="divide-y divide-gray-100">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div key={index} className="py-3.5">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between text-left font-semibold text-sm text-gray-700 hover:text-[#1D9E75] transition-colors"
                >
                  <span>{item.question}</span>
                  {isOpen ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-2 text-xs text-gray-500 leading-relaxed pl-1">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feedback Form Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.form 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit} 
              className="space-y-5"
            >
              <div>
                <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <MessageCircleQuestion size={18} className="text-amber-500" />
                  Enviar Feedback ou Bug
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Sua opinião ajuda a moldar a evolução do ecossistema OTTO.
                </p>
              </div>

              {/* Categorias */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tipo de Mensagem
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'sugestao', label: 'Sugestão', icon: Lightbulb, color: 'text-amber-500 bg-amber-50 border-amber-100 hover:bg-amber-100' },
                    { id: 'bug', label: 'Erro/Bug', icon: Bug, color: 'text-red-500 bg-red-50 border-red-100 hover:bg-red-100' },
                    { id: 'elogio', label: 'Elogio', icon: Heart, color: 'text-pink-500 bg-pink-50 border-pink-100 hover:bg-pink-100' },
                    { id: 'outros', label: 'Outros', icon: HelpCircle, color: 'text-blue-500 bg-blue-50 border-blue-100 hover:bg-blue-100' }
                  ].map((cat) => {
                    const isSelected = category === cat.id;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id as any)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                          isSelected 
                            ? 'border-[#1D9E75] bg-[#E1F7EE] text-[#1D9E75] ring-2 ring-[#1D9E75]/20 font-semibold' 
                            : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={18} className={isSelected ? 'text-[#1D9E75]' : 'text-gray-400'} />
                        <span className="text-[11px] mt-1.5">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Avaliação por Estrelas */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">
                  Como está sendo sua experiência no Beta? (Opcional)
                </label>
                <div className="flex items-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isActive = star <= (hoveredRating || rating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="p-1 hover:scale-110 active:scale-95 transition-all focus:outline-none"
                      >
                        <Star 
                          size={24} 
                          className={`transition-colors ${
                            isActive ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`} 
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">
                  Detalhes do Relato
                </label>
                <textarea
                  id="description"
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#1D9E75] focus:outline-none transition-all shadow-inner resize-none"
                  placeholder="Escreva aqui suas sugestões, descreva o erro que encontrou (se possível detalhando os passos para reproduzir) ou envie sua mensagem de suporte..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {errorMsg && (
                <p className="text-xs font-semibold text-red-500">{errorMsg}</p>
              )}

              {/* Botão de Envio */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#1D9E75] text-white font-bold rounded-xl hover:bg-[#0A865F] disabled:bg-gray-400 disabled:cursor-not-allowed active:scale-95 transition-all shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar Feedback</span>
                    <Send size={16} />
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div 
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="text-center py-8 space-y-4"
            >
              <div className="w-16 h-16 bg-[#E1F7EE] text-[#1D9E75] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Muito obrigado!</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                Seu feedback foi recebido e registrado com sucesso. Nossa equipe de desenvolvimento analisará o relato para continuar polindo o ecossistema.
              </p>
              <button
                onClick={() => setIsSuccess(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 font-bold rounded-xl transition-all"
              >
                Enviar Novo Relato
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
