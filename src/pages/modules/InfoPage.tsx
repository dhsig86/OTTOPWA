import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  Star, 
  Award, 
  CheckCircle2, 
  ExternalLink, 
  ChevronRight, 
  Bookmark,
  Share2,
  Calendar,
  Sparkles,
  Search,
  ListFilter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../lib/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

interface Artigo {
  titulo: string;
  revista: string;
  ano: string;
  autores: string;
  link: string;
}

interface QuizCuriosidade {
  pergunta: string;
  alternativas: string[];
  resposta_correta: string;
  explicacao: string;
}

interface PillData {
  id: string;
  tema: string;
  data_exibicao: string;
  tempo_leitura_min: number;
  especialidade: string;
  artigos: Artigo[];
  consenso_cientifico: string;
  pratica_clinica: string;
  quiz_curiosidade?: QuizCuriosidade;
}

export const InfoPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [pills, setPills] = useState<PillData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado da Pílula selecionada para leitura ativa
  const [activePill, setActivePill] = useState<PillData | null>(null);
  const [activeTab, setActiveTab] = useState<'evidencia' | 'pratica' | 'quiz'>('evidencia');
  
  // Quiz
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  
  // Favoritos e Leituras Concluídas
  const [favorites, setFavorites] = useState<string[]>([]);
  const [readPills, setReadPills] = useState<string[]>([]);
  
  // Filtro
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Carregar dados
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Buscar as pílulas do Firestore
        const q = query(collection(db, 'otto_pills'), orderBy('data_exibicao', 'desc'), limit(20));
        const snap = await getDocs(q);
        const list: PillData[] = [];
        
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as PillData);
        });

        // Caso o banco esteja vazio, injetar dados mockados de altíssima qualidade
        if (list.length === 0) {
          const mockPills: PillData[] = [
            {
              id: "mock_pill_1",
              tema: "Eficácia da Mometasona vs. Lavagem Salina na Rinossinusite Crônica",
              data_exibicao: new Date().toISOString().split('T')[0],
              tempo_leitura_min: 5,
              especialidade: "Rinologia",
              artigos: [
                {
                  titulo: "Intranasal corticosteroids for chronic rhinosinusitis without nasal polyps",
                  revista: "Cochrane Database Syst Rev",
                  ano: "2024",
                  autores": "Chong LY, et al.",
                  link: "https://pubmed.ncbi.nlm.nih.gov/38318854/"
                },
                {
                  titulo: "Nasal Saline Irrigation vs. Topical Steroids in Chronic Rhinosinusitis Management",
                  revista": "Laryngoscope",
                  ano: "2023",
                  autores": "Harvey RJ, et al.",
                  link: "https://pubmed.ncbi.nlm.nih.gov/37021145/"
                }
              ],
              consenso_cientifico": "A análise crítica das evidências de longo prazo da Cochrane e de ensaios clínicos controlados demonstra que o uso contínuo de corticosteroides intranasais apresenta superioridade estatística e clínica na redução de sintomas obstrutivos e escores SNOT-22 em pacientes com RSC sem pólipos nasais, em comparação com a lavagem salina isolada. No entanto, a terapia combinada (lavagem salina de alto volume antes da mometasona) confere a maior taxa de depuração mucociliar e controle de biofilmes bacterianos nasais.",
              pratica_clinica": "Recomende a realização de irrigação nasal salina de alto volume (240ml) sempre 10 a 15 minutos ANTES da aplicação do spray de mometasona nasofaringeo (200mcg/dia). Isso remove a barreira mecânica de muco e otimiza a penetração do corticoide nos óstios sinusais reabertos.",
              quiz_curiosidade": {
                "pergunta": "Qual a conduta que otimiza a penetração e eficácia do corticoide tópico na rinossinusite crônica?",
                "alternativas": [
                  "Aplicar o spray corticoide com o paciente em posição de Trendelenburg.",
                  "Realizar lavagem nasal salina de alto volume 10 a 15 minutos antes do corticoide.",
                  "Duplicar a dose do spray nasal nos dias de crise obstrutiva intensa.",
                  "Associar corticoide oral nos primeiros 3 dias de tratamento tópico."
                ],
                "resposta_correta": "Realizar lavagem nasal salina de alto volume 10 a 15 minutos antes do corticoide.",
                "explicacao": "A irrigação salina remove as crostas e o muco espesso, limpando a mucosa nasal para que o corticoide tópico seja absorvido de forma direta e homogênea."
              }
            },
            {
              id: "mock_pill_2",
              tema: "Efeitos da Microgravidade na Função Vestibular e Orientação Espacial",
              data_exibicao: "2026-05-18",
              tempo_leitura_min: 7,
              especialidade: "Vanguarda ORL",
              artigos: [
                {
                  titulo": "Vestibular adaptation and spatial disorientation in long-duration spaceflight",
                  revista: "npj Microgravity",
                  ano: "2024",
                  autores": "Hallgren E, et al.",
                  link": "https://pubmed.ncbi.nlm.nih.gov/38201243/"
                },
                {
                  titulo": "3D Printing of Otolith Models for Space Motion Sickness Simulation",
                  revista: "Otology & Neurotology",
                  ano: "2023",
                  autores": "Snape M, et al.",
                  link: "https://pubmed.ncbi.nlm.nih.gov/37199201/"
                }
              ],
              consenso_cientifico": "Estudos vestibulares em astronautas da ISS mostram que a ausência de gravidade altera a sinalização dos otólitos (utrículo e sáculo), forçando o cérebro a depender puramente de pistas visuais e proprioceptivas para a auto-orientação espacial. A adaptação vestibular inicial causa a chamada 'Síndrome de Adaptação Espacial' (Space Motion Sickness), com náusea e ilusões visuo-vestibulares, enquanto o retorno à Terra gera instabilidade postural prolongada devido à reconfiguração dos reflexos vestíbulo-oculares.",
              pratica_clinica": "Na prática terrestre de reabilitação vestibular, utilize exercícios de habituação visual complexos (optocinéticos e realidade virtual) para emular a dependência visual e acelerar a compensação vestibular em pacientes com perda otolítica unilateral crônica.",
              quiz_curiosidade": {
                "pergunta": "Qual receptor vestibular sofre a maior alteração de sinalização na ausência de gravidade?",
                "alternativas": [
                  "Canais semicirculares horizontais.",
                  "Órgãos otolíticos (utrículo e sáculo).",
                  "Cúpula do canal semicircular superior.",
                  "Nervo vestibular coclear proximal."
                ],
                "resposta_correta": "Órgãos otolíticos (utrículo e sáculo).",
                "explicacao": "Os otólitos dependem da força da gravidade sobre a membrana otolítica para defletir os cílios das células sensoriais. Em microgravidade, essa deflexão basal desaparece."
              }
            }
          ];
          setPills(mockPills);
          setActivePill(mockPills[0]);
        } else {
          setPills(list);
          setActivePill(list[0]);
        }

        // 2. Carregar favoritos e leituras do médico logado
        if (user) {
          const favRef = doc(db, 'users', user.uid, 'favoritos_news', 'list');
          const favSnap = await getDoc(favRef);
          if (favSnap.exists()) {
            setFavorites(favSnap.data().ids || []);
          }

          const readRef = doc(db, 'users', user.uid, 'leituras_news', 'list');
          const readSnap = await getDoc(readRef);
          if (readSnap.exists()) {
            setReadPills(readSnap.data().ids || []);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados do OTTO Update:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Manipular favoritos
  const toggleFavorite = async (pillId: string) => {
    if (!user) return;
    
    let updated: string[];
    if (favorites.includes(pillId)) {
      updated = favorites.filter(id => id !== pillId);
    } else {
      updated = [...favorites, pillId];
    }
    
    setFavorites(updated);
    try {
      await setDoc(doc(db, 'users', user.uid, 'favoritos_news', 'list'), { ids: updated });
    } catch (e) {
      console.error("Erro ao salvar favorito:", e);
    }
  };

  // Marcar como lido (gamificação)
  const toggleRead = async (pillId: string) => {
    if (!user) return;

    let updated: string[];
    if (readPills.includes(pillId)) {
      updated = readPills.filter(id => id !== pillId);
    } else {
      updated = [...readPills, pillId];
    }

    setReadPills(updated);
    try {
      await setDoc(doc(db, 'users', user.uid, 'leituras_news', 'list'), { ids: updated });
    } catch (e) {
      console.error("Erro ao salvar leitura concluída:", e);
    }
  };

  // Filtrar pílulas por categoria
  const filteredPills = pills.filter(p => {
    if (selectedCategory === 'Todas') return true;
    if (selectedCategory === 'Favoritos') return favorites.includes(p.id);
    return p.especialidade === selectedCategory;
  });

  // Estatísticas do Dashboard
  const totalLidos = readPills.length;
  const streakSemanas = Math.min(Math.ceil(totalLidos / 2), 4); // gamificação fictícia

  // Selecionar outra pílula no histórico
  const selectPill = (pill: PillData) => {
    setActivePill(pill);
    setActiveTab('evidencia');
    setSelectedAlternative(null);
    setQuizAnswered(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100 pb-20 selection:bg-indigo-500 selection:text-white">
      {/* Header Fixo Premium */}
      <header className="h-16 bg-gray-950/80 backdrop-blur-md border-b border-gray-800 text-white flex items-center justify-between px-4 sticky top-0 z-50">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 -ml-2 hover:bg-gray-800/80 rounded-full transition-colors flex items-center gap-1.5 text-gray-400 hover:text-white"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-semibold">Voltar</span>
        </button>
        <span className="font-extrabold text-base bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
          <Sparkles size={18} className="text-purple-400 animate-pulse" />
          OTTO UPDATE
        </span>
        <div className="w-8" />
      </header>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-gray-400">Analisando literatura científica...</span>
        </div>
      ) : (
        <div className="p-4 max-w-4xl mx-auto w-full space-y-6">
          
          {/* Dashboard Clínico: Cérebro Afiado */}
          <div className="bg-gradient-to-r from-gray-950 via-slate-900 to-gray-950 border border-gray-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full" />
            <div className="absolute left-1/2 bottom-0 w-32 h-12 bg-emerald-500/5 blur-2xl rounded-full" />
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Award size={15} className="text-indigo-400" />
                  Performance Científica
                </h2>
                <p className="text-xl font-black text-white mt-1">Cérebro Afiado 🧠</p>
              </div>
              <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs px-3 py-1 rounded-full font-bold">
                Level {Math.max(1, Math.floor(totalLidos / 3))}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-900/60 border border-gray-800/80 p-3 rounded-2xl">
                <span className="text-xs text-gray-500 block mb-1">Pílulas Lidas</span>
                <span className="text-2xl font-black text-emerald-400">{totalLidos}</span>
              </div>
              <div className="bg-gray-900/60 border border-gray-800/80 p-3 rounded-2xl">
                <span className="text-xs text-gray-500 block mb-1">Favoritos</span>
                <span className="text-2xl font-black text-amber-400">{favorites.length}</span>
              </div>
              <div className="bg-gray-900/60 border border-gray-800/80 p-3 rounded-2xl">
                <span className="text-xs text-gray-500 block mb-1">Meta Semanal</span>
                <span className="text-2xl font-black text-indigo-400">{totalLidos % 5}/5</span>
              </div>
            </div>
          </div>

          {activePill && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Topo do Card de Leitura */}
              <div className="p-6 bg-gradient-to-b from-indigo-950/40 via-gray-950 to-gray-950 border-b border-gray-800 relative">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider bg-indigo-900/60 border border-indigo-700 text-indigo-300 px-3 py-1 rounded-full">
                      {activePill.especialidade}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar size={12} />
                      {activePill.data_exibicao}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleFavorite(activePill.id)}
                      className={`p-2 rounded-full border transition-all ${
                        favorites.includes(activePill.id)
                          ? 'bg-amber-950/40 border-amber-500/50 text-amber-400'
                          : 'bg-gray-900 border-gray-850 text-gray-500 hover:text-gray-200'
                      }`}
                    >
                      <Star size={18} fill={favorites.includes(activePill.id) ? "currentColor" : "none"} />
                    </button>
                    <button 
                      onClick={() => toggleRead(activePill.id)}
                      className={`p-2 rounded-full border transition-all ${
                        readPills.includes(activePill.id)
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400'
                          : 'bg-gray-900 border-gray-850 text-gray-500 hover:text-gray-200'
                      }`}
                      title={readPills.includes(activePill.id) ? "Lido" : "Marcar como lido"}
                    >
                      <CheckCircle2 size={18} />
                    </button>
                  </div>
                </div>
                
                <h1 className="text-xl font-extrabold text-white leading-snug">{activePill.tema}</h1>
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                  <BookOpen size={13} className="text-indigo-400" />
                  Tempo estimado de leitura: <strong className="text-gray-200">{activePill.tempo_leitura_min} minutos</strong>
                </p>
              </div>

              {/* Abas Navegáveis */}
              <div className="flex border-b border-gray-850 bg-gray-950 px-4">
                <button
                  onClick={() => setActiveTab('evidencia')}
                  className={`flex-1 py-3 text-center text-xs font-bold border-b-2 transition-all ${
                    activeTab === 'evidencia' 
                      ? 'border-indigo-500 text-white' 
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Duelo de Evidências
                </button>
                <button
                  onClick={() => setActiveTab('pratica')}
                  className={`flex-1 py-3 text-center text-xs font-bold border-b-2 transition-all ${
                    activeTab === 'pratica' 
                      ? 'border-emerald-500 text-white' 
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Pílula Prática
                </button>
                {activePill.quiz_curiosidade && (
                  <button
                    onClick={() => setActiveTab('quiz')}
                    className={`flex-1 py-3 text-center text-xs font-bold border-b-2 transition-all ${
                      activeTab === 'quiz' 
                        ? 'border-purple-500 text-white' 
                        : 'border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    Quiz de Fixação
                  </button>
                )}
              </div>

              {/* Conteúdo da Aba Ativa */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'evidencia' && (
                    <motion.div
                      key="evidencia"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-6"
                    >
                      {/* Consenso Científico */}
                      <div>
                        <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider mb-2">Consenso e Integração Científica</h3>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line bg-gray-900/40 p-4 rounded-2xl border border-gray-850">
                          {activePill.consenso_cientifico}
                        </p>
                      </div>

                      {/* Artigos Utilizados */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Artigos Analisados (Publicados &gt; 12 meses)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {activePill.artigos.map((art, idx) => (
                            <div key={idx} className="bg-gray-900 p-4 rounded-2xl border border-gray-850 flex flex-col justify-between hover:border-gray-800 transition-colors">
                              <div>
                                <div className="flex items-center justify-between gap-1 mb-2">
                                  <span className="text-[10px] font-bold text-gray-500 bg-gray-950 border border-gray-850 px-2 py-0.5 rounded-md">
                                    Estudo {idx + 1}
                                  </span>
                                  <span className="text-xs font-semibold text-indigo-400">{art.revista} · {art.ano}</span>
                                </div>
                                <h4 className="text-xs font-bold text-white leading-snug line-clamp-3 mb-2">{art.titulo}</h4>
                                <p className="text-[10px] text-gray-500 italic mb-3">Autores: {art.autores}</p>
                              </div>
                              <a 
                                href={art.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 self-start group"
                              >
                                Acessar Artigo Original 
                                <ExternalLink size={10} className="group-hover:translate-x-0.5 transition-transform" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'pratica' && (
                    <motion.div
                      key="pratica"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wider">Takeaway Clínico (Conduta do Otorrino)</h3>
                      <div className="bg-emerald-950/20 border-l-4 border-emerald-500 p-5 rounded-r-2xl space-y-3">
                        <p className="text-gray-200 text-sm font-medium leading-relaxed whitespace-pre-line">
                          {activePill.pratica_clinica}
                        </p>
                      </div>
                      <div className="bg-gray-900 border border-gray-850 rounded-2xl p-4 flex items-center gap-3">
                        <Bookmark className="text-indigo-400 shrink-0" size={20} />
                        <p className="text-xs text-gray-400 leading-snug">
                          Esta pílula foi sintetizada a partir de meta-análises e ensaios clínicos controlados de alto impacto, projetada para ser memorizada em segundos e aplicada ao longo do dia.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'quiz' && activePill.quiz_curiosidade && (
                    <motion.div
                      key="quiz"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-5"
                    >
                      <div className="bg-purple-950/20 border border-purple-800/40 p-4 rounded-2xl flex items-center gap-2">
                        <Award className="text-purple-400 shrink-0 animate-bounce" size={20} />
                        <span className="text-xs font-bold text-purple-300">Sala de Espera & Curiosidades (OTTO GAMES preview)</span>
                      </div>

                      <h3 className="text-sm font-bold text-white leading-relaxed">
                        {activePill.quiz_curiosidade.pergunta}
                      </h3>

                      <div className="space-y-2.5">
                        {activePill.quiz_curiosidade.alternativas.map((alt, i) => {
                          const isSelected = selectedAlternative === alt;
                          const isCorrect = alt === activePill.quiz_curiosidade?.resposta_correta;
                          let btnStyle = "bg-gray-900 hover:bg-gray-850 border-gray-850 text-gray-300";
                          
                          if (quizAnswered) {
                            if (isCorrect) {
                              btnStyle = "bg-emerald-950/40 border-emerald-500 text-emerald-400";
                            } else if (isSelected) {
                              btnStyle = "bg-rose-950/40 border-rose-500 text-rose-400";
                            } else {
                              btnStyle = "bg-gray-900 border-gray-850 text-gray-600 opacity-60";
                            }
                          }

                          return (
                            <button
                              key={i}
                              disabled={quizAnswered}
                              onClick={() => {
                                setSelectedAlternative(alt);
                                setQuizAnswered(true);
                              }}
                              className={`w-full text-left p-3.5 rounded-2xl border text-xs font-medium transition-all flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{alt}</span>
                              {quizAnswered && isCorrect && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      <AnimatePresence>
                        {quizAnswered && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-900 border border-gray-850 p-4 rounded-2xl"
                          >
                            <h4 className="text-xs font-bold text-white mb-1">Explicação Científica:</h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              {activePill.quiz_curiosidade.explicacao}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Histórico e Busca */}
          <div className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-850 pb-3">
              <h2 className="text-base font-extrabold text-white flex items-center gap-1.5">
                <ListFilter size={18} className="text-indigo-400" />
                Acervo de Pílulas Clínicas
              </h2>

              {/* Botões de Categorias */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {['Todas', 'Rinologia', 'Laringologia', 'Otologia', 'Pediatria ORL', 'Vanguarda ORL', 'Favoritos'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-indigo-500 border-indigo-400 text-white'
                        : 'bg-gray-950 border-gray-800 text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Listagem do Acervo */}
            <div className="space-y-3">
              {filteredPills.length === 0 ? (
                <div className="bg-gray-950 border border-gray-850 p-8 rounded-3xl text-center text-gray-500">
                  <Search size={30} className="mx-auto text-gray-700 mb-2" />
                  Nenhuma pílula de conhecimento nesta subárea no momento.
                </div>
              ) : (
                filteredPills.map((pill, i) => (
                  <motion.div
                    key={pill.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => selectPill(pill)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                      activePill?.id === pill.id
                        ? 'bg-indigo-950/20 border-indigo-500/80 shadow-md'
                        : 'bg-gray-950 border-gray-850 hover:bg-gray-900/60 hover:border-gray-800'
                    }`}
                  >
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[9px] font-black uppercase tracking-wider bg-gray-900 border border-gray-800 text-gray-400 px-2 py-0.5 rounded-md">
                          {pill.especialidade}
                        </span>
                        {readPills.includes(pill.id) && (
                          <span className="text-[9px] font-bold uppercase text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle2 size={10} /> Lido
                          </span>
                        )}
                        {favorites.includes(pill.id) && (
                          <Star size={10} className="text-amber-400 fill-amber-400" />
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-gray-200 leading-snug line-clamp-2">{pill.tema}</h4>
                    </div>
                    <ChevronRight size={18} className="text-gray-600 shrink-0" />
                  </motion.div>
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
