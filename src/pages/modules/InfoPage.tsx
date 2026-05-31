import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
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
  BarChart3
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
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">{data.titulo}</p>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
          <circle
            cx="50" cy="50" r={r} fill="none"
            stroke="#10b981" strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
            className="transition-all duration-1000"
          />
          <text x="50" y="46" textAnchor="middle" fill="#111827" fontSize="18" fontWeight="800">{valor}</text>
          <text x="50" y="60" textAnchor="middle" fill="#6b7280" fontSize="10">{data.dados[0]?.unidade || '%'}</text>
        </svg>
        <p className="text-[10px] text-gray-400 text-center">{data.dados[0]?.label}</p>
      </div>
    );
  }

  if (data.tipo === 'comparacao') {
    const maxVal = Math.max(...data.dados.map(d => d.valor), 1);
    return (
      <div className="space-y-2 py-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{data.titulo}</p>
        {data.dados.map((d, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-500 truncate max-w-[60%]">{d.label}</span>
              <span className="font-bold text-gray-900">{d.valor}{d.unidade || '%'}</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
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
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{data.titulo}</p>
        <div className="flex items-end justify-between gap-1 h-16 px-1">
          {data.dados.map((d, i) => {
            const maxVal = Math.max(...data.dados.map(x => x.valor), 1);
            const pct = (d.valor / maxVal) * 100;
            return (
              <div key={i} className="flex flex-col items-center flex-1 gap-1">
                <span className="text-[10px] font-bold text-gray-900">{d.valor}{d.unidade || ''}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(pct, 8)}%` }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="w-full max-w-[24px] rounded-t"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-[8px] text-gray-400 text-center leading-tight">{d.label}</span>
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

  // Mapa de cores por especialidade para accent visual nas pílulas
  const SPECIALTY_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    'Rinologia': { bg: 'bg-sky-50', border: 'border-l-sky-500', text: 'text-sky-700', dot: 'bg-sky-500' },
    'Otologia': { bg: 'bg-violet-50', border: 'border-l-violet-500', text: 'text-violet-700', dot: 'bg-violet-500' },
    'Laringologia': { bg: 'bg-amber-50', border: 'border-l-amber-500', text: 'text-amber-700', dot: 'bg-amber-500' },
    'Cabeça e Pescoço': { bg: 'bg-rose-50', border: 'border-l-rose-500', text: 'text-rose-700', dot: 'bg-rose-500' },
    'Pediatria ORL': { bg: 'bg-teal-50', border: 'border-l-teal-500', text: 'text-teal-700', dot: 'bg-teal-500' },
    'Sono': { bg: 'bg-indigo-50', border: 'border-l-indigo-500', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  };
  const getSpecColor = (spec: string) => SPECIALTY_COLORS[spec] || { bg: 'bg-gray-50', border: 'border-l-emerald-500', text: 'text-emerald-700', dot: 'bg-emerald-500' };

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
      <div className="min-h-[60vh] bg-gray-50 flex flex-col items-center justify-center p-6 text-center text-gray-800">
        <h2 className="text-xl font-bold mb-2 text-emerald-600">Acesso Restrito</h2>
        <p className="text-sm text-gray-500 max-w-sm mb-6">
          Este módulo contém informações científicas voltadas exclusivamente a médicos e profissionais de saúde.
        </p>
        <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-[#1D9E75] hover:bg-[#0A865F] text-white rounded-full font-semibold transition-colors shadow-lg">
          Voltar para o Início
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-gray-800 selection:bg-[#1D9E75] selection:text-white">
      {/* Page Title */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h1 className="text-lg font-extrabold text-gray-800 flex items-center gap-2">
          <Sparkles size={18} className="text-[#1D9E75]" />
          OTTO Update
        </h1>
        <button
          onClick={() => fetchData(true)}
          disabled={isRefreshing}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 disabled:opacity-50"
          title="Atualizar pílulas"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-gray-500">Analisando literatura científica...</span>
        </div>
      ) : (
        <div id="otto-update-scrollable-content" className="flex-1 overflow-y-auto p-3 sm:p-4 pb-24">
          <div className="max-w-4xl mx-auto w-full space-y-4 sm:space-y-6">

            {/* Mock Data Banner */}
            {isMockData && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 border border-amber-200 rounded-2xl p-3 sm:p-4 flex items-start gap-3"
              >
                <Zap size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-700 mb-0.5">Modo Demonstração</p>
                  <p className="text-[10px] sm:text-xs text-amber-600">
                    Exibindo pílulas de exemplo. Execute o script <code className="bg-amber-100 px-1 rounded text-amber-700">generate-pills.mjs</code> para buscar artigos reais do PubMed.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ═══ DASHBOARD ═══ */}
            <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                    <BarChart3 size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-gray-900">Seu Progresso</h2>
                    <p className="text-[10px] text-gray-400">Level {Math.max(1, Math.floor(totalLidos / 3))} · Atualizado {lastUpdate}</p>
                  </div>
                </div>
                {realPills > 0 && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg flex items-center gap-1">
                    <TrendingUp size={10} />
                    {realPills} PubMed
                  </span>
                )}
              </div>

              {/* Stats Row — compact horizontal */}
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center py-2">
                  <span className="text-2xl font-black text-emerald-600 block">{totalLidos}</span>
                  <span className="text-[10px] text-gray-400 font-medium">Lidas</span>
                </div>
                <div className="text-center py-2">
                  <span className="text-2xl font-black text-gray-800 block">{totalPills}</span>
                  <span className="text-[10px] text-gray-400 font-medium">Acervo</span>
                </div>
                <div className="text-center py-2">
                  <span className="text-2xl font-black text-cyan-600 block">{specialtiesCovered}</span>
                  <span className="text-[10px] text-gray-400 font-medium">Áreas</span>
                </div>
                <div className="text-center py-2">
                  <span className="text-2xl font-black text-amber-500 block">{favorites.length}</span>
                  <span className="text-[10px] text-gray-400 font-medium">Favoritos</span>
                </div>
              </div>
            </div>

            {/* ═══ HERO CARD — Revelação Central ═══ */}
            {activePill && (
              <motion.div
                key={activePill.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl"
              >
                {/* Revelação Central Hero */}
                {activePill.revelacao_central && (
                  <div className="bg-gradient-to-r from-emerald-50 via-white to-teal-50 border-b border-gray-200 p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
                        <Zap size={16} className="text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Revelação Central</p>
                        <p className="text-sm sm:text-base font-extrabold text-gray-900 leading-snug">
                          {activePill.revelacao_central}
                        </p>
                      </div>
                    </div>
                    {/* Insight Chart */}
                    {activePill.insight_grafico && (
                      <div className="mt-3 bg-gray-100 border border-gray-100 rounded-xl p-3">
                        <InsightChart data={activePill.insight_grafico} />
                      </div>
                    )}
                  </div>
                )}

                {/* Pill Header */}
                <div className="p-4 sm:p-6 bg-gradient-to-b from-emerald-50/50 via-white to-white border-b border-gray-200">
                  <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider bg-emerald-100 border border-emerald-300 text-emerald-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                        {activePill.especialidade}
                      </span>
                      <span className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1">
                        <Calendar size={10} />
                        {activePill.data_exibicao}
                      </span>
                      {activePill.fonte === 'pubmed_real' && (
                        <span className="text-[8px] sm:text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          PubMed ✓
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => toggleFavorite(activePill.id)}
                        className={`p-1.5 sm:p-2 rounded-full border transition-all ${
                          favorites.includes(activePill.id)
                            ? 'bg-amber-50 border-amber-300 text-amber-600'
                            : 'bg-gray-100 border-gray-200 text-gray-400 hover:text-gray-900'
                        }`}
                      >
                        <Star size={15} fill={favorites.includes(activePill.id) ? "currentColor" : "none"} />
                      </button>
                      <button 
                        onClick={() => toggleRead(activePill.id)}
                        className={`p-1.5 sm:p-2 rounded-full border transition-all ${
                          readPills.includes(activePill.id)
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                            : 'bg-gray-100 border-gray-200 text-gray-400 hover:text-gray-900'
                        }`}
                        title={readPills.includes(activePill.id) ? "Lido" : "Marcar como lido"}
                      >
                        <CheckCircle2 size={15} />
                      </button>
                    </div>
                  </div>
                  
                  <h1 className="text-base sm:text-xl font-extrabold text-gray-900 leading-snug">{activePill.tema}</h1>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1.5 sm:mt-2 flex items-center gap-1.5">
                    <BookOpen size={12} className="text-[#1D9E75]" />
                    Leitura: <strong className="text-gray-700">{activePill.tempo_leitura_min} min</strong>
                    {activePill.artigos.length > 0 && (
                      <span className="ml-2">· {activePill.artigos.length} artigos</span>
                    )}
                  </p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-white px-2 sm:px-4">
                  <button
                    onClick={() => setActiveTab('evidencia')}
                    className={`flex-1 py-2.5 sm:py-3 text-center text-[10px] sm:text-xs font-bold border-b-2 transition-all ${
                      activeTab === 'evidencia' ? 'border-[#1D9E75] text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-800'
                    }`}
                  >
                    Evidências
                  </button>
                  <button
                    onClick={() => setActiveTab('pratica')}
                    className={`flex-1 py-2.5 sm:py-3 text-center text-[10px] sm:text-xs font-bold border-b-2 transition-all ${
                      activeTab === 'pratica' ? 'border-emerald-500 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-800'
                    }`}
                  >
                    Pílula Prática
                  </button>
                  {activePill.quiz_curiosidade && (
                    <button
                      onClick={() => setActiveTab('quiz')}
                      className={`flex-1 py-2.5 sm:py-3 text-center text-[10px] sm:text-xs font-bold border-b-2 transition-all ${
                        activeTab === 'quiz' ? 'border-teal-400 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-800'
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
                          <h3 className="text-[10px] sm:text-xs font-black uppercase text-emerald-700 tracking-wider mb-2">Consenso e Integração Científica</h3>
                          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-gray-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200">
                            {activePill.consenso_cientifico}
                          </p>
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                          <h3 className="text-[10px] sm:text-xs font-black uppercase text-gray-500 tracking-wider">Artigos Analisados</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            {activePill.artigos.map((art, idx) => (
                              <div key={idx} className="bg-gray-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 flex flex-col justify-between hover:border-[#1D9E75]/50 transition-colors">
                                <div>
                                  <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-2">
                                    <span className="text-[8px] sm:text-[10px] font-bold text-gray-400 bg-gray-100 border border-gray-200 px-1.5 sm:px-2 py-0.5 rounded-md">Estudo {idx + 1}</span>
                                    <span className="text-[10px] sm:text-xs font-semibold text-emerald-600 truncate ml-1">{art.revista} · {art.ano}</span>
                                  </div>
                                  <h4 className="text-[10px] sm:text-xs font-bold text-gray-900 leading-snug line-clamp-3 mb-1.5 sm:mb-2">{art.titulo}</h4>
                                  <p className="text-[10px] sm:text-[10px] text-gray-400 italic mb-2 sm:mb-3">Autores: {art.autores}</p>
                                </div>
                                <a href={art.link} target="_blank" rel="noopener noreferrer"
                                  className="text-[10px] sm:text-[10px] text-[#1D9E75] hover:text-emerald-600 font-bold flex items-center gap-1 self-start group">
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
                        <h3 className="text-[10px] sm:text-xs font-black uppercase text-emerald-600 tracking-wider">Takeaway Clínico (Conduta do Otorrino)</h3>
                        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 sm:p-5 rounded-r-xl sm:rounded-r-2xl space-y-3">
                          <p className="text-gray-700 text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-line">
                            {activePill.pratica_clinica}
                          </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-3">
                          <Bookmark className="text-[#1D9E75] shrink-0" size={18} />
                          <p className="text-[10px] sm:text-xs text-gray-500 leading-snug">
                            Pílula sintetizada de meta-análises e ensaios controlados para aplicação imediata no consultório.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'quiz' && activePill.quiz_curiosidade && (
                      <motion.div key="qz" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4 sm:space-y-5">
                        <div className="bg-emerald-50 border border-emerald-200 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center gap-2">
                          <Award className="text-emerald-600 shrink-0 animate-bounce" size={18} />
                          <span className="text-[10px] sm:text-xs font-bold text-emerald-600">Quiz de Fixação Clínica</span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-relaxed">{activePill.quiz_curiosidade.pergunta}</h3>
                        <div className="space-y-2">
                          {activePill.quiz_curiosidade.alternativas.map((alt, i) => {
                            const isSelected = selectedAlternative === alt;
                            const isCorrect = alt === activePill.quiz_curiosidade?.resposta_correta;
                            let btnStyle = "bg-gray-50 hover:bg-gray-50 border-gray-200 text-gray-600";
                            if (quizAnswered) {
                              if (isCorrect) btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-600";
                              else if (isSelected) btnStyle = "bg-rose-50 border-rose-400 text-rose-600";
                              else btnStyle = "bg-gray-50 border-gray-200 text-gray-400 opacity-60";
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
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-50 border border-gray-200 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                              <h4 className="text-[10px] sm:text-xs font-bold text-gray-900 mb-1">Explicação:</h4>
                              <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed">{activePill.quiz_curiosidade.explicacao}</p>
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
            <div className="space-y-3 pt-2">
              {/* Section header + filters */}
              <div className="space-y-3">
                <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                  <ListFilter size={16} className="text-[#1D9E75]" />
                  Acervo de Pílulas
                  <span className="text-[10px] font-medium text-gray-400 ml-1">({filteredPills.length})</span>
                </h2>
                {/* Category pills — horizontal scroll with fade edges */}
                <div className="relative">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
                    {categories.map(cat => {
                      const specColor = getSpecColor(cat);
                      const isActive = selectedCategory === cat;
                      return (
                        <button key={cat} onClick={() => setSelectedCategory(cat)}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all shrink-0 ${
                            isActive
                              ? cat === 'Todas' || cat === 'Favoritos'
                                ? 'bg-gray-900 border-gray-900 text-white'
                                : `${specColor.bg} ${specColor.text} border-current`
                              : 'bg-white border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {cat === 'Favoritos' ? '⭐ Favoritos' : cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Pill list */}
              <div className="space-y-2">
                {filteredPills.length === 0 ? (
                  <div className="bg-white border border-gray-200 p-8 rounded-2xl text-center">
                    <Search size={28} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-xs text-gray-400">Nenhuma pílula nesta subárea.</p>
                  </div>
                ) : (
                  filteredPills.map((pill, i) => {
                    const sc = getSpecColor(pill.especialidade);
                    const isActive = activePill?.id === pill.id;
                    const isRead = readPills.includes(pill.id);
                    const isFav = favorites.includes(pill.id);
                    return (
                      <motion.div key={pill.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => selectPill(pill)}
                        className={`group rounded-xl border-l-[3px] border border-gray-200 cursor-pointer transition-all overflow-hidden ${
                          isActive
                            ? `${sc.border} bg-white shadow-md ring-1 ring-gray-200`
                            : `${sc.border} bg-white hover:shadow-sm`
                        } ${isRead ? 'opacity-75' : ''}`}
                      >
                        <div className="flex items-center gap-3 p-3 sm:p-4">
                          {/* Specialty dot */}
                          <div className="flex flex-col items-center gap-1 shrink-0">
                            <div className={`w-2.5 h-2.5 rounded-full ${sc.dot}`} />
                            {isRead && <CheckCircle2 size={10} className="text-emerald-500" />}
                          </div>
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className={`text-[10px] font-bold ${sc.text}`}>{pill.especialidade}</span>
                              {pill.fonte === 'pubmed_real' && (
                                <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">PubMed</span>
                              )}
                              {isFav && <Star size={10} className="text-amber-500 fill-amber-500" />}
                              <span className="text-[10px] text-gray-300 ml-auto shrink-0">{pill.data_exibicao}</span>
                            </div>
                            <h4 className="font-bold text-[13px] text-gray-800 leading-snug line-clamp-2">{pill.tema}</h4>
                            {pill.revelacao_central && (
                              <p className="text-[10px] text-gray-500 mt-1 line-clamp-1 flex items-center gap-1">
                                <Zap size={10} className="text-amber-500 shrink-0" />
                                {pill.revelacao_central}
                              </p>
                            )}
                          </div>
                          {/* Arrow */}
                          <ChevronRight size={16} className={`shrink-0 transition-colors ${
                            isActive ? 'text-emerald-600' : 'text-gray-300 group-hover:text-gray-500'
                          }`} />
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
