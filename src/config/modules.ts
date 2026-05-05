import {
  Calculator,
  Syringe,
  Ear,
  Hospital,
  FileBadge,
  FolderOpen,
  GraduationCap,
  MessageSquare,
  Mic2,
  Volume2,
  PlaySquare,
  Activity,
  ClipboardList,
  Brain,

  MessageCircleQuestion,
  ScanText,
  BookOpen
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

export interface OttoModule {
  id: string
  name: string
  description: string
  icon: LucideIcon
  url: string
  external: boolean
  profiles: ('medico' | 'estudante' | 'profissional' | 'paciente')[]
  premium: boolean
  status: 'live' | 'beta' | 'coming-soon'
  category: 'clinico' | 'educacao_paciente'
  tags?: string[]
  localPath?: string
  iconBg?: string
  hasIA?: boolean
  iframeBlocked?: boolean
}

export const OTTO_MODULES: OttoModule[] = [
  // FERRAMENTAS CLÍNICAS (clinico)
  {
    id: 'bottok',
    name: 'BOTTOK',
    description: 'OtoConsult IA',
    icon: Brain,
    url: 'https://bottok-orcin.vercel.app/',
    external: true,
    profiles: ['medico', 'estudante', 'profissional'],
    premium: true,
    status: 'live',
    category: 'clinico',
    tags: ['ia', 'consulta', 'chat', 'gpt', 'otorrino', 'clinico'],
    iconBg: 'bg-[#E1F7EE] text-[#1D9E75]',
    hasIA: true
  },
  {
    id: 'atlas',
    name: 'Atlas',
    description: 'OtoAtlas IA',
    icon: Ear,
    url: 'https://atlas.drdariohart.com/',
    external: true,
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    premium: false,
    status: 'live',
    category: 'clinico',
    tags: ['imagem', 'foto', 'otoscopia', 'atlas', 'visual', 'diagnostico', 'ml'],
    iconBg: 'bg-[#E1F7EE] text-[#1D9E75]',
    hasIA: true
  },
  {
    id: 'procod',
    name: 'CID & TUSS',
    description: 'Codificação',
    icon: FileBadge,
    url: 'https://procod.drdariohart.com/',
    external: true,
    profiles: ['medico', 'estudante'],
    premium: false,
    status: 'live',
    category: 'clinico',
    tags: ['cid', 'tuss', 'codificacao', 'faturamento', 'cbhpm', 'procedimento'],
    iconBg: 'bg-[#E6EDFB] text-[#4068B2]'
  },
  {
    id: 'otoscopia',
    name: 'Otoscop.IA',
    description: 'Diagnóstico',
    icon: Hospital,
    url: 'https://atlas.drdariohart.com/?tab=ia&embed=true',
    external: true,
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    premium: true,
    status: 'live',
    category: 'clinico',
    tags: ['ia', 'diagnostico', 'imagem', 'ouvido', 'otoscop', 'ml', 'classificacao'],
    iconBg: 'bg-[#E5F5FA] text-[#2C95B5]',
    hasIA: true
  },
  {
    id: 'triagem',
    name: 'Triagem OS',
    description: 'Protocolo de admissão clínica',
    url: 'https://otto-ai-triagem-1fc48c3c292e.herokuapp.com/',
    icon: ClipboardList,
    external: true,
    iframeBlocked: true,
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    premium: false,
    status: 'live',
    category: 'clinico',
    tags: ['triagem', 'admissao', 'protocolo', 'ia', 'anamnese', 'cdss'],
    iconBg: 'bg-[#FAEEDA] text-[#D58C20]',
    hasIA: true
  },
  {
    id: 'calc',
    name: 'Calculadoras',
    description: '8 ferramentas',
    icon: Calculator,
    url: 'https://otto-calc-hub.vercel.app/',
    external: true,
    profiles: ['medico', 'estudante', 'profissional'],
    premium: false,
    status: 'live',
    category: 'clinico',
    tags: ['calcula', 'score', 'snot', 'tnm', 'nose', 'epworth', 'stop-bang', 'vhi', 'eat', 'dhi', 'thi', 'dose'],
    iconBg: 'bg-[#FEF1E2] text-[#E08A27]'
  },
  {
    id: 'imune',
    name: 'Imunobio.',
    description: 'Portal completo',
    icon: Syringe,
    url: 'https://otto-imune.vercel.app/',
    external: true,
    profiles: ['medico', 'estudante', 'profissional'],
    premium: true,
    status: 'live',
    category: 'clinico',
    tags: ['imunobiologico', 'biologico', 'dupilumabe', 'mepolizumabe', 'polipose', 'elegibilidade', 'lme'],
    iconBg: 'bg-[#EEF1FB] text-[#4B68D8]'
  },
  {
    id: 'ocr',
    name: 'OTTO OCR',
    description: 'Extrator de Laudos',
    icon: ScanText,
    url: 'https://otto-ocr-web.vercel.app',
    external: true,
    profiles: ['medico', 'estudante'],
    premium: true,
    status: 'live',
    category: 'clinico',
    tags: ['ocr', 'laudo', 'extrator', 'pdf', 'texto', 'imagem', 'relatorio'],
    iconBg: 'bg-[#CDF0E3] text-[#0A865F]',
    hasIA: true
  },
  {
    id: 'logbook',
    name: 'OTTO Log',
    description: 'Logbook Cirúrgico',
    icon: BookOpen,
    url: 'https://otto-log.vercel.app/',
    external: true,
    profiles: ['medico', 'estudante'],
    premium: false,
    status: 'live',
    category: 'clinico',
    tags: ['logbook', 'cirurgia', 'registro', 'casuistica', 'procedimento', 'orl'],
    iconBg: 'bg-[#D1FAE5] text-[#065F46]',
  },
  {
    id: 'periop',
    name: 'Peri-op.',
    description: 'Protocolos',
    icon: Activity,
    url: '/modules/periop',
    external: false,
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    premium: false,
    status: 'live',
    category: 'clinico',
    tags: ['cirurgia', 'preoperatorio', 'posoperatorio', 'jejum', 'medicacao', 'protocolo', 'orientacao'],
    iconBg: 'bg-[#FBEBF3] text-[#D84989]'
  },

  // EDUCAÇÃO E PACIENTES (educacao_paciente)
  {
    id: 'ottotests',
    name: 'OTTO Acadêmico',
    description: 'Simulados & Provas',
    icon: GraduationCap,
    url: 'https://test-pg-bice.vercel.app/',
    external: true,
    profiles: ['medico', 'estudante', 'profissional'],
    premium: true,
    status: 'live',
    category: 'educacao_paciente',
    tags: ['quiz', 'questoes', 'simulado', 'prova', 'residencia', 'estudo', 'concurso', 'teste', 'avaliacao', 'academico'],
    iconBg: 'bg-[#EDF1FC] text-[#34446C]'
  },
  {
    id: 'zumbido',
    name: 'Zumbido',
    description: 'Terapia sonora',
    icon: Volume2,
    url: '/modules/zumbido',
    external: false,
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    premium: false,
    status: 'live',
    category: 'educacao_paciente',
    tags: ['zumbido', 'tinnitus', 'som', 'ruido', 'terapia', 'reabilitacao', 'branco'],
    iconBg: 'bg-[#E1F7EE] text-[#1D9E75]'
  },
  {
    id: 'videos',
    name: 'Vídeos',
    description: 'Canal ORL',
    icon: PlaySquare,
    url: '/modules/videos',
    external: false,
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    premium: false,
    status: 'live',
    category: 'educacao_paciente',
    tags: ['video', 'youtube', 'aula', 'canal', 'educacao', 'anatomia'],
    iconBg: 'bg-[#F2EFFC] text-[#6A47C9]'
  },
  {
    id: 'voice',
    name: 'Voz',
    description: 'Gerador IA',
    icon: Mic2,
    url: 'https://otto-voice-one.vercel.app/',
    external: true,
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    premium: false,
    status: 'live',
    category: 'educacao_paciente',
    tags: ['voz', 'laringectomia', 'emocao', 'audio', 'gerador'],
    iconBg: 'bg-[#FCF5E3] text-[#553018]',
    hasIA: true
  },
  {
    id: 'cases',
    name: 'OTTO Cases',
    description: 'Relatos de Caso',
    icon: FolderOpen,
    url: 'https://otto-cases.vercel.app/',
    external: true,
    profiles: ['medico', 'estudante'],
    premium: false,
    status: 'live',
    category: 'clinico',
    tags: ['caso', 'relato', 'clinico', 'apresentacao', 'publicacao'],
    iconBg: 'bg-[#EEEDFC] text-[#5649B4]'
  },
  {
    id: 'info',
    name: 'Informações',
    description: 'Artigos',
    icon: FolderOpen,
    url: '/modules/info',
    external: false,
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    premium: false,
    status: 'beta',
    category: 'educacao_paciente',
    tags: ['artigo', 'informacao', 'texto', 'leitura', 'estudo'],
    iconBg: 'bg-[#EEEDFC] text-[#5649B4]'
  },
  // Premium desativado para MVP — reativar quando gateway de pagamento estiver pronto
  // { id: 'premium_access', name: 'Premium', ... }
  {
    id: 'ottosig',
    name: 'OTTO DIC',
    description: 'Mini glossário',
    icon: MessageSquare,
    url: 'https://dhsig86.github.io/minidic/',
    external: true,
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    premium: false,
    status: 'live',
    category: 'educacao_paciente',
    tags: ['glossario', 'dicionario', 'termos', 'definicao', 'vocabulario'],
    iconBg: 'bg-[#E1F7EE] text-[#1D9E75]',
    iframeBlocked: true
  },
  {
    id: 'whisper',
    name: 'OTTO Whisper',
    description: 'Escrivão Médico IA',
    icon: Mic2,
    url: 'https://otto-whisper.netlify.app',
    external: true,
    profiles: ['medico'],
    premium: true,
    status: 'beta',
    category: 'clinico',
    tags: ['transcricao', 'ditado', 'consulta', 'prontuario', 'ia', 'voz', 'audio'],
    iconBg: 'bg-[#FDE8E8] text-[#C53030]',
    hasIA: true
  },
  {
    id: 'feedback',
    name: 'Feedback',
    description: 'Reporte bugs e sugestões',
    icon: MessageCircleQuestion,
    url: '/modules/feedback',
    external: false,
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    premium: false,
    status: 'live',
    category: 'educacao_paciente',
    tags: ['feedback', 'suporte', 'ajuda', 'bug', 'sugestao', 'contato'],
    iconBg: 'bg-[#FAEEDA] text-[#D58C20]'
  }
];
