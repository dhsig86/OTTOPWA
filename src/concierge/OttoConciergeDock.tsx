import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConciergeChatBubble, type ChatAction } from './ConciergeChatBubble';
import { generateGreeting } from './greetings';
import { classifyIntent } from './intents';
import { runModuleAdapter } from './adapters';
import { createPwaLaunchPlan } from './bridge';
import { getModuleById, getCalcHubCatalogByArea } from './registry';
import { useAuth } from '../contexts/AuthContext';
import type { CommandSimulationResult, ModuleActivation, ConciergeDecision } from './types';

// ─── Chat Message Type ───────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  variant: 'assistant' | 'user' | 'system';
  text: string;
  actions?: ChatAction[];
  timestamp: string;
}

// ─── Help Response ───────────────────────────────────────────────────────────

function getHelpResponse(profile: string | null): { text: string; actions: ChatAction[] } {
  const modules = [
    { label: '🧮 Calculadoras ORL', cmd: 'quais calculadoras' },
    { label: '📋 Laudo por IA', cmd: 'abrir autolaudo' },
    { label: '📰 Pílulas Científicas', cmd: 'abrir update' },
    { label: '🔍 PROCOD (CID/TUSS)', cmd: 'abrir procod' },
    { label: '📝 Prontuário PROTTO', cmd: 'abrir protto' },
    { label: '📊 Cases Clínicos', cmd: 'abrir cases' },
    { label: '🎬 Vídeos ORL', cmd: 'abrir videos' },
    { label: '📖 LogBook Cirúrgico', cmd: 'abrir logbook' },
  ];

  if (profile === 'estudante') {
    modules.push({ label: '🎓 Simulado Acadêmico', cmd: 'abrir simulados' });
  }

  return {
    text: 'Posso te ajudar com qualquer módulo do ecossistema OTTO! Toque em uma opção ou digite o que precisa:',
    actions: modules.map(m => ({ label: m.label, command: m.cmd })),
  };
}

// ─── Conversational Responses ────────────────────────────────────────────────

