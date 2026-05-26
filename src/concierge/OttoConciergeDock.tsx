import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConciergeChatBubble, type ChatAction } from './ConciergeChatBubble';
import { generateGreeting } from './greetings';
import { simulateCommandActivation } from './core';
import { createPwaLaunchPlan } from './bridge';
import { getCalcHubCatalogByArea } from './registry';
import { useAuth } from '../contexts/AuthContext';
import type { ConciergeInput } from './types';

// ─── Chat Message Type ───────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  variant: 'assistant' | 'user' | 'system';
  text: string;
  actions?: ChatAction[];
  timestamp: string;
}

// ─── Session Storage (R3) ────────────────────────────────────────────────────

const CHAT_STORAGE_KEY = 'otto_concierge_chat';
const MAX_STORED_MESSAGES = 20;

function loadStoredMessages(): ChatMessage[] {
  try {
    const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

function saveMessages(messages: ChatMessage[]) {
  try {
    sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)));
  } catch { /* quota exceeded — ignore */ }
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

// ─── Build ConciergeInput from chat context (R1) ────────────────────────────

function buildConciergeInput(text: string, userId: string | null, profile: string | null): ConciergeInput {
  return {
    surface: 'pwa',
    input: { kind: 'text', text },
    identity: {
      uid: userId || 'anonymous',
      profile: (profile || 'medico') as any,
    },
    session: {
      id: `session_${Date.now()}`,
      timestamp: new Date().toISOString(),
      locale: 'pt-BR',
    },
  };
}

// ─── Main Component ──────────────────────────────────────────────────────────

export const OttoConciergeDock: React.FC = () => {
  const navigate = useNavigate();
  const { userName, profile, userId } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadStoredMessages); // R3
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(() => loadStoredMessages().length > 0); // R3: skip greeting if chat restored
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // R3: Persist messages on change
  useEffect(() => { saveMessages(messages); }, [messages]);

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
        unreadPills: 0,
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

  // ─── Process command (R1: uses core.ts) ─────────────────────────────────────
  const processCommand = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    addMessage({ variant: 'user', text: trimmed });
    setIsProcessing(true);

    try {
      // 1. Conversational check (saudações, agradecimentos, etc.)
      const conversational = getConversationalResponse(trimmed);
      if (conversational) {
        await typingDelay(conversational.text);
        addMessage({ variant: 'assistant', text: conversational.text, actions: conversational.actions });
        setIsProcessing(false);
        return;
      }

      // 2. Build formal ConciergeInput and run through core.ts decision engine
      //    This activates: guardrails, tutorials, capabilities_db help, NLU
      const input = buildConciergeInput(trimmed, userId, profile);
      const simResult = await simulateCommandActivation(input);
      const decision = simResult.decision;

      // R6: Proportional typing delay
      await typingDelay(decision.userMessage);

      // 3. Special case: calc.list (catalog display)
      if (decision.intentId === 'calc.list') {
        const catalog = getCalcHubCatalogByArea();
        const catalogText = catalog.map(g =>
          `**${g.area}:**\n${g.calculators.map(c => `- ${c.name}`).join('\n')}`
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

      // 4. Handle decision based on guardrail outcome
      if (decision.action.kind === 'refuse') {
        addMessage({
          variant: 'assistant',
          text: decision.userMessage,
          actions: [{ label: '❓ Ver opções', command: 'ajuda' }],
        });
        setIsProcessing(false);
        return;
      }

      // 5. Respond-only decisions (help, tutorials, capabilities)
      if (decision.action.kind === 'respond') {
        addMessage({
          variant: 'assistant',
          text: decision.userMessage,
          actions: [{ label: '❓ Mais opções', command: 'ajuda' }],
        });
        setIsProcessing(false);
        return;
      }

      // 6. Module navigation — create launch plan
      const plan = createPwaLaunchPlan(simResult);
      const moduleName = decision.action.moduleId || 'módulo';
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

      actions.push({ label: '❓ Mais opções', command: 'ajuda' });

      // Humanized response
      let responseText = decision.userMessage;
      if (!responseText || responseText.length < 5) {
        if (plan.status === 'ready') {
          responseText = `✅ **${moduleName}** está pronto!`;
        } else if (plan.status === 'handoff_required') {
          responseText = `🔐 **${moduleName}** precisa de acesso seguro.`;
        } else {
          responseText = `ℹ️ Módulo preparado.`;
        }
      }

      localStorage.setItem('otto_last_module', decision.action.moduleId || '');
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
  }, [addMessage, profile, userId]);

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

// ─── R6: Proportional typing delay ──────────────────────────────────────────

function typingDelay(text: string): Promise<void> {
  const ms = Math.min(800, 200 + (text?.length || 0) * 1.5);
  return new Promise(r => setTimeout(r, ms));
}
