import React from 'react';
import { motion } from 'framer-motion';
import { User, ThumbsUp, ThumbsDown } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type BubbleVariant = 'assistant' | 'user' | 'system';
export type BubbleStyle = 'default' | 'card' | 'hero' | 'tip';

export interface ChatAction {
  label: string;
  command: string;
  icon?: string;
  style?: 'primary' | 'secondary' | 'ghost';
}

export interface ConciergeBubbleProps {
  variant: BubbleVariant;
  text: string;
  actions?: ChatAction[];
  timestamp?: string;
  isTyping?: boolean;
  bubbleStyle?: BubbleStyle;
  onAction?: (command: string) => void;
}

// ─── Mini Markdown Renderer ──────────────────────────────────────────────────

function miniMarkdown(text: string): string {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/_(.+?)_/g, '<em class="text-gray-500 not-italic text-[11px]">$1</em>')
    .replace(/^- (.+)/gm, '<span class="flex gap-2 items-start"><span class="text-emerald-400 mt-px">›</span><span>$1</span></span>')
    .replace(/^\d+\. (.+)/gm, (_, content, offset, str) => {
      const before = str.substring(0, offset);
      const num = (before.match(/^\d+\. /gm) || []).length + 1;
      return `<span class="flex gap-2 items-start"><span class="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-px">${num}</span><span>${content}</span></span>`;
    })
    .replace(/\n/g, '<br/>');
}

// ─── Component ───────────────────────────────────────────────────────────────

export const ConciergeChatBubble: React.FC<ConciergeBubbleProps> = ({
  variant,
  text,
  actions,
  timestamp,
  isTyping,
  bubbleStyle = 'default',
  onAction,
}) => {
  const isUser = variant === 'user';
  const isSystem = variant === 'system';
  const [feedback, setFeedback] = React.useState<'up' | 'down' | null>(null);

  // Bubble style classes
  const getBubbleClasses = () => {
    if (isSystem) return 'bg-amber-50 border border-amber-200 text-amber-800 text-[11px] text-center px-4 rounded-full';
    if (isUser) return 'bg-[#1D9E75]/10 border border-[#1D9E75]/20 text-gray-800 rounded-br-sm';
    
    switch (bubbleStyle) {
      case 'card':
        return 'bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 text-gray-700 rounded-2xl shadow-sm';
      case 'hero':
        return 'bg-gradient-to-br from-[#1D9E75]/10 via-emerald-50 to-teal-50 border border-emerald-300/50 text-gray-700 rounded-2xl shadow-md';
      case 'tip':
        return 'bg-amber-50/80 border border-amber-200/50 text-amber-900 rounded-2xl';
      default:
        return 'bg-gray-50 border border-gray-200/80 text-gray-700 rounded-bl-sm';
    }
  };

  // Action button style
  const getActionClasses = (style?: ChatAction['style']) => {
    switch (style) {
      case 'primary':
        return 'bg-[#1D9E75] hover:bg-[#178a66] text-white border-[#1D9E75] shadow-md shadow-emerald-900/15 font-bold';
      case 'ghost':
        return 'bg-transparent hover:bg-gray-100 text-gray-500 hover:text-gray-700 border-transparent';
      default:
        return 'bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-700 hover:text-emerald-800 shadow-sm';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`flex gap-2 max-w-full ${isUser ? 'flex-row-reverse' : 'flex-row'} ${isSystem ? 'justify-center' : ''}`}
    >
      {/* Avatar */}
      {!isSystem && (
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 transition-all overflow-hidden ${
          isUser
            ? 'bg-[#1D9E75]/15'
            : 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-md shadow-emerald-900/30'
        }`}>
          {isUser ? (
            <User size={13} className="text-[#1D9E75]" />
          ) : (
            <img src="/otto_concierge_avatar.jpg" alt="OTTO" className="w-full h-full object-cover" />
          )}
        </div>
      )}

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[88%] min-w-0`}>
        {/* Bubble */}
        <div className={`rounded-2xl px-3.5 py-2.5 text-[12px] sm:text-[13px] leading-relaxed break-words ${getBubbleClasses()}`}>
          {isTyping ? (
            <span className="flex items-center gap-2 text-gray-400 py-0.5">
              <span className="flex gap-0.5">
                <span className="w-2 h-2 rounded-full bg-[#1D9E75]/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#1D9E75]/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#1D9E75]/60 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              <span className="text-[11px] text-gray-400">digitando...</span>
            </span>
          ) : isUser ? (
            <span className="whitespace-pre-line">{text}</span>
          ) : (
            <span dangerouslySetInnerHTML={{ __html: miniMarkdown(text) }} />
          )}
        </div>

        {/* Actions */}
        {actions && actions.length > 0 && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.2 }}
            className="flex flex-wrap gap-1.5 mt-2"
          >
            {actions.map((action, i) => (
              <motion.button
                key={`${action.command}_${i}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                onClick={() => onAction?.(action.command)}
                className={`flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold
                  border rounded-xl px-3 py-1.5
                  transition-all active:scale-95 ${getActionClasses(action.style)}`}
              >
                {action.label}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Footer row: timestamp + feedback */}
        {!isTyping && !isSystem && (
          <div className={`flex items-center gap-2 mt-1 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
            {timestamp && (
              <span className="text-[10px] text-gray-400">{timestamp}</span>
            )}
            {/* Feedback for assistant messages */}
            {!isUser && text && (
              <span className="flex items-center gap-0.5">
                <button
                  onClick={() => setFeedback(f => f === 'up' ? null : 'up')}
                  className={`p-0.5 rounded transition-all hover:bg-emerald-50 ${
                    feedback === 'up' ? 'text-emerald-500' : 'text-gray-300 hover:text-gray-400'
                  }`}
                >
                  <ThumbsUp size={10} />
                </button>
                <button
                  onClick={() => setFeedback(f => f === 'down' ? null : 'down')}
                  className={`p-0.5 rounded transition-all hover:bg-red-50 ${
                    feedback === 'down' ? 'text-red-400' : 'text-gray-300 hover:text-gray-400'
                  }`}
                >
                  <ThumbsDown size={10} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
