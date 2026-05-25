import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type BubbleVariant = 'assistant' | 'user' | 'action' | 'system';

export interface ChatAction {
  label: string;
  command: string;
  icon?: string;
}

export interface ConciergeBubbleProps {
  variant: BubbleVariant;
  text: string;
  actions?: ChatAction[];
  timestamp?: string;
  isTyping?: boolean;
  onAction?: (command: string) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const ConciergeChatBubble: React.FC<ConciergeBubbleProps> = ({
  variant,
  text,
  actions,
  timestamp,
  isTyping,
  onAction,
}) => {
  const isUser = variant === 'user';
  const isSystem = variant === 'system';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-2 max-w-full ${isUser ? 'flex-row-reverse' : 'flex-row'} ${isSystem ? 'justify-center' : ''}`}
    >
      {/* Avatar */}
      {!isSystem && (
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${
          isUser
            ? 'bg-[#1D9E75]/15'
            : 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-md shadow-emerald-900/30'
        }`}>
          {isUser ? <User size={13} className="text-[#1D9E75]" /> : <Bot size={13} className="text-white" />}
        </div>
      )}

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] min-w-0`}>
        {/* Bubble */}
        <div className={`rounded-2xl px-3.5 py-2.5 text-[12px] sm:text-[13px] leading-relaxed whitespace-pre-line break-words ${
          isSystem
            ? 'bg-amber-50 border border-amber-200 text-amber-800 text-[11px] text-center px-4 rounded-full'
            : isUser
              ? 'bg-[#1D9E75]/10 border border-[#1D9E75]/20 text-gray-800 rounded-br-sm'
              : 'bg-gray-100 border border-gray-200 text-gray-700 rounded-bl-sm'
        }`}>
          {isTyping ? (
            <span className="flex items-center gap-1.5 text-gray-400">
              <span className="flex gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              Pensando...
            </span>
          ) : (
            text
          )}
        </div>

        {/* Actions */}
        {actions && actions.length > 0 && !isTyping && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={() => onAction?.(action.command)}
                className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold
                  bg-emerald-50 hover:bg-emerald-100 border border-emerald-200
                  text-emerald-700 hover:text-emerald-800 rounded-xl px-3 py-1.5
                  transition-all active:scale-95 shadow-sm"
              >
                {action.icon && <span>{action.icon}</span>}
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        {timestamp && (
          <span className={`text-[9px] text-gray-400 mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {timestamp}
          </span>
        )}
      </div>
    </motion.div>
  );
};

// ─── Typing Indicator ────────────────────────────────────────────────────────

export const ConciergeTypingIndicator: React.FC = () => (
  <ConciergeChatBubble variant="assistant" text="" isTyping />
);
