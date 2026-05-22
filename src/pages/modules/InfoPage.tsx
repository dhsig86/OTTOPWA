import React, { useState, useEffect, useMemo } from 'react';
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
  Calendar,
  Sparkles,
  Search,
  ListFilter,
  RefreshCw,
  TrendingUp,
  Zap,
  BarChart3,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../lib/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  getDoc,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

// ─── Interfaces ──────────────────────────────────────────────────────────────

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

interface InsightChartData {
  tipo: 'comparacao' | 'percentual' | 'timeline';
  titulo: string;
  dados: Array<{ label: string; valor: number; unidade?: string }>;
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
  revelacao_central?: string;
  insight_grafico?: InsightChartData;
  fonte?: 'mock' | 'pubmed_real';
  pmids?: string[];
}

// ─── InsightChart SVG Component ──────────────────────────────────────────────

function InsightChart({ data }: { data: InsightChartData }) {
  if (!data?.dados?.length) return null;

  const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6'];

  if (data.tipo === 'percentual') {
    const valor = data.dados[0]?.valor || 0;
    const r = 42;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (valor / 100) * circumference;

    return (
      <div className="flex flex-col items-center gap-2 py-2">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">{data.titulo}</p>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#1a3a2f" strokeWidth="6" />
          <circle
            cx="50" cy="50" r={r} fill="none"
            stroke="#10b981" strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
            className="transition-all duration-1000"
          />
          <text x="50" y="46" textAnchor="middle" fill="white" fontSize="18" fontWeight="800">{valor}</text>
          <text x="50" y="60" textAnchor="middle" fill="#9ca3af" fontSize="10">{data.dados[0]?.unidade || '%'}</text>
        </svg>
        <p className="text-[10px] text-gray-500 text-center">{data.dados[0]?.label}</p>
      </div>
    );
  }

  if (data.tipo === 'comparacao') {
    const maxVal = Math.max(...data.dados.map(d => d.valor), 1);
    return (
      <div className="space-y-2 py-2">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{data.titulo}</p>
        {data.dados.map((d, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-400 truncate max-w-[60%]">{d.label}</span>
              <span className="font-bold text-white">{d.valor}{d.unidade || '%'}</span>
            </div>
            <div className="w-full h-2 bg-[#1a3a2f] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(d.valor / maxVal) * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
                className="h-full rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (data.tipo === 'timeline') {
    return (
      <div className="space-y-2 py-2">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{data.titulo}</p>
        <div className="flex items-end justify-between gap-1 h-16 px-1">
          {data.dados.map((d, i) => {
            const maxVal = Math.max(...data.dados.map(x => x.valor), 1);
            const pct = (d.valor / maxVal) * 100;
            return (
              <div key={i} className="flex flex-col items-center flex-1 gap-1">
                <span className="text-[9px] font-bold text-white">{d.valor}{d.unidade || ''}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(pct, 8)}%` }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="w-full max-w-[24px] rounded-t"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-[8px] text-gray-500 text-center leading-tight">{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}

// ─── Fallback mock pills (manter para offline) ──────────────────────────────

const MOCK_PILLS: PillData[] = [
  {
    id: "mock_pill_1",
    tema: "Eficácia da Mometasona vs. Lavagem Salina na Rinossinusite Crônica",
    data_exibicao: new Date().toISOString().slice(0, 10),
    tempo_leitura_min: 5,
    especialidade: "Rinologia",
    fonte: 'mock',
    revelacao_central: "Lavagem salina antes do corticoide tópico otimiza a penetração nos óstios sinusais",
    insight_grafico: {
      tipo: 'comparacao',
      titulo: 'Redução do SNOT-22',
      dados: [
        { label: 'Combinada (salina + CIN)', valor: 78, unidade: '%' },
        { label: 'Corticoide isolado', valor: 54, unidade: '%' },
        { label: 'Salina isolada', valor: 32, unidade: '%' },
      ]
    },
    artigos: [
      { titulo: "Intranasal corticosteroids for chronic rhinosinusitis without nasal polyps", revista: "Cochrane Database Syst Rev", ano: "2024", autores: "Chong LY, et al.", link: "https://pubmed.ncbi.nlm.nih.gov/" },
      { titulo: "Nasal Saline Irrigation vs. Topical Steroids in CRS Management", revista: "Laryngoscope", ano: "2023", autores: "Harvey RJ, et al.", link: "https://pubmed.ncbi.nlm.nih.gov/" }
    ],
    consenso_cientifico: "A análise crítica das evidências de longo prazo da Cochrane e de ensaios clínicos controlados demonstra que o uso contínuo de corticosteroides intranasais apresenta superioridade estatística na redução de sintomas obstrutivos e escores SNOT-22 em pacientes com RSC sem pólipos nasais. A terapia combinada (lavagem salina + mometasona) confere a maior taxa de depuração mucociliar.",
    pratica_clinica: "Recomende irrigação nasal salina de alto volume (240ml) 10 a 15 minutos ANTES do spray de mometasona nasofaríngeo (200mcg/dia). Isso remove a barreira de muco e otimiza a penetração do corticoide.",
    quiz_curiosidade: {
      pergunta: "Qual conduta otimiza a penetração do corticoide tópico na rinossinusite crônica?",
      alternativas: [
        "A) Aplicar spray em posição de Trendelenburg.",
        "B) Lavagem nasal salina 10-15min antes do corticoide.",
        "C) Duplicar a dose do spray nos dias de crise.",
        "D) Associar corticoide oral nos 3 primeiros dias."
      ],
      resposta_correta: "B) Lavagem nasal salina 10-15min antes do corticoide.",
      explicacao: "A irrigação salina remove crostas e muco espesso, permitindo absorção direta e homogênea do corticoide tópico."
    }
  },
  {
    id: "mock_pill_2",
    tema: "Corticoterapia Intratimpânica como Resgate na Surdez Súbita",
    data_exibicao: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    tempo_leitura_min: 5,
    especialidade: "Otologia",
    fonte: 'mock',
    revelacao_central: "CIT de resgate deve iniciar nas primeiras 2 semanas após falha do corticoide sistêmico",
    insight_grafico: {
      tipo: 'percentual',
      titulo: 'Taxa de Recuperação Auditiva',
      dados: [{ label: 'Pacientes com CIT ≤ 14 dias', valor: 67, unidade: '%' }]
    },
    artigos: [
      { titulo: "Intratympanic methylprednisolone vs systemic steroids for SSNHL", revista: "JAMA Otolaryngol", ano: "2023", autores: "Rauch SD, et al.", link: "https://pubmed.ncbi.nlm.nih.gov/" },
      { titulo: "Salvage intratympanic steroid therapy for sudden deafness", revista: "Otol Neurotol", ano: "2024", autores: "Plontke SK, et al.", link: "https://pubmed.ncbi.nlm.nih.gov/" }
    ],
    consenso_cientifico: "Na PANSS idiopática, a CIT de resgate com metilprednisolona ou dexametasona apresenta eficácia comprovada em pacientes refratários ao corticoide sistêmico, devendo ser iniciada nas primeiras 2-3 semanas após a falha do tratamento inicial.",
    pratica_clinica: "Realize 3-4 aplicações intratimpânicas (dexametasona 4mg/ml) com intervalo de 3-7 dias. Oriente decúbito lateral por 20-30 minutos sem engolir.",
    quiz_curiosidade: {
      pergunta: "Qual recomendação otimiza a absorção na corticoterapia intratimpânica?",
      alternativas: [
        "A) Paciente sentado mastigando chiclete.",
        "B) Decúbito lateral 20-30min sem deglutir.",
        "C) Manobras de Valsalva nos primeiros 5min.",
        "D) Compressa morna no pavilhão auricular."
      ],
      resposta_correta: "B) Decúbito lateral 20-30min sem deglutir.",
      explicacao: "Decúbito com orelha tratada para cima acumula medicação sobre a janela redonda. Evitar deglutição previne drenagem pela tuba."
    }
  }
];

// ─── Main Component ──────────────────────────────────────────────────────────

export const InfoPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId, profile } = useAuth();
  
  const [pills, setPills] = useState<PillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMockData, setIsMockData] = useState(false);
  
  const [activePill, setActivePill] = useState<PillData | null>(null);
  const [activeTab, setActiveTab] = useState<'evidencia' | 'pratica' | 'quiz'>('evidencia');
  
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  
  const [favorites, setFavorites] = useState<string[]>([]);
  const [readPills, setReadPills] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  const fetchData = async (showRefreshAnim = false) => {
    try {
      if (showRefreshAnim) setIsRefreshing(true);
      else setLoading(true);

      const q = query(collection(db, 'otto_pills'), orderBy('data_exibicao', 'desc'), limit(30));
      const snap = await getDocs(q);
      const list: PillData[] = [];
      
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as PillData);
      });

      if (list.length === 0) {
        setPills(MOCK_PILLS);
        setActivePill(MOCK_PILLS[0]);
        setIsMockData(true);
      } else {
        setPills(list);
        if (!showRefreshAnim || !activePill) setActivePill(list[0]);
        setIsMockData(false);
      }

      if (userId) {
        const favRef = doc(db, 'users', userId, 'favoritos_news', 'list');
        const favSnap = await getDoc(favRef);
        if (favSnap.exists()) setFavorites(favSnap.data().ids || []);

        const readRef = doc(db, 'users', userId, 'leituras_news', 'list');
        const readSnap = await getDoc(readRef);
        if (readSnap.exists()) setReadPills(readSnap.data().ids || []);
      }
    } catch (err) {
      console.error("Erro ao carregar OTTO Update:", err);
      setPills(MOCK_PILLS);
      setActivePill(MOCK_PILLS[0]);
      setIsMockData(true);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, [userId]);

  const toggleFavorite = async (pillId: string) => {
    if (!userId) return;
    const updated = favorites.includes(pillId) ? favorites.filter(id => id !== pillId) : [...favorites, pillId];
    setFavorites(updated);
    try { await setDoc(doc(db, 'users', userId, 'favoritos_news', 'list'), { ids: updated }); }
    catch (e) { console.error("Erro ao salvar favorito:", e); }
  };

  const toggleRead = async (pillId: string) => {
    if (!userId) return;
    const updated = readPills.includes(pillId) ? readPills.filter(id => id !== pillId) : [...readPills, pillId];
    setReadPills(updated);
    try { await setDoc(doc(db, 'users', userId, 'leituras_news', 'list'), { ids: updated }); }
    catch (e) { console.error("Erro ao salvar leitura:", e); }
  };

  const filteredPills = pills.filter(p => {
    if (selectedCategory === 'Todas') return true;
    if (selectedCategory === 'Favoritos') return favorites.includes(p.id);
    return p.especialidade === selectedCategory;
  });

  const categories = useMemo(() => {
    const cats = [...new Set(pills.map(p => p.especialidade))].sort();
    return ['Todas', ...cats, 'Favoritos'];
  }, [pills]);

  // Stats
  const totalLidos = readPills.length;
  const totalPills = pills.length;
  const realPills = pills.filter(p => p.fonte === 'pubmed_real').length;
  const specialtiesCovered = new Set(pills.map(p => p.especialidade)).size;
  const lastUpdate = pills[0]?.data_exibicao || '—';

  const selectPill = (pill: PillData) => {
    setActivePill(pill);
    setActiveTab('evidencia');
    setSelectedAlternative(null);
    setQuizAnswered(false);
    const el = document.getElementById('otto-update-scrollable-content');
    if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Block patients
  if (profile === 'paciente') {
    return (
      <div className="fixed inset-0 z-50 bg-[#051813] flex flex-col items-center justify-center p-6 text-center text-white">
        <h2 className="text-xl font-bold mb-2 text-emerald-400">Acesso Restrito</h2>
        <p className="text-sm text-gray-400 max-w-sm mb-6">
          Este módulo contém informações científicas voltadas exclusivamente a médicos e profissionais de saúde.
        </p>
        <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-[#1D9E75] hover:bg-[#0A865F] text-white rounded-full font-semibold transition-colors shadow-lg">
          Voltar para o Início
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-45 bg-[#051813] flex flex-col text-gray-100 selection:bg-[#1D9E75] selection:text-white">
      {/* Header */}
      <header className="h-14 sm:h-16 bg-[#0B251E] border-b border-[#123E32] text-white flex items-center justify-between px-3 sm:px-4 shrink-0 z-50">
        <button onClick={() => navigate(-1)} className="p-2 -ml-1 hover:bg-[#123E32]/80 rounded-full transition-colors flex items-center gap-1 text-gray-400 hover:text-white">
          <ArrowLeft size={18} />
          <span className="text-xs sm:text-sm font-semibold hidden sm:inline">Voltar</span>
        </button>
        <span className="font-extrabold text-sm sm:text-base bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 bg-clip-text text-transparent flex items-center gap-1.5">
          <Sparkles size={16} className="text-emerald-400 animate-pulse" />
          OTTO UPDATE
        </span>
        <button
          onClick={() => fetchData(true)}
          disabled={isRefreshing}
          className="p-2 hover:bg-[#123E32]/80 rounded-full transition-colors text-gray-400 hover:text-white disabled:opacity-50"
          title="Atualizar pílulas"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </header>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-gray-400">Analisando literatura científica...</span>
        </div>
      ) : (
        <div id="otto-update-scrollable-content" className="flex-1 overflow-y-auto p-3 sm:p-4 pb-24">
          <div className="max-w-4xl mx-auto w-full space-y-4 sm:space-y-6">

            {/* Mock Data Banner */}
            {isMockData && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-950/30 border border-amber-700/40 rounded-2xl p-3 sm:p-4 flex items-start gap-3"
              >
                <Zap size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-300 mb-0.5">Modo Demonstração</p>
                  <p className="text-[10px] sm:text-xs text-amber-200/70">
                    Exibindo pílulas de exemplo. Execute o script <code className="bg-amber-950/50 px-1 rounded text-amber-300">generate-pills.mjs</code> para buscar artigos reais do PubMed.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ═══ DASHBOARD ═══ */}
            <div className="bg-gradient-to-br from-[#030d0a] via-[#0B251E] to-[#071a14] border border-[#123E32] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full" />
              <div className="absolute left-1/3 bottom-0 w-32 h-12 bg-[#1D9E75]/5 blur-2xl rounded-full" />

              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                  <h2 className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                    <BarChart3 size={13} className="text-[#1D9E75]" />
                    Performance Científica
                  </h2>
                  <p className="text-lg sm:text-xl font-black text-white mt-0.5">Cérebro Afiado 🧠</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-950/80 text-emerald-300 border border-[#123E32] text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full font-bold">
                    Level {Math.max(1, Math.floor(totalLidos / 3))}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <div className="bg-[#030d0a]/60 border border-[#123E32]/80 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-center">
                  <span className="text-[9px] sm:text-xs text-gray-500 block mb-0.5">Pílulas Lidas</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-400">{totalLidos}</span>
                </div>
                <div className="bg-[#030d0a]/60 border border-[#123E32]/80 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-center">
                  <span className="text-[9px] sm:text-xs text-gray-500 block mb-0.5">No Acervo</span>
                  <span className="text-xl sm:text-2xl font-black text-teal-400">{totalPills}</span>
                </div>
                <div className="bg-[#030d0a]/60 border border-[#123E32]/80 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-center">
                  <span className="text-[9px] sm:text-xs text-gray-500 block mb-0.5">Especialidades</span>
                  <span className="text-xl sm:text-2xl font-black text-cyan-400">{specialtiesCovered}</span>
                </div>
                <div className="bg-[#030d0a]/60 border border-[#123E32]/80 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-center">
                  <span className="text-[9px] sm:text-xs text-gray-500 block mb-0.5">Favoritos</span>
                  <span className="text-xl sm:text-2xl font-black text-amber-400">{favorites.length}</span>
                </div>
              </div>

              {/* Last update info */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#123E32]/60">
                <span className="text-[9px] sm:text-[10px] text-gray-600 flex items-center gap-1">
                  <Clock size={10} />
                  Última atualização: {lastUpdate}
                </span>
                {realPills > 0 && (
                  <span className="text-[9px] sm:text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <TrendingUp size={10} />
                    {realPills} artigos PubMed verificados
                  </span>
                )}
              </div>
            </div>

            {/* ═══ HERO CARD — Revelação Central ═══ */}
            {activePill && (
              <motion.div
                key={activePill.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#071F19] border border-[#123E32] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl"
              >
                {/* Revelação Central Hero */}
                {activePill.revelacao_central && (
                  <div className="bg-gradient-to-r from-emerald-950/40 via-[#071F19] to-teal-950/30 border-b border-[#123E32] p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <Zap size={16} className="text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-500/70 mb-1">Revelação Central</p>
                        <p className="text-sm sm:text-base font-extrabold text-white leading-snug">
                          {activePill.revelacao_central}
                        </p>
                      </div>
                    </div>
                    {/* Insight Chart */}
                    {activePill.insight_grafico && (
                      <div className="mt-3 bg-[#030d0a]/50 border border-[#123E32]/60 rounded-xl p-3">
                        <InsightChart data={activePill.insight_grafico} />
                      </div>
                    )}
                  </div>
                )}

                {/* Pill Header */}
                <div className="p-4 sm:p-6 bg-gradient-to-b from-emerald-950/10 via-[#071F19] to-[#071F19] border-b border-[#123E32]">
                  <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] sm:text-xs font-black uppercase tracking-wider bg-emerald-900/40 border border-emerald-700/50 text-[#CDF0E3] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                        {activePill.especialidade}
                      </span>
                      <span className="text-[9px] sm:text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={10} />
                        {activePill.data_exibicao}
                      </span>
                      {activePill.fonte === 'pubmed_real' && (
                        <span className="text-[8px] sm:text-[9px] font-bold uppercase text-emerald-500 bg-emerald-950/50 border border-emerald-700/30 px-1.5 py-0.5 rounded">
                          PubMed ✓
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => toggleFavorite(activePill.id)}
                        className={`p-1.5 sm:p-2 rounded-full border transition-all ${
                          favorites.includes(activePill.id)
                            ? 'bg-amber-950/40 border-amber-500/50 text-amber-400'
                            : 'bg-[#030d0a] border-[#123E32] text-gray-500 hover:text-gray-200'
                        }`}
                      >
                        <Star size={15} fill={favorites.includes(activePill.id) ? "currentColor" : "none"} />
                      </button>
                      <button 
                        onClick={() => toggleRead(activePill.id)}
                        className={`p-1.5 sm:p-2 rounded-full border transition-all ${
                          readPills.includes(activePill.id)
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400'
                            : 'bg-[#030d0a] border-[#123E32] text-gray-500 hover:text-gray-200'
                        }`}
                        title={readPills.includes(activePill.id) ? "Lido" : "Marcar como lido"}
                      >
                        <CheckCircle2 size={15} />
                      </button>
                    </div>
                  </div>
                  
                  <h1 className="text-base sm:text-xl font-extrabold text-white leading-snug">{activePill.tema}</h1>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1.5 sm:mt-2 flex items-center gap-1.5">
                    <BookOpen size={12} className="text-[#1D9E75]" />
                    Leitura: <strong className="text-gray-200">{activePill.tempo_leitura_min} min</strong>
                    {activePill.artigos.length > 0 && (
                      <span className="ml-2">· {activePill.artigos.length} artigos</span>
                    )}
                  </p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#123E32] bg-[#071F19] px-2 sm:px-4">
                  <button
                    onClick={() => setActiveTab('evidencia')}
                    className={`flex-1 py-2.5 sm:py-3 text-center text-[10px] sm:text-xs font-bold border-b-2 transition-all ${
                      activeTab === 'evidencia' ? 'border-[#1D9E75] text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    Evidências
                  </button>
                  <button
                    onClick={() => setActiveTab('pratica')}
                    className={`flex-1 py-2.5 sm:py-3 text-center text-[10px] sm:text-xs font-bold border-b-2 transition-all ${
                      activeTab === 'pratica' ? 'border-emerald-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    Pílula Prática
                  </button>
                  {activePill.quiz_curiosidade && (
                    <button
                      onClick={() => setActiveTab('quiz')}
                      className={`flex-1 py-2.5 sm:py-3 text-center text-[10px] sm:text-xs font-bold border-b-2 transition-all ${
                        activeTab === 'quiz' ? 'border-teal-400 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      Quiz
                    </button>
                  )}
                </div>

                {/* Tab Content */}
                <div className="p-4 sm:p-6">
                  <AnimatePresence mode="wait">
                    {activeTab === 'evidencia' && (
                      <motion.div key="ev" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4 sm:space-y-6">
                        <div>
                          <h3 className="text-[10px] sm:text-xs font-black uppercase text-[#CDF0E3] tracking-wider mb-2">Consenso e Integração Científica</h3>
                          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-[#051813]/60 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#123E32]">
                            {activePill.consenso_cientifico}
                          </p>
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                          <h3 className="text-[10px] sm:text-xs font-black uppercase text-gray-400 tracking-wider">Artigos Analisados</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            {activePill.artigos.map((art, idx) => (
                              <div key={idx} className="bg-[#051813] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#123E32] flex flex-col justify-between hover:border-[#1D9E75]/30 transition-colors">
                                <div>
                                  <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-2">
                                    <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 bg-[#030d0a] border border-[#123E32] px-1.5 sm:px-2 py-0.5 rounded-md">Estudo {idx + 1}</span>
                                    <span className="text-[9px] sm:text-xs font-semibold text-emerald-400 truncate ml-1">{art.revista} · {art.ano}</span>
                                  </div>
                                  <h4 className="text-[10px] sm:text-xs font-bold text-white leading-snug line-clamp-3 mb-1.5 sm:mb-2">{art.titulo}</h4>
                                  <p className="text-[9px] sm:text-[10px] text-gray-500 italic mb-2 sm:mb-3">Autores: {art.autores}</p>
                                </div>
                                <a href={art.link} target="_blank" rel="noopener noreferrer"
                                  className="text-[9px] sm:text-[10px] text-[#1D9E75] hover:text-emerald-300 font-bold flex items-center gap-1 self-start group">
                                  Acessar Artigo Original
                                  <ExternalLink size={9} className="group-hover:translate-x-0.5 transition-transform" />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'pratica' && (
                      <motion.div key="pr" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                        <h3 className="text-[10px] sm:text-xs font-black uppercase text-emerald-400 tracking-wider">Takeaway Clínico (Conduta do Otorrino)</h3>
                        <div className="bg-emerald-950/20 border-l-4 border-emerald-500 p-4 sm:p-5 rounded-r-xl sm:rounded-r-2xl space-y-3">
                          <p className="text-gray-200 text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-line">
                            {activePill.pratica_clinica}
                          </p>
                        </div>
                        <div className="bg-[#051813] border border-[#123E32] rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-3">
                          <Bookmark className="text-[#1D9E75] shrink-0" size={18} />
                          <p className="text-[9px] sm:text-xs text-gray-400 leading-snug">
                            Pílula sintetizada de meta-análises e ensaios controlados para aplicação imediata no consultório.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'quiz' && activePill.quiz_curiosidade && (
                      <motion.div key="qz" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4 sm:space-y-5">
                        <div className="bg-emerald-950/20 border border-emerald-800/40 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center gap-2">
                          <Award className="text-emerald-400 shrink-0 animate-bounce" size={18} />
                          <span className="text-[10px] sm:text-xs font-bold text-emerald-300">Quiz de Fixação Clínica</span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-white leading-relaxed">{activePill.quiz_curiosidade.pergunta}</h3>
                        <div className="space-y-2">
                          {activePill.quiz_curiosidade.alternativas.map((alt, i) => {
                            const isSelected = selectedAlternative === alt;
                            const isCorrect = alt === activePill.quiz_curiosidade?.resposta_correta;
                            let btnStyle = "bg-[#051813] hover:bg-[#071F19] border-[#123E32] text-gray-300";
                            if (quizAnswered) {
                              if (isCorrect) btnStyle = "bg-emerald-950/40 border-emerald-500 text-emerald-400";
                              else if (isSelected) btnStyle = "bg-rose-950/40 border-rose-500 text-rose-400";
                              else btnStyle = "bg-[#051813] border-[#123E32] text-gray-600 opacity-60";
                            }
                            return (
                              <button key={i} disabled={quizAnswered}
                                onClick={() => { setSelectedAlternative(alt); setQuizAnswered(true); }}
                                className={`w-full text-left p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border text-[10px] sm:text-xs font-medium transition-all flex items-center justify-between ${btnStyle}`}
                              >
                                <span>{alt}</span>
                                {quizAnswered && isCorrect && <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                        <AnimatePresence>
                          {quizAnswered && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#051813] border border-[#123E32] p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                              <h4 className="text-[10px] sm:text-xs font-bold text-white mb-1">Explicação:</h4>
                              <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed">{activePill.quiz_curiosidade.explicacao}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* ═══ ACERVO ═══ */}
            <div className="space-y-3 sm:space-y-4 pt-2 sm:pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-b border-[#123E32] pb-2 sm:pb-3">
                <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-1.5">
                  <ListFilter size={16} className="text-[#1D9E75]" />
                  Acervo de Pílulas
                </h2>
                <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)}
                      className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-wider px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border transition-all shrink-0 ${
                        selectedCategory === cat
                          ? 'bg-[#1D9E75] border-[#1D9E75] text-white'
                          : 'bg-[#030d0a] border-[#123E32] text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {filteredPills.length === 0 ? (
                  <div className="bg-[#030d0a] border border-[#123E32] p-6 sm:p-8 rounded-2xl sm:rounded-3xl text-center text-gray-500">
                    <Search size={28} className="mx-auto text-gray-700 mb-2" />
                    <p className="text-xs sm:text-sm">Nenhuma pílula nesta subárea no momento.</p>
                  </div>
                ) : (
                  filteredPills.map((pill, i) => (
                    <motion.div key={pill.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => selectPill(pill)}
                      className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 sm:gap-4 ${
                        activePill?.id === pill.id
                          ? 'bg-[#1D9E75]/10 border-[#1D9E75]/80 shadow-md'
                          : 'bg-[#030d0a] border-[#123E32]/80 hover:bg-[#071F19]'
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 flex-wrap">
                          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-[#051813] border border-[#123E32] text-gray-400 px-1.5 sm:px-2 py-0.5 rounded-md">
                            {pill.especialidade}
                          </span>
                          {pill.fonte === 'pubmed_real' && (
                            <span className="text-[7px] sm:text-[8px] font-bold text-emerald-500">PubMed✓</span>
                          )}
                          {readPills.includes(pill.id) && (
                            <span className="text-[8px] sm:text-[9px] font-bold uppercase text-emerald-400 flex items-center gap-0.5">
                              <CheckCircle2 size={9} /> Lido
                            </span>
                          )}
                          {favorites.includes(pill.id) && (
                            <Star size={9} className="text-amber-400 fill-amber-400" />
                          )}
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-gray-200 leading-snug line-clamp-2">{pill.tema}</h4>
                        {pill.revelacao_central && (
                          <p className="text-[9px] sm:text-[10px] text-emerald-500/70 mt-0.5 line-clamp-1 italic">💡 {pill.revelacao_central}</p>
                        )}
                      </div>
                      <ChevronRight size={16} className="text-gray-600 shrink-0" />
                    </motion.div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
