import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConciergeChatBubble, type ChatAction, type BubbleStyle } from './ConciergeChatBubble';
import { generateGreeting } from './greetings';
import { simulateCommandActivation } from './core';
import { createPwaLaunchPlan } from './bridge';
import { getCalcHubCatalogByArea, getModuleById } from './registry';
import { useAuth } from '../contexts/AuthContext';
import type { ConciergeInput } from './types';

// ─── Chat Message Type ───────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  variant: 'assistant' | 'user' | 'system';
  text: string;
  actions?: ChatAction[];
  timestamp: string;
  bubbleStyle?: BubbleStyle;
}

// ─── Session Storage ─────────────────────────────────────────────────────────

const CHAT_KEY = 'otto_concierge_chat';
const MAX_MSGS = 30;

function loadChat(): ChatMessage[] {
  try { return JSON.parse(sessionStorage.getItem(CHAT_KEY) || '[]'); }
  catch { return []; }
}
function saveChat(m: ChatMessage[]) {
  try { sessionStorage.setItem(CHAT_KEY, JSON.stringify(m.slice(-MAX_MSGS))); }
  catch { /* ignore */ }
}

// ─── Personality Layer ───────────────────────────────────────────────────────

const GREETINGS_CASUAL = [
  'Olá! 😊 Em que posso ajudar?',
  'Oi! Me diz o que precisa 👋',
  'Olá! Estou à disposição 🫡',
];

const THANKS_REPLIES = [
  'Disponha! Precisa de mais alguma coisa? 🫡',
  'Por nada! Estou sempre aqui 😊',
  'Fico feliz em ajudar! Mais algo?',
];

const OPENER_LINES: Record<string, string> = {
  ready: 'Preparei tudo pra você!',
  handoff_required: 'Precisa de acesso seguro — toque para continuar:',
  confirmation_required: 'Precisa de uma confirmação antes:',
};

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function getConversationalResponse(text: string): { text: string; actions: ChatAction[] } | null {
  const n = text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

  // ─── Tour Steps ──────────────────────────────────────────────────────────
  if (n === 'concierge.tour.start') {
    return {
      text: '🧮 **Passo 1: Calculadoras Clínicas**\n\nExperimente digitar `calcular stop bang` ou `abrir vhi`. Eu identifico a calculadora e abro o módulo diretamente na ferramenta certa.\n\nVamos testar?',
      actions: [
        { label: 'Testar com STOP-Bang', command: 'calcular stop bang', style: 'primary' },
        { label: 'Próximo Passo ➡️', command: 'concierge.tour.step2' }
      ]
    };
  }

  if (n === 'concierge.tour.step2') {
    return {
      text: '🎙️ **Passo 2: Escriba Médico (Whisper)**\n\nPrecisa de transcrever e resumir uma consulta? Diga `gravar consulta` ou `ditar evolucao`. Eu preparo o gravador com injeção segura no prontuário.\n\nPróximo?',
      actions: [
        { label: 'Próximo Passo ➡️', command: 'concierge.tour.step3', style: 'primary' }
      ]
    };
  }

  if (n === 'concierge.tour.step3') {
    return {
      text: '🔎 **Passo 3: Faturamento e CID/TUSS (PROCOD)**\n\nQuer codificar um procedimento ou buscar CID? Digite `cid faringite` ou `tuss amigdalectomia`. Trago os códigos certos na hora.\n\nPronto! Agora você está pronto para dominar o ecossistema.',
      actions: [
        { label: 'Concluir Tour ✅', command: 'concierge.tour.done', style: 'primary' }
      ]
    };
  }

  if (n === 'concierge.tour.done') {
    localStorage.setItem('otto_concierge_tour_done', 'true');
    return {
      text: 'Excelente! O tour foi concluído. Estou sempre aqui no canto da tela para facilitar seu fluxo clínico. Como posso ajudar agora?',
      actions: [
        { label: '🧭 Ver opções', command: 'ajuda', style: 'primary' }
      ]
    };
  }

  if (n === 'concierge.tour.skip') {
    localStorage.setItem('otto_concierge_tour_done', 'true');
    return {
      text: 'Sem problemas! Se precisar de ajuda, é só digitar `ajuda` ou clicar no botão de menu.',
      actions: [
        { label: '🧭 O que posso fazer?', command: 'ajuda', style: 'primary' }
      ]
    };
  }

  // ─── Conversational Responses ──────────────────────────────────────────────
  if (/^(oi|ola|hey|bom dia|boa tarde|boa noite|e ai|fala|salve)\b/.test(n)) {
    return {
      text: pick(GREETINGS_CASUAL),
      actions: [
        { label: '🧭 O que posso fazer?', command: 'ajuda', style: 'primary' },
        { label: '📰 Novidades', command: 'abrir update' },
      ],
    };
  }

  if (/^(obrigad|valeu|vlw|thanks|brigad)/.test(n)) {
    return { text: pick(THANKS_REPLIES), actions: [] };
  }

  if (/quem (e |eh )?(voce|vc|tu)|o que (e |eh )?o? ?concierge|se apresent/.test(n)) {
    return {
      text: '🤖 Sou o **OTTO Concierge** — seu assistente pessoal dentro do ecossistema OTTO.\n\nNavego entre módulos, abro calculadoras, explico funcionalidades e guio você pelo sistema. Todas as decisões clínicas são do médico — eu facilito o caminho.',
      actions: [{ label: '🧭 Ver o que posso fazer', command: 'ajuda', style: 'primary' }],
    };
  }

  return null;
}

