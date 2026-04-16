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
  Star,
  ClipboardList
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

export interface OttoModule {
  id: string
  name: string
  description: string
  icon: LucideIcon
  url: string
  external: boolean
  profiles: ('medico' | 'estudante' | 'paciente')[]
  premium: boolean
  status: 'live' | 'beta' | 'coming-soon'
  category: 'clinico' | 'educacao_paciente'
  tags?: string[]
  localPath?: string
  iconBg?: string
  hasIA?: boolean
}

export const OTTO_MODULES: OttoModule[] = [
  // FERRAMENTAS CLÍNICAS (clinico)
  {
    id: 'atlas',
    name: 'Atlas',
    description: 'OtoAtlas IA',
    icon: Ear,
    url: 'https://atlas.drdariohart.com/',
    external: true,
    profiles: ['medico', 'estudante', 'paciente'],
    premium: false,
    status: 'live',
    category: 'clinico',
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
    iconBg: 'bg-[#E6EDFB] text-[#4068B2]'
  },
  {
    id: 'otoscopia',
    name: 'Otoscop.IA',
    description: 'Diagnóstico',
    icon: Hospital,
    url: 'https://otoscopia.drdariohart.com/',
    external: true,
    profiles: ['medico'],
    premium: true,
    status: 'live',
    category: 'clinico',
    iconBg: 'bg-[#E5F5FA] text-[#2C95B5]',
    hasIA: true
  },
  {
    id: 'triagem',
    name: 'Triagem OS',
    description: 'Protocolo de admissão clínica (Requer HTTPS)',
    url: 'http://triagem.otosig.com/',
    icon: ClipboardList,
    external: true,
    profiles: ['medico'],
    premium: true,
    status: 'coming-soon',
    category: 'clinico',
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
    profiles: ['medico', 'estudante'],
    premium: false,
    status: 'live',
    category: 'clinico',
    iconBg: 'bg-[#FEF1E2] text-[#E08A27]'
  },
  {
    id: 'imune',
    name: 'Imunobio.',
    description: 'Portal completo',
    icon: Syringe,
    url: 'https://otto-imune.vercel.app/',
    external: true,
    profiles: ['medico', 'estudante'],
    premium: true,
    status: 'live',
    category: 'clinico',
    iconBg: 'bg-[#EEF1FB] text-[#4B68D8]'
  },
  {
    id: 'periop',
    name: 'Peri-op.',
    description: 'Protocolos',
    icon: Activity,
    url: '/modules/periop',
    external: false,
    profiles: ['medico', 'estudante', 'paciente'],
    premium: false,
    status: 'live',
    category: 'clinico',
    iconBg: 'bg-[#FBEBF3] text-[#D84989]'
  },

  // EDUCAÇÃO E PACIENTES (educacao_paciente)
  {
    id: 'quiz',
    name: 'OTTO Quiz',
    description: 'Simulados',
    icon: GraduationCap,
    url: '/modules/quiz',
    external: false,
    profiles: ['medico', 'estudante'],
    premium: true,
    status: 'coming-soon',
    category: 'educacao_paciente',
    iconBg: 'bg-[#EDF1FC] text-[#34446C]'
  },
  {
    id: 'zumbido',
    name: 'Zumbido',
    description: 'Terapia sonora',
    icon: Volume2,
    url: '/modules/zumbido',
    external: false,
    profiles: ['medico', 'paciente', 'estudante'],
    premium: false,
    status: 'live',
    category: 'educacao_paciente',
    iconBg: 'bg-[#E1F7EE] text-[#1D9E75]'
  },
  {
    id: 'videos',
    name: 'Vídeos',
    description: 'Canal ORL',
    icon: PlaySquare,
    url: '/modules/videos',
    external: false,
    profiles: ['medico', 'estudante', 'paciente'],
    premium: false,
    status: 'live',
    category: 'educacao_paciente',
    iconBg: 'bg-[#F2EFFC] text-[#6A47C9]'
  },
  {
    id: 'voice',
    name: 'Voz',
    description: 'Gerador IA',
    icon: Mic2,
    url: 'https://otto-voice-one.vercel.app/',
    external: true,
    profiles: ['medico', 'estudante', 'paciente'],
    premium: false,
    status: 'live',
    category: 'educacao_paciente',
    iconBg: 'bg-[#FCF5E3] text-[#553018]',
    hasIA: true
  },
  {
    id: 'cases',
    name: 'OTTO Cases',
    description: 'Relatos de Caso',
    icon: FolderOpen,
    url: 'https://cases.drdariohart.com/',
    external: true,
    profiles: ['medico', 'estudante'],
    premium: false,
    status: 'live',
    category: 'clinico',
    iconBg: 'bg-[#EEEDFC] text-[#5649B4]'
  },
  {
    id: 'info',
    name: 'Informações',
    description: 'Artigos',
    icon: FolderOpen,
    url: '/modules/info',
    external: false,
    profiles: ['medico', 'estudante', 'paciente'],
    premium: false,
    status: 'coming-soon',
    category: 'educacao_paciente',
    iconBg: 'bg-[#EEEDFC] text-[#5649B4]'
  },
  {
    id: 'premium_access',
    name: 'Premium',
    description: 'Acesso total',
    icon: Star,
    url: '/modules/premium',
    external: false,
    profiles: ['medico', 'estudante', 'paciente'],
    premium: false,
    status: 'coming-soon',
    category: 'educacao_paciente',
    iconBg: 'bg-[#FDF6DE] text-[#EF9F27]'
  },
  {
    id: 'ottosig',
    name: 'Glossário',
    description: 'BOTTOK Chat',
    icon: MessageSquare,
    url: 'https://dhsig86.github.io/minidic/',
    external: true,
    profiles: ['medico', 'estudante'],
    premium: true,
    status: 'live',
    category: 'educacao_paciente',
    iconBg: 'bg-[#E1F7EE] text-[#1D9E75]'
  }
];
