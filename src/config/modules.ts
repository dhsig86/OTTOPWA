import {
  Calculator,
  Syringe,
  Ear,
  Hospital,
  Microscope,
  FileBadge,
  SearchCode,
  FolderOpen,
  GraduationCap,
  MessageSquare,
  Newspaper,
  Mic2,
  Stethoscope,
  Volume2,
  Youtube,
  Scissors,
  Moon,
  MessageCircleQuestion, // For feedback
} from 'lucide-react';

export interface OttoModule {
  id: string
  name: string
  description: string
  icon: any
  url: string           // URL externa OU rota interna (/modules/video)
  external: boolean     // true = iframe, false = componente interno
  profiles: ('medico' | 'estudante' | 'paciente')[]
  premium: boolean
  status: 'live' | 'beta' | 'coming-soon'
  category: 'clinico' | 'educacao' | 'paciente' | 'gestao'
  tags?: string[]
}

export const OTTO_MODULES: OttoModule[] = [
  {
    id: 'calc-hub',
    name: 'OTTO Calc-Hub',
    description: '20 calculadoras clínicas validadas em ORL',
    icon: Calculator,
    url: 'https://otto-calc-hub.vercel.app',
    external: true,
    profiles: ['medico', 'estudante'],
    premium: false,
    status: 'live',
    category: 'clinico',
    tags: ['SNOT-22', 'TNM', 'NOSE', 'Lund-Mackay', 'THI']
  },
  {
    id: 'imune',
    name: 'OTTO Imune',
    description: 'Elegibilidade imunobiológicos RSCcPN',
    icon: Syringe,
    url: 'https://otto-imune.vercel.app',
    external: true,
    profiles: ['medico'],
    premium: true,
    status: 'live',
    category: 'clinico'
  },
  {
    id: 'atlas',
    name: 'OTTO Atlas',
    description: 'Atlas de otoscopia + predição IA',
    icon: Ear,
    url: 'https://otto-atlas.vercel.app',
    external: true,
    profiles: ['medico', 'estudante'],
    premium: false,
    status: 'live',
    category: 'clinico'
  },
  {
    id: 'triagem',
    name: 'OTTO Triagem',
    description: 'Triagem e suporte à decisão clínica (CDSS)',
    icon: Hospital,
    url: 'https://otto-triagem.vercel.app',
    external: true,
    profiles: ['medico'],
    premium: true,
    status: 'live',
    category: 'clinico'
  },
  {
    id: 'ocr',
    name: 'OTTO OCR',
    description: 'Interpretação de laudos médicos (serviço interno)',
    icon: Microscope,
    url: 'https://otto-ocr.herokuapp.com',
    external: true,
    profiles: ['medico'],
    premium: true,
    status: 'live',
    category: 'clinico'
  },
  {
    id: 'procod',
    name: 'OTTO ProCod',
    description: 'Relatório médico, CID e orçamento cirúrgico',
    icon: FileBadge,
    url: 'https://otto-procod.vercel.app',
    external: true,
    profiles: ['medico'],
    premium: false,
    status: 'live',
    category: 'gestao'
  },
  {
    id: 'cid-tuss',
    name: 'OTTO CID & TUSS',
    description: 'Codificação e faturamento médico',
    icon: SearchCode,
    url: 'https://otto-cid-tuss.vercel.app',
    external: true,
    profiles: ['medico'],
    premium: false,
    status: 'live',
    category: 'gestao'
  },
  {
    id: 'cases',
    name: 'OTTO Cases',
    description: 'Relatos de caso médico',
    icon: FolderOpen,
    url: 'https://otto-cases.vercel.app',
    external: true,
    profiles: ['medico', 'estudante'],
    premium: false,
    status: 'live',
    category: 'educacao'
  },
  {
    id: 'quiz',
    name: 'OTTO Quiz',
    description: 'Questões para concurso e fixação ORL',
    icon: GraduationCap,
    url: 'https://otto-quiz.vercel.app',
    external: true,
    profiles: ['medico', 'estudante'],
    premium: false,
    status: 'live',
    category: 'educacao'
  },
  {
    id: 'ottosig',
    name: 'OTTOSIG / BOTTOK',
    description: 'Glossário ORL + chat com literatura ORL',
    icon: MessageSquare,
    url: 'https://ottosig.vercel.app',
    external: true,
    profiles: ['medico', 'estudante'],
    premium: true,
    status: 'beta',
    category: 'educacao'
  },
  {
    id: 'news',
    name: 'OTTO News',
    description: 'Novidades científicas em ORL/CCP',
    icon: Newspaper,
    url: 'https://otto-news.vercel.app',
    external: true,
    profiles: ['medico', 'estudante'],
    premium: false,
    status: 'live',
    category: 'educacao'
  },
  {
    id: 'voice',
    name: 'OTTO Voice',
    description: 'Gerador de voz para reabilitação',
    icon: Mic2,
    url: 'https://dhsig86.github.io/OTTO-VOICE/',
    external: true,
    profiles: ['medico', 'paciente'],
    premium: false,
    status: 'live',
    category: 'paciente'
  },
  {
    id: 'periop',
    name: 'Peri-operatório',
    description: 'Protocolos e orientações cirúrgicas',
    icon: Stethoscope,
    url: '/modules/periop',
    external: false,
    profiles: ['medico', 'estudante', 'paciente'],
    premium: false,
    status: 'live',
    category: 'paciente'
  },
  {
    id: 'zumbido',
    name: 'Terapia de Zumbido',
    description: 'Sons terapêuticos para tratamento',
    icon: Volume2,
    url: '/modules/zumbido',
    external: false,
    profiles: ['medico', 'paciente'],
    premium: false,
    status: 'live',
    category: 'paciente'
  },
  {
    id: 'videos',
    name: 'Canais de Vídeo',
    description: 'Playlists curadas ORL/CCP no YouTube',
    icon: Youtube,
    url: '/modules/videos',
    external: false,
    profiles: ['medico', 'estudante', 'paciente'],
    premium: false,
    status: 'live',
    category: 'educacao'
  },
  // Feedback (Novo Requisito)
  {
    id: 'feedback',
    name: 'Feedback Beta',
    description: 'Ofereça sugestões e reporte bugs',
    icon: MessageCircleQuestion,
    url: '/modules/feedback',
    external: false,
    profiles: ['medico', 'estudante', 'paciente'],
    premium: false,
    status: 'live',
    category: 'gestao'
  },
  // Futuros
  {
    id: 'otto-op',
    name: 'OTTO OP',
    description: 'Guia prático de cirurgias ORL',
    icon: Scissors,
    url: '',
    external: false,
    profiles: ['medico', 'estudante', 'paciente'],
    premium: false,
    status: 'coming-soon',
    category: 'clinico'
  },
  {
    id: 'otto-zumb',
    name: 'OTTO Zumb',
    description: 'Tratamento de zumbido crônico',
    icon: Moon,
    url: '',
    external: false,
    profiles: ['medico', 'paciente'],
    premium: false,
    status: 'coming-soon',
    category: 'paciente'
  },
];