function getConversationalResponse(text: string): { text: string; actions: ChatAction[] } | null {
  const normalized = text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

  // Greetings
  if (/^(oi|ola|hey|bom dia|boa tarde|boa noite|e ai|fala|salve)\b/.test(normalized)) {
    return {
      text: 'Olá! 😊 Estou aqui para ajudar. O que você precisa?',
      actions: [
        { label: '❓ O que posso fazer?', command: 'ajuda' },
        { label: '📰 Novidades', command: 'abrir update' },
      ],
    };
  }

  // Thanks
  if (/^(obrigad|valeu|vlw|thanks|brigad)/.test(normalized)) {
    return {
      text: 'De nada! 🫡 Estou sempre por aqui. Precisa de mais alguma coisa?',
      actions: [],
    };
  }

  // Who are you?
  if (/quem (e |eh )?(voce|vc|tu)|o que (e |eh )?o? ?concierge|se apresent/.test(normalized)) {
    return {
      text: '🤖 Sou o **OTTO Concierge** — seu assistente inteligente dentro do ecossistema OTTO.\n\nPosso navegar para qualquer módulo, abrir calculadoras, buscar códigos TUSS/CID, e muito mais! Sou movido por IA mas todas as decisões clínicas são do médico.',
      actions: [{ label: '❓ Ver tudo que posso fazer', command: 'ajuda' }],
    };
  }

  return null;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export const OttoConciergeDock: React.FC = () => {
  const navigate = useNavigate();
  const { userName, profile, userId } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  const addMessage = useCallback((msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, newMsg]);
    scrollToBottom();
    return newMsg;
  }, [scrollToBottom]);

  // ─── Generate greeting on open ──────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      const lastModule = localStorage.getItem('otto_last_module') || undefined;
      const pillsReadStr = localStorage.getItem('otto_pills_read_count');
      const totalPillsRead = pillsReadStr ? parseInt(pillsReadStr, 10) : 0;
      const favsStr = localStorage.getItem('otto_favs_count');
      const favoritesCount = favsStr ? parseInt(favsStr, 10) : 0;

      const greeting = generateGreeting({
        userName: userName || 'Doutor(a)',
        profile: profile as any,
        hour: new Date().getHours(),
        unreadPills: 0, // TODO: compute from Firestore
        lastModule,
        totalPillsRead,
        favoritesCount,
      });

      addMessage({
        variant: 'assistant',
        text: greeting.message,
        actions: greeting.suggestions.map(s => ({
          label: `${s.icon} ${s.label}`,
          command: s.command,
        })),
      });

      setHasGreeted(true);
    }
  }, [isOpen, hasGreeted, userName, profile, addMessage]);

  // ─── Focus input on open ────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // ─── Process command ────────────────────────────────────────────────────────
  const processCommand = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Add user message
    addMessage({ variant: 'user', text: trimmed });
    setIsProcessing(true);

    // Small delay for natural feel
    await new Promise(r => setTimeout(r, 300));

    try {
      // 1. Check for conversational responses first
      const conversational = getConversationalResponse(trimmed);
      if (conversational) {
        addMessage({ variant: 'assistant', text: conversational.text, actions: conversational.actions });
        setIsProcessing(false);
        return;
      }

      // 2. Check for help command
      const normalizedCmd = trimmed.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
      if (/^(ajuda|help|menu|o que (voce|vc) (faz|pode)|opcoes|comandos)/.test(normalizedCmd)) {
        const help = getHelpResponse(profile);
        addMessage({ variant: 'assistant', text: help.text, actions: help.actions });
        setIsProcessing(false);
        return;
      }

      // 3. Classify intent
      const candidates = classifyIntent(trimmed);
      
      if (candidates.length === 0) {
        addMessage({
          variant: 'assistant',
          text: `🤔 Não encontrei um módulo para "${trimmed}". Posso te ajudar de outra forma?`,
          actions: [
            { label: '❓ Ver opções', command: 'ajuda' },
            { label: '🤖 Perguntar ao BOTTOK', command: `perguntar bottok ${trimmed}` },
          ],
        });
        setIsProcessing(false);
        return;
      }

      const topCandidate = candidates[0];
      const intentEntry = topCandidate.intent;
      const module = getModuleById(intentEntry.moduleId);

      // 4. Catalog request (special case)
      if (intentEntry.id === 'calc.list') {
        const catalog = getCalcHubCatalogByArea();
        const catalogText = catalog.map(g =>
          `**${g.area}:**\n${g.calculators.map(c => `  • ${c.name}`).join('\n')}`
        ).join('\n\n');

        addMessage({
          variant: 'assistant',
          text: `🧮 Calculadoras disponíveis no OTTO CALC-HUB:\n\n${catalogText}\n\nDigite o nome de uma calculadora para abrir.`,
          actions: [
            { label: 'SNOT-22', command: 'abrir snot-22' },
            { label: 'Epworth', command: 'abrir epworth' },
            { label: 'THI Zumbido', command: 'abrir thi' },
          ],
        });
        setIsProcessing(false);
        return;
      }

      // 5. Run adapter and create launch plan
      const traceId = `trace_${Date.now()}`;
      const adapterRequest = {
        moduleId: intentEntry.moduleId,
        intentId: intentEntry.id,
        surface: 'pwa' as const,
        input: { text: trimmed },
        identity: userId ? {
          uid: userId,
          profile: (profile || 'medico') as any,
        } : undefined,
        traceId,
      };

      const adapterResponse = await runModuleAdapter(adapterRequest);

      const decision: ConciergeDecision = {
        decisionId: traceId,
        intentId: intentEntry.id,
        confidence: topCandidate.confidence,
        riskLevel: intentEntry.riskLevel,
        action: {
          kind: intentEntry.actionKind,
          moduleId: intentEntry.moduleId,
          url: module?.currentUrl,
        },
        audit: intentEntry.auditPolicy,
        userMessage: adapterResponse.summary,
        debug: {
          traceId,
          selectedIntent: intentEntry.id,
          guardrailDecision: 'allow',
        },
      };

      const activation: ModuleActivation = {
        shouldActivate: true,
        moduleId: intentEntry.moduleId,
        mode: intentEntry.actionKind === 'deep_link' ? 'deep_link' : 'open_module',
        url: module?.currentUrl,
        reason: 'Intent classified with high confidence',
      };

      const simResult: CommandSimulationResult = {
        decision,
        activation,
        adapterResponse,
        durationMs: 0,
      };

      const plan = createPwaLaunchPlan(simResult);

      // 6. Build response
      const moduleName = module?.displayName || intentEntry.displayName;
      const actions: ChatAction[] = [];

      if (plan.route && plan.status === 'ready') {
        actions.push({
          label: `🚀 Abrir ${moduleName}`,
          command: `__navigate__${plan.route}__${plan.navigationState?.url || ''}`,
        });
      } else if (plan.status === 'handoff_required') {
        actions.push({
          label: `🔐 Continuar no PWA`,
          command: `__navigate__${plan.route}__${plan.navigationState?.url || ''}`,
        });
      }

      // Add contextual follow-up
      actions.push({ label: '❓ Mais opções', command: 'ajuda' });

      // Humanized response
      let responseText = '';
      if (plan.status === 'ready') {
        responseText = `✅ **${moduleName}** está pronto! ${adapterResponse.summary}`;
      } else if (plan.status === 'handoff_required') {
        responseText = `🔐 **${moduleName}** precisa de acesso seguro. ${adapterResponse.summary}`;
      } else if (plan.status === 'confirmation_required') {
        responseText = `⚠️ **${moduleName}** precisa de confirmação. ${plan.helperMessage}`;
      } else {
        responseText = `ℹ️ ${adapterResponse.summary}`;
      }

      // Track last module
      localStorage.setItem('otto_last_module', intentEntry.moduleId);

      addMessage({ variant: 'assistant', text: responseText, actions });

    } catch (err) {
      console.error('Concierge error:', err);
      addMessage({
        variant: 'assistant',
        text: '❌ Ops, algo deu errado. Tente novamente ou use o menu principal.',
        actions: [{ label: '❓ Ver opções', command: 'ajuda' }],
      });
    } finally {
      setIsProcessing(false);
    }
  }, [addMessage, profile, userId, navigate]);

  // ─── Listen to global open event ───────────────────────────────────────────
  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ command?: string }>;
      setIsOpen(true);
      if (customEvent.detail?.command) {
        void processCommand(customEvent.detail.command);
      }
    };
    window.addEventListener('otto-open-concierge', handleOpen as EventListener);
    return () => window.removeEventListener('otto-open-concierge', handleOpen as EventListener);
  }, [processCommand]);

  // ─── Handle action clicks ──────────────────────────────────────────────────
  const handleAction = useCallback((command: string) => {
    if (command.startsWith('__navigate__')) {
      const parts = command.split('__');
      const route = parts[2] || '/';
      const url = parts[3] || '';

      if (route === '/modules/webview' && url) {
        navigate(route, { state: { url } });
      } else if (route.startsWith('/')) {
        navigate(route);
      }
      setIsOpen(false);
      return;
    }

    setInputValue('');
    processCommand(command);
  }, [navigate, processCommand]);

  // ─── Handle submit ─────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;
    processCommand(inputValue);
    setInputValue('');
  };

  return (
    <>
      {/* ═══ Chat Panel ═══ */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop (mobile) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none sm:pointer-events-none"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed z-50
                inset-0 sm:inset-auto
                sm:right-0 sm:top-0 sm:bottom-0 sm:w-[380px]
                bg-white border-l border-gray-200
                flex flex-col shadow-2xl"
            >
              {/* Panel Header */}
              <header className="h-14 bg-[#1D9E75] border-b border-[#0A865F] px-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shadow-md">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-white leading-none">
                      OTTO Concierge
                    </h2>
                    <span className="text-[9px] text-emerald-100 font-semibold">Assistente Inteligente</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors text-emerald-100 hover:text-white"
                >
                  <X size={18} />
                </button>
              </header>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300">
                {messages.map((msg) => (
                  <ConciergeChatBubble
                    key={msg.id}
                    variant={msg.variant}
                    text={msg.text}
                    actions={msg.actions}
                    timestamp={msg.timestamp}
                    onAction={handleAction}
                  />
                ))}

                {isProcessing && (
                  <ConciergeChatBubble variant="assistant" text="" isTyping />
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Input Bar */}
              <div className="shrink-0 bg-gray-50 border-t border-gray-200 p-3">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Digite um comando ou pergunta..."
                    disabled={isProcessing}
                    className="flex-1 bg-white border border-gray-300 rounded-xl px-3.5 py-2.5
                      text-[13px] text-gray-800 placeholder-gray-400
                      focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75]/30
                      disabled:opacity-50 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isProcessing}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700
                      flex items-center justify-center text-white
                      hover:from-emerald-500 hover:to-teal-600
                      disabled:opacity-30 disabled:cursor-not-allowed
                      transition-all active:scale-95 shadow-md"
                  >
                    <Send size={16} />
                  </button>
                </form>
                <p className="text-[9px] text-gray-400 text-center mt-1.5">
                  Decisões clínicas são sempre do médico · LGPD compliant
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
