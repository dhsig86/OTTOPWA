import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Aperture, ClipboardList, Ear,
  ScanText, Wind, ClipboardSignature,
  PenLine, FolderHeart, BookA, FileSignature,
  FilePen, Gamepad2, Loader2, HeartPulse
} from 'lucide-react';

interface ModuleSplashProps {
  moduleId?: string;
  moduleName?: string;
}

interface SplashConfig {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  tips: string[];
  pulseAnimation?: any;
}

// Configurações temáticas de cada módulo para o Splash Screen
const SPLASH_CONFIGS: Record<string, SplashConfig> = {
  triagem: {
    icon: ClipboardList,
    iconBg: 'bg-[#FAEEDA]', iconColor: 'text-[#D58C20]',
    title: 'Preparando Sala de Espera...',
    tips: [
      "A Triagem OS organiza a admissão do paciente antes de você entrar na sala.",
      "Identificando Red Flags e calculando escores de risco...",
      "O OTTO estrutura sintomas em tempo real para otimizar a sua consulta."
    ]
  },
  protto: {
    icon: FileSignature,
    iconBg: 'bg-[#FDE8E8]', iconColor: 'text-[#B03060]',
    title: 'Convocando o Robô-Escriba...',
    tips: [
      "O PROTTO estrutura o raciocínio clínico usando a arquitetura DeepSeek R1.",
      "Você sabia? Históricos longos são resumidos sem perder os detalhes cirúrgicos essenciais.",
      "Integrando contextos de telemedicina e consultas presenciais..."
    ]
  },
  ocr: {
    icon: ScanText,
    iconBg: 'bg-[#CDF0E3]', iconColor: 'text-[#0A865F]',
    title: 'Afiando o Scanner IA...',
    tips: [
      "O OTTO OCR usa visão computacional para ler audiometrias e tomografias densas.",
      "Convertendo PDFs antigos em dados clínicos estruturados e pesquisáveis.",
      "Processando metadados e anonimizando nomes de pacientes para LGPD..."
    ]
  },
  atlas: {
    icon: BookA,
    iconBg: 'bg-[#E1F7EE]', iconColor: 'text-[#1D9E75]',
    title: 'Abrindo o Grande Livro...',
    tips: [
      "Carregando a maior biblioteca visual interativa de Otorrinolaringologia.",
      "Modelos 3D de osso temporal e laringe sendo processados...",
      "Cruzando casos clínicos com diagnósticos diferenciais visuais."
    ]
  },
  otoscopia: {
    icon: Aperture,
    iconBg: 'bg-[#E5F5FA]', iconColor: 'text-[#2C95B5]',
    title: 'Calibrando as Lentes IA...',
    tips: [
      "A IA da Otoscop.IA possui alto nível de precisão basal para MT Íntegra.",
      "Ajustando foco automático para detecção de efusões e retrações...",
      "Lembre-se de usar o cone no tamanho certo para iluminar o conduto adequadamente."
    ]
  },
  cases: {
    icon: FolderHeart,
    iconBg: 'bg-[#EEEDFC]', iconColor: 'text-[#5649B4]',
    title: 'Mergulhando na Literatura...',
    tips: [
      "O OTTO Cases correlaciona seu paciente com publicações de alto impacto.",
      "Extraindo evidências da literatura para fechar diagnósticos raros...",
      "Prepara relatórios perfeitos para sessões clínicas e congressos."
    ]
  },
  whisper: {
    icon: PenLine,
    iconBg: 'bg-[#FDE8E8]', iconColor: 'text-[#C53030]',
    title: 'Sintonizando Frequências...',
    tips: [
      "O Whisper escuta o seu ditado e transforma em prontuários lapidados.",
      "Você pode ditar do celular, relógio inteligente ou microfone de lapela.",
      "Removendo ruídos de fundo e estruturando jargões médicos instantaneamente."
    ]
  },
  logbook: {
    icon: ClipboardSignature,
    iconBg: 'bg-[#D1FAE5]', iconColor: 'text-[#065F46]',
    title: 'Buscando Histórico Cirúrgico...',
    tips: [
      "O Logbook arquiva cada passo da sua evolução cirúrgica.",
      "Separando registros de dissecção de osso temporal, cirurgia nasal e laringe...",
      "Lembre-se: Cirurgiões que revisam seus logs têm curvas de aprendizado mais rápidas."
    ]
  },
  aerodig: {
    icon: Wind,
    iconBg: 'bg-[#EFF6FB]', iconColor: 'text-[#0E7AB8]',
    title: 'Acessando a Via Aérea...',
    tips: [
      "O hub definitivo para decisões em vias aéreas pediátricas.",
      "Calculando escores de Monnier, Myer-Cotton e Rutter...",
      "Integrando protocolos de FEES, VFSS e decanulação traqueal."
    ]
  },
  bottok: {
    icon: Brain,
    iconBg: 'bg-[#E1F7EE]', iconColor: 'text-[#1D9E75]',
    title: 'Conectando Redes Neurais...',
    tips: [
      "O BOTTOK é seu concierge clínico com acesso aos guidelines mais recentes.",
      "Buscando as interações medicamentosas mais complexas da prescrição...",
      "Ele aprende com o OTTO Ecosystem para te dar respostas precisas."
    ]
  },
  games: {
    icon: Gamepad2,
    iconBg: 'bg-[#E1F7FC]', iconColor: 'text-[#0284C7]',
    title: 'Iniciando Diversão Curativa...',
    tips: [
      "O OTTO Games transforma a adesão ao tratamento em uma aventura.",
      "Super Claris e Doutor Urso estão se arrumando para ajudar seus pacientes!",
      "A gamificação reduz em 40% a ansiedade pré e pós-operatória infantil."
    ]
  },
  check: {
    icon: Ear,
    iconBg: 'bg-[#E1F7EE]', iconColor: 'text-[#1D9E75]',
    title: 'Limpando as Frequências...',
    tips: [
      "O OTTO Check equaliza tons puros para investigar zumbidos.",
      "Sons marrons são excelentes relaxantes noturnos e mascaradores de zumbido agudo.",
      "Faça o teste auditivo web para calibrar sua terapia sonora personalizada."
    ]
  },
  autolaudo: {
    icon: FilePen,
    iconBg: 'bg-[#E1F7EE]', iconColor: 'text-[#1D9E75]',
    title: 'Gerando Matrizes de Laudo...',
    tips: [
      "O AUTOLAUDO usa IA para agilizar a documentação de endoscopias e laringoscopias.",
      "Você dita e ele estrutura os achados perfeitamente nos campos corretos.",
      "Otimiza o fluxo entre a sala de exames e a impressora."
    ]
  }
};

