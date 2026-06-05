import {
  Calculator,
  Syringe,
  Brain,
  ClipboardList,
  ScanText,
  Activity,
  GraduationCap,
  MessageCircleQuestion,
  ScanSearch,
  Tags,
  Aperture,
  Wind,
  ClipboardSignature,
  AudioWaveform,
  MonitorPlay,
  AudioLines,
  FolderHeart,
  Library,
  BookA,
  PenLine,
  FileSignature,
  FilePen,
  Ear,
  Gamepad2
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
  category: 'clinico' | 'academia' | 'publico'
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
    description: 'Tire dúvidas ORL com IA',
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
    description: 'Imagens clínicas + ML',
    icon: ScanSearch,
    url: 'https://atlas.drdariohart.com/',
    external: true,
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    premium: false,
    status: 'live',
    category: 'publico',
    tags: ['imagem', 'foto', 'otoscopia', 'atlas', 'visual', 'diagnostico', 'ml'],
    iconBg: 'bg-[#E1F7EE] text-[#1D9E75]',
    hasIA: true
  },
  {
    id: 'procod',
    name: 'CID & TUSS',
    description: 'CID + TUSS + OPME rápido',
    icon: Tags,
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
    description: 'Classifique otoscopias',
    icon: Aperture,
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
    description: 'Anamnese guiada por IA',
    url: 'https://otto-ai-triagem-1fc48c3c292e.herokuapp.com/',
    icon: ClipboardList,
    external: true,
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    premium: false,
    status: 'live',
    category: 'clinico',
    tags: ['triagem', 'admissao', 'protocolo', 'ia', 'anamnese', 'cdss'],
    iconBg: 'bg-[#FAEEDA] text-[#D58C20]',
    hasIA: true
  },
  {
    id: 'check',
    name: 'OTTO Check',
    description: 'Teste auditivo domiciliar',
    url: 'https://otto-check.vercel.app/',
    icon: Ear,
    external: true,
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    premium: false,
    status: 'beta',
    category: 'clinico',
    tags: ['triagem', 'audiometria', 'zumbido', 'tinnitus', 'teste', 'audicao', 'som'],
    iconBg: 'bg-[#E1F7EE] text-[#1D9E75]'
  },


  {
    id: 'calc',
    name: 'Calculadoras',
    description: '29 PROMs e escores',
    icon: Calculator,
    url: 'https://otto-calc-hub.vercel.app/',
    external: true,
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    premium: false,
    status: 'live',
    category: 'clinico',
    tags: ['calcula', 'score', 'snot', 'tnm', 'nose', 'epworth', 'stop-bang', 'vhi', 'eat', 'dhi', 'thi', 'dose'],
    iconBg: 'bg-[#FEF1E2] text-[#E08A27]'
  },
  {
    id: 'imune',
    name: 'Imunobio.',
    description: 'Elegibilidade Dupilumabe',
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
    description: 'Extraia dados de PDFs',
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
    id: 'aerodig',
    name: 'Aerodigestive',
    description: 'Protocolos via aérea',
    icon: Wind,
    url: 'https://otto-aerodig.vercel.app/',
    external: true,
    profiles: ['medico', 'estudante', 'profissional'],
    premium: false,
    status: 'beta',
    category: 'clinico',
    tags: ['aerodigestivo', 'via-aerea', 'pediatrico', 'laringe', 'traqueia', 'esofago', 'deglutic', 'fees', 'vfss', 'monnier', 'rutter', 'subglotica', 'fenda', 'laringomalacia', 'eoe', 'traqueostomia', 'canula', 'shiley', 'bivona', 'biesalski', 'jackson'],
    iconBg: 'bg-[#EFF6FB] text-[#0E7AB8]'
  },
  {
    id: 'logbook',
    name: 'OTTO Log',
    description: 'Registre suas cirurgias',
    icon: ClipboardSignature,
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
    description: 'Pré e pós-operatório',
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
    id: 'games',
    name: 'OTTO Games',
    description: 'Jogos para crianças',
    icon: Gamepad2,
    url: 'https://otto-games.vercel.app/',
    external: true,
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    premium: false,
    status: 'live',
    category: 'publico',
    tags: ['jogo', 'game', 'crianca', 'pediatria', 'pos-operatorio', 'amigdala', 'divertido'],
    iconBg: 'bg-[#E1F7FC] text-[#0284C7]'
  },
  {
    id: 'ottotests',
    name: 'OTTO Acadêmico',
    description: 'Simulados e provas',
    icon: GraduationCap,
    url: 'https://test-pg-bice.vercel.app/',
    external: true,
    profiles: ['medico', 'estudante', 'profissional'],
    premium: true,
    status: 'live',
    category: 'academia',
    tags: ['quiz', 'questoes', 'simulado', 'prova', 'residencia', 'estudo', 'concurso', 'teste', 'avaliacao', 'academico'],
    iconBg: 'bg-[#EDF1FC] text-[#34446C]'
  },
  {
    id: 'zumbido',
    name: 'Zumbido',
    description: 'Terapia para zumbido',
    icon: AudioWaveform,
    url: 'https://otto-check.vercel.app/?tool=zumbido',
    external: true,
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    premium: false,
    status: 'live',
    category: 'publico',
    tags: ['zumbido', 'tinnitus', 'som', 'ruido', 'terapia', 'reabilitacao', 'branco'],
    iconBg: 'bg-[#E1F7EE] text-[#1D9E75]'
  },
  {
    id: 'videos',
    name: 'Vídeos',
    description: 'Aulas e tutoriais',
    icon: MonitorPlay,
    url: '/modules/videos',
    external: false,
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    premium: false,
    status: 'live',
    category: 'publico',
    tags: ['video', 'youtube', 'aula', 'canal', 'educacao', 'anatomia'],
    iconBg: 'bg-[#F2EFFC] text-[#6A47C9]'
  },
  {
    id: 'voice',
    name: 'Voz',
    description: 'Voz para laringectomia',
    icon: AudioLines,
    url: 'https://otto-voice-one.vercel.app/',
    external: true,
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    premium: false,
    status: 'live',
    category: 'publico',
    tags: ['voz', 'laringectomia', 'emocao', 'audio', 'gerador'],
    iconBg: 'bg-[#FCF5E3] text-[#553018]',
    hasIA: true
  },
  {
    id: 'cases',
    name: 'OTTO Cases',
    description: 'Relatos com IA',
    icon: FolderHeart,
    url: 'https://otto-cases.vercel.app/',
    external: true,
    profiles: ['medico', 'estudante'],
    premium: false,
    status: 'live',
    category: 'academia',
    tags: ['caso', 'relato', 'clinico', 'apresentacao', 'publicacao'],
    iconBg: 'bg-[#EEEDFC] text-[#5649B4]'
  },
  {
    id: 'info',
    name: 'OTTO NEWS',
    description: 'Evidências em destaque',
    icon: Library,
    url: '/modules/info',
    external: false,
    profiles: ['medico', 'estudante', 'profissional'],
    premium: false,
    status: 'live',
    category: 'academia',
    tags: ['artigo', 'informacao', 'texto', 'leitura', 'estudo', 'update', 'pilulas', 'quiz', 'curiosidades', 'ciencia', 'vanguarda'],
    iconBg: 'bg-[#EEEDFC] text-[#5649B4]',
    hasIA: true
  },
  // Premium desativado para MVP — reativar quando gateway de pagamento estiver pronto
  // { id: 'premium_access', name: 'Premium', ... }
  {
    id: 'ottosig',
    name: 'OTTO DIC',
    description: 'Termos e definições',
    icon: BookA,
    url: 'https://dhsig86.github.io/minidic/',
    external: true,
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    premium: false,
    status: 'live',
    category: 'publico',
    tags: ['glossario', 'dicionario', 'termos', 'definicao', 'vocabulario'],
    iconBg: 'bg-[#E1F7EE] text-[#1D9E75]',
    iframeBlocked: true
  },
  {
    id: 'whisper',
    name: 'OTTO Whisper',
    description: 'Dite e transcreva',
    icon: PenLine,
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
    id: 'protto',
    name: 'PROTTO',
    description: 'Prontuário com CDSS',
    icon: FileSignature,
    url: 'https://otto-protto.vercel.app',

    external: true,
    profiles: ['medico'],
    premium: true,
    status: 'beta',
    category: 'clinico',
    tags: ['prontuario', 'triagem', 'orl', 'ia', 'protto', 'anamnese', 'deepseek', 'token'],
    iconBg: 'bg-[#FDE8E8] text-[#B03060]',
    hasIA: true,
  },
  {
    id: 'autolaudo',
    name: 'AUTOLAUDO',
    description: 'Dite e gere laudos',
    icon: FilePen,
    url: 'https://otto-laudo-ia.vercel.app',
    external: true,
    profiles: ['medico'],
    premium: true,
    status: 'beta',
    category: 'clinico',
    tags: ['laudo', 'voz', 'videolaringoscopia', 'endoscopia', 'nasal', 'ia', 'ditado', 'otorrino'],
    iconBg: 'bg-[#E1F7EE] text-[#1D9E75]',
    hasIA: true,
  },
  {
    id: 'feedback',
    name: 'Feedback',
    description: 'Reporte e sugira',
    icon: MessageCircleQuestion,
    url: '/modules/feedback',
    external: false,
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    premium: false,
    status: 'live',
    category: 'publico',
    tags: ['feedback', 'suporte', 'ajuda', 'bug', 'sugestao', 'contato'],
    iconBg: 'bg-[#FAEEDA] text-[#D58C20]'
  }
];