// ─── Build ConciergeInput ────────────────────────────────────────────────────

function buildInput(text: string, uid: string | null, profile: string | null): ConciergeInput {
  return {
    surface: 'pwa',
    input: { kind: 'text', text },
    identity: { uid: uid || 'anonymous', profile: (profile || 'medico') as any },
    session: { id: `s_${Date.now()}`, timestamp: new Date().toISOString(), locale: 'pt-BR' },
  };
}

// ─── Contextual Follow-ups ───────────────────────────────────────────────────

function getContextualActions(moduleId: string): ChatAction[] {
  const related: Record<string, ChatAction[]> = {
    protto:   [{ label: '🎙️ Ditar consulta', command: 'abrir whisper' }, { label: '📋 Ver triagem', command: 'abrir triagem' }],
    whisper:  [{ label: '📝 Prontuário', command: 'abrir protto' }, { label: '✍️ Laudo-IA', command: 'abrir autolaudo' }],
    procod:   [{ label: '📊 Cases clínicos', command: 'abrir cases' }, { label: '📖 LogBook', command: 'abrir logbook' }],
    calchub:  [{ label: '📊 Ver outra calc', command: 'quais calculadoras' }, { label: '📝 Prontuário', command: 'abrir protto' }],
    cases:    [{ label: '🏷️ Codificar TUSS', command: 'abrir procod' }, { label: '📖 LogBook', command: 'abrir logbook' }],
    logbook:  [{ label: '📊 Cases', command: 'abrir cases' }, { label: '🏷️ PROCOD', command: 'abrir procod' }],
    triagem:  [{ label: '📝 Prontuário', command: 'abrir protto' }, { label: '🧮 Calculadoras', command: 'quais calculadoras' }],
    autolaudo:[{ label: '🎙️ Whisper', command: 'abrir whisper' }, { label: '📋 Triagem', command: 'abrir triagem' }],
    atlas:    [{ label: '🔍 Otoscop.IA', command: 'abrir otoscopia' }, { label: '🎓 Acadêmico', command: 'abrir academico' }],
    games:    [{ label: '🔔 Zumbido', command: 'abrir zumbido' }, { label: '👂 Teste auditivo', command: 'abrir check' }],
  };
  return related[moduleId] || [{ label: '🧭 Mais opções', command: 'ajuda', style: 'ghost' as const }];
}