const DEFAULT_CONFIG: SplashConfig = {
  icon: HeartPulse,
  iconBg: 'bg-slate-100', iconColor: 'text-slate-600',
  title: 'Conectando Módulo...',
  tips: [
    "O OTTO Ecosystem foi desenhado para remover o trabalho braçal da medicina.",
    "Segurança em primeiro lugar: Seus dados estão sob criptografia de ponta a ponta.",
    "Acordando motores e calibrando inteligência artificial. Só mais um instante!"
  ]
};

export const ModuleSplash: React.FC<ModuleSplashProps> = ({ moduleId = '', moduleName }) => {
  const [tipIndex, setTipIndex] = useState(0);
  const config = SPLASH_CONFIGS[moduleId] || DEFAULT_CONFIG;
  const Icon = config.icon;
  const displayTitle = moduleName ? `Iniciando ${moduleName}...` : config.title;

  // Carrossel de dicas: Muda a cada 4 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % config.tips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [config.tips.length]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
      className="absolute inset-0 z-40 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
    >
      {/* Icone central animado */}
      <motion.div 
        className={`relative w-28 h-28 rounded-3xl flex items-center justify-center mb-8 shadow-xl border-4 border-white ${config.iconBg}`}
        animate={{ 
          y: [0, -10, 0],
          boxShadow: ['0px 10px 15px rgba(0,0,0,0.1)', '0px 20px 25px rgba(0,0,0,0.15)', '0px 10px 15px rgba(0,0,0,0.1)']
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Icon size={56} className={`${config.iconColor}`} strokeWidth={1.5} />
        
        {/* Spinner orbital */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-3xl border-2 border-transparent border-t-[#1D9E75]/30 border-r-[#1D9E75]/10"
        />
      </motion.div>

      {/* Titulo principal */}
      <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
        {displayTitle}
      </h2>
      
      {/* Container fixo para as dicas para não pular layout */}
      <div className="h-20 w-full max-w-sm relative mt-4">
        <AnimatePresence mode="wait">
          <motion.p
            key={tipIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="text-sm font-medium text-slate-500 leading-relaxed absolute w-full inset-0"
          >
            {config.tips[tipIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Loading linear embaixo */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
        <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">OTTO OS</span>
      </div>
    </motion.div>
  );
};