// ─── Main Component ──────────────────────────────────────────────────────────

export const OttoConciergeDock: React.FC = () => {
  const navigate = useNavigate();
  const { userName, profile, userId } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadChat);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(() => loadChat().length > 0);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { saveChat(messages); }, [messages]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
  }, []);

  const addMsg = useCallback((msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const m: ChatMessage = {
      ...msg,
      id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, m]);
    scrollToBottom();
    return m;
  }, [scrollToBottom]);

  // Multi-bubble delivery: shows typing → adds bubble → repeats
  const addMultiBubble = useCallback(async (
    bubbles: Array<Omit<ChatMessage, 'id' | 'timestamp'>>
  ) => {
    for (let i = 0; i < bubbles.length; i++) {
      if (i > 0) {
        setIsProcessing(true);
        await new Promise(r => setTimeout(r, 350 + Math.min(400, (bubbles[i].text?.length || 0) * 1.2)));
      }
      setIsProcessing(false);
      addMsg(bubbles[i]);
    }
  }, [addMsg]);

  // ─── Greeting ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      const tourDone = localStorage.getItem('otto_concierge_tour_done') === 'true';
      if (!tourDone) {
        addMsg({
          variant: 'assistant',
          text: '🩺 **Bem-vindo ao OTTO Concierge!**\n\nSou seu assistente de navegação clínica. Posso abrir calculadoras, transcrever áudios e buscar códigos CID/TUSS rapidamente.\n\nGostaria de fazer um tour interativo de 1 minuto?',
          bubbleStyle: 'hero',
          actions: [
            { label: '🚀 Iniciar Tour', command: 'concierge.tour.start', style: 'primary' },
            { label: '❌ Pular', command: 'concierge.tour.skip', style: 'ghost' }
          ]
        });
        setHasGreeted(true);
        return;
      }

      const lastModule = localStorage.getItem('otto_last_module') || undefined;
      const greeting = generateGreeting({
        userName: userName || 'Doutor(a)',
        profile: profile as any,
        hour: new Date().getHours(),
        unreadPills: 0,
        lastModule,
        totalPillsRead: parseInt(localStorage.getItem('otto_pills_read_count') || '0'),
        favoritesCount: parseInt(localStorage.getItem('otto_favs_count') || '0'),
      });

      addMsg({
        variant: 'assistant',
        text: greeting.message,
        bubbleStyle: 'hero',
        actions: greeting.suggestions.map(s => ({
          label: `${s.icon} ${s.label}`,
          command: s.command,
          style: 'primary' as const,
        })),
      });
      setHasGreeted(true);
    }
  }, [isOpen, hasGreeted, userName, profile, addMsg]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  // ─── Process command ───────────────────────────────────────────────────────
  const processCommand = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    addMsg({ variant: 'user', text: trimmed });
    setIsProcessing(true);

    try {
      // 1. Conversational check
      const conv = getConversationalResponse(trimmed);
      if (conv) {
        await typeDelay(conv.text);
        setIsProcessing(false);
        addMsg({ variant: 'assistant', text: conv.text, actions: conv.actions });
        return;
      }

      // 2. Core.ts decision engine
      const input = buildInput(trimmed, userId, profile);
      const simResult = await simulateCommandActivation(input);
      const decision = simResult.decision;

      await typeDelay(decision.userMessage);

      // 3. Calc catalog → multi-bubble
      if (decision.intentId === 'calc.list') {
        const catalog = getCalcHubCatalogByArea();
        const introText = '🧮 Temos calculadoras em várias áreas. Escolha uma categoria ou digite o nome:';
        const categoryBubbles: Array<Omit<ChatMessage, 'id' | 'timestamp'>> = [
          { variant: 'assistant', text: introText, bubbleStyle: 'card' },
          ...catalog.map(g => ({
            variant: 'assistant' as const,
            text: `**${g.area}**\n${g.calculators.slice(0, 5).map(c => `- ${c.name}`).join('\n')}${g.calculators.length > 5 ? `\n_...e mais ${g.calculators.length - 5}_` : ''}`,
            bubbleStyle: 'card' as BubbleStyle,
            actions: g.calculators.slice(0, 3).map(c => ({
              label: c.name,
              command: `abrir ${c.name.toLowerCase()}`,
            })),
          })),
        ];
        setIsProcessing(false);
        await addMultiBubble(categoryBubbles);
        return;
      }

      // 4. Refuse
      if (decision.action.kind === 'refuse') {
        setIsProcessing(false);
        addMsg({
          variant: 'assistant',
          text: `🤔 ${decision.userMessage}`,
          actions: [
            { label: '🧭 Ver opções', command: 'ajuda', style: 'primary' },
            { label: '🤖 BOTTOK', command: `perguntar bottok ${trimmed}` },
          ],
        });
        return;
      }

      // 5. Respond-only (help, tutorials, capabilities)
      if (decision.action.kind === 'respond') {
        // Split long help into multi-bubble by double-newline sections
        const sections = decision.userMessage.split(/\n\n(?=\*\*[🏥🔬📋🎓🩺🧒🎮])/);
        if (sections.length > 2) {
          const bubbles: Array<Omit<ChatMessage, 'id' | 'timestamp'>> = sections.map((section, i) => ({
            variant: 'assistant' as const,
            text: section.trim(),
            bubbleStyle: (i === 0 ? 'hero' : 'card') as BubbleStyle,
            ...(i === sections.length - 1 ? {
              actions: [{ label: '💬 Como funciona um módulo?', command: 'como funciona protto', style: 'ghost' as const }]
            } : {}),
          }));
          setIsProcessing(false);
          await addMultiBubble(bubbles);
        } else {
          // Tutorial or short help — single bubble with card style
          setIsProcessing(false);
          const isTutorial = decision.userMessage.includes('Passo a passo');
          addMsg({
            variant: 'assistant',
            text: decision.userMessage,
            bubbleStyle: isTutorial ? 'card' : 'default',
            actions: decision.action.moduleId
              ? [
                  { label: `🚀 Abrir ${decision.action.moduleId}`, command: `abrir ${decision.action.moduleId}`, style: 'primary' },
                  ...getContextualActions(decision.action.moduleId).slice(0, 1),
                ]
              : [{ label: '🧭 Mais opções', command: 'ajuda', style: 'ghost' }],
          });
        }
        return;
      }

      // 6. Module navigation
      const plan = createPwaLaunchPlan(simResult);
      const moduleId = decision.action.moduleId || '';
      const module = getModuleById(moduleId);
      const moduleName = module?.displayName || moduleId;
      const status = plan.status || 'ready';

      const postMsgStr = plan.postMessage ? btoa(encodeURIComponent(JSON.stringify(plan.postMessage))) : '';
      const navAction: ChatAction = {
        label: `🚀 Abrir ${moduleName}`,
        command: `__navigate__${plan.route}__${plan.navigationState?.url || ''}__${postMsgStr}`,
        style: 'primary',
      };
      if (status === 'handoff_required') {
        navAction.label = `🔐 Continuar seguro`;
      }

      // Response text — concierge tone
      const summary = simResult.adapterResponse?.summary || '';
      const opener = OPENER_LINES[status] || 'Aqui está:';
      const responseText = summary
        ? `${opener}\n\n${summary}`
        : `${opener} **${moduleName}** está pronto.`;

      setIsProcessing(false);

      // Deliver as: response bubble + tip with contextual follow-ups
      await addMultiBubble([
        {
          variant: 'assistant',
          text: responseText,
          bubbleStyle: 'card',
          actions: [navAction],
        },
        {
          variant: 'assistant',
          text: `💡 _Relacionados que podem te interessar:_`,
          bubbleStyle: 'tip',
          actions: getContextualActions(moduleId),
        },
      ]);

      localStorage.setItem('otto_last_module', moduleId);

    } catch (err) {
      console.error('Concierge error:', err);
      setIsProcessing(false);
      addMsg({
        variant: 'assistant',
        text: '😅 Algo não saiu como esperado. Vamos tentar de novo?',
        actions: [
          { label: '🧭 Ver opções', command: 'ajuda', style: 'primary' },
        ],
      });
    }
  }, [addMsg, addMultiBubble, profile, userId]);

  // ─── Events ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleOpen = (e: Event) => {
      const ce = e as CustomEvent<{ command?: string }>;
      setIsOpen(true);
      if (ce.detail?.command) void processCommand(ce.detail.command);
    };
    window.addEventListener('otto-open-concierge', handleOpen as EventListener);
    return () => window.removeEventListener('otto-open-concierge', handleOpen as EventListener);
  }, [processCommand]);

  const handleAction = useCallback((command: string) => {
    if (command.startsWith('__navigate__')) {
      const parts = command.split('__');
      const route = parts[2] || '/';
      const url = parts[3] || '';
      const postMsgEncoded = parts[4] || '';

      if (postMsgEncoded) {
        try {
          const decoded = decodeURIComponent(atob(postMsgEncoded));
          sessionStorage.setItem('otto_concierge_pending_message', decoded);
        } catch (e) {
          console.error('Failed to parse encoded postMessage:', e);
        }
      }

      if (route === '/modules/webview' && url) navigate(route, { state: { url } });
      else if (route.startsWith('/')) navigate(route);
      setIsOpen(false);
      return;
    }
    setInputValue('');
    processCommand(command);
  }, [navigate, processCommand]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;
    processCommand(inputValue);
    setInputValue('');
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none sm:pointer-events-none"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => { if (info.offset.x > 120) setIsOpen(false); }}
            className="fixed z-50
              inset-0 sm:inset-auto
              sm:right-0 sm:top-0 sm:bottom-0 sm:w-[400px]
              bg-white border-l border-gray-200
              flex flex-col shadow-2xl"
          >
            {/* Header */}
            <header className="h-14 bg-gradient-to-r from-[#1D9E75] to-[#15876a] px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shadow-md backdrop-blur-sm">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-white leading-none tracking-tight">
                    OTTO Concierge
                  </h2>
                  <span className="text-[9px] text-emerald-200 font-medium">Assistente do Ecossistema</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                <span className="text-[9px] text-emerald-200 font-medium mr-2">Online</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/15 rounded-full transition-all text-emerald-200 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </header>

            {/* Chat */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-gradient-to-b from-gray-50/50 to-white scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300">
              {messages.map((msg) => (
                <ConciergeChatBubble
                  key={msg.id}
                  variant={msg.variant}
                  text={msg.text}
                  actions={msg.actions}
                  timestamp={msg.timestamp}
                  bubbleStyle={msg.bubbleStyle}
                  onAction={handleAction}
                />
              ))}

              {isProcessing && (
                <ConciergeChatBubble variant="assistant" text="" isTyping />
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 bg-white border-t border-gray-100 p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ex: abrir protto, como funciona calc..."
                  disabled={isProcessing}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5
                    text-[13px] text-gray-800 placeholder-gray-400
                    focus:outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/15 focus:bg-white
                    disabled:opacity-40 transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isProcessing}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1D9E75] to-teal-700
                    flex items-center justify-center text-white
                    hover:shadow-lg hover:shadow-emerald-500/25
                    disabled:opacity-20 disabled:cursor-not-allowed
                    transition-all active:scale-90 shadow-md"
                >
                  <Send size={16} />
                </button>
              </form>
              <p className="text-[8px] text-gray-400 text-center mt-1.5 tracking-wide">
                Decisões clínicas são do médico · LGPD compliant
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Typing delay ────────────────────────────────────────────────────────────

function typeDelay(text: string): Promise<void> {
  const ms = Math.min(800, 250 + (text?.length || 0) * 1);
  return new Promise(r => setTimeout(r, ms));
}
